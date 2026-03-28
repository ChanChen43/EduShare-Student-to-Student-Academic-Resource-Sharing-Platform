# EduShare - Project Architecture

## Overview

EduShare is built as a modern, full-stack web application using React, TypeScript, Tailwind CSS, and Supabase. This document outlines the technical architecture and design decisions.

## Technology Stack

### Frontend
- **React 18.3.1**: UI library
- **TypeScript**: Type safety
- **React Router v7**: Client-side routing
- **Tailwind CSS v4**: Utility-first styling
- **Shadcn/ui**: Component library
- **Recharts**: Data visualization
- **Lucide React**: Icon library
- **React Hook Form**: Form management
- **Sonner**: Toast notifications

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Real-time subscriptions
  - Edge Functions
  - Row Level Security

### Build Tools
- **Vite**: Build tool and dev server
- **pnpm**: Package manager
- **TypeScript**: Type checking

## Project Structure

```
edushare/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/                 # Reusable UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ... (30+ components)
│   │   │   ├── Auth.tsx            # Authentication page
│   │   │   ├── Dashboard.tsx       # Main dashboard
│   │   │   ├── ItemListing.tsx     # Browse items page
│   │   │   ├── AddItem.tsx         # Add new item form
│   │   │   ├── MyItems.tsx         # User's items list
│   │   │   ├── Reservations.tsx    # Reservations management
│   │   │   ├── Messages.tsx        # Messaging system
│   │   │   ├── AdminPanel.tsx      # Admin dashboard
│   │   │   ├── Reports.tsx         # Analytics/reports
│   │   │   └── Layout.tsx          # Main layout wrapper
│   │   └── App.tsx                 # Root component with routing
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication context
│   │
│   ├── lib/
│   │   └── supabase.ts             # Supabase client & types
│   │
│   └── styles/
│       ├── index.css               # Global styles
│       ├── theme.css               # Theme variables
│       ├── tailwind.css            # Tailwind base
│       └── fonts.css               # Font imports
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql  # Database schema
│   │   └── 002_email_triggers.sql  # Email notification triggers
│   ├── functions/
│   │   └── send-email/
│   │       └── index.ts            # Email edge function
│   └── seed.sql                    # Sample data
│
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind config
│
└── Documentation/
    ├── README.md                   # Main documentation
    ├── SETUP.md                    # Quick setup guide
    ├── SUPABASE_SETUP.md           # Supabase configuration
    ├── FEATURES.md                 # Feature documentation
    ├── DEPLOYMENT.md               # Deployment guide
    └── ARCHITECTURE.md             # This file
```

## Component Architecture

### Component Hierarchy

```
App (Router)
├── AuthProvider (Context)
│   ├── Auth (Public)
│   │   ├── Login Form
│   │   └── Register Form
│   │
│   └── Protected Routes
│       └── Layout (Navigation)
│           ├── Dashboard
│           │   ├── Stats Cards
│           │   ├── Recent Items
│           │   └── My Reservations
│           │
│           ├── ItemListing
│           │   ├── Search/Filter Bar
│           │   └── Item Cards
│           │
│           ├── AddItem
│           │   └── Item Form
│           │
│           ├── MyItems
│           │   └── Item Cards
│           │
│           ├── Reservations
│           │   └── Reservation Cards
│           │
│           ├── Messages
│           │   ├── Conversation List
│           │   └── Chat Interface
│           │
│           ├── AdminPanel
│           │   ├── Stats Dashboard
│           │   ├── Pending Items
│           │   ├── All Items
│           │   └── Users List
│           │
│           └── Reports
│               ├── Stats Cards
│               ├── Pie Chart
│               ├── Bar Charts
│               └── Impact Metrics
```

## Data Flow

### Authentication Flow

```
1. User → Auth Component
2. Auth Component → Supabase Auth
3. Supabase Auth → Returns Session
4. Session → AuthContext
5. AuthContext → Fetch User Profile
6. User Profile → Update Context State
7. Context State → Available to All Components
```

