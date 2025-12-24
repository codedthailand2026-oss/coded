# AI Tools Platform - Project Brief

> เอกสารนี้รวบรวมรายละเอียดทั้งหมดของ project สำหรับทีม Dev และ AI Assistant

---

## 1. Executive Summary

### 1.1 Problem Statement

องค์กรและทีมในไทยยังใช้ AI กันไม่มาก เนื่องจาก:
- Prompt ได้ไม่ดี / อธิบายบริบทไม่ละเอียดพอ → ผลลัพธ์ไม่ตรงความต้องการ
- ไม่รู้จะเริ่มใช้ AI กับงานตัวเองยังไง
- ลองใช้ไม่กี่ครั้ง ไม่เวิร์ค ก็เลิกใช้
- AI ทั่วไปไม่เข้าใจบริบทการทำงานและวัฒนธรรมไทย

### 1.2 Solution

Platform ที่รวม AI Tools ที่ใช้งานได้จริง ปรับแต่งพร้อมใช้งานผ่าน n8n ไม่ต้อง prompt เอง เพิ่ม productivity ให้ทีม

### 1.3 Key Differentiator

นอกจากรวม AI ที่ใช้งานได้จริงไว้ที่เดียว เราจะใช้ **System Prompt** เพื่อ:
- ให้ AI เข้าใจ **ตลาดไทย** - พฤติกรรมผู้บริโภค, เทรนด์, ภาษาที่ใช้
- ให้ AI เข้าใจ **Culture การทำงานแบบไทย** - ลำดับขั้น, การสื่อสาร, มารยาท
- **ตอบได้ถูกใจ User** มากขึ้น - ภาษาเป็นธรรมชาติ, เข้าใจบริบท, ใช้งานได้เลย

**= ChatGPT/Claude ที่ปรับแต่งมาเพื่อคนทำงานในไทยโดยเฉพาะ**

### 1.4 Target Users

- พนักงาน Office ในไทย อายุ 25-45 ปี
- ทีม Marketing, Content, Social Media
- SME ที่ต้องการเพิ่ม productivity
- ไม่คุ้นเคยกับการใช้ AI / prompt ไม่เป็น

---

## 2. Core Features (MVP)

### 2.1 Chat / Content Marketing

**Description:** AI Chat ที่เข้าใจบริบทไทย สำหรับสร้าง content, ตอบคำถาม, brainstorm

**AI Provider:** OpenAI (GPT-4o) หรือ Claude API

**User Flow:**
1. User เลือก category (Marketing, Content, General)
2. พิมพ์คำถาม/request
3. AI ตอบด้วย System Prompt ที่เข้าใจตลาดไทย
4. User สามารถ follow-up conversation ได้

**Credit Usage:** 1 chat credit ต่อ 1 conversation turn

### 2.2 Image to Video

**Description:** แปลงรูปภาพนิ่งเป็น video สั้นสำหรับ Reels/TikTok

**AI Provider:** Freepik AI / Runway / Pika

**User Flow:**
1. User upload รูปภาพ
2. เลือก style/effect
3. กด Generate
4. รอ processing (แสดง progress)
5. ดู preview + download

**Credit Usage:** 
- Video < 10 วินาที = 1 image credit
- Video > 10 วินาที = 3 image credits

### 2.3 Analytics Dashboard

**Description:** แสดง usage statistics และ insights

**Features:**
- Credits usage (daily/weekly/monthly)
- Feature usage breakdown
- Cost estimation
- Usage trends

---

## 3. Business Model

### 3.1 Pricing Plans

| Plan | Price/Month | Chat Credits | Image Credits | Features |
|------|-------------|--------------|---------------|----------|
| Free | 0 ฿ | 50 | 3 | Basic features, 1 project |
| Starter | 299 ฿ | 500 | 20 | All features, 3 projects |
| Pro | 799 ฿ | 2,000 | 100 | All features, 10 projects, Priority support |
| Enterprise | Custom | Unlimited | 500+ | Custom, Team features, API access |

