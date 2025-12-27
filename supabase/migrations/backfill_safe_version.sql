-- ===================================================================
-- BACKFILL SCRIPT - SAFE VERSION (แก้ปัญหา UUID error)
-- ===================================================================
-- Version นี้จัดการ edge cases ได้ดีกว่า
-- Copy ทั้งหมด → Paste ใน Supabase SQL Editor → Run
-- ===================================================================

DO $$
DECLARE
  user_record RECORD;
  free_plan_id uuid;
  plan_count integer;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 Checking plans table...';
  RAISE NOTICE '';

  -- 1. เช็คว่ามี plan อยู่กี่ตัว
  SELECT COUNT(*) INTO plan_count FROM public.plans;
  RAISE NOTICE '📊 Total plans in database: %', plan_count;

  -- 2. หา Free plan (ลอง case-insensitive)
  SELECT id INTO free_plan_id
  FROM public.plans
  WHERE LOWER(name) = 'free'
  LIMIT 1;

  IF free_plan_id IS NOT NULL THEN
    RAISE NOTICE '✅ Found existing Free plan: %', free_plan_id;
  ELSE
    RAISE NOTICE '⚠️  No Free plan found, creating one...';

    -- สร้าง Free plan ใหม่
    INSERT INTO public.plans (
      name,
      price,
      chat_credits,
      image_credits,
      features,
      is_popular
    )
    VALUES (
      'Free',
      0,
      50,
      3,
      ARRAY['50 Chat credits', '3 Image credits', 'Basic support']::text[],
      false
    )
    RETURNING id INTO free_plan_id;

    RAISE NOTICE '✅ Created new Free plan: %', free_plan_id;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📋 Starting backfill process...';
  RAISE NOTICE '';

  -- 3. Loop ผ่าน users ที่ยังไม่มี profile
  DECLARE
    users_processed integer := 0;
  BEGIN
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

      RAISE NOTICE '👤 [%] Processing: %', users_processed, user_record.email;

      BEGIN
        -- สร้าง profile
        INSERT INTO public.profiles (
          id,
          email,
          full_name,
          avatar_url,
          created_at,
          updated_at
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
          user_id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          created_at,
          updated_at
        ) VALUES (
          user_record.id,
          free_plan_id,
          'active',
          NOW(),
          NOW() + INTERVAL '1 year',
          NOW(),
          NOW()
        );
        RAISE NOTICE '      ✅ Subscription created';

        -- สร้าง credits
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
          user_record.id,
          50,
          3,
          0,
          0,
          DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
          NOW(),
          NOW()
        );
        RAISE NOTICE '      ✅ Credits created (50 chat, 3 image)';

      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '      ❌ ERROR for user %: %', user_record.email, SQLERRM;
      END;

      RAISE NOTICE '';

    END LOOP;

    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 Backfill completed!';
    RAISE NOTICE '📊 Total users processed: %', users_processed;
    RAISE NOTICE '========================================';
  END;

END $$;

-- ===================================================================
-- ตรวจสอบผลลัพธ์
-- ===================================================================
RAISE NOTICE '';
RAISE NOTICE '📋 Final Results:';
RAISE NOTICE '';

SELECT
  au.email,
  p.full_name,
  pl.name as plan_name,
  c.chat_credits,
  c.image_credits
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.subscriptions s ON au.id = s.user_id
LEFT JOIN public.plans pl ON s.plan_id = pl.id
LEFT JOIN public.credits c ON au.id = c.user_id
ORDER BY au.created_at DESC;
