# Authentication Setup Guide

## Step 1: Apply Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/mlrygvsukjecwoogfkni
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-schema.sql` and run it

## Step 2: Configure Authentication Providers

### For Email/Password (Easiest for testing):
1. Go to Authentication → Settings in your Supabase dashboard
2. Email/Password should already be enabled by default

### For Social Providers (Optional):
1. Go to Authentication → Providers
2. Configure Google, Apple, Facebook with your app credentials

## Step 3: Test Account Creation

You can create a test account in two ways:

### Option A: Email/Password (Recommended for testing)
1. Click "Medium" or "Hard" difficulty in the game
2. In the auth modal, switch to "Sign Up" mode
3. Enter any email and password (e.g., test@example.com / password123)
4. Check your email for verification (or disable email confirmation in Supabase settings for testing)

### Option B: Social Login
1. Configure the social providers in Supabase
2. Use your existing Google/Apple/Facebook account

## Quick Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_results table
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  hints_used INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own game results" ON public.game_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game results" ON public.game_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## For Fastest Testing:

1. Go to Supabase → Authentication → Settings
2. Turn OFF "Enable email confirmations" for testing
3. This allows immediate account creation without email verification