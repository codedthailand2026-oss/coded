-- ===================================================================
-- DEBUG: ตรวจสอบปัญหา
-- ===================================================================
-- Script นี้จะช่วยหาสาเหตุของ error
-- Run ก่อน COMPLETE_SETUP.sql เพื่อดูว่ามีปัญหาอะไร
-- ===================================================================

-- 1. เช็คว่า plans table มีหรือไม่
SELECT 'Table exists check:' as step;
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'plans'
) as plans_table_exists;

-- 2. เช็ค structure ของ plans table
SELECT 'Column structure:' as step;
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'plans'
ORDER BY ordinal_position;

-- 3. เช็คข้อมูลใน plans table
SELECT 'Data in plans table:' as step;
SELECT
  id,
  name,
  LOWER(name) as name_lower,
  price,
  chat_credits,
  image_credits
FROM public.plans
ORDER BY name;

-- 4. เช็คว่ามี Free plan หรือไม่ (case-insensitive)
SELECT 'Free plan lookup:' as step;
SELECT
  id,
  name,
  LOWER(name) as name_lower
FROM public.plans
WHERE LOWER(name) = 'free'
LIMIT 1;

-- 5. เช็คว่ามี users ไหนที่ยังไม่มี profile
SELECT 'Users without profiles:' as step;
SELECT COUNT(*) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 6. เช็ค trigger
SELECT 'Trigger check:' as step;
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 7. เช็ค function
SELECT 'Function check:' as step;
SELECT
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ===================================================================
-- ดูผลลัพธ์แต่ละขั้นตอน
-- ถ้ามีขั้นตอนไหน error หรือผลลัพธ์แปลก ให้บอกผม
-- ===================================================================
