# 🔐 OAuth Setup Checklist

> Checklist สำหรับเชื่อม Google OAuth - ใช้คู่กับ SUPABASE_OAUTH_SETUP.md

---

## ✅ Phase 1: Supabase Setup

### Google Cloud Console
- [ ] สร้าง/เลือก Google Cloud Project
- [ ] เปิด APIs & Services → Credentials
- [ ] สร้าง OAuth 2.0 Client ID (Web application)
- [ ] เพิ่ม Authorized redirect URI:
  ```
  https://<your-project-ref>.supabase.co/auth/v1/callback
  ```
- [ ] คัดลอก Client ID และ Client Secret

### Supabase Dashboard
- [ ] ไปที่ Authentication → Providers → Google
- [ ] เปิด Google provider
- [ ] วาง Client ID และ Client Secret
- [ ] กด Save
- [ ] ไปที่ Authentication → URL Configuration
- [ ] ตั้งค่า Site URL:
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`
- [ ] เพิ่ม Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback`

---

## ✅ Phase 2: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] Install สำเร็จ
- [ ] ตรวจสอบใน package.json

---

## ✅ Phase 3: Environment Variables

### สร้างไฟล์ `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] สร้างไฟล์ `.env.local`
- [ ] คัดลอก URL และ Anon Key จาก Supabase (Project Settings → API)
- [ ] ตรวจสอบว่า `.env.local` อยู่ใน `.gitignore`
- [ ] Restart dev server: `npm run dev`

---

## ✅ Phase 4: Create Supabase Clients

### ไฟล์ที่ต้องสร้าง:

- [ ] `lib/supabase/client.ts` (Browser client)
- [ ] `lib/supabase/server.ts` (Server client)
- [ ] `middleware.ts` (Root level - สำคัญ!)

**ดู code ตัวอย่างที่:** `docs/SUPABASE_OAUTH_SETUP.md` Step 4

---

## ✅ Phase 5: Update Login Page

### แก้ไข `app/(auth)/login/page.tsx`

- [ ] Import `createClient` from `@/lib/supabase/client`
- [ ] สร้าง instance: `const supabase = createClient()`
- [ ] เพิ่ม function `handleGoogleLogin()`
- [ ] เรียก `supabase.auth.signInWithOAuth({ provider: 'google', ... })`
- [ ] ตั้ง `redirectTo: ${window.location.origin}/auth/callback`
- [ ] ผูก function เข้ากับปุ่ม
- [ ] เพิ่ม error handling จาก URL params

**ดู code ตัวอย่างที่:** `docs/SUPABASE_OAUTH_SETUP.md` Step 5

---

## ✅ Phase 6: Create Callback Route

### สร้าง `app/auth/callback/route.ts`

⚠️ **สำคัญ:** ต้องเป็น `route.ts` ไม่ใช่ `page.tsx`!

- [ ] สร้างโฟลเดอร์ `app/auth/callback/`
- [ ] สร้างไฟล์ `route.ts`
- [ ] Import `createServerClient` from `@supabase/ssr`
- [ ] Export async function `GET(request: NextRequest)`
- [ ] ดึง `code` จาก URL params
- [ ] เรียก `supabase.auth.exchangeCodeForSession(code)`
- [ ] Redirect ไป `/` ถ้าสำเร็จ
- [ ] Redirect ไป `/login?error=...` ถ้าล้มเหลว

**ดู code ตัวอย่างที่:** `docs/SUPABASE_OAUTH_SETUP.md` Step 6

---

## ✅ Phase 7: Database Setup

### Run SQL Migrations

**ไปที่:** Supabase Dashboard → SQL Editor → New Query

#### 7.1 Create Trigger Function

- [ ] คัดลอก SQL จาก `docs/SUPABASE_OAUTH_SETUP.md` Step 7.1
- [ ] Run migration
- [ ] ตรวจสอบว่าไม่มี error

**Trigger ทำอะไร:**
- สร้าง profile อัตโนมัติเมื่อมี user ใหม่
- สร้าง subscription (Free plan)
- สร้าง credits (50 chat, 3 image)

#### 7.2 Setup Row Level Security

- [ ] คัดลอก SQL จาก `docs/SUPABASE_OAUTH_SETUP.md` Step 7.2
- [ ] Run migration
- [ ] ตรวจสอบว่าทุก table มี RLS enabled

