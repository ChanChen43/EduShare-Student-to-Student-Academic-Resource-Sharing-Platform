# Supabase Setup Commands - Copy & Paste Guide

## Step-by-Step Commands to Set Up Supabase

### 1. Create Your Supabase Project

1. Go to https://app.supabase.com/
2. Click "New Project"
3. Fill in details and wait for setup

### 2. Get Your Credentials

1. Go to Project Settings > API
2. Copy these values:

```bash
# Project URL
https://xxxxxxxxxxxxx.supabase.co

# Anon/Public Key
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Create .env File

In your project root, create `.env`:

```bash
# Create .env file
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF
```

Replace the values with your actual credentials.

### 4. Run Database Migrations

#### Method 1: Via SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success" message

8. Repeat for `supabase/migrations/002_email_triggers.sql`:
   - Click **New Query**
   - Copy content from file
   - Paste into editor
   - Click **Run**

#### Method 2: Via Supabase CLI

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
# (Replace with your project reference from dashboard)
supabase link --project-ref your-project-ref

# Push migrations to database
supabase db push

# Verify migrations ran successfully
supabase db diff
```

### 5. Verify Tables Were Created

Run this SQL query in SQL Editor:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show: items, messages, reservations, users
```

### 6. Configure Storage Bucket

#### Verify Bucket Exists

1. Go to **Storage** in sidebar
2. Look for `item-images` bucket
3. If it doesn't exist, create it:

```sql
-- Run this in SQL Editor if bucket doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;
```

#### Verify Storage Policies

```sql
-- Check storage policies
SELECT * FROM storage.policies
WHERE bucket_id = 'item-images';

-- Should show 4 policies (SELECT, INSERT, UPDATE, DELETE)
```

### 7. Configure Authentication

```bash
# 1. Enable Email Provider
# Dashboard > Authentication > Providers > Email > Enable

# 2. For Development: Disable Email Confirmation
# Dashboard > Authentication > Settings
# Uncheck "Enable email confirmations"
# Click Save

# 3. For Production: Configure SMTP
# Dashboard > Project Settings > Auth > SMTP Settings
# Add your email provider credentials
```

### 8. Verify Row Level Security

```sql
-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'items', 'reservations', 'messages');

-- All should show rowsecurity = true
```

### 9. Check Policies Are Created

```sql
-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Should show:
-- items: 6 policies
-- messages: 2 policies
-- reservations: 3 policies
-- users: 2 policies
```

### 10. Create First Admin User

After signing up through the app, run this:

```sql
-- Replace with your actual email
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify admin was set
SELECT id, name, email, role FROM users WHERE role = 'admin';
```

### 11. Optional: Add Sample Data

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Insert sample items (replace USER_ID with your actual ID)
INSERT INTO items (title, category, description, condition, status, donor_id) VALUES
('Calculus Textbook 12th Edition', 'Textbooks', 'Stewart Calculus textbook in excellent condition', 'Like New', 'Available', 'USER_ID_HERE'),
('Scientific Calculator TI-84', 'Calculators', 'Graphing calculator in good working condition', 'Good', 'Available', 'USER_ID_HERE'),
('Biology Lab Manual', 'Lab Equipment', 'Lab manual for Bio 101', 'Good', 'Available', 'USER_ID_HERE');

-- Verify items were added
SELECT title, category, status FROM items;
```

### 12. Test Real-time (Optional)

```sql
-- Enable realtime for messages table
-- Go to Database > Replication > messages > Enable

-- Test with this query
SELECT * FROM messages;
-- (Messages should update in real-time in the app)
```

### 13. Verify Everything Works

Run these verification queries:

```sql
-- 1. Check users table
SELECT COUNT(*) as user_count FROM users;

-- 2. Check items table
SELECT COUNT(*) as item_count FROM items;

-- 3. Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'item-images';

-- 4. Check auth configuration
SELECT * FROM auth.config;

-- 5. Test a simple query
SELECT u.name, COUNT(i.id) as item_count
FROM users u
LEFT JOIN items i ON i.donor_id = u.id
GROUP BY u.name;
```

### 14. Configure for Production (When Ready)

```bash
# Add production environment variables
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key

# Enable email confirmations
# Dashboard > Authentication > Settings
# Check "Enable email confirmations"

# Configure custom SMTP
# Dashboard > Project Settings > Auth > SMTP Settings

# Add production domain to allowed origins
# Dashboard > Authentication > URL Configuration
# Add: https://yourdomain.com

# Set up backups
# Dashboard > Database > Backups > Enable daily backups

# Configure rate limiting (if needed)
# Dashboard > Project Settings > API
```

## Quick Verification Checklist

After running all commands, verify:

- [ ] .env file created with correct credentials
- [ ] All 4 tables created (users, items, reservations, messages)
- [ ] Storage bucket `item-images` exists and is public
- [ ] RLS enabled on all tables
- [ ] 13+ policies created across tables
- [ ] Email authentication enabled
- [ ] Email confirmation configured (disabled for dev)
- [ ] At least one admin user created
- [ ] Can sign up through the app
- [ ] Can create an item through the app
- [ ] Messages work in real-time

## Common Issues & Quick Fixes

### "relation already exists"
```sql
-- Tables already exist, skip to next step
-- Or drop and recreate:
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- Then re-run migration
```

### "permission denied for table"
```sql
-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

### "bucket already exists"
```sql
-- Bucket exists, verify it's public
UPDATE storage.buckets
SET public = true
WHERE name = 'item-images';
```

### "policy already exists"
```sql
-- Drop existing policies first
DROP POLICY IF EXISTS "policy_name" ON table_name;
-- Then re-run migration
```

## Need Help?

1. **Check Supabase Dashboard Logs**
   - Database > Logs
   - Look for error messages

2. **Verify Connection**
   ```bash
   # Test in your terminal
   curl https://your-project.supabase.co/rest/v1/users \
     -H "apikey: your-anon-key"
   ```

3. **Check Supabase Status**
   - https://status.supabase.com

4. **Review Documentation**
   - README.md
   - SUPABASE_SETUP.md

---

That's it! Your Supabase backend is now fully configured. 🎉

Return to the main README.md to continue with running the app locally.
