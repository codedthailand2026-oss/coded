# 🔐 Supabase OAuth Setup Guide

> คู่มือการเชื่อม Google OAuth กับ Frontend ผ่าน Supabase
> อธิบายทีละขั้นตอนพร้อมหลักการทำงาน

---

## 📋 Table of Contents

1. [Overview - ภาพรวมการทำงาน](#overview)
2. [Step 1: Setup Supabase Project](#step-1-setup-supabase-project)
3. [Step 2: Install Dependencies](#step-2-install-dependencies)
4. [Step 3: Environment Variables](#step-3-environment-variables)
5. [Step 4: Create Supabase Client](#step-4-create-supabase-client)
6. [Step 5: Implement OAuth Login](#step-5-implement-oauth-login)
7. [Step 6: Create Callback Page](#step-6-create-callback-page)
8. [Step 7: Setup Database Triggers](#step-7-setup-database-triggers)
9. [Testing](#testing)

---

## Overview

### ภาพรวมการทำงานของ OAuth Flow

```
User คลิก "Login with Google"
         ↓
Frontend redirect ไป Google
         ↓
User login ที่ Google + อนุญาตให้เข้าถึงข้อมูล
         ↓
Google redirect กลับมาที่ /auth/callback พร้อม code
         ↓
Supabase แลก code เป็น token อัตโนมัติ
         ↓
ตรวจสอบว่า user มีในระบบหรือยัง
         ↓
┌─────────────┬─────────────┐
│ User ใหม่   │ User เก่า   │
│ - สร้าง     │ - Login     │
│   profile   │   เลย       │
│ - สร้าง     │             │
│   credits   │             │
└─────────────┴─────────────┘
         ↓
Redirect ไป Dashboard
```

### ทำไมใช้ Supabase Auth?

**ข้อดี:**
- ✅ จัดการ OAuth flow ให้อัตโนมัติ
- ✅ เก็บ session/token ได้อัตโนมัติ
- ✅ Refresh token อัตโนมัติเมื่อหมดอายุ
- ✅ มี built-in security (PKCE flow)
- ✅ ไม่ต้องจัดการ cookies/localStorage เอง

**ทำอะไรให้เรา:**
- จัดการ redirect URLs
- แลก authorization code → access token
- เก็บ user session
- Refresh token เมื่อใกล้หมดอายุ

---

## Step 1: Setup Supabase Project

### 1.1 เปิดใช้งาน Google OAuth

1. ไปที่ [Supabase Dashboard](https://app.supabase.com)
2. เลือก Project → Authentication → Providers
3. เปิด **Google** provider

### 1.2 ตั้งค่า Google Cloud Console

**ทำไมต้องทำ:** Supabase ต้องการ Client ID และ Secret จาก Google เพื่อยืนยันตัวตน

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้าง Project (หรือเลือก project ที่มีอยู่)
3. เปิด **APIs & Services** → **Credentials**
4. คลิก **Create Credentials** → **OAuth 2.0 Client ID**
5. เลือก Application type: **Web application**

**Authorized redirect URIs:**
```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

**หาที่ไหน:** Supabase Dashboard → Authentication → Providers → Google จะมี redirect URL ให้

6. คัดลอก **Client ID** และ **Client Secret**
7. วางใน Supabase Dashboard (Google provider settings)
8. กด **Save**

### 1.3 ตั้งค่า Site URL

**ทำไมสำคัญ:** หลัง login สำเร็จ Supabase จะ redirect กลับมาที่ URL นี้

**ไปที่:** Supabase Dashboard → Authentication → URL Configuration

```
Site URL (Production): https://yourdomain.com
Site URL (Development): http://localhost:3000
```

**Redirect URLs (allowed):**
```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

---

## Step 2: Install Dependencies

### 2.1 ติดตั้ง Supabase Client

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Package อธิบาย:**
- `@supabase/supabase-js` - Core library สำหรับเชื่อมต่อ Supabase
- `@supabase/ssr` - Server-side rendering support สำหรับ Next.js App Router

**ทำไมต้องใช้ @supabase/ssr:**
Next.js App Router มีทั้ง Server Component และ Client Component
- Server: ใช้ cookies สำหรับ session (secure, httpOnly)
- Client: ใช้ localStorage + cookies
- `@supabase/ssr` จัดการให้อัตโนมัติ

---

## Step 3: Environment Variables

### 3.1 สร้างไฟล์ `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**หาที่ไหน:**
Supabase Dashboard → Project Settings → API

**ทำไมต้องมี NEXT_PUBLIC_:**
- Prefix `NEXT_PUBLIC_` = ตัวแปรนี้จะถูกส่งไปที่ browser (Client Component)
- ไม่มี prefix = ใช้ได้เฉพาะ server-side only

**Anon Key ปลอดภัยไหม:**
✅ ปลอดภัย! Anon key ใช้สำหรับ public access
- Row Level Security (RLS) ป้องกันการเข้าถึงข้อมูล
- API Gateway ของ Supabase ตรวจสอบทุก request
- Secret Key ต้องไม่เปิดเผยเด็ดขาด (สำหรับ admin operations)

### 3.2 Update `.gitignore`

```bash
# Environment
.env.local
.env*.local
```

**ทำไม:** ป้องกันไม่ให้ secret keys ถูก commit ขึ้น GitHub

---

## Step 4: Create Supabase Client

### 4.1 สร้าง Client สำหรับ Browser

**ไฟล์:** `lib/supabase/client.ts`

```typescript
/**
 * Supabase Client for Browser (Client Components)
 *
 * ใช้ใน Client Components เท่านั้น (components ที่มี "use client")
 * จัดการ session ผ่าน localStorage + cookies
 *
 * Use cases:
 * - OAuth login/logout
 * - Real-time subscriptions
 * - Client-side data fetching
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**ทำไมใช้ createBrowserClient:**
- จัดการ cookies อัตโนมัติ (ผ่าน document.cookie)
- Sync session ระหว่าง tabs (ใช้ localStorage + BroadcastChannel)
- Refresh token อัตโนมัติเมื่อใกล้หมดอายุ

### 4.2 สร้าง Client สำหรับ Server

**ไฟล์:** `lib/supabase/server.ts`

```typescript
/**
 * Supabase Client for Server (Server Components, API Routes)
 *
 * ใช้ใน Server Components และ API Routes
 * จัดการ session ผ่าน cookies (httpOnly, secure)
 *
 * Use cases:
 * - Server-side data fetching
 * - API route handlers
 * - Middleware authentication
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ในบาง environment cookies อาจเป็น read-only
            // เช่นใน Server Component ที่ render ครั้งแรก
          }
        },
      },
    }
  )
}
```

**ทำไมแยก client:**
- Browser client: จัดการ session ใน browser
- Server client: จัดการ session ใน server (secure cookies)
- Next.js App Router ต้องการทั้ง 2 แบบ

### 4.3 สร้าง Middleware (Optional แต่แนะนำ)

**ไฟล์:** `middleware.ts` (ไฟล์นี้อยู่ที่ root ของ project)

```typescript
/**
 * Next.js Middleware
 *
 * ทำงานก่อน request จะถึง page
 * ใช้สำหรับ:
 * - ตรวจสอบ authentication
 * - Refresh token อัตโนมัติ
 * - Redirect ไป login ถ้ายังไม่ได้ login
 *
 * ทำไมต้องมี:
 * Middleware refresh token ก่อน page load
 * ทำให้แน่ใจว่า session ยังใช้งานได้
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session อัตโนมัติ (สำคัญมาก!)
  // getUser() จะ refresh token ถ้าใกล้หมดอายุ
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect logic (ถ้าต้องการ)
  // if (!user && !request.nextUrl.pathname.startsWith('/login')) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**ทำไมต้องมี Middleware:**
- Refresh token อัตโนมัติก่อน page load
- ถ้าไม่มี: token อาจหมดอายุ → user ถูก logout กะทันหัน
- Middleware ทำให้ session "always fresh"

---

## Step 5: Implement OAuth Login

### 5.1 Update Login Page

**ไฟล์:** `app/(auth)/login/page.tsx`

ลบ mock code ออก แล้วใส่ code จริง:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  /**
   * Handle Google OAuth Login
   *
   * Flow:
   * 1. เรียก supabase.auth.signInWithOAuth()
   * 2. Supabase สร้าง authorization URL
   * 3. Redirect user ไป Google
   * 4. User login ที่ Google
   * 5. Google redirect กลับมาที่ /auth/callback
   * 6. Callback page จัดการ session
   *
   * PKCE Flow (Proof Key for Code Exchange):
   * - Supabase สร้าง code_verifier (random string)
   * - Hash code_verifier → code_challenge
   * - ส่ง code_challenge ไป Google
   * - Google return authorization code
   * - Supabase ใช้ code_verifier แลก code → token
   * - ปลอดภัยกว่า implicit flow (ป้องกัน code interception)
   */
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Callback URL (หลัง Google login สำเร็จ)
          redirectTo: `${window.location.origin}/auth/callback`,

          // Query params ที่จะส่งต่อไป callback
          // ใช้สำหรับ track origin หรือ redirect path
          queryParams: {
            // access_type: 'offline', // ถ้าต้องการ refresh_token จาก Google
            // prompt: 'consent', // บังคับให้ user เห็นหน้า consent ทุกครั้ง
          },

          // Scopes (ข้อมูลที่ขอจาก Google)
          // Default: profile, email
          // scopes: 'profile email',
        },
      });

      if (error) throw error;

      // data.url = Google OAuth URL
      // Browser จะ redirect อัตโนมัติ
      // ไม่ต้อง setLoading(false) เพราะกำลังจะ redirect

    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  // ... rest of the component

  return (
    // ... JSX
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {loading ? "กำลังเชื่อมต่อ..." : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            {/* Google icon SVG */}
          </svg>
          เข้าสู่ระบบด้วย Google
        </>
      )}
    </Button>
    // ...
  );
}
```

**Key Points:**
- `redirectTo` - URL ที่ Google จะ redirect กลับมา (ต้องตรงกับที่ตั้งใน Supabase)
- `queryParams` - พารามิเตอร์เพิ่มเติมส่งให้ Google
- OAuth flow เป็น async แต่ redirect เกิดในฝั่ง browser อัตโนมัติ

---

## Step 6: Create Callback Page

### 6.1 สร้าง Callback Route Handler

**ไฟล์:** `app/auth/callback/route.ts`

```typescript
/**
 * OAuth Callback Handler
 *
 * ทำงานเมื่อ Google redirect กลับมาพร้อม authorization code
 *
 * Flow:
 * 1. Google redirect มาที่ URL นี้พร้อม code
 *    Example: /auth/callback?code=abc123&...
 *
 * 2. แลก code → session token (Supabase ทำให้อัตโนมัติ)
 *
 * 3. เก็บ session ใน cookies
 *
 * 4. Redirect ไป dashboard
 *
 * Error Cases:
 * - ไม่มี code → redirect กลับ login
 * - code ไม่ valid → redirect กลับ login
 * - Network error → redirect กลับ login
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Cookies may be read-only in some cases
            }
          },
        },
      }
    )

    /**
     * แลก authorization code → session
     *
     * ทำอะไรใน exchangeCodeForSession():
     * 1. ส่ง code + code_verifier ไป Supabase
     * 2. Supabase verify code กับ Google
     * 3. Google return access_token + user info
     * 4. Supabase สร้าง session + JWT
     * 5. เก็บ session ใน cookies
     * 6. ถ้า user ใหม่ → trigger database function สร้าง profile
     */
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      /**
       * Login สำเร็จ!
       *
       * User session ถูกเก็บใน cookies แล้ว:
       * - sb-<project-ref>-auth-token (access token)
       * - sb-<project-ref>-auth-token.1 (refresh token)
       *
       * Database triggers จะทำงานอัตโนมัติ (ถ้าเป็น user ใหม่):
       * - สร้าง profile
       * - สร้าง subscription (Free plan)
       * - สร้าง credits (50 chat, 3 image)
       */

      // forwardedHost สำหรับกรณีที่อยู่หลัง proxy/load balancer
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // Development: redirect to localhost
        return NextResponse.redirect(`${origin}/`)
      } else if (forwardedHost) {
        // Production with proxy: redirect to proxied host
        return NextResponse.redirect(`https://${forwardedHost}/`)
      } else {
        // Production: redirect to origin
        return NextResponse.redirect(`${origin}/`)
      }
    }
  }

  /**
   * Error Cases:
   * - ไม่มี code parameter
   * - exchangeCodeForSession() failed
   *
   * Redirect กลับ login พร้อม error message
   */
  return NextResponse.redirect(`${origin}/login?error=authentication_failed`)
}
```

**สำคัญมาก:**
- Route นี้เป็น **Route Handler** (ไม่ใช่ page)
- ต้องอยู่ที่ `app/auth/callback/route.ts` (ไม่ใช่ `page.tsx`)
- Export `GET` function (เพราะ Google ใช้ GET request)

### 6.2 Update Login Page (แสดง error)

```typescript
// app/(auth)/login/page.tsx

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam === 'authentication_failed') {
      setError('การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง');
    }
  }, [errorParam]);

  // ... rest of component
}
```

---

## Step 7: Setup Database Triggers

### 7.1 Auto-create Profile for New Users

**ทำไมต้องมี:** เมื่อ user login ด้วย Google ครั้งแรก ต้องสร้าง profile + credits อัตโนมัติ

**SQL Migration:** (รันใน Supabase SQL Editor)

```sql
-- ===================================
-- AUTO CREATE PROFILE AFTER SIGNUP
-- ===================================
-- Trigger นี้จะทำงานทุกครั้งที่มี user ใหม่ใน auth.users
-- สร้างโดย Google OAuth หรือ Email signup ก็ได้

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- หา Free plan ID
  SELECT id INTO free_plan_id
  FROM public.plans
  WHERE name = 'Free'
  LIMIT 1;

  -- ถ้าไม่มี Free plan ให้สร้างก่อน
  IF free_plan_id IS NULL THEN
    INSERT INTO public.plans (name, price, chat_credits, image_credits)
    VALUES ('Free', 0, 50, 3)
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
    -- ดึง name จาก Google OAuth metadata
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    -- ดึง avatar จาก Google
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
    NOW() + INTERVAL '1 year', -- Free plan ไม่หมดอายุ (1 ปี)
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
    50,  -- Free plan chat credits
    3,   -- Free plan image credits
    0,   -- ยังไม่มี bonus
    0,
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month', -- Reset ต้นเดือนหน้า
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้าง trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**อธิบาย:**
- `SECURITY DEFINER` - function ทำงานด้วยสิทธิ์ของคนสร้าง (bypass RLS)
- `NEW.raw_user_meta_data` - ข้อมูลจาก Google (name, avatar, etc.)
- `COALESCE()` - เลือกค่าแรกที่ไม่ใช่ NULL

