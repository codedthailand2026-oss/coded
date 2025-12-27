-- ===================================================================
-- COMPLETE SETUP: TRIGGER + BACKFILL
-- ===================================================================
-- Script นี้จะทำทุกอย่างให้อัตโนมัติ:
-- 1. ติดตั้ง trigger สำหรับ user ใหม่
-- 2. Backfill ข้อมูลให้ existing users
--
-- ⚠️ IMPORTANT: Copy ทั้งหมด → Paste ใน Supabase SQL Editor → Run
-- ===================================================================

-- ===================================================================
-- PART 1: INSTALL TRIGGER
-- ===================================================================

-- สร้าง function สำหรับสร้าง profile/subscription/credits อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- หา Free plan ID (case-insensitive)
  SELECT id INTO free_plan_id
  FROM public.plans
  WHERE LOWER(name) = 'free'
  LIMIT 1;

  -- ถ้าไม่มี Free plan ให้สร้างก่อน
  IF free_plan_id IS NULL THEN
    INSERT INTO public.plans (name, price, chat_credits, image_credits, features, is_popular)
    VALUES ('Free', 0, 50, 3, ARRAY['50 Chat credits', '3 Image credits', 'Basic support'], false)
    RETURNING id INTO free_plan_id;
  END IF;

  -- 1. สร้าง profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
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
    NOW(),
    NOW()
  );

  -- 2. สร้าง subscription (Free plan)
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
    free_plan_id,
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    NOW(),
    NOW()
  );

  -- 3. สร้าง credits (50 chat, 3 image)
  INSERT INTO public.credits (
    user_id,
    chat_credits,
    image_credits,
    bonus_chat_credits,
    bonus_image_credits,
    credits_reset_at,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    50,
    3,
    0,
    0,
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- ลบ trigger เก่า (ถ้ามี) แล้วสร้างใหม่
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===================================================================
-- PART 2: BACKFILL EXISTING USERS
-- ===================================================================

DO $$
DECLARE
  user_record RECORD;
  free_plan_id uuid;
  plan_count integer;
  users_processed integer := 0;
  users_total integer := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 STARTING COMPLETE SETUP';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- ตรวจสอบ trigger
  RAISE NOTICE '✅ Part 1: Trigger installed successfully';
  RAISE NOTICE '   - Function: handle_new_user()';
  RAISE NOTICE '   - Trigger: on_auth_user_created';
  RAISE NOTICE '';

  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 Part 2: Checking existing users...';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- เช็คว่ามี plan อยู่กี่ตัว
  SELECT COUNT(*) INTO plan_count FROM public.plans;
  RAISE NOTICE '📊 Total plans in database: %', plan_count;

  -- หา Free plan
  SELECT id INTO free_plan_id
  FROM public.plans
  WHERE LOWER(name) = 'free'
  LIMIT 1;

  IF free_plan_id IS NULL THEN
    RAISE NOTICE '⚠️  Free plan not found, creating...';

    INSERT INTO public.plans (
      name, price, chat_credits, image_credits, features, is_popular
    )
    VALUES (
      'Free', 0, 50, 3,
      ARRAY['50 Chat credits', '3 Image credits', 'Basic support']::text[],
      false
    )
    RETURNING id INTO free_plan_id;

    RAISE NOTICE '✅ Created Free plan: %', free_plan_id;
  ELSE
    RAISE NOTICE '✅ Found Free plan: %', free_plan_id;
  END IF;

  RAISE NOTICE '';

  -- นับจำนวน users ที่ยังไม่มี profile
  SELECT COUNT(*) INTO users_total
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;

  IF users_total = 0 THEN
    RAISE NOTICE '✅ All users already have profiles!';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 SETUP COMPLETED';
    RAISE NOTICE '========================================';
    RETURN;
  END IF;

  RAISE NOTICE '📋 Found % users without profiles', users_total;
  RAISE NOTICE '🔄 Starting backfill...';
  RAISE NOTICE '';

  -- Loop ผ่าน users ที่ยังไม่มี profile
  FOR user_record IN
    SELECT
      au.id,
      au.email,
      au.raw_user_meta_data,
      au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
    ORDER BY au.created_at ASC
  LOOP
    users_processed := users_processed + 1;
    RAISE NOTICE '👤 [%/%] %', users_processed, users_total, user_record.email;

    BEGIN
      -- สร้าง profile
      INSERT INTO public.profiles (
        id, email, full_name, avatar_url, created_at, updated_at
      ) VALUES (
        user_record.id,
        user_record.email,
        COALESCE(
          user_record.raw_user_meta_data->>'full_name',
          user_record.raw_user_meta_data->>'name',
          split_part(user_record.email, '@', 1)
        ),
        user_record.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
      );
      RAISE NOTICE '      ✅ Profile created';

      -- สร้าง subscription
      INSERT INTO public.subscriptions (
        user_id, plan_id, status, current_period_start,
        current_period_end, created_at, updated_at
      ) VALUES (
        user_record.id,
        free_plan_id,
        'active',
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW(),
        NOW()
      );
      RAISE NOTICE '      ✅ Subscription created (Free plan)';

      -- สร้าง credits
      INSERT INTO public.credits (
        user_id, chat_credits, image_credits, bonus_chat_credits,
        bonus_image_credits, credits_reset_at, created_at, updated_at
      ) VALUES (
        user_record.id, 50, 3, 0, 0,
        DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
        NOW(),
        NOW()
      );
      RAISE NOTICE '      ✅ Credits created (50 chat, 3 image)';
      RAISE NOTICE '';

    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '      ❌ ERROR: %', SQLERRM;
      RAISE NOTICE '';
    END;

  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 SETUP COMPLETED!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - Trigger: ✅ Installed';
  RAISE NOTICE '   - Users processed: %/%', users_processed, users_total;
  RAISE NOTICE '   - Free plan: %', free_plan_id;
  RAISE NOTICE '';
  RAISE NOTICE '🚀 New users will now get profiles automatically!';
  RAISE NOTICE '========================================';

END $$;

-- ===================================================================
-- DONE! ทุกอย่างเสร็จสมบูรณ์
-- ===================================================================
-- ตรวจสอบว่าทุกอย่างถูกต้อง:
--
-- 1. เช็ค trigger:
--    SELECT trigger_name, event_object_table
--    FROM information_schema.triggers
--    WHERE trigger_name = 'on_auth_user_created';
--
-- 2. เช็ค users:
--    SELECT
--      p.email, p.full_name,
--      pl.name as plan,
--      c.chat_credits, c.image_credits
--    FROM profiles p
--    JOIN subscriptions s ON p.id = s.user_id
--    JOIN plans pl ON s.plan_id = pl.id
--    JOIN credits c ON p.id = c.user_id;
-- ===================================================================
