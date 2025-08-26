-- VocalSaaS Database Schema for Supabase
-- This file contains all the necessary tables, policies, indexes, and triggers

-- =====================================================
-- 1. VOICE MODELS TABLE
-- =====================================================
CREATE TABLE voice_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  elevenlabs_voice_id VARCHAR(255),
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE voice_models ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own voice models
CREATE POLICY "Users can view their own voice models" ON voice_models
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own voice models
CREATE POLICY "Users can insert their own voice models" ON voice_models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own voice models
CREATE POLICY "Users can update their own voice models" ON voice_models
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own voice models
CREATE POLICY "Users can delete their own voice models" ON voice_models
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. AUDIO SESSIONS TABLE
-- =====================================================
CREATE TABLE audio_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_model_id UUID REFERENCES voice_models(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  script TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER, -- in seconds
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE audio_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own sessions
CREATE POLICY "Users can view their own audio sessions" ON audio_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own sessions
CREATE POLICY "Users can insert their own audio sessions" ON audio_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own sessions
CREATE POLICY "Users can update their own audio sessions" ON audio_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own sessions
CREATE POLICY "Users can delete their own audio sessions" ON audio_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. JOURNAL ENTRIES TABLE
-- =====================================================
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own journal entries
CREATE POLICY "Users can view their own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own journal entries
CREATE POLICY "Users can insert their own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own journal entries
CREATE POLICY "Users can update their own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own journal entries
CREATE POLICY "Users can delete their own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
-- Index for voice models by user
CREATE INDEX idx_voice_models_user_id ON voice_models(user_id);

-- Index for audio sessions by user
CREATE INDEX idx_audio_sessions_user_id ON audio_sessions(user_id);

-- Index for audio sessions by voice model
CREATE INDEX idx_audio_sessions_voice_model_id ON audio_sessions(voice_model_id);

-- Index for journal entries by user
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);

-- Index for created_at timestamps
CREATE INDEX idx_voice_models_created_at ON voice_models(created_at);
CREATE INDEX idx_audio_sessions_created_at ON audio_sessions(created_at);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);

-- =====================================================
-- 5. CREATE FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_voice_models_updated_at 
    BEFORE UPDATE ON voice_models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_sessions_updated_at 
    BEFORE UPDATE ON audio_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================
-- 
-- This schema creates:
-- - 3 main tables: voice_models, audio_sessions, journal_entries
-- - Row Level Security (RLS) enabled on all tables
-- - User-specific access policies for all CRUD operations
-- - Performance indexes on foreign keys and timestamps
-- - Automatic updated_at timestamp management
-- - Proper foreign key relationships with cascade delete
--
-- To apply this schema:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Run the SQL commands
--
-- Note: The auth.users table is automatically created by Supabase Auth
-- =====================================================
