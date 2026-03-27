# 📚 EduShare - Peer-to-Peer Academic Resource Sharing Platform

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Beta-orange.svg)](https://github.com/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform)

**A sustainable ecosystem for students to share academic resources and reduce educational inequality**

[Live Demo](#) • [Documentation](./DOCUMENTATION_INDEX.md) • [Report Bug](https://github.com/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform/issues) • [Request Feature](https://github.com/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform/pulls)

</div>

---

## 🎯 Problem Statement & Solution

### The Problem
- **Educational inequality**: Students from underprivileged backgrounds struggle to afford essential academic resources
- **Resource waste**: Textbooks, lab equipment, and study materials are often bought once and discarded after use
- **Sustainability challenges**: Massive production of academic materials contributes to environmental impact
- **Isolation in learning**: Limited peer-to-peer resource sharing platforms in the student community

### Our Solution: EduShare
EduShare is a **community-driven peer-to-peer sharing platform** that enables students to share academic resources affordably and sustainably. By implementing a **karma-based incentive system**, we encourage resource sharing while fostering a collaborative learning environment.

### UN Sustainable Development Goal 4 (SDG 4): Quality Education
This initiative directly supports SDG 4 by:
- ✅ Making educational resources accessible to all students regardless of financial status
- ✅ Reducing financial barriers to quality education
- ✅ Promoting sustainable consumption through resource sharing
- ✅ Building community through collaborative learning environments

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.0+
- **Styling**: Tailwind CSS v4 + shadcn/ui component library
- **Routing**: React Router v7
- **Forms**: React Hook Form with validation
- **State Management**: React Context API + Custom Hooks
- **Charts & Analytics**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Build Tool**: Vite

### Backend & Database
- **Platform**: Supabase (managed PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Storage**: Supabase Storage (Image uploads)
- **Real-time**: Supabase Realtime subscriptions
- **Security**: Row Level Security (RLS) policies
- **Database Triggers**: PostgreSQL triggers for automation

### External Services
- **Email**: Supabase SMTP (native)
- **Image Hosting**: Supabase Storage (S3-compatible)

---

## 📋 Prerequisites

### Required
- **Node.js** v18 or higher → [Download](https://nodejs.org/)
- **pnpm** v8+ or npm v9+ → `npm install -g pnpm`
- **Git** → [Download](https://git-scm.com/)
- **Supabase Account** (Free tier available) → [Sign Up](https://supabase.com/)

### Recommended
- VS Code with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Supabase CLI (optional)

---

## 🚀 Local Installation & Setup Guide

### Step 1: Clone Repository

```bash
git clone https://github.com/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform.git
cd EduShare-Student-to-Student-Academic-Resource-Sharing-Platform
```

### Step 2: Install Dependencies

```bash
# Using pnpm (recommended - faster, more efficient)
pnpm install

# Or using npm
npm install
```

### Step 3: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com/) and sign in
2. Click **"New Project"** and fill in:
   - Project name: `edushare`
   - Database password: *(securely generate one)*
   - Region: *(closest to you)*
3. Wait 2-3 minutes for project initialization

### Step 4: Configure Environment Variables

Create `.env` file in project root:

```bash
# .env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these**:
- Go to **Settings → API** in Supabase dashboard
- Copy `Project URL` and `anon/public` key

### Step 5: Initialize Database Schema

1. Open **SQL Editor** in Supabase dashboard
2. Create new query and copy contents from:
   - `supabase/migrations/001_initial_schema.sql`
   - Paste and click **"Run"** → Wait for success ✓

3. Create another query with:
   - `supabase/migrations/002_email_triggers.sql`
   - Paste and click **"Run"** → Wait for success ✓

### Step 6: Configure Storage

1. Navigate to **Storage** in Supabase dashboard
2. Create new bucket named `item-images`
3. Set bucket visibility to **"Public"**
4. Verify policies allow:
   - SELECT: Public
   - INSERT: Authenticated users
   - UPDATE: Own files only
   - DELETE: Own files only

### Step 7: Setup Authentication

1. Go to **Authentication → Providers**
2. Enable **"Email"** provider
3. Go to **Authentication → Settings**
4. For development, disable "Enable email confirmations" (optional)

### Step 8: Start Development Server

```bash
pnpm dev
```

Application opens at: `http://localhost:5173`

---

## 👥 User Authentication & Signup Flow

### Signup Process

```
1. Visit application → Click "Sign Up"
2. Select role:
   - 👤 "Borrow Items" (Beneficiary)
   - 📦 "Share Items" (Donor)
   - 🔑 "Admin" (Platform Management) - requires admin setup
3. Enter email & password
4. Email verification (optional in dev mode)
5. Redirected to Dashboard
```

### Login Process

```
1. Click "Login" on homepage
2. Enter email & password
3. One-time password verification (if enabled)
4. Redirected to Dashboard based on role
```

### Default Test Accounts

```
Just sign up new account
Note: It needs a real email address since it sends out a verification link.
```

*Note: Create these through the app, then run the SQL command below to set admin role*

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
```

---

## ✨ Core Features & Functionality

### 1. **Authentication & Profile Management** 🔐
- Secure email/password authentication
- User profile with customizable information
- Role-based access control (Donor, Beneficiary, Admin)
- Password change & reset functionality
- Profile picture support

### 2. **Item Management** 📦
- **Add Items**: Donors can list items with:
  - Title, category, description, condition
  - Image upload to cloud storage
  - Status tracking (Pending → Available → Reserved → Completed)
- **Edit Items**: Modify item details anytime
- **Delete Items**: Remove items from platform
- **Search & Filter**: By title, category, status, donor
- **Item Approval**: Admin review before visibility

### 3. **Smart Reservation System** 📅
- 24-hour reservation window (auto-expires)
- Multi-user queuing: Multiple users can reserve same item
- Status flow: Pending → Confirmed → Completed/Cancelled
- Automatic item availability recalculation
- Expiration management with notifications

### 4. **Messaging System** 💬
- Real-time peer-to-peer chat
- Item-specific conversations
- Message history persistence
- Delete message capability
- Typing indicators (optional enhancement)

### 5. **Karma Points System** ⭐
- **Earn Points**: Donors get +10 points per completed exchange
- **Milestone Tracking**: Leaderboard features
- **Incentivization**: Encourages resource sharing
- **Points Display**: Visible on user profiles and dashboard

### 6. **Admin Dashboard** 🔑
- **Item Approval Queue**: Review pending items
- **User Management**: View/edit/delete users
- **Analytics**: Platform metrics and statistics
- **Report Generation**: Usage patterns and trends
- **Content Moderation**: Remove inappropriate items

### 7. **Analytics & Reports** 📊
- Interactive charts with Recharts
- Metrics tracked:
  - Total items shared
  - Active reservations
  - Completed exchanges
  - Karma points distribution
  - User growth trends

### 8. **UI/UX Features** 🎨
- Dark/Light mode with persistence
- Fully responsive design (desktop/tablet/mobile)
- Accessibility compliance (WCAG 2.1)
- Loading states and error handling
- Toast notifications for user feedback

---

## 🔄 User Workflows

### Workflow 1: Donor Sharing an Item

```
┌─ DONOR LOGIN ─┐
│               ↓
│       DASHBOARD
│       "Add Item" button
│               ↓
│       FILL ITEM DETAILS
│       - Title: "Linear Algebra Textbook"
│       - Category: "Textbooks"
│       - Condition: "Like New"
│       - Upload image
│               ↓
│       SUBMIT → Admin Review (Pending)
│               ↓
│       ADMIN APPROVES → Item "Available"
│               ↓
│       NOTIFICATION: "Your item is live!"
│               ↓
│       MY ITEMS PAGE
│       Status: "Available" (Green badge)
│               ↓
│       BORROWER RESERVES IT
│       Status changes: "Available" → "Reserved"
│               ↓
│       CONFIRM RESERVATION
│       Chat with borrower to arrange pickup
│               ↓
│       MARK AS COMPLETED
│       ⭐ +10 Karma Points awarded!
│       Status: "Available" (back to available for next person)
│               ↓
│       REPEAT for unlimited exchanges
└───────────────┘
```

### Workflow 2: Borrower Reserving & Returning Item

```
┌─ BORROWER LOGIN ─┐
│                  ↓
│          DASHBOARD
│          "Browse Items" section
│                  ↓
│          SEARCH/FILTER ITEMS
│          - Category: "Textbooks"
│          - Status: "Available"
│          - Keyword: "Linear Algebra"
│                  ↓
│          ITEM CARD DISPLAYS
│          - Title, image, condition
│          - Donor name
│          - "Reserve Item" button
│                  ↓
│          CLICK "RESERVE ITEM"
│          24-hour timer starts
│                  ↓
│          MY RESERVATIONS
│          Status: "⏳ Pending"
│                  ↓
│          CHAT WITH DONOR
│          Arrange pickup/delivery time
│                  ↓
│          WAIT FOR CONFIRMATION
│          Donor confirms reservation
│          Status: "✅ Confirmed"
│                  ↓
│          PICKUP ITEM
│                  ↓
│          MARK AS COMPLETED
│          Reservation status: "Completed"
│          ✅ Exchange successful!
│                  ↓
│          CAN RESERVE SAME ITEM AGAIN
│          (if donor has more copies or re-lists it)
└──────────────────┘
```

---

## 🗄️ Data Storage Architecture

### Database Tables

```
┌─────────────────────────────────────────────────────┐
│                    SUPABASE                         │
│           PostgreSQL Database Storage               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📋 users                                          │
│  ├─ id (UUID) - Primary Key                       │
│  ├─ email (Text) - Unique, Auth email            │
│  ├─ name (Text) - Display name                    │
│  ├─ role (Text) - donor|beneficiary|admin        │
│  ├─ points (Integer) - Karma points (default: 0) │
│  ├─ created_at (Timestamp)                        │
│  └─ profile_image_url (Text, nullable)            │
│                                                     │
│  📦 items                                          │
│  ├─ id (UUID) - Primary Key                       │
│  ├─ title (Text) - Item name                      │
│  ├─ description (Text) - Detailed description     │
│  ├─ category (Text) - Item category               │
│  ├─ condition (Text) - good|excellent|like_new   │
│  ├─ status (Text) - Pending|Available|Reserved    │
│  ├─ donor_id (UUID) - FK → users                 │
│  ├─ image_url (Text) - Supabase Storage path      │
│  ├─ created_at (Timestamp)                        │
│  └─ updated_at (Timestamp)                        │
│                                                     │
│  🔗 reservations                                   │
│  ├─ id (UUID) - Primary Key                       │
│  ├─ item_id (UUID) - FK → items                  │
│  ├─ borrower_id (UUID) - FK → users              │
│  ├─ status (Text) - pending|confirmed|completed  │
│  ├─ reserved_at (Timestamp)                       │
│  ├─ expires_at (Timestamp) - 24hr expiry          │
│  ├─ confirmed_at (Timestamp, nullable)            │
│  ├─ completed_at (Timestamp, nullable)            │
│  └─ created_at (Timestamp)                        │
│                                                     │
│  💬 messages                                       │
│  ├─ id (UUID) - Primary Key                       │
│  ├─ sender_id (UUID) - FK → users                │
│  ├─ receiver_id (UUID) - FK → users              │
│  ├─ item_id (UUID, nullable) - FK → items        │
│  ├─ message_text (Text) - Message content        │
│  ├─ is_deleted (Boolean) - Soft delete flag      │
│  └─ timestamp (Timestamp)                         │
│                                                     │
│  🖼️ item_images (Storage)                         │
│  └─ Bucket: item-images                           │
│     └─ Path: /donor-id/item-id/image.jpg         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Data Relationships

```
users (1) ──────→ (Many) items (donor_id FK)
         
items (1) ──────→ (Many) reservations (item_id FK)
         ↓
      (1) reservations ←──── (Many) users (borrower_id FK)

users (1) ──────→ (Many) messages (sender_id FK)
       ↓
     (1) messages ←──── (Many) users (receiver_id FK)

items (1) ──────→ (Many) messages (item_id FK, nullable)
```

### Storage Details

| Data Type | Location | Capacity | Access |
|-----------|----------|----------|--------|
| User data | Supabase Auth + users table | Unlimited | Authenticated users |
| Item metadata | PostgreSQL items table | 10GB (free tier) | Public read, authenticated write |
| Item images | Supabase Storage (S3) | 1GB (free tier) | Public read via signed URLs |
| Chat history | PostgreSQL messages table | 10GB (free tier) | Authorized users only |
| Reservations | PostgreSQL reservations table | 10GB (free tier) | Authorized users only |

---

## 🏗️ System Architecture

### Component Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        EduShare System                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              FRONTEND (React + TypeScript)              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Components:                                            │   │
│  │  ├─ Auth (Login/Signup)                               │   │
│  │  ├─ Dashboard (Home/Overview)                         │   │
│  │  ├─ ItemListing (Browse & Reserve)                    │   │
│  │  ├─ MyItems (Donor inventory)                         │   │
│  │  ├─ Reservations (Borrower tracking)                  │   │
│  │  ├─ Messages (Real-time chat)                         │   │
│  │  ├─ Profile (User account)                            │   │
│  │  ├─ AdminPanel (Moderation)                           │   │
│  │  └─ Reports (Analytics)                               │   │
│  │                                                         │   │
│  │  State Management:                                      │   │
│  │  └─ AuthContext (User auth & session)                 │   │
│  │                                                         │   │
│  │  Styling: Tailwind CSS + shadcn/ui                    │   │
│  │  Build: Vite (HMR, optimized bundles)                │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│                     HTTP(S) REST API                             │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         BACKEND (Supabase) - Managed Platform           │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Authentication Layer:                                  │   │
│  │  └─ Supabase Auth (JWT tokens, sessions)              │   │
│  │                                                         │   │
│  │  API Layer (Auto-generated REST + GraphQL):           │   │
│  │  ├─ Read: SELECT queries on all tables                │   │
│  │  ├─ Write: INSERT/UPDATE/DELETE with RLS              │   │
│  │  ├─ Real-time: Subscriptions via WebSocket            │   │
│  │  └─ Functions: PostgreSQL stored procedures           │   │
│  │                                                         │   │
│  │  Security Layer:                                        │   │
│  │  └─ Row Level Security (RLS) policies                 │   │
│  │     ├─ Users can only modify own data                 │   │
│  │     ├─ Items filtered by approval status              │   │
│  │     ├─ Messages only visible to participants          │   │
│  │     └─ Admin has unrestricted access                  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│                    Managed Services                              │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │      DATABASE & STORAGE (PostgreSQL + S3)              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  PostgreSQL Database:                                   │   │
│  │  ├─ users, items, reservations, messages              │   │
│  │  ├─ Triggers for business logic                       │   │
│  │  ├─ Indexes for query performance                     │   │
│  │  └─ Backups (daily, 7-day retention)                  │   │
│  │                                                         │   │
│  │  S3-Compatible Storage (Supabase Storage):             │   │
│  │  └─ item-images bucket (public-read, auth-write)      │   │
│  │     └─ Organized: /donor-id/item-id/image.jpg         │   │
│  │                                                         │   │
│  │  Email Service (SMTP):                                 │   │
│  │  └─ Email verification, password reset, notifications │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Browser (React App)
    │
    ├─→ AuthContext → Supabase Auth
    │   (Token management, session handling)
    │
    ├─→ React Components
    │   │
    │   ├─→ ItemListing → Supabase REST API
    │   │   (SELECT items, INSERT reservations)
    │   │
    │   ├─→ MyItems → Supabase REST API
    │   │   (SELECT user's items, UPDATE reservations)
    │   │
    │   ├─→ Messages → Supabase Realtime
    │   │   (SUBSCRIBE to messages, INSERT new messages)
    │   │
    │   ├─→ Dashboard → Supabase REST API
    │   │   (SELECT reservations, items with real-time)
    │   │
    │   └─→ AdminPanel → Supabase REST API
    │       (UPDATE item status, DELETE items/users)
    │
    └─→ Supabase Backend
        │
        ├─→ Authentication Service
        │   └─ JWT Token validation
        │
        ├─→ PostgreSQL Database
        │   ├─ RLS Policies enforce access control
        │   ├─ Triggers handle automation
        │   └─ Indexes optimize queries
        │
        ├─→ Realtime Subscriptions
        │   └─ WebSocket connection for live updates
        │
        ├─→ Storage Service (S3)
        │   └─ Image uploads & retrieval
        │
        └─→ Email Service
            └─ Account verification, notifications
```

---

## 📊 Current Status & Future Roadmap

### ✅ Current Features (MVP - March 2025)

| Category | Feature | Status |
|----------|---------|--------|
| **Auth** | Email/Password signup & login | ✅ Complete |
| | Role-based access control | ✅ Complete |
| | Password reset via email | ✅ Complete |
| **Items** | Add/edit/delete items | ✅ Complete |
| | Image upload support | ✅ Complete |
| | Search & filtering | ✅ Complete |
| | Admin approval workflow | ✅ Complete |
| **Reservations** | Create reservations | ✅ Complete |
| | 24-hour auto-expiry | ✅ Complete |
| | Multi-user queuing | ✅ Complete |
| | Status tracking | ✅ Complete |
| **Messaging** | Real-time peer chat | ✅ Complete |
| | Message deletion | ✅ Complete |
| | Item-specific conversations | ✅ Complete |
| **Karma System** | Points tracking | ✅ Complete |
| | Points award on completion | ✅ Complete |
| | Leaderboard (basic) | ✅ Complete |
| **Dashboard** | Admin item approval | ✅ Complete |
| | User analytics | ✅ Complete |
| | Reports & charts | ✅ Complete |
| **UI/UX** | Dark/Light mode | ✅ Complete |
| | Responsive design | ✅ Complete |
| | Toast notifications | ✅ Complete |

### 🔄 Planned for Semifinal and Finals

- [ ] **Advanced Search**
  - [ ] Full-text search with Postgres FTS
  - [ ] Tag-based categorization
  

- [ ] **Enhanced Messaging**
  - [ ] Media sharing in messages
  - [ ] Message read receipts
  - [ ] Typing indicators

- [ ] **Karma System Expansion**
  - [ ] Badges/achievements
  - [ ] Tier-based privileges (bronze/silver/gold)
  - [ ] Points multipliers for sustained sharing

- [ ] **Reservation Enhancements**
  - [ ] QR code check-in/check-out
  - [ ] Deposit system for high-value items
  - [ ] Insurance integration

- [ ] **Social Features**
  - [ ] User profiles with reviews/ratings
  - [ ] Donor verification system
  - [ ] Community leaderboards
  - [ ] Follow donors

- [ ] **Admin Enhancements**
  - [ ] Advanced moderation tools
  - [ ] Ban/suspend functionality
  - [ ] Dispute resolution system
  - [ ] Detailed user analytics

- [ ] **Mobile App**
  - [ ] PWA Support
  - [ ] Push notifications

- [ ] **Compliance & Legal**
  - [ ] GDPR compliance
  - [ ] Terms of service & privacy policy
  

### ⚠️ Known Limitations

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| Item images limited to 1GB bucket (free tier) | Cannot handle high-volume usage | Upgrade to Pro tier or implement CDN |
| Database limited to 10GB (free tier) | Won't scale beyond ~100K active users | Upgrade to Pro tier or implement sharding |
| No advanced payment system | Cannot monetize or handle deposits | External payment integration needed |
| Email delivery via Supabase SMTP | Limited to 100 emails/hour | Upgrade or use external email provider |
| No mobile app | Mobile users have sub-optimal UX | Build React Native apps |
| Basic user authentication only | No social login or 2FA | Implement OAuth providers, TOTP |
| No dispute resolution mechanism | No way to handle scams/theft | Implement moderation & rating system |

---

## 📸 Screenshots & Demo

### Dashboard Screenshots

<details>
<summary><b>Click to expand screenshots section</b></summary>

#### Authentication Screens
- [ ] Login page
- [ ] Signup page
- [ ] Email verification
- [ ] Password reset flow

#### Dashboard
- [ ] Beneficiary dashboard
- [ ] Donor dashboard
- [ ] Admin dashboard

#### Item Management
- [ ] Browse items (ItemListing)
- [ ] My Items (donor view)
- [ ] Add/edit item form
- [ ] Item details

#### Reservations & Messaging
- [ ] My reservations page
- [ ] Chat/messages interface
- [ ] Reservation approval (donor)

#### User Accounts
- [ ] User profile page
- [ ] Karma points display
- [ ] Edit profile
- [ ] Password change

#### Admin Features
- [ ] Admin panel overview
- [ ] Item approval queue
- [ ] User management
- [ ] Reports & analytics

#### Dark Mode
- [ ] Dashboard (dark)
- [ ] Item listing (dark)
- [ ] Messages (dark)

*Note: Add screenshots here during testing*

</details>


## 📄 License

MIT License © 2025 EduShare Contributors

---

## 🌟 Acknowledgments

- Built with [Supabase](https://supabase.com/) - Open source backend platform
- UI components from [Shadcn/ui](https://ui.shadcn.com/) - Beautiful React components
- Icons from [Lucide](https://lucide.dev/) - Consistent icon library
- Tailwind CSS for utility-first styling
- React community for amazing tools and libraries

---

## 📧 Support & Contact

- **Issues & Bugs**: [GitHub Issues](https://github.com/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform/discussions)
- **Email**: support@edushare.edu
- **Documentation**: [Full Docs](./DOCUMENTATION_INDEX.md)

---

<div align="center">

### Made with ❤️ by students, for students

**Building a more accessible and sustainable future for education**

[![GitHub stars](https://img.shields.io/github/stars/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform?style=social)](https://github.com/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform)
[![GitHub forks](https://img.shields.io/github/forks/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform?style=social)](https://github.com/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform)
[![GitHub watchers](https://img.shields.io/github/watchers/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform?style=social)](https://github.com/ChanChen43/EduShare-Student-to-Student-Academic-Resource-Sharing-Platform)

</div>
