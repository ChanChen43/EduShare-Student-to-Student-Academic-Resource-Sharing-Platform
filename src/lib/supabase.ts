import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'beneficiary' | 'admin';
  points: number;
  created_at?: string;
};

export type Item = {
  id: string;
  title: string;
  category: string;
  description: string;
  condition: string;
  status: 'Pending' | 'Available' | 'Reserved' | 'Borrowed';
  donor_id: string;
  image_url?: string;
  created_at: string;
  donor?: User;
};

export type Reservation = {
  id: string;
  item_id: string;
  borrower_id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reserved_at: string;
  expires_at: string;
  item?: Item;
  borrower?: User;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  item_id: string;
  message_text: string;
  timestamp: string;
  sender?: User;
  receiver?: User;
};
