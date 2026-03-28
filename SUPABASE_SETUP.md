# Supabase Configuration Guide

This guide walks you through setting up Supabase for the EduShare platform.

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com/
2. Click "New Project"
3. Fill in:
   - **Name**: EduShare (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 2: Get API Credentials

1. In your project dashboard, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. You'll see two important values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long JWT token starting with `eyJ...`
4. Copy these to your `.env` file

## Step 3: Set Up Database

### Option A: Using SQL Editor (Recommended)

1. Go to **SQL Editor** in the sidebar
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** or press `Ctrl+Enter`
5. Wait for success message
6. Repeat for `supabase/migrations/002_email_triggers.sql`

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 4: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** > **Providers**
2. Find **Email** in the list
3. Make sure it's **enabled** (toggle should be green)
4. Click **Save**

### Email Confirmation Settings

For **Development**:
1. Go to **Authentication** > **Settings**
2. Scroll to **Email Confirmation**
3. Toggle **OFF** "Enable email confirmations"
4. Click **Save**

For **Production**:
1. Keep email confirmations **enabled**
2. Configure SMTP settings (see below)

### Configure SMTP (Production Only)

1. Go to **Project Settings** > **Auth**
2. Scroll to **SMTP Settings**
3. Choose an email provider:
   - **SendGrid**
   - **AWS SES**
   - **Resend** (recommended)
   - Custom SMTP
4. Enter credentials from your email provider
5. Test email sending

## Step 5: Set Up Storage

### Create Storage Bucket

The migration script should auto-create the bucket. To verify:

1. Go to **Storage** in the sidebar
2. Check if `item-images` bucket exists
3. If not, click **New Bucket**
   - **Name**: `item-images`
   - **Public**: Toggle **ON**
   - Click **Create bucket**

### Verify Storage Policies

1. Click on `item-images` bucket
2. Go to **Policies** tab
3. Verify these policies exist:
   - `Anyone can view item images` (SELECT)
   - `Authenticated users can upload item images` (INSERT)
   - `Users can update own images` (UPDATE)
   - `Users can delete own images` (DELETE)

If policies are missing, they should have been created by the migration script.

## Step 6: Enable Realtime (Optional)

For real-time messaging features:

1. Go to **Database** > **Replication**
2. Find the `messages` table
3. Click **Enable** for Realtime
4. Choose replication settings:
   - **Inserts**: Enable
   - **Updates**: Enable
   - **Deletes**: Enable (optional)

## Step 7: Configure Row Level Security

RLS should be enabled by the migration script. To verify:

1. Go to **Authentication** > **Policies**
2. Select each table (users, items, reservations, messages)
3. Verify policies are present
4. Check that RLS is **enabled** for each table

## Step 8: Set Up Edge Functions (Optional)

For email notifications via Edge Functions:

```bash
# Deploy email function
supabase functions deploy send-email

# Set environment variables
supabase secrets set RESEND_API_KEY=your_api_key
```

## Step 9: Create Test Admin User

After signing up through the app:

1. Go to **SQL Editor**
2. Run this query:

```sql
-- Replace with your email
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Step 10: Test Your Setup

### Test Database Connection

Create a test query in SQL Editor:

```sql
SELECT * FROM users LIMIT 5;
```

### Test Authentication

1. Try signing up through the app
2. Check **Authentication** > **Users** in Supabase
3. Verify user appears in the list

### Test Storage

1. Try uploading an item with an image
2. Check **Storage** > **item-images** bucket
3. Verify image appears

## Environment Variables Summary

Create a `.env` file in your project root:

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key

# Optional (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
RESEND_API_KEY=re_...your-resend-key
```

## Security Checklist

- [ ] Row Level Security enabled on all tables
- [ ] Storage policies configured correctly
- [ ] Email confirmation enabled (production)
- [ ] Strong database password set
- [ ] API keys stored in `.env` (not committed to Git)
- [ ] `.env` added to `.gitignore`

## Common Issues

### "Invalid API key"
- Check `.env` file has correct credentials
- Restart development server after changing `.env`
- Verify no extra spaces in `.env` values

### "relation does not exist"
- Run migration scripts in SQL Editor
- Check for errors in migration output
- Verify you're connected to the right project

### "Storage bucket not found"
- Create `item-images` bucket manually
- Set it to public
- Re-run storage policy migration

### "Email not sending"
- For dev: Disable email confirmation
- For prod: Configure SMTP settings
- Check spam folder
- Verify email templates in Auth settings

## Production Checklist

Before deploying to production:

- [ ] Enable email confirmations
- [ ] Configure SMTP for emails
- [ ] Set up custom domain (optional)
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging
- [ ] Review and test all RLS policies
- [ ] Audit storage policies
- [ ] Enable 2FA for Supabase account

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Auth Guide](https://supabase.com/docs/guides/auth)

## Need Help?

- Check the [Supabase Discord](https://discord.supabase.com/)
- Visit the [Supabase Community Forum](https://github.com/supabase/supabase/discussions)
- Review the main README.md for troubleshooting

---

Configuration complete! Return to the main README.md for next steps.
