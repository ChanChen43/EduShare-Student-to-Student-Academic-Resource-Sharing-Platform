# API Documentation

## Overview

EduShare uses Supabase as its backend, which provides a REST API, GraphQL API, and real-time subscriptions. This document covers the main API operations.

## Base URLs

```
Supabase API: https://your-project.supabase.co/rest/v1
Supabase Auth: https://your-project.supabase.co/auth/v1
Supabase Storage: https://your-project.supabase.co/storage/v1
```

## Authentication

All API requests require authentication via JWT token:

```typescript
headers: {
  'apikey': 'your-anon-key',
  'Authorization': 'Bearer user-jwt-token'
}
```

### Get Current Session

```typescript
const { data: { session }, error } = await supabase.auth.getSession();
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

## Users API

### Get User Profile

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "donor",
  "points": 50,
  "created_at": "2026-03-25T12:00:00Z"
}
```

### Update User Profile

```typescript
const { data, error } = await supabase
  .from('users')
  .update({ name: 'New Name' })
  .eq('id', userId);
```

### Get All Users (Admin Only)

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .order('created_at', { ascending: false });
```

## Items API

### Get All Items

```typescript
const { data, error } = await supabase
  .from('items')
  .select('*, donor:users!items_donor_id_fkey(name, email)')
  .order('created_at', { ascending: false });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Calculus Textbook",
    "category": "Textbooks",
    "description": "8th edition, excellent condition",
    "condition": "Like New",
    "status": "Available",
    "donor_id": "uuid",
    "image_url": "https://...",
    "created_at": "2026-03-25T12:00:00Z",
    "donor": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

### Get Items by Status

```typescript
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('status', 'Available');
```

### Get Items by Category

```typescript
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('category', 'Textbooks');
```

### Search Items

```typescript
const { data, error } = await supabase
  .from('items')
  .select('*')
  .or(`title.ilike.%${query}%,description.ilike.%${query}%`);
```

### Get Single Item

```typescript
const { data, error } = await supabase
  .from('items')
  .select('*, donor:users!items_donor_id_fkey(*)')
  .eq('id', itemId)
  .single();
```

### Create Item

```typescript
const { data, error } = await supabase
  .from('items')
  .insert([{
    title: 'Item Title',
    category: 'Textbooks',
    description: 'Description here',
    condition: 'Good',
    status: 'Pending',
    donor_id: userId,
    image_url: 'https://...'
  }])
  .select();
```

### Update Item

```typescript
const { data, error } = await supabase
  .from('items')
  .update({ status: 'Available' })
  .eq('id', itemId);
```

### Delete Item

```typescript
const { data, error } = await supabase
  .from('items')
  .delete()
  .eq('id', itemId);
```

## Reservations API

### Get User Reservations

```typescript
const { data, error } = await supabase
  .from('reservations')
  .select(`
    *,
    item:items(*),
    borrower:users!reservations_borrower_id_fkey(*)
  `)
  .eq('borrower_id', userId)
  .order('reserved_at', { ascending: false });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "item_id": "uuid",
    "borrower_id": "uuid",
    "status": "pending",
    "reserved_at": "2026-03-25T12:00:00Z",
    "expires_at": "2026-03-26T12:00:00Z",
    "item": {
      "title": "Calculus Textbook",
      "category": "Textbooks"
    }
  }
]
```

### Create Reservation

```typescript
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);

const { data, error } = await supabase
  .from('reservations')
  .insert([{
    item_id: itemId,
    borrower_id: userId,
    status: 'pending',
    reserved_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString()
  }])
  .select();
```

### Update Reservation Status

```typescript
const { data, error } = await supabase
  .from('reservations')
  .update({ status: 'confirmed' })
  .eq('id', reservationId);
```

### Cancel Reservation

```typescript
const { data, error } = await supabase
  .from('reservations')
  .update({ status: 'cancelled' })
  .eq('id', reservationId);
```

## Messages API

### Get Conversations

```typescript
const { data, error } = await supabase
  .from('messages')
  .select('*, sender:users!messages_sender_id_fkey(*), receiver:users!messages_receiver_id_fkey(*)')
  .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
  .order('timestamp', { ascending: false });
```

### Get Messages Between Users

```typescript
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .or(
    `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
  )
  .order('timestamp', { ascending: true });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "item_id": "uuid",
    "message_text": "Hello, is this still available?",
    "timestamp": "2026-03-25T12:00:00Z"
  }
]
```

### Send Message

```typescript
const { data, error } = await supabase
  .from('messages')
  .insert([{
    sender_id: userId,
    receiver_id: recipientId,
    item_id: itemId,
    message_text: 'Message content',
    timestamp: new Date().toISOString()
  }]);
