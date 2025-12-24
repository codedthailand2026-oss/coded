# AI Tools Platform - Project Guidelines

## 🎯 Project Overview

Platform รวม AI Tools ที่ปรับแต่งพร้อมใช้งานสำหรับคนทำงานไทย ใช้ System Prompt ที่เข้าใจตลาดไทยและ Culture การทำงานไทย

**Target Users:** พนักงาน Office ในไทยที่ไม่คุ้นเคยกับการใช้ AI

**Business Model:** SaaS Subscription + Credit-based

## 📦 Core Features (MVP)

1. **Chat / Content Marketing** - สร้าง content, ตอบคำถาม (OpenAI, Claude API)
2. **Image to Video** - แปลงรูปเป็น video สำหรับ Reels (Freepik, Runway)
3. **Analytics** - วิเคราะห์ usage และ performance

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + shadcn/ui + Tailwind CSS
- **Backend:** n8n Cloud (Workflow/API)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payment:** Stripe
- **Hosting:** Vercel
- **Error Tracking:** Sentry

## 📁 Folder Structure (Required)

```
src/
├── app/              # Next.js pages (App Router)
├── components/
│   ├── ui/          # Base components (from shadcn)
│   └── features/    # Feature-specific components
├── lib/
│   ├── api/         # API calls
│   ├── hooks/       # Custom React hooks
│   ├── utils/       # Helper functions
│   └── validations/ # Zod schemas
├── services/        # External services (Supabase, Stripe)
├── types/           # TypeScript types/interfaces
└── config/          # Constants, settings
```

## ⚙️ Coding Standards

### Must Follow:
- ใช้ TypeScript เสมอ (strict mode)
- ใช้ Zod สำหรับ validation
- ทุก API response ใช้ format เดียวกัน (ดู docs/API_FORMAT.md)
- ใช้ environment variables สำหรับ secrets ทั้งหมด
- **เขียน comments อธิบาย code ทุกส่วนสำคัญ** (ดูรายละเอียดด้านล่าง)

## 📝 Code Comments (สำคัญมาก)

> ⚠️ Project นี้ทีมยังใหม่กับ codebase และใช้ AI ช่วยเขียน code (vibe coding)
> ต้องเขียน comments ละเอียดเพื่อให้คนอื่นเข้ามาช่วยดูได้ง่าย

### ต้องมี Comments ที่:

**1. ทุก Function/Component:**
```typescript
/**
 * ตรวจสอบและหัก credits ของ user
 * 
 * Flow:
 * 1. เช็คว่ามี credits พอไหม (bonus ก่อน แล้วค่อย regular)
 * 2. หัก credits จาก database
 * 3. บันทึก usage log
 * 
 * @param userId - ID ของ user
 * @param creditType - 'chat' หรือ 'image'
 * @param amount - จำนวน credits ที่จะหัก
 * @returns สำเร็จหรือไม่ + credits คงเหลือ
 * 
 * @example
 * const result = await deductCredits('user-123', 'chat', 1);
 * if (!result.success) {
 *   // แสดง modal ให้ upgrade
 * }
 */
async function deductCredits(userId: string, creditType: CreditType, amount: number) {
  // ...
}
```

**2. Logic ที่ซับซ้อน:**
```typescript
// === CREDIT DEDUCTION LOGIC ===
// ใช้ bonus credits ก่อน เพราะไม่หมดอายุ
// ถ้า bonus ไม่พอ ค่อยใช้ regular credits
// Regular credits จะ reset ทุกต้นเดือน
if (bonusCredits >= amount) {
  // หักจาก bonus อย่างเดียว
  newBonus = bonusCredits - amount;
  newRegular = regularCredits;
} else {
  // หัก bonus หมดก่อน แล้วหักที่เหลือจาก regular
  const remaining = amount - bonusCredits;
  newBonus = 0;
  newRegular = regularCredits - remaining;
}
```

**3. ทุก API Endpoint:**
```typescript
/**
 * POST /api/chat
 * 
 * ส่งข้อความไปยัง AI และรับ response
 * 
 * Request Body:
 * - message: string - ข้อความจาก user
 * - conversationId?: string - ID ของ conversation (ถ้ามี)
 * 
 * Response:
 * - success: boolean
 * - data: { response: string, conversationId: string }
 * - meta: { credits_remaining: number }
 * 
 * Errors:
 * - INSUFFICIENT_CREDITS: credits ไม่พอ
 * - RATE_LIMITED: เรียกบ่อยเกินไป
 * 
 * Flow:
 * 1. Validate input
 * 2. Check credits
 * 3. Call n8n webhook → AI
 * 4. Deduct credits
 * 5. Save to conversation
 * 6. Return response
 */
export async function POST(request: Request) {
  // ...
}
```