### 3.2 Credit System

**Credit Types:**
- **chat_credits** - สำหรับ Chat, Content Marketing (ต้นทุนต่ำ ใช้บ่อย)
- **image_credits** - สำหรับ Image to Video (ต้นทุนสูง ใช้น้อยกว่า)

**Credit Deduction:**

| Action | Credits | Type |
|--------|---------|------|
| Chat message (send + receive) | 1 | chat |
| Generate content (short < 500 words) | 2 | chat |
| Generate content (long > 500 words) | 5 | chat |
| Image to Video (< 10 sec) | 1 | image |
| Image to Video (> 10 sec) | 3 | image |

**Credit Logic:**
1. ใช้ bonus_credits ก่อน (ไม่หมดอายุ)
2. แล้วค่อยใช้ credits ปกติ (reset ทุกเดือน)

### 3.3 Cost Analysis

**AI API Costs (estimated):**

| Service | Cost per request | Our price | Margin |
|---------|------------------|-----------|--------|
| GPT-4o (chat) | ~$0.01 (0.35฿) | 1 credit | ~85% at Starter |
| Claude (chat) | ~$0.01 (0.35฿) | 1 credit | ~85% at Starter |
| Image to Video | ~$0.10-0.50 | 1-3 credits | ~60-70% |

---

## 4. Technical Architecture

### 4.1 Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | Next.js 14 (App Router) | Modern, AI-friendly, Good DX |
| UI Library | shadcn/ui + Tailwind | Beautiful, Customizable |
| Language | TypeScript | Type safety, Better DX |
| Backend Logic | n8n Cloud | Visual workflow, Easy AI integration |
| Database | Supabase PostgreSQL | Auth + DB + Storage in one |
| Auth | Supabase Auth | Built-in, OAuth support |
| Storage | Supabase Storage | For uploaded images, generated videos |
| Payment | Stripe | Global standard, Good docs |
| Hosting | Vercel | Auto deploy, Edge functions |
| Error Tracking | Sentry | Industry standard |
| Analytics | Mixpanel / PostHog | User behavior tracking |

### 4.2 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                           │
│  ┌─────────────────┐    ┌─────────────────────────────────┐    │
│  │ Company Website │    │         Web Application         │    │
│  │   (Marketing)   │    │  (Dashboard, AI Tools, Chat)    │    │
│  └─────────────────┘    └─────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌───────────┐ ┌─────────────────┐
│    SUPABASE     │ │   n8n     │ │   STRIPE        │
│  • Auth         │ │ (Workflow)│ │  (Payment)      │
│  • Database     │ │           │ │                 │
│  • Storage      │ │           │ │                 │
└─────────────────┘ └─────┬─────┘ └─────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌───────────┐ ┌─────────────────┐
│  OpenAI API     │ │ Claude    │ │  Freepik/       │
│  (Chat, GPT)    │ │ API       │ │  Runway (Video) │
└─────────────────┘ └───────────┘ └─────────────────┘
```

### 4.3 Data Flow Examples

**Flow 1: User Registration**
```
1. User clicks Sign Up
2. Supabase Auth creates user in auth.users
3. Database trigger fires → creates profile, subscription (free), credits
4. Redirect to Dashboard
5. Show onboarding (optional)
```

**Flow 2: Chat Message**
```
1. User types message
2. Frontend checks credits (chat_credits > 0)
3. If OK → POST to n8n webhook
4. n8n: Add System Prompt + User message → Send to OpenAI
5. n8n: Receive response → Log to usage_logs → Deduct credits
6. n8n: Return response to Frontend
7. Frontend: Display message + Update credits display
```

**Flow 3: Payment**
```
1. User clicks Upgrade
2. Redirect to Stripe Checkout
3. User completes payment
4. Stripe sends webhook to n8n
5. n8n: Verify signature → Update subscription → Add credits → Log transaction
6. Redirect back to app with success message
```

---

## 5. Database Schema

### 5.1 Core Tables (MVP Required)

#### profiles
```sql
- id: uuid (PK, FK → auth.users.id)
- email: text
- display_name: text
- avatar_url: text
- phone: text
- company_name: text
- job_title: text
- industry: text
- locale: text (default 'th')
- timezone: text (default 'Asia/Bangkok')
- onboarding_completed: boolean
- metadata: jsonb
- created_at: timestamptz
- updated_at: timestamptz
```

#### plans
```sql
- id: text (PK) -- free, starter, pro, enterprise
- name: text
- price_monthly: integer
- price_yearly: integer
- chat_credits_monthly: integer
- image_credits_monthly: integer
- max_projects: integer
- max_team_members: integer
- features: jsonb
- is_active: boolean
- sort_order: integer
- created_at: timestamptz
```

#### subscriptions
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles.id, UNIQUE)
- plan_id: text (FK → plans.id)
- status: text -- active, cancelled, past_due, trialing
- billing_cycle: text -- monthly, yearly
- stripe_customer_id: text
- stripe_subscription_id: text
- current_period_start: timestamptz
- current_period_end: timestamptz
- cancel_at_period_end: boolean
- cancelled_at: timestamptz
- trial_start: timestamptz
- trial_end: timestamptz
- metadata: jsonb
- created_at: timestamptz
- updated_at: timestamptz
```