### 7.2 Setup Row Level Security (RLS)

```sql
-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================
-- ป้องกันไม่ให้ user คนอื่นเห็นข้อมูลของเรา

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Profiles: user เห็นได้เฉพาะของตัวเอง
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions: user เห็นได้เฉพาะของตัวเอง
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Credits: user เห็นได้เฉพาะของตัวเอง
CREATE POLICY "Users can view own credits"
  ON public.credits FOR SELECT
  USING (auth.uid() = user_id);
```

**ทำไมต้องมี RLS:**
- Anon key สามารถเข้าถึง database ได้
- แต่ RLS ป้องกันไม่ให้เห็นข้อมูลคนอื่น
- `auth.uid()` = user ID ของคนที่ login อยู่

---

## Testing

### 8.1 ทดสอบ OAuth Flow

**Checklist:**

1. **กดปุ่ม "Login with Google"**
   - ✅ Redirect ไป Google
   - ✅ URL ขึ้นต้นด้วย `https://accounts.google.com/o/oauth2/`

2. **Login ที่ Google**
   - ✅ เห็นหน้า consent (ขออนุญาตเข้าถึง email, profile)
   - ✅ กด "Allow"

3. **Redirect กลับมา**
   - ✅ URL เป็น `/auth/callback?code=...`
   - ✅ Redirect ไป dashboard (/) อัตโนมัติ