### Item Creation Flow

```
1. User → AddItem Form
2. Form Validation
3. Image Upload → Supabase Storage
4. Get Image Public URL
5. Item Data + Image URL → Supabase Database
6. Database Trigger → Set Status: Pending
7. Success → Navigate to My Items
8. Admin → Receives Notification
```

### Reservation Flow

```
1. User → Click Reserve on Item
2. Create Reservation Record
   - Set expires_at: +24 hours
   - Status: pending
3. Update Item Status → Reserved
4. Database Trigger → Notify Donor
5. User & Donor → Can Message
6. Donor → Confirms Reservation
7. Status → confirmed
8. After Return → Mark Completed
9. Update Donor Points (+10)
10. Item Status → Available
```

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │────┐
│ name         │    │
│ email        │    │
│ role         │    │
│ points       │    │
└──────────────┘    │
                    │
                    │ donor_id (FK)
                    │
                    ▼
              ┌──────────────┐
              │    items     │
              ├──────────────┤
              │ id (PK)      │────┐
              │ title        │    │
              │ category     │    │
              │ description  │    │
              │ condition    │    │
              │ status       │    │
              │ donor_id(FK) │    │
              │ image_url    │    │
              └──────────────┘    │
                                  │ item_id (FK)
                                  │
                                  ▼
                            ┌────────────────┐
                            │ reservations   │
                            ├────────────────┤
                            │ id (PK)        │
                            │ item_id (FK)   │
                            │ borrower_id(FK)│
                            │ status         │
                            │ reserved_at    │
                            │ expires_at     │
                            └────────────────┘

┌──────────────┐
│   messages   │
├──────────────┤
│ id (PK)      │
│ sender_id(FK)│
│ receiver_id  │
│ item_id (FK) │
│ message_text │
│ timestamp    │
└──────────────┘
```

### Indexes

- `items.donor_id` - Fast donor lookups
- `items.status` - Fast status filtering
- `reservations.borrower_id` - Fast user reservations
- `reservations.item_id` - Fast item reservations
- `messages.sender_id` - Fast sender messages
- `messages.receiver_id` - Fast receiver messages

## Security Architecture

### Row Level Security (RLS)

Each table has RLS policies:

**users table:**
- Anyone can view profiles
- Users can only update their own profile

**items table:**
- Anyone can view items
- Only donors can create items
- Donors can update/delete own items
- Admins can update/delete any item

**reservations table:**
- Users can view their own reservations
- Donors can view reservations for their items
- Users can create/update own reservations

**messages table:**
- Users can only view messages they sent/received
- Users can only send messages as themselves

### Authentication Security

- Passwords hashed with bcrypt
- JWT tokens for session management
- Tokens stored in httpOnly cookies
- CSRF protection enabled
- XSS prevention via React
- SQL injection prevented by Supabase

## State Management

### Global State (Context API)

**AuthContext:**
- Current user
- Session
- Loading state
- Auth methods (signIn, signUp, signOut)

### Local State (useState)

Each component manages its own:
- Form data
- Loading states
- Error messages
- UI state (modals, dropdowns, etc.)

### Server State (Supabase)

Data fetched from Supabase:
- User profiles
- Items
- Reservations
- Messages
- Analytics data

## Routing Strategy

### Route Structure

```
/ → Auth page (public)
  → Redirects to /dashboard if logged in

/dashboard → Dashboard (protected)
/items → Item listing (protected)
/add-item → Add item form (protected, donors only)
/my-items → User's items (protected, donors only)
/reservations → User's reservations (protected)
/messages → Messaging (protected)
/admin → Admin panel (protected, admins only)
/reports → Analytics (protected, admins only)
```

### Route Guards

**PrivateRoute Component:**
- Checks authentication status
- Shows loading spinner while checking
- Redirects to auth page if not logged in
- Renders protected component if authenticated

**Role-Based Access:**
- Checked in component (not route level)
- Admin routes show "Access Denied" for non-admins
- Donor-specific routes hidden from beneficiaries

## Real-time Features

### Supabase Realtime

**Messages Real-time:**
```typescript
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, handleNewMessage)
  .subscribe()
