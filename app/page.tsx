/**
 * Root Page - Redirect to SPA Main App
 *
 * ตรวจสอบ auth และ redirect ไปหน้าที่เหมาะสม:
 * - ถ้ายังไม่ login → /login
 * - ถ้า onboarding ยังไม่เสร็จ → /onboarding
 * - ถ้าพร้อมแล้ว → /app (SPA main app)
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → go to login
  if (!user) {
    redirect("/login");
  }

  // Check if onboarding completed
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  // Redirect to main SPA app
  redirect("/app");
}
