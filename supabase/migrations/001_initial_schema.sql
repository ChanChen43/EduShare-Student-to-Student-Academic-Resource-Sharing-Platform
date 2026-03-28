-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('donor', 'beneficiary', 'admin')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  condition TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Available', 'Reserved', 'Borrowed')) DEFAULT 'Pending',
  donor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System can update user points via trigger and RPC" ON users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can update any user" ON users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete any user" ON users FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for items table
CREATE POLICY "Anyone can view available items" ON items FOR SELECT USING (true);
CREATE POLICY "Donors can insert items" ON items FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors can update own items" ON items FOR UPDATE USING (auth.uid() = donor_id);
CREATE POLICY "Donors can delete own items" ON items FOR DELETE USING (auth.uid() = donor_id);
CREATE POLICY "Admins can update any item" ON items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete any item" ON items FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for reservations table
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (
  auth.uid() = borrower_id OR
  EXISTS (SELECT 1 FROM items WHERE items.id = reservations.item_id AND items.donor_id = auth.uid())
);
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT WITH CHECK (auth.uid() = borrower_id);
CREATE POLICY "Borrowers can update own reservations" ON reservations FOR UPDATE USING (auth.uid() = borrower_id);
CREATE POLICY "Donors can update reservations on own items" ON reservations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM items WHERE items.id = reservations.item_id AND items.donor_id = auth.uid())
);
CREATE POLICY "Admins can update any reservation" ON reservations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Borrowers can delete own reservations" ON reservations FOR DELETE USING (auth.uid() = borrower_id);
CREATE POLICY "Donors can delete reservations on own items" ON reservations FOR DELETE USING (
  EXISTS (SELECT 1 FROM items WHERE items.id = reservations.item_id AND items.donor_id = auth.uid())
);
CREATE POLICY "Admins can delete any reservation" ON reservations FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for messages table
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (auth.uid() = sender_id);
CREATE POLICY "Admins can delete any message" ON messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy
CREATE POLICY "Anyone can view item images" ON storage.objects FOR SELECT USING (bucket_id = 'item-images');
CREATE POLICY "Authenticated users can upload item images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'item-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (
  bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_donor_id ON items(donor_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_reservations_borrower_id ON reservations(borrower_id);
CREATE INDEX IF NOT EXISTS idx_reservations_item_id ON reservations(item_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- Create function to clean up expired reservations
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
  UPDATE items
  SET status = 'Available'
  WHERE id IN (
    SELECT item_id FROM reservations
    WHERE status = 'pending' AND expires_at < NOW()
  );

  UPDATE reservations
  SET status = 'cancelled'
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
