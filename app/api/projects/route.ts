/**
 * GET /api/projects - ดึง projects ทั้งหมดของ user
 * POST /api/projects - สร้าง project ใหม่
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreateProjectData } from '@/types/chat';

export async function GET() {
  try {
    const supabase = await createClient();

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

    // ดึง projects ของ user (ไม่เอาที่ archived)
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Projects fetch error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch projects' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { projects } });
  } catch (error) {
    console.error('Projects error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

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

    const body: CreateProjectData = await request.json();
    const { name, description, system_prompt_type } = body;

    // Validate
    if (!name || !system_prompt_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: { required: ['name', 'system_prompt_type'] },
          },
        },
        { status: 400 }
      );
    }

    // สร้าง project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        system_prompt_type,
      })
      .select()
      .single();

    if (error) {
      console.error('Project create error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create project' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { project } });
  } catch (error) {
    console.error('Projects error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    );
  }
}
