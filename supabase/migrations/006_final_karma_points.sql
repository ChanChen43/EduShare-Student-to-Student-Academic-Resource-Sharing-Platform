-- Clean karma points implementation (run ONLY this migration)
-- This replaces all previous migration attempts

-- Step 1: Clean up any existing functions and triggers
DROP TRIGGER IF EXISTS award_karma_points_trigger ON reservations CASCADE;
DROP FUNCTION IF EXISTS award_karma_points() CASCADE;
DROP FUNCTION IF EXISTS award_karma_points_to_donor(UUID) CASCADE;

-- Step 2: Add completed_at column to reservations if needed
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Create the RPC-callable function with correct parameter name
CREATE OR REPLACE FUNCTION award_karma_points_to_donor(reservation_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, new_points INTEGER) AS $$
DECLARE
  v_donor_id UUID;
  v_item_id UUID;
  v_new_points INTEGER;
BEGIN
  -- Get the item and donor IDs from the reservation
  SELECT items.id, items.donor_id 
  INTO v_item_id, v_donor_id
  FROM reservations
  INNER JOIN items ON reservations.item_id = items.id
  WHERE reservations.id = reservation_id;
  
  -- Debug logging
  RAISE NOTICE '[KARMA] Processing reservation: %, donor: %', reservation_id, v_donor_id;
  
  -- If no donor found, return error
  IF v_donor_id IS NULL THEN
    RAISE NOTICE '[KARMA] ERROR: No donor found for reservation %', reservation_id;
    RETURN QUERY SELECT false, 'No donor found for this reservation'::TEXT, 0;
    RETURN;
  END IF;
  
  -- Update user points (bypass RLS because function is SECURITY DEFINER)
  UPDATE users
  SET points = COALESCE(points, 0) + 10
  WHERE id = v_donor_id
  RETURNING (COALESCE(points, 0) + 10) INTO v_new_points;
  
  RAISE NOTICE '[KARMA] SUCCESS: Awarded 10 points to donor %, new total: %', v_donor_id, v_new_points;
  RETURN QUERY SELECT true, 'Points awarded successfully'::TEXT, v_new_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the after-update trigger function
CREATE OR REPLACE FUNCTION award_karma_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_donor_id UUID;
BEGIN
  -- Only process if status is changing to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    RAISE NOTICE '[TRIGGER] Reservation % marked as completed', NEW.id;
    
    -- Get the donor ID
    SELECT donor_id INTO v_donor_id FROM items WHERE id = NEW.item_id;
    
    IF v_donor_id IS NOT NULL THEN
      -- Award points
      UPDATE users
      SET points = COALESCE(points, 0) + 10
      WHERE id = v_donor_id;
      
      RAISE NOTICE '[TRIGGER] Awarded 10 points to donor %', v_donor_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
CREATE TRIGGER award_karma_points_trigger
AFTER UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION award_karma_on_completion();

-- Step 6: Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION award_karma_points_to_donor(UUID) TO authenticated;

-- Verify the function exists and is callable
SELECT 'Karma points system ready' as status,
       proname as function_name,
       prokind as function_type
FROM pg_proc 
WHERE proname = 'award_karma_points_to_donor';