#### credits
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles.id, UNIQUE)
- chat_credits: integer (default 50)
- image_credits: integer (default 3)
- bonus_chat_credits: integer (default 0)
- bonus_image_credits: integer (default 0)
- last_reset_at: timestamptz
- next_reset_at: timestamptz
- updated_at: timestamptz
```

#### usage_logs
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles.id)
- feature: text -- chat, image_to_video, content
- action: text -- generate, edit, retry
- credits_used: integer
- credit_type: text -- chat, image
- tokens_input: integer
- tokens_output: integer
- cost_usd: decimal(10,6)
- model: text
- status: text -- success, failed, refunded
- duration_ms: integer
- request_id: text
- metadata: jsonb
- created_at: timestamptz
- ip_address: inet
- user_agent: text
```

#### transactions
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles.id)
- type: text -- subscription, topup, refund, promo
- amount: decimal(10,2)
- currency: text (default 'THB')
- status: text -- pending, completed, failed, refunded
- description: text
- stripe_payment_intent_id: text
- stripe_invoice_id: text
- credits_added: jsonb
- metadata: jsonb
- created_at: timestamptz
- completed_at: timestamptz
```

### 5.2 Feature Tables

#### conversations
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles.id)
- title: text
- feature: text -- chat, content
- model: text
- system_prompt_id: uuid (FK → system_prompts.id)
- message_count: integer
- total_tokens: integer
- is_archived: boolean
- is_pinned: boolean
- metadata: jsonb
- created_at: timestamptz
- updated_at: timestamptz
```

#### messages
```sql
- id: uuid (PK)
- conversation_id: uuid (FK → conversations.id)
- role: text -- user, assistant, system
- content: text
- tokens: integer
- model: text
- finish_reason: text
- attachments: jsonb
- metadata: jsonb
- created_at: timestamptz
```

#### generated_contents
```sql
- id: uuid (PK)
- user_id: uuid (FK → profiles.id)
- type: text -- image, video, document
- title: text
- prompt: text
- source_url: text
- output_url: text
- storage_path: text
- file_size: integer
- duration: integer
- dimensions: jsonb
- model: text
- status: text -- processing, completed, failed
- credits_used: integer
- is_public: boolean
- expires_at: timestamptz
- metadata: jsonb
- created_at: timestamptz
```

#### system_prompts
```sql
- id: uuid (PK)
- name: text
- slug: text (UNIQUE)
- description: text
- category: text -- marketing, content, general
- prompt: text
- variables: jsonb
- model_preference: text
- is_active: boolean
- is_default: boolean
- usage_count: integer
- version: integer
- created_by: uuid (FK → profiles.id)
- created_at: timestamptz
- updated_at: timestamptz
```

