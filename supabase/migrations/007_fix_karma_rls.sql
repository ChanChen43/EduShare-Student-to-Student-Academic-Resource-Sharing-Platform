-- FINAL KARMA POINTS FIX - Only karma-related changes

-- Drop all conflicting karma functions and triggers
DROP TRIGGER IF EXISTS award_karma_points_trigger ON reservations CASCADE;
DROP FUNCTION IF EXISTS award_karma_points() CASCADE;
DROP FUNCTION IF EXISTS award_karma_points_to_donor(UUID) CASCADE;
DROP FUNCTION IF EXISTS award_karma_points_to_donor(p_reservation_id UUID) CASCADE;

-- Add completed_at column if needed
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create RPC function with SECURITY DEFINER (bypasses RLS)
CREATE FUNCTION award_karma_points_to_donor(reservation_id UUID)
RETURNS JSON AS $$
DECLARE
  v_donor_id UUID;
BEGIN
  SELECT donor_id INTO v_donor_id FROM items 
  WHERE id = (SELECT item_id FROM reservations WHERE id = reservation_id);
  
  UPDATE users
  SET points = COALESCE(points, 0) + 10
  WHERE id = v_donor_id;
  
  RETURN json_build_object('success', true, 'message', 'Points awarded');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION award_karma_points_to_donor(UUID) TO authenticated;

SELECT 'Karma points system ready' as status;