```

### Real-time Message Subscription

```typescript
const subscription = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

## Storage API

### Upload Image

```typescript
const file = event.target.files[0];
const fileExt = file.name.split('.').pop();
const fileName = `${userId}-${Date.now()}.${fileExt}`;

const { data, error } = await supabase.storage
  .from('item-images')
  .upload(fileName, file);
```

### Get Public URL

```typescript
const { data } = supabase.storage
  .from('item-images')
  .getPublicUrl(fileName);

const publicUrl = data.publicUrl;
```

### Delete Image

```typescript
const { error } = await supabase.storage
  .from('item-images')
  .remove([fileName]);
```

### List Images

```typescript
const { data, error } = await supabase.storage
  .from('item-images')
  .list(userId);
```

## Admin APIs

### Approve Item

```typescript
const { data, error } = await supabase
  .from('items')
  .update({ status: 'Available' })
  .eq('id', itemId);
```

### Get Pending Items

```typescript
const { data, error } = await supabase
  .from('items')
  .select('*, donor:users!items_donor_id_fkey(*)')
  .eq('status', 'Pending')
  .order('created_at', { ascending: false });
```

### Update User Points

```typescript
const { data, error } = await supabase
  .from('users')
  .update({ points: currentPoints + 10 })
  .eq('id', userId);
```

## Analytics APIs

### Get Total Counts

```typescript
// Total Users
const { count: totalUsers } = await supabase
  .from('users')
  .select('*', { count: 'exact', head: true });

// Total Items
const { count: totalItems } = await supabase
  .from('items')
  .select('*', { count: 'exact', head: true });

// Total Reservations
const { count: totalReservations } = await supabase
  .from('reservations')
  .select('*', { count: 'exact', head: true });
```

### Get Items by Category

```typescript
const { data, error } = await supabase
  .from('items')
  .select('category');

// Process to count by category
const categoryCounts = data.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + 1;
  return acc;
}, {});
```

## Error Handling

All API calls return an error object if something goes wrong:

```typescript
const { data, error } = await supabase
  .from('items')
  .select('*');

if (error) {
  console.error('Error:', error.message);
  // Handle error
}
```

Common error codes:
- `PGRST116`: No rows found
- `42501`: Insufficient privileges
- `23505`: Unique constraint violation
- `23503`: Foreign key violation

## Rate Limiting

Supabase free tier limits:
- 50,000 monthly active users
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth

For production, upgrade to Pro tier for higher limits.

## Best Practices

### 1. Always Select Specific Fields

```typescript
// Good
.select('id, title, category')

// Avoid
.select('*')
```

### 2. Use Pagination

```typescript
const { data, error } = await supabase
  .from('items')
  .select('*')
  .range(0, 9); // First 10 items
```

### 3. Use Filters Efficiently

```typescript
// Combine filters
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('status', 'Available')
  .eq('category', 'Textbooks')
  .order('created_at', { ascending: false });
```

### 4. Handle Errors Gracefully

```typescript
try {
  const { data, error } = await supabase
    .from('items')
    .select('*');

  if (error) throw error;

  return data;
} catch (error) {
  console.error('Error fetching items:', error);
  toast.error('Failed to load items');
  return [];
}
```

### 5. Use TypeScript Types

```typescript
type Item = {
  id: string;
  title: string;
  category: string;
  // ... other fields
};

const { data, error } = await supabase
  .from('items')
  .select('*')
  .returns<Item[]>();
```

## Testing APIs

### Using Postman

1. Set up environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `USER_TOKEN` (from auth)

2. Add headers to all requests:
   ```
   apikey: {{SUPABASE_ANON_KEY}}
   Authorization: Bearer {{USER_TOKEN}}
   ```

3. Make requests to:
   ```
   GET {{SUPABASE_URL}}/rest/v1/items
   POST {{SUPABASE_URL}}/rest/v1/items
   ```

### Using cURL

```bash
curl -X GET \
  'https://your-project.supabase.co/rest/v1/items' \
  -H 'apikey: your-anon-key' \
  -H 'Authorization: Bearer your-jwt-token'
```

## Webhooks (Future)

EduShare can be extended to send webhooks for events:

- Item created
- Item approved
- Reservation made
- Message sent
- User registered

Configure in Supabase Dashboard > Database > Webhooks

---

For more information, see:
- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript)
- [Supabase REST API Documentation](https://supabase.com/docs/guides/api)
