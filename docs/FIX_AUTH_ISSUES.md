# 🔧 Fix: Authentication & Profile Issues

## 🐛 ปัญหาที่พบ

### ปัญหาที่ 1: User ที่ถูกลบยังเข้าเว็บได้
**อาการ:** เมื่อลบ user ออกจาก database แล้ว refresh หน้า user ยังเข้าเว็บได้อยู่

**สาเหตุ:**
- Middleware เช็คแค่ `auth.users` table (Supabase Auth)
- ไม่ได้เช็คว่ามี profile ใน `public.profiles`
- Session token ยังไม่ expire ดังนั้นถึงลบ profile ออกก็ยังเข้าได้

### ปัญหาที่ 2: User ใหม่ login แล้วไม่มีข้อมูลใน DB
**อาการ:** Login ผ่าน Google สำเร็จ เข้าหน้า home ได้ แต่ไม่มีข้อมูลใน database

**สาเหตุ:**
- Trigger `handle_new_user()` **ยังไม่ได้ run ใน Supabase**
- มีแค่ไฟล์ SQL อยู่ในโค้ด แต่ยังไม่ได้ execute ใน database จริง

---

## ✅ วิธีแก้ปัญหา

### Step 1: ติดตั้ง Trigger (สำคัญมาก!)

**1.1 ตรวจสอบว่า trigger มีอยู่แล้วหรือไม่:**

```sql
-- Copy และ Run ใน Supabase SQL Editor
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**ผลลัพธ์ที่ควรได้:**
- ถ้ามี trigger แล้ว: จะมี 1 row แสดง `on_auth_user_created`
- ถ้ายังไม่มี: จะได้ 0 rows (ต้องติดตั้ง!)

**1.2 ถ้ายังไม่มี trigger ให้ติดตั้ง:**

Option A: Run verification script (แนะนำ)
```bash
# ใน Supabase SQL Editor
# Copy ทั้งหมดจาก: supabase/migrations/00_verify_and_install_trigger.sql
# Paste และ Run
```

Option B: Run trigger installation script
```bash
# ใน Supabase SQL Editor
# Copy ทั้งหมดจาก: supabase/migrations/create_handle_new_user_trigger.sql
# Paste และ Run
```

**Expected Output:**
```
✅ Function handle_new_user() exists
✅ Trigger on_auth_user_created exists
```

---

### Step 2: Backfill Existing Users (ถ้ามี)

ถ้ามี users ที่ login ไปแล้วแต่ยังไม่มี profile ให้ run:

```bash
# ใน Supabase SQL Editor
# Copy ทั้งหมดจาก: supabase/migrations/backfill_fixed.sql
# Paste และ Run
```

**Expected Output:**
```
========================================
🔍 Checking plans table...

📊 Total plans in database: 4
✅ Found Free plan: [uuid]

========================================
📋 Starting backfill...

👤 [1] user@example.com
      ✅ Profile
      ✅ Subscription
      ✅ Credits (50 chat, 3 image)

========================================
🎉 Backfill completed!
📊 Users processed: 1
========================================
```

---

### Step 3: แก้ไข Code (ทำเสร็จแล้ว ✅)

**3.1 Middleware ปรับปรุงแล้ว** (`middleware.ts`)
- ✅ เพิ่มการเช็ค profile ก่อนให้เข้าหน้าใดๆ
- ✅ ถ้าไม่มี profile จะ redirect ไป `/setup-profile`
- ✅ ป้องกัน infinite loop ด้วย whitelist `/setup-profile`

**3.2 หน้า Setup Profile** (`src/app/setup-profile/page.tsx`)
- ✅ แสดง loading screen
- ✅ เรียก API สร้าง profile อัตโนมัติ
- ✅ สร้าง profile, subscription (Free), credits (50 chat, 3 image)
- ✅ Redirect ไป home หลังสำเร็จ

**3.3 API Route** (`src/app/api/setup-profile/route.ts`)
- ✅ สร้าง profile, subscription, credits
- ✅ ใช้ Free plan
- ✅ Error handling ครบถ้วน

---

## 🧪 การทดสอบ

### ทดสอบ Case 1: User ใหม่ Login

1. ลบ test user ออกจาก `auth.users` (ถ้ามี)
2. Login ผ่าน Google ด้วย email ใหม่
3. ✅ **Expected:**
   - Redirect ไปหน้า home อัตโนมัติ
   - มีข้อมูลใน `profiles`, `subscriptions`, `credits` tables
   - Sidebar แสดง user info, credits (50 chat, 3 image)

### ทดสอบ Case 2: User ที่ไม่มี Profile

1. ลบ profile ของ user ออกจาก database (เก็บ `auth.users` ไว้)
2. Refresh หน้าเว็บ
3. ✅ **Expected:**
   - Redirect ไป `/setup-profile` อัตโนมัติ
   - แสดง "Setting up your account..."
   - สร้าง profile, subscription, credits ให้
   - Redirect กลับ home
   - Sidebar แสดงข้อมูลถูกต้อง

### ทดสอบ Case 3: User ถูกลบออกจาก DB

1. ลบ user ทั้งหมดออกจาก `auth.users` และ `profiles`
2. Refresh หน้า (session token ยังอยู่)
3. ✅ **Expected:**
   - Supabase จะ invalidate session เพราะ user ไม่อยู่ใน `auth.users`
   - Redirect ไป `/login` อัตโนมัติ

---

## 📂 Files Changed

| File | Changes |
|------|---------|
| `middleware.ts` | เพิ่มการเช็ค profile, redirect ไป `/setup-profile` ถ้าไม่มี |
| `src/app/setup-profile/page.tsx` | หน้าใหม่: auto-create profile |
| `src/app/api/setup-profile/route.ts` | API ใหม่: สร้าง profile/subscription/credits |
| `supabase/migrations/00_verify_and_install_trigger.sql` | Script ตรวจสอบ trigger |

---

## 🔑 Key Points

1. **Trigger ต้อง run ใน Supabase ก่อน** - ไม่ใช่แค่มีไฟล์ในโค้ด
2. **Middleware จะ catch ทุก case** - user ไม่มี profile จะถูก redirect อัตโนมัติ
3. **Setup Profile Page = Fallback** - ถ้า trigger fail ก็จะสร้างให้ทันที
4. **RLS ยังใช้งานได้** - API ใช้ server-side client ที่มี service role

---

## 🚀 Next Steps

1. [ ] Run trigger verification script
2. [ ] ถ้ายังไม่มี trigger ให้ run installation script
3. [ ] Run backfill script สำหรับ existing users
4. [ ] ทดสอบ login ด้วย user ใหม่
5. [ ] ทดสอบลบ profile แล้ว refresh (ควร auto-create)
6. [ ] Deploy to staging/production

---

## 💡 Tips

- ถ้า trigger ยัง fail ให้เช็ค Supabase Logs (Dashboard → Logs)
- ถ้า RLS block ให้เช็ค policies ที่ `public.profiles`, `subscriptions`, `credits`
- ถ้าต้องการ manual create profile ให้เข้า `/setup-profile` ได้เลย
