-- ===================================================================
-- FINAL FIX: ลบของเก่าทิ้งหมด แล้วสร้างใหม่ (SCHEMA ถูกต้อง)
-- ===================================================================
-- แก้ปัญหา: invalid input syntax for type uuid: "free"
-- สาเหตุ: Schema ผิด! plan_id เป็น TEXT ไม่ใช่ UUID
--
-- Plans table schema:
-- - id: text (PK) -- 'free', 'starter', 'pro', 'enterprise'
-- - name: text
-- - price_monthly: integer
-- - price_yearly: integer
-- - chat_credits_monthly: integer
-- - image_credits_monthly: integer
-- - features: jsonb
-- - is_active: boolean
-- ===================================================================

-- ===================================================================
-- STEP 1: ลบ trigger และ function เก่าทิ้งหมด
-- ===================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ===================================================================
-- STEP 2: สร้าง function ใหม่ที่ถูกต้อง
-- ===================================================================

CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_free_plan_exists boolean;
BEGIN
  -- เช็คว่ามี Free plan หรือไม่ (id = 'free')
  SELECT EXISTS (
    SELECT 1 FROM public.plans WHERE id = 'free' AND is_active = true
  ) INTO v_free_plan_exists;

  -- ถ้าไม่มี Free plan ให้ error (admin ต้องสร้างก่อน)
  IF NOT v_free_plan_exists THEN
    RAISE EXCEPTION 'Free plan not found. Please create plans first.';
  END IF;

  -- สร้าง profile
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

  -- สร้าง subscription (Free plan)
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,          -- TEXT: 'free'
    status,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'free',           -- ใช้ 'free' ตรงๆ (เป็น text ไม่ใช่ uuid)
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    NOW(),
    NOW()
  );

  -- สร้าง credits
  -- ดึงค่า credits จาก Free plan
  INSERT INTO public.credits (
    user_id,
    chat_credits,
    image_credits,
    bonus_chat_credits,
    bonus_image_credits,
    credits_reset_at,
    created_at,
    updated_at
  )
  SELECT
    NEW.id,
    p.chat_credits_monthly,
    p.image_credits_monthly,
    0,
    0,
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    NOW(),
    NOW()
  FROM public.plans p
  WHERE p.id = 'free';

  RETURN NEW;
END;
$$;

-- ===================================================================
-- STEP 3: สร้าง trigger ใหม่
-- ===================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===================================================================
-- STEP 4: Backfill existing users
-- ===================================================================

DO $$
DECLARE
  v_user_record RECORD;
  v_free_plan_exists boolean;
  v_chat_credits integer;
  v_image_credits integer;
  v_users_processed integer := 0;
  v_users_total integer := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 STARTING SETUP';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- ยืนยันว่า trigger ถูกสร้างแล้ว
  RAISE NOTICE '✅ Step 1: Cleaned old trigger/function';
  RAISE NOTICE '✅ Step 2: Created new function';
  RAISE NOTICE '✅ Step 3: Created new trigger';
  RAISE NOTICE '';

  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 Step 4: Backfilling existing users...';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- เช็คว่ามี Free plan หรือไม่
  SELECT EXISTS (
    SELECT 1 FROM public.plans WHERE id = 'free' AND is_active = true
  ) INTO v_free_plan_exists;

  IF NOT v_free_plan_exists THEN
    RAISE NOTICE '❌ Free plan not found!';
    RAISE NOTICE '';
    RAISE NOTICE 'Please create Free plan first:';
    RAISE NOTICE 'INSERT INTO public.plans (id, name, price_monthly, price_yearly,';
    RAISE NOTICE '  chat_credits_monthly, image_credits_monthly, features, is_active, sort_order)';
    RAISE NOTICE 'VALUES (''free'', ''Free'', 0, 0, 50, 3,';
    RAISE NOTICE '  ''{"features": ["50 Chat credits/month", "3 Image credits/month", "Basic support"]}''::jsonb,';
    RAISE NOTICE '  true, 1);';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RETURN;
  END IF;

  -- ดึงค่า credits จาก Free plan
  SELECT chat_credits_monthly, image_credits_monthly
  INTO v_chat_credits, v_image_credits
  FROM public.plans
  WHERE id = 'free';

  RAISE NOTICE '✅ Found Free plan';
  RAISE NOTICE '   - Chat credits: %', v_chat_credits;
  RAISE NOTICE '   - Image credits: %', v_image_credits;
  RAISE NOTICE '';

  -- นับ users ที่ยังไม่มี profile
  SELECT COUNT(*) INTO v_users_total
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;

  IF v_users_total = 0 THEN
    RAISE NOTICE '✅ All users already have profiles!';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 SETUP COMPLETED';
    RAISE NOTICE '========================================';
    RETURN;
  END IF;

  RAISE NOTICE '📋 Found % users without profiles', v_users_total;
  RAISE NOTICE '🔄 Processing...';
  RAISE NOTICE '';

  -- Loop สร้าง profiles
  FOR v_user_record IN
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
    v_users_processed := v_users_processed + 1;
    RAISE NOTICE '👤 [%/%] %', v_users_processed, v_users_total, v_user_record.email;

    BEGIN
      -- Profile
      INSERT INTO public.profiles (
        id, email, full_name, avatar_url, created_at, updated_at
      ) VALUES (
        v_user_record.id,
        v_user_record.email,
        COALESCE(
          v_user_record.raw_user_meta_data->>'full_name',
          v_user_record.raw_user_meta_data->>'name',
          split_part(v_user_record.email, '@', 1)
        ),
        v_user_record.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
      );

      -- Subscription (plan_id = 'free' เป็น TEXT)
      INSERT INTO public.subscriptions (
        user_id, plan_id, status,
        current_period_start, current_period_end,
        created_at, updated_at
      ) VALUES (
        v_user_record.id,
        'free',  -- TEXT ไม่ใช่ UUID
        'active',
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW(),
        NOW()
      );

      -- Credits
      INSERT INTO public.credits (
        user_id, chat_credits, image_credits,
        bonus_chat_credits, bonus_image_credits,
        credits_reset_at, created_at, updated_at
      ) VALUES (
        v_user_record.id,
        v_chat_credits,
        v_image_credits,
        0, 0,
        DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
        NOW(),
        NOW()
      );

      RAISE NOTICE '      ✅ Done';

    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '      ❌ ERROR: %', SQLERRM;
    END;

    RAISE NOTICE '';

  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 SETUP COMPLETED!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   Trigger: ✅ Installed';
  RAISE NOTICE '   Users processed: %/%', v_users_processed, v_users_total;
  RAISE NOTICE '========================================';

END $$;

-- ===================================================================
-- ตรวจสอบผลลัพธ์
-- ===================================================================

SELECT 'Verification:' as step;

-- เช็ค trigger
SELECT
  'Trigger installed' as check_type,
  COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- เช็ค users
SELECT
  'Users with complete data' as check_type,
  COUNT(*) as count
FROM auth.users au
INNER JOIN public.profiles p ON au.id = p.id
INNER JOIN public.subscriptions s ON au.id = s.user_id
INNER JOIN public.credits c ON au.id = c.user_id;
