/**
 * Middleware - รันก่อนทุก request
 *
 * หน้าที่:
 * 1. Refresh session ถ้าใกล้หมดอายุ
 * 2. ป้องกันหน้าที่ต้อง login (Protected Routes)
 * 3. Redirect user ที่ login แล้วออกจากหน้า login/register
 * 4. Redirect user ที่ยังไม่ทำ onboarding ไปหน้า /onboarding
 *
 * Protected Routes:
 * - /chat
 * - /image-to-video
 * - /analytics
 * - /settings
 *
 * Auth Routes (สำหรับคนที่ยังไม่ login):
 * - /login
 * - /register
 *
 * Public Routes (ไม่ต้อง login):
 * - /onboarding
 * - /api/onboarding
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// หน้าที่ต้อง login ก่อนถึงจะเข้าได้
const protectedRoutes = ["/chat", "/image-to-video", "/analytics", "/settings"];

// หน้าสำหรับคนที่ยังไม่ login (ถ้า login แล้วไม่ต้องเข้า)
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // เช็คว่ามี environment variables หรือไม่
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // ถ้าไม่มี ให้ผ่านไปเลย (ป้องกัน error)
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // ถ้าเข้าหน้าที่ต้อง login แต่ยังไม่ login
    if (protectedRoutes.some((route) => path.startsWith(route)) && !user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(redirectUrl);
    }

    // ถ้า login แล้วแต่พยายามเข้าหน้า login/register
    if (authRoutes.some((route) => path.startsWith(route)) && user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // ถ้า login แล้วแต่ยังไม่ทำ onboarding
    // (ยกเว้นหน้า onboarding, api, login, register)
    if (user &&
        path !== "/onboarding" &&
        !path.startsWith("/api/onboarding") &&
        !authRoutes.some((route) => path.startsWith(route))) {

      // เช็คว่าทำ onboarding เสร็จหรือยัง
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      // ถ้ายังไม่เสร็จ → redirect ไป /onboarding
      if (profile && !profile.onboarding_completed) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }

    return response;
  } catch (error) {
    // ถ้ามี error ให้ผ่านไปเลย (ป้องกันหน้าค้าง)
    console.error("Middleware error:", error);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
