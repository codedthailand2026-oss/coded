-- ===================================================================
-- VERIFY AND INSTALL TRIGGER
-- ===================================================================
-- Script นี้จะ:
-- 1. ตรวจสอบว่า trigger ถูกติดตั้งแล้วหรือยัง
-- 2. ถ้ายังไม่มี ก็จะติดตั้งให้อัตโนมัติ
-- 3. แสดงสถานะหลังติดตั้ง
--
-- Run ใน: Supabase Dashboard → SQL Editor
-- ===================================================================

DO $$
DECLARE
  trigger_exists boolean;
  function_exists boolean;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 Checking trigger installation...';
  RAISE NOTICE '';

  -- เช็คว่า function มีหรือยัง
  SELECT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) INTO function_exists;

  -- เช็คว่า trigger มีหรือยัง
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) INTO trigger_exists;

  IF function_exists THEN
    RAISE NOTICE '✅ Function handle_new_user() exists';
  ELSE
    RAISE NOTICE '❌ Function handle_new_user() NOT FOUND';
  END IF;

  IF trigger_exists THEN
    RAISE NOTICE '✅ Trigger on_auth_user_created exists';
  ELSE
    RAISE NOTICE '❌ Trigger on_auth_user_created NOT FOUND';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';

END $$;

-- ===================================================================
-- ถ้ายังไม่มี trigger ให้ run script ด้านล่างนี้
-- (หรือ run create_handle_new_user_trigger.sql แทน)
-- ===================================================================
