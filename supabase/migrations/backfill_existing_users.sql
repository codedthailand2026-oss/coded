-- ===================================================================
-- BACKFILL EXISTING USERS
-- ===================================================================
-- Script นี้สร้าง profile, subscription, credits ให้ user ที่มีอยู่แล้ว
-- (User ที่ signup ก่อนสร้าง trigger)
--
-- ⚠️ WARNING: Run ครั้งเดียวเท่านั้น!
-- ⚠️ ตรวจสอบผลลัพธ์ก่อนด้วย SELECT query ด้านล่าง
-- ===================================================================

-- 1. ดูก่อนว่ามี user ไหนที่ยังไม่มี profile
SELECT
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'full_name' as google_name,
  au.raw_user_meta_data->>'avatar_url' as google_avatar
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ถ้ามี user แสดง ให้ uncomment และรัน code ด้านล่าง
-- ===================================================================

/*
-- 2. สร้าง profile, subscription, credits ให้ existing users
DO $$
DECLARE
  user_record RECORD;
  free_plan_id uuid;
BEGIN
  -- หา Free plan ID
  SELECT id INTO free_plan_id
  FROM public.plans
  WHERE name = 'Free'
  LIMIT 1;

  -- ถ้าไม่มี Free plan ให้สร้างก่อน
  IF free_plan_id IS NULL THEN
    INSERT INTO public.plans (name, price, chat_credits, image_credits, features, is_popular)
    VALUES ('Free', 0, 50, 3, ARRAY['50 Chat credits', '3 Image credits', 'Basic support'], false)
    RETURNING id INTO free_plan_id;

    RAISE NOTICE 'Created Free plan: %', free_plan_id;
  END IF;

  -- Loop ผ่าน users ที่ยังไม่มี profile
  FOR user_record IN
    SELECT
      au.id,
      au.email,
      au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    RAISE NOTICE 'Processing user: % (%)', user_record.email, user_record.id;

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

    RAISE NOTICE 'Created profile, subscription, and credits for user: %', user_record.email;
  END LOOP;

  RAISE NOTICE 'Backfill completed!';
END $$;

-- 3. ตรวจสอบผลลัพธ์
SELECT
  au.email,
  p.full_name,
  s.status as subscription_status,
  pl.name as plan_name,
  c.chat_credits,
  c.image_credits
FROM auth.users au
INNER JOIN public.profiles p ON au.id = p.id
INNER JOIN public.subscriptions s ON au.id = s.user_id
INNER JOIN public.plans pl ON s.plan_id = pl.id
INNER JOIN public.credits c ON au.id = c.user_id
ORDER BY au.created_at DESC;
*/
