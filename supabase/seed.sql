-- Sample data for testing (run after 001_initial_schema.sql)
-- This creates test users and items for development

-- Note: You'll need to create auth users first through the app signup
-- Then use these INSERT statements to add profile data

-- Example: Insert sample users (replace UUIDs with actual auth.users IDs)
-- After signing up through the app, get the user ID from auth.users table
-- and update the users table with additional profile info

-- Sample items data (uncomment and modify after creating users)
/*
INSERT INTO items (title, category, description, condition, status, donor_id, created_at) VALUES
('Calculus Textbook 12th Edition', 'Textbooks', 'Stewart Calculus textbook in excellent condition. All chapters included, minimal highlighting.', 'Like New', 'Available', 'your-user-id-here', NOW()),
('Organic Chemistry Lab Manual', 'Textbooks', 'Lab manual with all experiments. Some notes in margins.', 'Good', 'Available', 'your-user-id-here', NOW()),
('Scientific Calculator TI-84', 'Calculators', 'Texas Instruments graphing calculator. Works perfectly, comes with manual.', 'Good', 'Available', 'your-user-id-here', NOW()),
('Physics Lab Goggles', 'Lab Equipment', 'Safety goggles for chemistry and physics labs. Never used.', 'New', 'Available', 'your-user-id-here', NOW()),
('Biology Notes - First Semester', 'Notes', 'Comprehensive notes from Biology 101. Includes diagrams and study guides.', 'Good', 'Available', 'your-user-id-here', NOW());
*/

-- To use this seed data:
-- 1. Sign up at least one user through the app
-- 2. Go to SQL Editor in Supabase
-- 3. Run: SELECT id, email FROM auth.users;
-- 4. Copy a user ID
-- 5. Replace 'your-user-id-here' with the actual UUID
-- 6. Uncomment and run the INSERT statements above
