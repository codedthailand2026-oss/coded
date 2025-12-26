/**
 * Auth Callback Route
 *
 * รับ callback จาก OAuth Provider (Google)
 *
 * Flow:
 * 1. User login Google สำเร็จ
 * 2. Google redirect มาที่ /auth/callback?code=xxx
 * 3. Route นี้รับ code
 * 4. แลก code เป็น session (exchangeCodeForSession)
 * 5. Redirect ไปหน้า dashboard หรือ หน้าที่กำหนด
 *
 * URL นี้ต้องตรงกับที่ตั้งใน:
 * - Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
 * - Google Cloud Console > Credentials > Authorized redirect URIs
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // รับ code จาก URL (?code=xxx)
  const code = searchParams.get("code");

  // รับ redirect path (ถ้ามี)
  const next = searchParams.get("next") ?? "/";

  // ถ้ามี error จาก OAuth
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("OAuth error:", error, errorDescription);
    // Redirect ไปหน้า login พร้อม error message
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const supabase = await createClient();

    // แลก code เป็น session
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // สำเร็จ! Redirect ไปหน้าที่กำหนด
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Exchange code error:", exchangeError);
  }

  // ถ้ามีปัญหา redirect กลับไป login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
