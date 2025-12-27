/**
 * POST /api/onboarding
 *
 * บันทึกข้อมูล onboarding และ mark เป็น completed
 *
 * Request Body:
 * {
 *   phone: string
 *   company_name: string
 *   job_title: string
 *   industry: string
 *   locale: string
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   data: { profile: {...} }
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
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
          error: {
            code: 'UNAUTHORIZED',
            message: 'Please login first',
          },
        },
        { status: 401 }
      );
    }

    // 2. ดึงข้อมูลจาก request
    const body = await request.json();
    const { phone, company_name, job_title, industry, locale } = body;

    // 3. Validate required fields
    if (!phone || !company_name || !job_title || !industry) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: {
              required: ['phone', 'company_name', 'job_title', 'industry'],
            },
          },
        },
        { status: 400 }
      );
    }

    // 4. Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        phone,
        company_name,
        job_title,
        industry,
        locale: locale || 'th',
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Onboarding update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: 'Failed to update profile',
            details: { updateError },
          },
        },
        { status: 500 }
      );
    }

    // 5. Success response
    return NextResponse.json({
      success: true,
      data: { profile },
      meta: {
        message: 'Onboarding completed successfully',
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: error instanceof Error ? { message: error.message } : {},
        },
      },
      { status: 500 }
    );
  }
}
