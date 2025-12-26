/**
 * Supabase Client สำหรับใช้ฝั่ง Server
 *
 * ใช้ใน:
 * - Server Components
 * - API Routes (route.ts)
 * - Server Actions
 *
 * ต้องเรียกใหม่ทุกครั้งที่ใช้ (ไม่ cache)
 * เพราะ cookies อาจเปลี่ยน
 *
 * ตัวอย่างการใช้งาน:
 * ```typescript
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 * }
 * ```
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // อ่าน cookies ทั้งหมด
        getAll() {
          return cookieStore.getAll();
        },
        // เขียน cookies (สำหรับ update session)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ถ้าเรียกจาก Server Component จะ set cookie ไม่ได้
            // แต่ไม่เป็นไร เพราะ middleware จะจัดการให้
          }
        },
      },
    }
  );
}