```

**Benefits:**
- Instant message delivery
- No polling required
- Low latency
- Efficient bandwidth usage

## Performance Optimizations

### Code Splitting

```typescript
const Dashboard = lazy(() => import('./components/Dashboard'));
const Messages = lazy(() => import('./components/Messages'));
```

### Image Optimization

- Lazy loading for images
- Supabase CDN delivery
- Image size limits (10MB)
- Responsive images

### Database Optimization

- Indexed foreign keys
- Efficient query patterns
- Pagination for large lists
- Select only needed fields

### Caching Strategy

- Browser caching for static assets
- Supabase CDN caching
- Client-side data caching (React state)

## Error Handling

### Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### API Error Handling

```typescript
try {
  const { data, error } = await supabase.from('items').select();
  if (error) throw error;
} catch (error) {
  console.error('Error:', error);
  toast.error(error.message);
}
```

### User Feedback

- Toast notifications for actions
- Loading spinners for async operations
- Error messages inline with forms
- Empty states with helpful guidance

## Testing Strategy

### Unit Tests

```bash
# Install testing libraries
pnpm add -D vitest @testing-library/react

# Run tests
pnpm test
```

### Integration Tests

- Test user flows
- Test database operations
- Test authentication

### E2E Tests

```bash
# Install Playwright
pnpm add -D @playwright/test

# Run E2E tests
pnpm test:e2e
```

## Deployment Architecture

### Production Stack

```
User Browser
    ↓
Vercel/Netlify (CDN + Hosting)
    ↓
Supabase (API + Database + Storage)
    ↓
PostgreSQL Database
```

### CI/CD Pipeline

```
1. Push to GitHub
2. GitHub Actions triggered
3. Run tests
4. Build application
5. Deploy to Vercel
6. Run smoke tests
7. Notify team
```

## Monitoring & Analytics

### Application Monitoring

- **Vercel Analytics**: Page views, performance
- **Sentry**: Error tracking
- **Supabase Logs**: Database queries, auth events

### Database Monitoring

- Query performance
- Connection pool usage
- Storage usage
- Backup status

## Scalability Considerations

### Horizontal Scaling

- Stateless application design
- Database connection pooling
- CDN for static assets
- Edge functions for API logic

### Vertical Scaling

- Supabase can upgrade database resources
- Increase storage capacity
- Add read replicas

### Performance Targets

- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s
- **Database Query Time**: < 100ms
- **API Response Time**: < 200ms

## Future Enhancements

### Technical Improvements

- [ ] GraphQL API layer
- [ ] Redis caching
- [ ] Full-text search (PostgreSQL)
- [ ] Image CDN optimization
- [ ] Progressive Web App (PWA)
- [ ] Mobile app (React Native)
- [ ] Microservices architecture
- [ ] Event-driven architecture
- [ ] Message queue (for emails)
- [ ] Advanced analytics

### Infrastructure

- [ ] Multi-region deployment
- [ ] Database replication
- [ ] Automated backups
- [ ] Disaster recovery plan
- [ ] Load balancing
- [ ] Auto-scaling

## Development Workflow

### Local Development

```bash
1. Clone repository
2. Install dependencies (pnpm install)
3. Set up .env file
4. Run migrations in Supabase
5. Start dev server (pnpm dev)
6. Make changes
7. Test locally
8. Commit and push
```

### Code Standards

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Component naming**: PascalCase
- **File naming**: kebab-case
- **Git commits**: Conventional Commits

## Documentation Standards

All code should be:
- Self-documenting with clear naming
- Commented for complex logic
- Documented in README for major features
- Updated when changes are made

---

For more information, see:
- [README.md](./README.md) - Getting started
- [FEATURES.md](./FEATURES.md) - Feature list
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup
