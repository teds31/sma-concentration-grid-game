-- Enable Row Level Security
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_results ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create game_results table
CREATE TABLE IF NOT EXISTS public.game_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    score INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER NOT NULL, -- in milliseconds
    hints_used INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    grid_size TEXT NOT NULL, -- e.g., "4x4", "5x5", "6x6"
    cells_count INTEGER NOT NULL, -- number of cells to remember
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON public.game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_difficulty ON public.game_results(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_results_score ON public.game_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_completed ON public.game_results(completed);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON public.game_results(created_at DESC);

-- Row Level Security Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Game results policies
CREATE POLICY "Users can view their own game results"
    ON public.game_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game results"
    ON public.game_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow public read access to completed games for leaderboard (optional)
CREATE POLICY "Public can view completed games for leaderboard"
    ON public.game_results FOR SELECT
    USING (completed = true);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();