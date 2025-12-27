/**
 * POST /api/setup-profile
 *
 * สร้าง profile, subscription, และ credits สำหรับ user ที่ login แล้วแต่ยังไม่มีข้อมูลใน DB
 *
 * Use Case:
 * - User login ผ่าน Google OAuth แต่ trigger ไม่ทำงาน
 * - User ถูกลบออกจาก DB แต่ยังมี session อยู่
 * - Migration ระหว่าง development
 *
 * Flow:
 * 1. ตรวจสอบว่า user login อยู่หรือไม่
 * 2. เช็คว่ามี profile อยู่แล้วหรือยัง
 * 3. ถ้ายังไม่มี ให้สร้าง profile, subscription (Free plan), และ credits
 * 4. Return ข้อมูล user profile
 *
 * @returns {ApiResponse} ข้อมูล user profile ที่สร้างเสร็จ
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. ตรวจสอบ authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Please login first",
          },
        },
        { status: 401 }
      );
    }

    // 2. เช็คว่ามี profile อยู่แล้วหรือไม่
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      // มี profile อยู่แล้ว ดึงข้อมูลเต็มมาส่งกลับ
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          `
          *,
          credits(*),
          subscriptions(
            *,
            plan:plans(*)
          )
        `
        )
        .eq("id", user.id)
        .single();

      return NextResponse.json({
        success: true,
        data: profile,
        error: null,
      });
    }

    // 3. สร้าง profile ใหม่
    // 3.1 หา Free plan
    const { data: freePlan, error: planError } = await supabase
      .from("plans")
      .select("id, chat_credits, image_credits")
      .ilike("name", "free")
      .single();

    if (planError || !freePlan) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "SETUP_ERROR",
            message: "Free plan not found in database. Please contact support.",
            details: { planError },
          },
        },
        { status: 500 }
      );
    }

    // 3.2 สร้าง profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0],
      avatar_url: user.user_metadata?.avatar_url,
    });

    if (profileError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "SETUP_ERROR",
            message: "Failed to create profile",
            details: { profileError },
          },
        },
        { status: 500 }
      );
    }

    // 3.3 สร้าง subscription (Free plan)
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: freePlan.id,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year
      });

    if (subscriptionError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "SETUP_ERROR",
            message: "Failed to create subscription",
            details: { subscriptionError },
          },
        },
        { status: 500 }
      );
    }

    // 3.4 สร้าง credits
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);

    const { error: creditsError } = await supabase.from("credits").insert({
      user_id: user.id,
      chat_credits: freePlan.chat_credits || 50,
      image_credits: freePlan.image_credits || 3,
      bonus_chat_credits: 0,
      bonus_image_credits: 0,
      credits_reset_at: nextMonth.toISOString(),
    });

    if (creditsError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "SETUP_ERROR",
            message: "Failed to create credits",
            details: { creditsError },
          },
        },
        { status: 500 }
      );
    }

    // 4. ดึงข้อมูลเต็มมาส่งกลับ
    const { data: newProfile } = await supabase
      .from("profiles")
      .select(
        `
        *,
        credits(*),
        subscriptions(
          *,
          plan:plans(*)
        )
      `
      )
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: newProfile,
      error: null,
      meta: {
        message: "Profile created successfully",
      },
    });
  } catch (error) {
    console.error("Setup profile error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
          details: error instanceof Error ? { message: error.message } : {},
        },
      },
      { status: 500 }
    );
  }
}