**4. Database Queries:**
```typescript
// ดึง subscription พร้อม plan details ของ user
// JOIN กับ plans table เพื่อได้ credit limits
// ใช้ single() เพราะ 1 user มีได้ 1 subscription เท่านั้น
const { data: subscription } = await supabase
  .from('subscriptions')
  .select(`
    *,
    plan:plans(*)
  `)
  .eq('user_id', userId)
  .single();
```

**5. External Service Calls:**
```typescript
// === CALL N8N WORKFLOW ===
// n8n จะ:
// 1. เพิ่ม System Prompt (เข้าใจตลาดไทย)
// 2. ส่งไป OpenAI/Claude
// 3. Log usage + cost
// 4. Return response
//
// Timeout: 30 วินาที (AI อาจใช้เวลานาน)
// ถ้า fail: จะ throw error ไม่หัก credits
const response = await fetch(N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, userId }),
  signal: AbortSignal.timeout(30000),
});
```

### Comment Style:
- ใช้ภาษาอังกฤษหรือไทยก็ได้ (ไทยอ่านง่ายกว่าสำหรับทีม)
- อธิบาย **ทำไม (WHY)** ไม่ใช่แค่ **อะไร (WHAT)**
- ถ้า copy code จาก AI ให้เพิ่ม comment อธิบายว่า code นี้ทำอะไร

### API Response Format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } | null;
  meta?: {
    credits_remaining?: number;
    request_id?: string;
  };
}
```

### Error Codes:
- `UNAUTHORIZED` - ไม่ได้ login
- `FORBIDDEN` - ไม่มีสิทธิ์
- `INSUFFICIENT_CREDITS` - credits ไม่พอ
- `RATE_LIMITED` - เรียกบ่อยเกินไป
- `VALIDATION_ERROR` - input ไม่ถูกต้อง
- `EXTERNAL_API_ERROR` - AI API มีปัญหา

## 🗄️ Database

- ใช้ Supabase PostgreSQL
- ต้องเปิด Row Level Security (RLS) ทุก table
- ใช้ `uuid` สำหรับ primary keys
- ทุก table ต้องมี `created_at`, `updated_at`
- ใช้ Soft Delete (deleted_at) แทน hard delete

**Key Tables:** profiles, plans, subscriptions, credits, usage_logs, transactions, conversations, messages, generated_contents, system_prompts

ดู schema เต็มที่ `docs/DATABASE.md`

## 💳 Credit System

| Type | ใช้กับ |
|------|-------|
| chat_credits | Chat, Content Marketing |
| image_credits | Image to Video |

**Logic:** ใช้ bonus_credits ก่อน → แล้วค่อยใช้ credits ปกติ

## 🔐 Security Checklist

- [ ] RLS enabled ทุก table
- [ ] API rate limiting
- [ ] Input validation (Zod)
- [ ] Stripe webhook signature verification
- [ ] Environment variables ไม่ hardcode

## 📝 Before Committing

1. ตรวจสอบ TypeScript errors: `npm run type-check`
2. ตรวจสอบ lint: `npm run lint`
3. ทดสอบ build: `npm run build`
4. อัพเดท documentation ถ้าเปลี่ยน API

## 📚 Documentation

- `docs/PROJECT_BRIEF.md` - รายละเอียด project ทั้งหมด
- `docs/DATABASE.md` - Database schema
- `docs/API.md` - API endpoints
- `docs/SYSTEM_PROMPTS.md` - System prompts ที่ใช้

## 🚀 Environments

| Environment | Branch | URL |
|-------------|--------|-----|
| Development | develop | localhost:3000 |
| Staging | staging | staging.xxx.com |
| Production | main | xxx.com |

## ❓ When Unsure

1. ถามก่อนทำถ้าไม่แน่ใจ
2. อ้างอิง docs/PROJECT_BRIEF.md สำหรับ business logic
3. ดู existing code pattern ก่อนสร้างใหม่
