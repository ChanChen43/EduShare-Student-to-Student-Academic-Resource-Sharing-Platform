-- Verification script for karma points system
-- Run this in your Supabase SQL editor to test if the system is working

-- 1. Check if the function exists
SELECT proname, prosecdef, prokind FROM pg_proc 
WHERE proname = 'award_karma_points_to_donor';

-- 2. Test the function directly (replace these UUIDs with real ones from your database)
-- First, find an actual reservation
SELECT id as reservation_id, item_id, borrower_id, status 
FROM reservations 
LIMIT 1;

-- 3. Check a user's points before
-- Replace 'user-uuid' with actual donor UUID from step 2
SELECT id, name, points, role 
FROM users 
WHERE role = 'donor' 
LIMIT 1;

-- 4. You can manually test by calling the function:
-- SELECT award_karma_points_to_donor('reservation-uuid-from-step-2'::uuid);

-- 5. Check the points after the function call
-- SELECT id, name, points, role FROM users WHERE role = 'donor' LIMIT 1;

-- 6. Verify the trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'award_karma_points_trigger';

-- 7. Check function logs if available
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%award_karma%' 
LIMIT 10;
