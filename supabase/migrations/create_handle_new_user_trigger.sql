-- ===================================================================
-- AUTO CREATE PROFILE, SUBSCRIPTION, CREDITS AFTER USER SIGNUP
-- ===================================================================
-- Trigger นี้จะทำงานอัตโนมัติเมื่อมี user ใหม่ใน auth.users
-- (ไม่ว่าจะ signup ด้วย Email หรือ Google OAuth)
--
-- Run script นี้ใน: Supabase Dashboard → SQL Editor → New Query
-- แล้ว Paste ทั้งหมดนี้ → Run
-- ===================================================================

-- 1. สร้าง function สำหรับสร้าง profile/subscription/credits อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- หา Free plan ID
  SELECT id INTO free_plan_id
  FROM public.plans
  WHERE name = 'Free'
  LIMIT 1;

  -- ถ้าไม่มี Free plan ให้สร้างก่อน (กรณี migration แรก)
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
    -- ดึง name จาก Google OAuth metadata (ถ้ามี)
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)  -- fallback: ใช้ส่วนหน้า @ ของ email
    ),
    -- ดึง avatar จาก Google (ถ้ามี)
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
    NOW() + INTERVAL '1 year',  -- Free plan ไม่หมดอายุ (set 1 ปี)
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
    50,   -- Free plan chat credits
    3,    -- Free plan image credits
    0,    -- ยังไม่มี bonus
    0,
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',  -- Reset ต้นเดือนหน้า
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- 2. ลบ trigger เก่า (ถ้ามี) แล้วสร้างใหม่
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. ตรวจสอบว่า trigger ถูกสร้างแล้ว
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ===================================================================
-- DONE! Trigger พร้อมใช้งาน
-- ===================================================================
-- ทดสอบ: ลอง login ด้วย Google account ใหม่
-- ตรวจสอบ: profiles, subscriptions, credits tables ควรมีข้อมูลอัตโนมัติ
-- ===================================================================
