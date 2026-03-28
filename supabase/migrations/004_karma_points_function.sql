-- Create a stored procedure to award karma points
-- This can be called directly from the application

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS award_karma_points_to_donor(UUID) CASCADE;

-- Create the function with proper security settings
CREATE FUNCTION award_karma_points_to_donor(reservation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donor_id UUID;
  v_item_id UUID;
  v_points_before INTEGER;
  v_points_after INTEGER;
BEGIN
  -- Get the item ID and donor ID from the reservation
  SELECT i.id, i.donor_id INTO v_item_id, v_donor_id
  FROM reservations r
  JOIN items i ON r.item_id = i.id
  WHERE r.id = reservation_id;
  
  -- Check if donor exists
  IF v_donor_id IS NULL THEN
    RAISE EXCEPTION 'No donor found for this reservation';
  END IF;
  
  -- Get the current points before update
  SELECT points INTO v_points_before FROM users WHERE id = v_donor_id;
  
  -- Award 10 points to the donor
  UPDATE users
  SET points = COALESCE(points, 0) + 10
  WHERE id = v_donor_id;
  
  -- Get the new points after update
  SELECT points INTO v_points_after FROM users WHERE id = v_donor_id;
  
  -- Return true if points were actually updated
  RETURN v_points_after > COALESCE(v_points_before, 0);
END;
$$;

-- Alter function to be executable by authenticated users without RLS
ALTER FUNCTION award_karma_points_to_donor(UUID) OWNER TO postgres;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION award_karma_points_to_donor(UUID) TO authenticated, anon;
