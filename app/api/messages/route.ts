/**
 * GET /api/messages - ดึงข้อความใน conversation
 *
 * Query params:
 * - conversation_id: string (required)
 *
 * Response:
 * - success: boolean
 * - data: Message[]
 *
 * ใช้สำหรับ:
 * - แสดงประวัติการสนทนา
 * - Load messages เมื่อเลือก conversation
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
    const conversationId = searchParams.get('conversation_id');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'conversation_id is required' } },
        { status: 400 }
      );
    }

    // 3. ตรวจสอบว่า conversation เป็นของ user นี้
    // ป้องกันการเข้าถึง conversation ของคนอื่น
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    if (conversation.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // 4. ดึง messages
    // Order by created_at (เก่าสุดก่อน = เรียงตามเวลา)
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Messages query error:', msgError);
      return NextResponse.json(
        { success: false, error: { code: 'QUERY_ERROR', message: 'Failed to fetch messages' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: messages || [],
    });
  } catch (error) {
    console.error('Messages error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    );
  }
}
