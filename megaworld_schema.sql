-- MEGAWORLD Database Schema Initial Migration
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.mw_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL DEFAULT 'free' CHECK (role IN ('admin', 'author', 'premium', 'basic', 'free')),
  display_name text,
  username text UNIQUE,
  avatar_url text,
  bio text,
  join_date timestamptz DEFAULT now(),
  membership text DEFAULT 'عضو عادي',
  level int DEFAULT 1,
  xp int DEFAULT 0,
  favorite_genres text[] DEFAULT '{}',
  settings jsonb DEFAULT '{
    "font": "fn", "sz": 22, "align": "ar",
    "continuousMode": false, "theme": "bg-def",
    "sidebarVisible": true, "chapterSortOrder": "asc"
  }',
  is_banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.mw_subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text NOT NULL,
  price_monthly numeric DEFAULT 0,
  price_yearly numeric DEFAULT 0,
  max_library_size int DEFAULT 10,
  can_read_locked boolean DEFAULT false,
  can_read_premium boolean DEFAULT false,
  can_publish boolean DEFAULT false,
  ad_free boolean DEFAULT false,
  features jsonb DEFAULT '[]',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.mw_user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.mw_profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.mw_subscription_plans(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  payment_provider text,
  payment_ref text,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Novels Table
CREATE TABLE IF NOT EXISTS public.mw_novels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.mw_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE,
  author_name text DEFAULT 'مؤلف مجهول',
  description text,
  cover_url text,
  status text DEFAULT 'مستمرة' CHECK (status IN ('مستمرة', 'مكتملة', 'متوقفة')),
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'hidden')),
  genres text[] DEFAULT '{"عام"}',
  is_featured boolean DEFAULT false,
  total_views int DEFAULT 0,
  rating_avg numeric(3,2) DEFAULT 0,
  rating_count int DEFAULT 0,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Chapters Table
CREATE TABLE IF NOT EXISTS public.mw_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id uuid REFERENCES public.mw_novels(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  sort_order int DEFAULT 0,
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'subscribers_only', 'premium_only', 'private', 'hidden')),
  required_plan text DEFAULT 'free' CHECK (required_plan IN ('free', 'basic', 'premium')),
  is_locked boolean DEFAULT false,
  views int DEFAULT 0,
  word_count int DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. User Library Table
CREATE TABLE IF NOT EXISTS public.mw_user_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.mw_profiles(id) ON DELETE CASCADE,
  novel_id uuid REFERENCES public.mw_novels(id) ON DELETE CASCADE,
  status text DEFAULT 'reading' CHECK (status IN ('reading', 'completed', 'wishlist', 'following', 'onhold', 'dropped')),
  active_chapter_id uuid REFERENCES public.mw_chapters(id),
  last_read_at timestamptz DEFAULT now(),
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, novel_id)
);

-- 7. Chapter Views Table
CREATE TABLE IF NOT EXISTS public.mw_chapter_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES public.mw_chapters(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.mw_profiles(id),
  viewed_at timestamptz DEFAULT now(),
  view_date date DEFAULT current_date
);

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS public.mw_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.mw_profiles(id) ON DELETE CASCADE,
  novel_id uuid REFERENCES public.mw_novels(id) ON DELETE CASCADE,
  rating int CHECK (rating >= 1 AND rating <= 5),
  content text,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, novel_id)
);

-- 9. Initial Plans Data
INSERT INTO public.mw_subscription_plans (name, label, price_monthly, can_read_locked, sort_order)
VALUES 
('free', 'مجاني', 0, false, 0),
('basic', 'أساسي', 50, true, 1),
('premium', 'بريميوم', 100, true, 2);

-- 10. Create Profile Trigger (Automatic profile creation on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.mw_profiles (id, display_name, username)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', 'مستخدم جديد'), COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
