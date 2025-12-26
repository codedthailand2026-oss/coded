/**
 * Supabase Client for Browser (Client Components)
 *
 * ใช้ใน Client Components เท่านั้น (components ที่มี "use client")
 * จัดการ session ผ่าน localStorage + cookies
 *
 * Use cases:
 * - OAuth login/logout
 * - Client-side data fetching
 * - Real-time subscriptions
 *
 * IMPORTANT: ต้อง install packages ก่อน:
 * npm install @supabase/supabase-js
 *
 * และต้องมี environment variables ใน .env.local:
 * NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
