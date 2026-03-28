# Quick Setup Guide

This is a condensed version of the setup process. For detailed instructions, see README.md.

## Prerequisites
- Node.js v18+
- Supabase account

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Set Up Supabase

1. Create project at https://app.supabase.com/
2. Go to Project Settings > API
3. Copy Project URL and anon key

## 3. Create .env File

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Run Database Migrations

In Supabase SQL Editor, run these files in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_email_triggers.sql`

## 5. Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. For development: Disable email confirmation in Auth Settings

## 6. Create Storage Bucket

The migration should auto-create `item-images` bucket.
If not, create it manually in Storage (make it public).

## 7. Run Development Server

```bash
pnpm dev
```

Open http://localhost:5173

## 8. Create Admin User (Optional)

After signing up through the app, run in SQL Editor:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Testing the App

### As Beneficiary (Borrower)
1. Sign up with "Borrow Items" role
2. Browse available items
3. Reserve an item
4. Message the donor

### As Donor
1. Sign up with "Share Items" role
2. Add a new item
3. Wait for admin approval
4. Earn karma points when borrowed

### As Admin
1. Sign up and update role to 'admin' via SQL
2. Access Admin Panel
3. Approve/reject pending items
4. View reports and analytics

## Common Commands

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
edushare/
├── src/
│   ├── app/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Reusable UI components
│   │   │   ├── Auth.tsx    # Authentication
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ItemListing.tsx
│   │   │   ├── AddItem.tsx
│   │   │   ├── MyItems.tsx
│   │   │   ├── Reservations.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Layout.tsx
│   │   └── App.tsx         # Main app component
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                # Library files
│   │   └── supabase.ts     # Supabase client
│   └── styles/             # CSS files
├── supabase/
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge functions
├── .env                    # Environment variables
├── package.json
└── README.md
```

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Invalid API key | Check .env file and restart server |
| Table not found | Run migration scripts in SQL Editor |
| Can't upload images | Create item-images bucket in Storage |
| Email not sending | Disable email confirmation for dev |

For detailed troubleshooting, see README.md

---

Need help? Check the full README.md or open an issue on GitHub.