---

## ✅ Phase 8: Testing

### 8.1 Basic Flow

- [ ] รัน dev server: `npm run dev`
- [ ] เปิด http://localhost:3000/login
- [ ] กดปุ่ม "Login with Google"
- [ ] **ตรวจสอบ:** Redirect ไป Google
- [ ] Login ด้วย Google account
- [ ] **ตรวจสอบ:** เห็นหน้า consent (ขออนุญาต)
- [ ] กด "Allow"
- [ ] **ตรวจสอบ:** Redirect กลับมาที่ `/auth/callback?code=...`
- [ ] **ตรวจสอบ:** Redirect ไป dashboard (/) อัตโนมัติ

### 8.2 Check Session

เปิด console แล้วรัน:

```javascript
// ตรวจสอบ cookies
document.cookie

// ตรวจสอบ localStorage
localStorage.getItem('sb-<project-ref>-auth-token')
```

- [ ] มี cookies ที่ขึ้นต้นด้วย `sb-`
- [ ] Cookies มี access token และ refresh token

### 8.3 Check Database

**Supabase Dashboard → Table Editor**

#### profiles table
- [ ] มี record ใหม่
- [ ] email ตรงกับ Google email
- [ ] full_name มีค่า (จาก Google)
- [ ] avatar_url มีค่า (จาก Google)

#### subscriptions table
- [ ] มี record ใหม่
- [ ] user_id ตรงกับ profile id
- [ ] plan_id = Free plan
- [ ] status = 'active'

#### credits table
- [ ] มี record ใหม่
- [ ] chat_credits = 50
- [ ] image_credits = 3
- [ ] bonus_credits = 0

### 8.4 Test Logout & Re-login

เพิ่ม logout function:

```typescript
const handleLogout = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.push('/login');
};
```

- [ ] Logout สำเร็จ (redirect ไป /login)
- [ ] Cookies ถูกลบ
- [ ] Login อีกครั้ง → เข้าได้ทันที
- [ ] **ไม่สร้าง profile ซ้ำ** (ตรวจสอบ database)

### 8.5 Test Error Cases

- [ ] Cancel ที่หน้า Google → redirect กลับ login
- [ ] Invalid callback URL → แสดง error message
- [ ] Refresh page หลาย ๆ ครั้ง → session ยังคงอยู่

---

## ✅ Phase 9: Production Deployment

### Vercel Environment Variables

- [ ] เพิ่ม `NEXT_PUBLIC_SUPABASE_URL`
- [ ] เพิ่ม `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase URL Configuration

- [ ] อัพเดท Site URL เป็น production URL
- [ ] อัพเดท Redirect URLs เพิ่ม production URL

### Google Cloud Console

- [ ] อัพเดท Authorized redirect URIs เพิ่ม production URL

### Test บน Production

- [ ] Deploy ขึ้น Vercel
- [ ] ทดสอบ OAuth flow บน production
- [ ] ตรวจสอบ cookies (ต้องเป็น secure, httpOnly)

---

## 🐛 Common Issues

### ❌ "Invalid Redirect URI"
**แก้:** ตรวจสอบ redirect URI ใน Google Console ตรงกับ Supabase callback URL

### ❌ "Session not found"
**แก้:** ตรวจสอบว่า Site URL ตั้งค่าถูกต้อง + cookies ไม่ถูกบล็อก

### ❌ User ถูก logout หลัง refresh
**แก้:** สร้าง `middleware.ts` (Step 4.3)

### ❌ Profile ไม่ถูกสร้างอัตโนมัติ
**แก้:** ตรวจสอบว่า trigger function ถูก apply แล้ว (ใน Supabase SQL Editor)

### ❌ "Unauthorized" เมื่อเรียก API
**แก้:** ตรวจสอบ RLS policies + ใช้ `auth.uid()` ใน query

---

## 📖 Full Documentation

ดูคำอธิบายละเอียดพร้อม code ตัวอย่างที่:
- `docs/SUPABASE_OAUTH_SETUP.md` - Setup guide ฉบับเต็ม
- `docs/API_AUTH.md` - API documentation

---

**Created:** 2025-12-25
**Last Updated:** 2025-12-25
