# AI Tools Platform - Project Status

> **Last Updated:** 25 December 2024  
> **สำหรับ:** Claude Code / ทีม Dev

---

## 📍 สถานะปัจจุบัน

**Phase:** 1 - Foundation  
**Week:** 1  
**Progress:** ~40%

---

## ✅ สิ่งที่เสร็จแล้ว

### Documentation
- [x] CLAUDE.md (Guidelines สำหรับ Claude Code)
- [x] PROJECT_BRIEF.md (รายละเอียด Project ทั้งหมด)
- [x] Database Schema Design
- [x] System Architecture Design

### Supabase (Database)
- [x] สร้าง Supabase Project: **Coded Project**
- [x] สร้าง Tables ทั้งหมด (10 tables):
  - `plans` (พร้อมข้อมูล 4 plans: free, starter, pro, enterprise)
  - `profiles`
  - `subscriptions`
  - `credits`
  - `usage_logs`
  - `transactions`
  - `conversations`
  - `messages`
  - `generated_contents`
  - `system_prompts`
- [x] สร้าง Trigger `handle_new_user()` (auto-create profile, subscription, credits เมื่อ signup)
- [x] เปิด Row Level Security (RLS) ทุก table
- [x] สร้าง Policies ทั้งหมด

### Frontend (Next.js)
- [x] สร้าง Next.js Project
- [x] ติดตั้ง Dependencies
- [x] Run dev server สำเร็จ (localhost:3000)
- [x] ใส่ CLAUDE.md และ docs/ ใน project

---

## ⏳ สิ่งที่รอดำเนินการ

### Blocked (รอ Supabase แก้ไข)
- [ ] ทดสอบ User Registration - Supabase มีปัญหา SMTP service
- [ ] ทดสอบ Trigger ทำงานถูกต้อง

### ถัดไป (Frontend)
- [ ] ติดตั้ง shadcn/ui
- [ ] สร้าง Layout (Sidebar + Header)
- [ ] สร้างหน้า Login/Register
- [ ] เชื่อมต่อ Supabase Auth

### ถัดไป (Marketer)
- [ ] ร่าง System Prompt v1
- [ ] สมัคร OpenAI API
- [ ] Setup n8n workflow แรก

---

## 🗄️ Database Schema Summary

```
plans (4 rows)
├── free: 50 chat, 3 image credits
├── starter: 500 chat, 20 image (299฿/mo)
├── pro: 2000 chat, 100 image (799฿/mo)
└── enterprise: unlimited

profiles ──┬── subscriptions (1:1)
           ├── credits (1:1)
           ├── usage_logs (1:many)
           ├── transactions (1:many)
           ├── conversations ── messages (1:many)
           └── generated_contents (1:many)

system_prompts (standalone)
```

---

## 🔧 Tech Stack Confirmed

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Next.js 16 + TypeScript | ✅ Setup |
| UI | shadcn/ui + Tailwind | ⏳ Pending |
| Database | Supabase PostgreSQL | ✅ Ready |
| Auth | Supabase Auth | ⏳ Pending test |
| Backend | n8n Cloud | ⏳ Pending |
| Payment | Stripe | ⏳ Pending |
| AI APIs | OpenAI, Claude | ⏳ Pending |

---

## 📁 Project Structure

```
coded/
├── CLAUDE.md          ← Guidelines for Claude Code
├── docs/
│   └── PROJECT_BRIEF.md
├── src/
│   └── app/           ← Next.js App Router
├── public/
├── package.json
└── ...
```

---

## 🎯 MVP Features Reminder

1. **Chat / Content Marketing** - AI Chat เข้าใจบริบทไทย
2. **Image to Video** - แปลงรูปเป็น video สำหรับ Reels
3. **Analytics** - Usage statistics

---

## 🚀 Next Actions (Priority Order)

### สำหรับ Claude Code:

1. **ติดตั้ง shadcn/ui**
```bash
npx shadcn@latest init
npx shadcn@latest add button card input avatar dropdown-menu
```

2. **สร้าง Layout Structure**
   - `src/components/layout/sidebar.tsx`
   - `src/components/layout/header.tsx`
   - `src/app/layout.tsx` (update)

3. **สร้างหน้า Auth**
   - `src/app/(auth)/login/page.tsx`
   - `src/app/(auth)/register/page.tsx`

4. **เชื่อม Supabase**
   - ติดตั้ง `@supabase/supabase-js`
   - สร้าง `src/lib/supabase.ts`
   - สร้าง environment variables

---

## 🔑 Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lwhxqppwhvgilikyksye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard>

# (Later)
STRIPE_SECRET_KEY=
OPENAI_API_KEY=
```

---

## ⚠️ Known Issues

1. **Supabase SMTP** - มีปัญหา ใช้ "Auto Confirm User" แทนได้
2. **Email verification** - ข้ามไปก่อน ค่อยเปิดทีหลัง

---

## 📞 Communication

- ถ้าติดปัญหา → ถาม Claude (PM)
- ถ้าต้องการ code → บอก Claude จะสร้างให้
- ถ้าสับสน → ขอ brief ใหม่ได้

---

*สร้างโดย Claude (PM) - 25 Dec 2024*
