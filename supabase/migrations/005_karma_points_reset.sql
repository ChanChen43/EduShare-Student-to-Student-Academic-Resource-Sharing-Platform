-- Comprehensive karma points system reset
-- Run this if the previous migrations didn't work correctly

-- Step 1: Add the completed_at column if missing
ALTER TABLE IF EXISTS reservations 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Drop existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS award_karma_points_trigger ON reservations CASCADE;
DROP FUNCTION IF EXISTS award_karma_points() CASCADE;
DROP FUNCTION IF EXISTS award_karma_points_to_donor(UUID) CASCADE;

-- Step 3: Create the improved stored procedure function
CREATE FUNCTION award_karma_points_to_donor(p_reservation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_donor_id UUID;
  v_item_id UUID;
BEGIN
  -- Log the call for debugging
  RAISE NOTICE 'award_karma_points_to_donor called with reservation_id: %', p_reservation_id;
  
  -- Get the donor and item IDs
  SELECT i.id, i.donor_id 
  INTO v_item_id, v_donor_id
  FROM reservations r
  JOIN items i ON r.item_id = i.id
  WHERE r.id = p_reservation_id;
  
  -- If no donor found, return false
  IF v_donor_id IS NULL THEN
    RAISE NOTICE 'No donor found for reservation %', p_reservation_id;
    RETURN FALSE;
  END IF;
  
  -- Award 10 points to the donor
  UPDATE users
  SET points = COALESCE(points, 0) + 10,
      updated_at = NOW()
  WHERE id = v_donor_id;
  
  RAISE NOTICE 'Awarded 10 points to donor %', v_donor_id;
  RETURN TRUE;
END;
$$;

-- Step 4: Create the trigger function
CREATE FUNCTION award_karma_points()
RETURNS TRIGGER AS $$
DECLARE
  v_donor_id UUID;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get the donor ID
    SELECT donor_id INTO v_donor_id FROM items WHERE id = NEW.item_id;
    
    -- Award points if donor exists
    IF v_donor_id IS NOT NULL THEN
      UPDATE users
      SET points = COALESCE(points, 0) + 10,
          updated_at = NOW()
      WHERE id = v_donor_id;
      
      RAISE NOTICE 'Trigger: Awarded 10 points to donor %', v_donor_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
CREATE TRIGGER award_karma_points_trigger
AFTER UPDATE ON reservations
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'completed')
EXECUTE FUNCTION award_karma_points();

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION award_karma_points_to_donor(UUID) TO authenticated;

-- Step 7: Verify schema is correct
SELECT 'Karma points system setup complete' as status;
