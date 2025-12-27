-- ===================================================================
-- UPDATE SCHEMA FOR REDESIGN
-- ===================================================================
-- เพิ่ม columns และ tables สำหรับ redesign ตามความต้องการใหม่
--
-- Changes:
-- 1. profiles: เพิ่ม phone, company_name, job_title, industry, locale, onboarding_completed
-- 2. credits: แยก chat_credits และ graphic_credits
-- 3. projects: table ใหม่สำหรับ AI Chat projects
-- 4. plans: เพิ่ม graphic_credits_monthly
-- ===================================================================

-- ===================================================================
-- 1. ALTER profiles table - เพิ่ม columns สำหรับ onboarding
-- ===================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS locale text DEFAULT 'th',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Bangkok',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.phone IS 'Phone number with country code (e.g., +66812345678)';
COMMENT ON COLUMN public.profiles.company_name IS 'Company or organization name';
COMMENT ON COLUMN public.profiles.job_title IS 'Job title: marketing, project_manager, business_owner, content_creator, graphic_designer, etc.';
COMMENT ON COLUMN public.profiles.industry IS 'Industry: technology, retail, finance, education, healthcare, etc.';
COMMENT ON COLUMN public.profiles.locale IS 'Language preference: en, th';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether user completed onboarding flow';

-- ===================================================================
-- 2. ALTER credits table - แยก chat และ graphic credits
-- ===================================================================

-- Rename existing columns
ALTER TABLE public.credits
RENAME COLUMN chat_credits TO chat_credits_old;

ALTER TABLE public.credits
RENAME COLUMN image_credits TO graphic_credits_old;

-- Add new columns
ALTER TABLE public.credits
ADD COLUMN IF NOT EXISTS chat_credits integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS graphic_credits integer DEFAULT 0;

-- Migrate data (รวม chat + image เป็น graphic)
UPDATE public.credits
SET
  chat_credits = COALESCE(chat_credits_old, 0),
  graphic_credits = COALESCE(graphic_credits_old, 0);

-- Drop old columns (ถ้าต้องการ - ให้ uncomment)
-- ALTER TABLE public.credits DROP COLUMN chat_credits_old;
-- ALTER TABLE public.credits DROP COLUMN graphic_credits_old;

COMMENT ON COLUMN public.credits.chat_credits IS 'Credits for AI Chat feature';
COMMENT ON COLUMN public.credits.graphic_credits IS 'Credits for Graphic features (Image/Video/Audio)';

-- ===================================================================
-- 3. CREATE projects table - สำหรับ AI Chat
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  system_prompt_type text NOT NULL DEFAULT 'general',
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at DESC);

COMMENT ON TABLE public.projects IS 'AI Chat projects for organizing conversations';
COMMENT ON COLUMN public.projects.system_prompt_type IS 'System prompt type: general, marketing, analysis';

-- ===================================================================
-- 4. ALTER conversations table - เชื่อมกับ projects
-- ===================================================================

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS conversations_project_id_idx ON public.conversations(project_id);

-- ===================================================================
-- 5. ALTER messages table - เพิ่ม attachments
-- ===================================================================

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.messages.attachments IS 'Array of attachments: [{type: "file"|"image", url: "...", name: "...", size: 123}]';

-- ===================================================================
-- 6. ALTER plans table - เพิ่ม graphic_credits_monthly
-- ===================================================================

ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS graphic_credits_monthly integer DEFAULT 0;

-- Migrate data (copy from image_credits_monthly)
UPDATE public.plans
SET graphic_credits_monthly = COALESCE(image_credits_monthly, 0)
WHERE graphic_credits_monthly = 0;

COMMENT ON COLUMN public.plans.graphic_credits_monthly IS 'Monthly graphic credits (Image/Video/Audio)';

-- ===================================================================
-- 7. UPDATE trigger function - ให้ onboarding_completed = false
-- ===================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_free_plan_exists boolean;
  v_chat_credits integer;
  v_graphic_credits integer;
BEGIN
  -- เช็คว่ามี Free plan หรือไม่
  SELECT EXISTS (
    SELECT 1 FROM public.plans WHERE id = 'free' AND is_active = true
  ) INTO v_free_plan_exists;

  IF NOT v_free_plan_exists THEN
    RAISE EXCEPTION 'Free plan not found. Please create plans first.';
  END IF;

  -- ดึงค่า credits จาก Free plan
  SELECT chat_credits_monthly, graphic_credits_monthly
  INTO v_chat_credits, v_graphic_credits
  FROM public.plans
  WHERE id = 'free';

  -- สร้าง profile (onboarding_completed = false)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    onboarding_completed,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    false,  -- ต้องทำ onboarding
    NOW(),
    NOW()
  );

  -- สร้าง subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'free',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    NOW(),
    NOW()
  );

  -- สร้าง credits (แยก chat และ graphic)
  INSERT INTO public.credits (
    user_id,
    chat_credits,
    graphic_credits,
    bonus_chat_credits,
    bonus_image_credits,
    credits_reset_at,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_chat_credits,
    v_graphic_credits,
    0,
    0,
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- ===================================================================
-- 8. RLS Policies for projects
-- ===================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can view their own projects
CREATE POLICY "Users can view own projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own projects
CREATE POLICY "Users can create own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
ON public.projects FOR DELETE
USING (auth.uid() = user_id);

-- ===================================================================
-- DONE!
-- ===================================================================

SELECT 'Schema updated successfully!' as status;
