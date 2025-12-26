/**
 * Supabase Client สำหรับใช้ฝั่ง Browser
 *
 * ใช้ใน:
 * - React Components (Client Components)
 * - Event handlers (onClick, onSubmit)
 * - useEffect
 *
 * ไม่ใช้ใน:
 * - Server Components
 * - API Routes
 * - Middleware
 *
 * ตัวอย่างการใช้งาน:
 * ```typescript
 * import { createClient } from '@/lib/supabase/client'
 *
 * const supabase = createClient()
 * const { data, error } = await supabase.auth.signInWithOAuth({
 *   provider: 'google'
 * })
 * ```
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
