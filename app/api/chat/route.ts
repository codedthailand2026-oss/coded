/**
 * POST /api/chat - ส่งข้อความและรับ response จาก AI
 *
 * Flow:
 * 1. ตรวจสอบ authentication
 * 2. เช็ค chat credits
 * 3. บันทึก user message
 * 4. เรียก Gemini API (Free: Flash, Paid: 3.5 Pro)
 * 5. บันทึก assistant response
 * 6. หัก credits
 * 7. Return response
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ChatRequest {
  conversation_id?: string;
  project_id?: string;
  message: string;
  attachments?: any[];
}

export async function POST(request: Request) {
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

    const body: ChatRequest = await request.json();
    const { conversation_id, project_id, message, attachments } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Message is required' } },
        { status: 400 }
      );
    }

    // 2. เช็ค credits
    const { data: credits } = await supabase
      .from('credits')
      .select('chat_credits, bonus_chat_credits')
      .eq('user_id', user.id)
      .single();

    const totalCredits = (credits?.chat_credits || 0) + (credits?.bonus_chat_credits || 0);

    if (totalCredits < 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: 'Insufficient chat credits',
          },
        },
        { status: 402 }
      );
    }

    // 3. สร้าง/ดึง conversation
    let convId = conversation_id;

    if (!convId) {
      // สร้าง conversation ใหม่
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          project_id: project_id || null,
          title: message.substring(0, 50), // ใช้ message แรกเป็น title
        })
        .select()
        .single();

      if (convError || !newConv) {
        return NextResponse.json(
          { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create conversation' } },
          { status: 500 }
        );
      }

      convId = newConv.id;
    }

    // 4. บันทึก user message
    const { error: msgError } = await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
      attachments: attachments || [],
    });

    if (msgError) {
      console.error('Message insert error:', msgError);
    }

    // 5. เรียก AI (Mock response ก่อน - TODO: integrate Gemini API)
    const aiResponse = await generateAIResponse(message, project_id);

    // 6. บันทึก assistant response
    const { error: aiMsgError } = await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: aiResponse,
    });

    if (aiMsgError) {
      console.error('AI message insert error:', aiMsgError);
    }

    // 7. หัก credits (ใช้ bonus ก่อน แล้วค่อย regular)
    if (credits) {
      if (credits.bonus_chat_credits > 0) {
        await supabase
          .from('credits')
          .update({ bonus_chat_credits: credits.bonus_chat_credits - 1 })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('credits')
          .update({ chat_credits: credits.chat_credits - 1 })
          .eq('user_id', user.id);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation_id: convId,
        message: aiResponse,
        credits_remaining: totalCredits - 1,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    );
  }
}

// Mock AI response - TODO: replace with Gemini API
async function generateAIResponse(message: string, projectId?: string): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock responses based on project type
  const responses = {
    marketing: `สำหรับคำถาม "${message}" ในด้านการตลาด ผมแนะนำให้:

1. วิเคราะห์กลุ่มเป้าหมาย
2. สร้าง content ที่ตรงใจ
3. ใช้ social media อย่างมีกลยุทธ์

คุณต้องการให้ผมช่วยวางแผนรายละเอียดไหมครับ?`,
    analysis: `จากข้อมูลที่คุณให้มา "${message}" ผมวิเคราะห์ได้ดังนี้:

**ข้อมูลเชิงลึก:**
- Pattern ที่พบ: ...
- แนวโน้ม: ...
- คำแนะนำ: ...

ต้องการให้ผมวิเคราะห์เพิ่มเติมในมุมไหนไหมครับ?`,
    default: `เข้าใจคำถามของคุณแล้วครับ: "${message}"

ผมสามารถช่วยคุณได้ในเรื่องนี้ มีอะไรที่อยากให้ผมอธิบายเพิ่มเติมไหมครับ?`,
  };

  // TODO: Get project to determine system_prompt_type
  return responses.default;
}