4. **ตรวจสอบ session**
   ```typescript
   // ใน page.tsx ใด ๆ
   const supabase = createClient();
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user);
   ```
   - ✅ user.email ตรงกับ Google email
   - ✅ user.user_metadata มี avatar_url

5. **ตรวจสอบ database**
   - ✅ มี record ใน `profiles` table
   - ✅ มี record ใน `subscriptions` table (plan = Free)
   - ✅ มี record ใน `credits` table (50 chat, 3 image)

6. **Logout แล้ว login อีกครั้ง**
   - ✅ Login สำเร็จเลย (ไม่สร้าง profile ซ้ำ)
   - ✅ ข้อมูล credits เหมือนเดิม

### 8.2 ดู Session Cookies

**Chrome DevTools:**
1. F12 → Application → Cookies → http://localhost:3000
2. หา cookies ที่ขึ้นต้นด้วย `sb-`
   - `sb-<project-ref>-auth-token` - Access token (JWT)
   - `sb-<project-ref>-auth-token.1` - Refresh token

**Decode JWT:**
```javascript
// Console
const token = document.cookie.match(/sb-.*-auth-token=([^;]+)/)[1];
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

### 8.3 Test Error Cases

1. **Cancel ที่หน้า Google**
   - ✅ Redirect กลับ login
   - ✅ ไม่มี error (user cancel เอง)

2. **Invalid callback URL**
   - ✅ Redirect กลับ login พร้อม error message

3. **Token หมดอายุ**
   - ✅ Middleware auto refresh
   - ✅ User ไม่ถูก logout

---

## 🎯 Next Steps

หลังจากที่ OAuth ใช้งานได้แล้ว:

1. **สร้าง API สำหรับดึงข้อมูล user**
   ```typescript
   // app/api/user/route.ts
   export async function GET() {
     const supabase = await createClient();
     const { data: { user } } = await supabase.auth.getUser();

     if (!user) {
       return Response.json({ error: 'Unauthorized' }, { status: 401 });
     }

     // ดึงข้อมูล profile + credits
     const { data: profile } = await supabase
       .from('profiles')
       .select('*, credits(*), subscriptions(*, plan:plans(*))')
       .eq('id', user.id)
       .single();

     return Response.json({ user: profile });
   }
   ```

2. **Protected Routes**
   - Update middleware เพื่อ redirect ไป login ถ้ายังไม่ได้ login
   - ป้องกัน route ที่ต้อง login เท่านั้น

3. **Logout Function**
   ```typescript
   const handleLogout = async () => {
     const supabase = createClient();
     await supabase.auth.signOut();
     router.push('/login');
   };
   ```

4. **Email/Password Authentication**
   - Implement register + login ด้วย email
   - Confirm email verification

---

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [PKCE Flow Explained](https://oauth.net/2/pkce/)

---

## ❓ Troubleshooting

### Error: "Invalid Redirect URI"

**สาเหตร:** URL ใน Google Cloud Console ไม่ตรงกับ Supabase callback URL

**แก้ไข:**
1. ไปที่ Supabase → Authentication → Providers → Google
2. คัดลอก callback URL ที่แสดง
3. วางใน Google Cloud Console → Credentials → Authorized redirect URIs

### Error: "Session not found"

**สาเหตร:** Cookies ถูกบล็อกโดย browser (third-party cookies)

**แก้ไข:**
1. ตรวจสอบว่า Site URL ตั้งค่าถูกต้อง
2. ใช้ same-site cookies (production ต้องใช้ HTTPS)

### User ถูก logout หลัง refresh

**สาเหตร:** ไม่มี middleware auto-refresh token

**แก้ไข:**
- สร้าง `middleware.ts` ตาม Step 4.3
- ตรวจสอบว่า cookies ไม่ถูกลบโดย browser

---

**สร้างเมื่อ:** 2025-12-25
**Last Updated:** 2025-12-25
**Author:** Claude Code
