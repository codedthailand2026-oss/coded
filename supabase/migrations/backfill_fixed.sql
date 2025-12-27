-- ===================================================================
-- BACKFILL SCRIPT - FIXED VERSION
-- ===================================================================
-- แก้ไข syntax error แล้ว - พร้อม run เลย
-- Copy ทั้งหมด → Paste ใน Supabase SQL Editor → Run
-- ===================================================================

DO $$
DECLARE
  user_record RECORD;
  free_plan_id uuid;
  plan_count integer;
  users_processed integer := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 Checking plans table...';
  RAISE NOTICE '';

  -- 1. เช็คว่ามี plan อยู่กี่ตัว
  SELECT COUNT(*) INTO plan_count FROM public.plans;
  RAISE NOTICE '📊 Total plans in database: %', plan_count;

  -- 2. หา Free plan
  SELECT id INTO free_plan_id
  FROM public.plans
  WHERE LOWER(name) = 'free'
  LIMIT 1;

  IF free_plan_id IS NOT NULL THEN
    RAISE NOTICE '✅ Found Free plan: %', free_plan_id;
  ELSE
    RAISE NOTICE '⚠️  Creating Free plan...';

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
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📋 Starting backfill...';
  RAISE NOTICE '';

  -- 3. Loop ผ่าน users ที่ยังไม่มี profile
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
    RAISE NOTICE '👤 [%] %', users_processed, user_record.email;

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
      RAISE NOTICE '      ✅ Profile';

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
      RAISE NOTICE '      ✅ Subscription';

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
      RAISE NOTICE '      ✅ Credits (50 chat, 3 image)';
      RAISE NOTICE '';

    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '      ❌ ERROR: %', SQLERRM;
      RAISE NOTICE '';
    END;

  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 Backfill completed!';
  RAISE NOTICE '📊 Users processed: %', users_processed;
  RAISE NOTICE '========================================';

END $$;
