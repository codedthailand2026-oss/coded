/**
 * Login Page
 *
 * หน้าเข้าสู่ระบบ
 *
 * Features:
 * - Email + Password validation
 * - Google OAuth sign in
 * - Error handling
 * - Loading state
 * - Link ไป Register page
 *
 * TODO: เชื่อมต่อ Supabase Auth
 *
 * Supabase OAuth Flow:
 * import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
 * const supabase = createClientComponentClient()
 * await supabase.auth.signInWithOAuth({ provider: 'google' })
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /**
   * Handle Google OAuth sign in
   *
   * TODO: เชื่อมต่อ Supabase Auth
   * const supabase = createClientComponentClient()
   * await supabase.auth.signInWithOAuth({
   *   provider: 'google',
   *   options: {
   *     redirectTo: `${window.location.origin}/auth/callback`
   *   }
   * })
   */
  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      // TODO: Implement Supabase Google OAuth
      // const { data, error } = await supabase.auth.signInWithOAuth({
      //   provider: 'google',
      //   options: {
      //     redirectTo: `${window.location.origin}/auth/callback`
      //   }
      // });

      // if (error) throw error;

      // Mock delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Google sign in clicked - waiting for backend implementation");
      setError("Google sign in จะพร้อมใช้งานเมื่อ Supabase OAuth ถูก setup แล้ว");
      setGoogleLoading(false);

    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
      setGoogleLoading(false);
    }
  };

  /**
   * Handle form submission
   *
   * Flow:
   * 1. Validate form data
   * 2. Call login API (TODO: implement)
   * 3. Save token to localStorage
   * 4. Redirect to dashboard
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        setError("กรุณากรอกข้อมูลให้ครบถ้วน");
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("รูปแบบอีเมลไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      // TODO: Call backend API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();

      // Mock success (for demo)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Save token
      // localStorage.setItem('token', data.token);

      // Redirect to dashboard
      router.push("/");

    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">เข้าสู่ระบบ</CardTitle>
        <CardDescription className="text-center">
          กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || googleLoading}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">หรือ</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading || googleLoading}
            onClick={handleGoogleSignIn}
          >
            {googleLoading ? (
              "กำลังเชื่อมต่อ..."
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                เข้าสู่ระบบด้วย Google
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
