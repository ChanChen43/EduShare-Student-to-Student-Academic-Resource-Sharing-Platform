-- Function to send email notification when item is reserved
CREATE OR REPLACE FUNCTION notify_reservation_created()
RETURNS TRIGGER AS $$
DECLARE
  donor_email TEXT;
  borrower_name TEXT;
  item_title TEXT;
BEGIN
  -- Get donor email, borrower name, and item title
  SELECT u.email, items.title INTO donor_email, item_title
  FROM items
  JOIN users u ON items.donor_id = u.id
  WHERE items.id = NEW.item_id;

  SELECT name INTO borrower_name
  FROM users
  WHERE id = NEW.borrower_id;

  -- Here you would call your edge function to send email
  -- For now, we'll just log it
  RAISE NOTICE 'Reservation notification: Item "%" reserved by % for donor %', item_title, borrower_name, donor_email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reservation notifications
DROP TRIGGER IF EXISTS on_reservation_created ON reservations;
CREATE TRIGGER on_reservation_created
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_reservation_created();

-- Function to send email when reservation is confirmed
CREATE OR REPLACE FUNCTION notify_reservation_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  borrower_email TEXT;
  item_title TEXT;
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    SELECT u.email, items.title INTO borrower_email, item_title
    FROM users u
    JOIN items ON NEW.item_id = items.id
    WHERE u.id = NEW.borrower_id;

    RAISE NOTICE 'Confirmation notification: Item "%" confirmed for %', item_title, borrower_email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for confirmation notifications
DROP TRIGGER IF EXISTS on_reservation_confirmed ON reservations;
CREATE TRIGGER on_reservation_confirmed
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_reservation_confirmed();
