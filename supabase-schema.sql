-- ============================================
-- Yusuf AI Chatbot - Supabase Database Schema
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- 1. Tabel chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Index untuk performa
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- 3. Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policy: user hanya bisa baca/tulis pesan sendiri
CREATE POLICY "Users can read own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Policy: anon key bisa insert (untuk API route)
CREATE POLICY "Allow insert via service"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Selesai! Tabel siap digunakan.
