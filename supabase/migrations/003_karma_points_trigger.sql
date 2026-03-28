-- Create a trigger to automatically award karma points when a reservation is completed

-- First, add the completed_at column if it doesn't exist
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Drop the old trigger and function if they exist
DROP TRIGGER IF EXISTS award_karma_points_trigger ON reservations;
DROP FUNCTION IF EXISTS award_karma_points();

-- Create the trigger function with proper security settings
CREATE FUNCTION award_karma_points()
RETURNS TRIGGER AS $$
DECLARE
  v_donor_id UUID;
BEGIN
  -- Only process if status is being changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get the donor ID from the item
    SELECT donor_id INTO v_donor_id FROM items WHERE id = NEW.item_id;
    
    -- Award points if donor exists
    IF v_donor_id IS NOT NULL THEN
      UPDATE users
      SET points = COALESCE(points, 0) + 10
      WHERE id = v_donor_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER award_karma_points_trigger
AFTER UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION award_karma_points();
