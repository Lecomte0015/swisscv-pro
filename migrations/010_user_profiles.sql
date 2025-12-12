-- Migration 010: User Profiles (complément à auth.users)
-- Table pour stocker les infos custom des utilisateurs

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    tier TEXT DEFAULT 'free', -- free, premium, pro
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON public.user_profiles(tier);

-- RLS (Row Level Security) - optionnel
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Les users peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Les users peuvent update leur propre profil
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);