### 5.3 Future Tables (Phase 2+)

- **teams** - Organization/Team feature
- **team_members** - Team membership
- **projects** - Group contents into projects
- **api_keys** - For users who want API access
- **templates** - Content templates
- **feedback** - User ratings
- **notifications** - In-app notifications

### 5.4 Database Triggers

1. **handle_new_user** - After INSERT on auth.users → Create profile, subscription (free), credits
2. **update_updated_at** - Before UPDATE → Set updated_at = now()
3. **update_conversation_count** - After INSERT on messages → Update conversation.message_count

### 5.5 Row Level Security (RLS)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | own only | own only | own only | ❌ |
| subscriptions | own only | ❌ (system) | ❌ (system) | ❌ |
| credits | own only | ❌ (system) | ❌ (system) | ❌ |
| usage_logs | own only | ❌ (system) | ❌ | ❌ |
| conversations | own only | own only | own only | own only |
| messages | own conv | own conv | ❌ | own only |
| system_prompts | all active | ❌ (admin) | ❌ (admin) | ❌ |
| plans | all active | ❌ (admin) | ❌ (admin) | ❌ |

---

## 6. API Design

### 6.1 Response Format

All API responses must follow this format:

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
    credits_remaining?: {
      chat: number;
      image: number;
    };
    request_id?: string;
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}
```

### 6.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | ไม่ได้ login หรือ token หมดอายุ |
| FORBIDDEN | 403 | ไม่มีสิทธิ์เข้าถึง resource นี้ |
| NOT_FOUND | 404 | ไม่พบ resource |
| VALIDATION_ERROR | 400 | Input ไม่ถูกต้อง |
| INSUFFICIENT_CREDITS | 402 | Credits ไม่พอ |
| RATE_LIMITED | 429 | เรียกบ่อยเกินไป |
| EXTERNAL_API_ERROR | 502 | AI API มีปัญหา |
| INTERNAL_ERROR | 500 | Server error |

### 6.3 Rate Limiting

| Plan | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 10 | 100 |
| Starter | 30 | 1,000 |
| Pro | 60 | 5,000 |
| Enterprise | Custom | Custom |

---

## 7. Security Requirements

### 7.1 Must Have (MVP)

- [ ] Row Level Security (RLS) on all tables
- [ ] API Rate Limiting
- [ ] Input Validation (Zod schemas)
- [ ] Stripe Webhook Signature Verification
- [ ] Environment Variables (no hardcoded secrets)
- [ ] HTTPS only
- [ ] Secure session management (Supabase handles this)

### 7.2 Should Have

- [ ] Audit logging (who did what when)
- [ ] IP-based rate limiting
- [ ] Request signing for n8n webhooks

### 7.3 Future

- [ ] 2FA for enterprise users
- [ ] SSO integration
- [ ] Data encryption at rest

---

## 8. Team Structure

| Role | Responsibility |
|------|----------------|
| **Marketer / Product Owner** | Business model, System Prompts, n8n workflows, Company website, Find AI tools that work |
| **Junior Developer** | Web App (Auth, Dashboard, Features, Payment, Database integration) |
| **AI (Claude)** | Write main code as Senior Dev, Documentation |

---

## 9. Development Timeline

### Phase 1: Foundation (Week 1-2)

**Junior Dev:**
- Setup GitHub, Next.js, Supabase
- Create database tables + triggers
- Implement Auth (Login, Register, OAuth)
- Setup Vercel deployment

**Marketer:**
- Setup n8n Cloud
- Draft System Prompts v1
- Prepare landing page content
- Test AI APIs

### Phase 2: Core Features (Week 3-6)

**Junior Dev:**
- Dashboard layout
- Chat feature + n8n integration
- Image to Video feature
- Credit system (check, deduct, display)
- Payment integration (Stripe)

**Marketer:**
- Build n8n workflows
- Refine System Prompts
- Create landing page
- Test user flows

### Phase 3: Polish & Launch (Week 7-8)

- Error handling
- Loading states
- Responsive design
- Testing all flows
- Bug fixes
- Launch preparation

---

## 10. Technical Foundation (For Future Scaling)

### 10.1 Code Quality

- TypeScript strict mode
- ESLint + Prettier
- Consistent folder structure
- Separation of concerns (UI vs Business Logic)

### 10.2 Monitoring & Logging

- Sentry for error tracking
- Structured logging (JSON format)
- Usage analytics (Mixpanel/PostHog)
- Cost tracking per request

### 10.3 Documentation

- README.md with setup instructions
- API documentation
- Database schema documentation
- System Prompt documentation
- Architecture Decision Records (ADRs)

### 10.4 Code Comments (สำคัญมาก)

> ⚠️ **Context:** Project นี้ใช้ AI ช่วยเขียน code (vibe coding) และทีมยังใหม่กับ codebase
> ต้องเขียน comments ละเอียดเพื่อให้คนที่เข้ามาช่วยในอนาคตเข้าใจได้ง่าย

**หลักการ:**
- อธิบาย **ทำไม (WHY)** ไม่ใช่แค่ **อะไร (WHAT)**
- ใช้ภาษาไทยหรืออังกฤษก็ได้ (ไทยอ่านง่ายกว่าสำหรับทีม)
- ถ้า copy code จาก AI ต้องเพิ่ม comment อธิบาย

**ต้องมี Comments ที่:**

1. **ทุก Function/Component** - อธิบายว่าทำอะไร, รับ parameter อะไร, return อะไร
2. **Business Logic** - อธิบาย flow และเหตุผลที่ทำแบบนี้
3. **API Endpoints** - อธิบาย request/response format, errors ที่เป็นไปได้
4. **Database Queries** - อธิบายว่า query นี้ดึงอะไร ทำไมต้อง JOIN
5. **External Service Calls** - อธิบายว่าเรียก service อะไร คาดหวังอะไรกลับมา

**ตัวอย่าง:**

```typescript
/**
 * ตรวจสอบและหัก credits ของ user
 * 
 * Flow:
 * 1. เช็คว่ามี credits พอไหม (bonus ก่อน แล้วค่อย regular)
 * 2. หัก credits จาก database
 * 3. บันทึก usage log
 * 
 * ทำไมใช้ bonus ก่อน: 
 * - bonus credits ไม่หมดอายุ (จาก referral, promo)
 * - regular credits reset ทุกเดือน ควรใช้ก่อนหมดอายุ
 * 
 * @param userId - ID ของ user
 * @param creditType - 'chat' หรือ 'image'
 * @param amount - จำนวน credits ที่จะหัก
 */
async function deductCredits(userId: string, creditType: CreditType, amount: number) {
  // ...
}
```

### 10.5 DevOps

- Git branching (main/develop/feature)
- Environment separation (dev/staging/prod)
- Auto-deploy via Vercel
- Database migrations tracked in code

---

## 11. Success Metrics

### 11.1 MVP Success

- [ ] User can register and login
- [ ] User can use Chat feature
- [ ] User can generate Image to Video
- [ ] Credits are tracked correctly
- [ ] Payment works end-to-end
- [ ] 10 beta users testing

### 11.2 Business Success

- Monthly Recurring Revenue (MRR)
- User retention rate
- Feature usage breakdown
- Cost per user vs Revenue per user

---

## 12. Appendix

### 12.1 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# n8n
N8N_WEBHOOK_URL=

# Sentry
SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=
```

### 12.2 Useful Commands

```bash
# Development
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Database migrations
npx supabase db push
npx supabase db reset
```

### 12.3 Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [n8n Cloud](https://app.n8n.cloud)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Sentry Dashboard](https://sentry.io)

---

*Last Updated: December 2024*
