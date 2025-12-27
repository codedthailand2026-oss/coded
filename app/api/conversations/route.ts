/**
 * GET /api/conversations - ดึง conversations ของ project
 *
 * Query params:
 * - project_id: string (required)
 *
 * Response:
 * - success: boolean
 * - data: Conversation[]
 *
 * ใช้สำหรับ:
 * - แสดงประวัติการสนทนาใน project
 * - เลือก conversation เพื่อดูข้อความเก่า
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Please login first' } },
        { status: 401 }
      );
    }

    // 2. Get query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'project_id is required' } },
        { status: 400 }
      );
    }

    // 3. ดึง conversations
    // Order by updated_at (ล่าสุดก่อน)
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (convError) {
      console.error('Conversations query error:', convError);
      return NextResponse.json(
        { success: false, error: { code: 'QUERY_ERROR', message: 'Failed to fetch conversations' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversations || [],
    });
  } catch (error) {
    console.error('Conversations error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    );
  }
}
