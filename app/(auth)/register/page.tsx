/**
 * Register Page
 *
 * หน้าสมัครสมาชิก
 *
 * Features:
 * - Full name, Email, Password validation
 * - Google OAuth sign up
 * - Password strength indicator
 * - Error handling
 * - Loading state
 * - Link ไป Login page
 *
 * TODO: เชื่อมต่อ Supabase Auth
 *
 * Supabase OAuth Flow:
 * import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
 * const supabase = createClientComponentClient()
 * await supabase.auth.signInWithOAuth({ provider: 'google' })
 *
 * Flow หลัง Register (Auto by Supabase Trigger):
 * 1. สร้าง user profile
 * 2. สร้าง subscription (Free plan)
 * 3. สร้าง credits record (50 chat, 3 image)
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
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /**
   * Check password strength
   * - ความยาวอย่างน้อย 8 ตัวอักษร
   * - มีตัวพิมพ์เล็กและพิมพ์ใหญ่
   * - มีตัวเลข
   */
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return null;
    if (password.length < 8) return "weak";

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (hasLower && hasUpper && hasNumber) return "strong";
    if ((hasLower || hasUpper) && hasNumber) return "medium";
    return "weak";
  };

  const passwordStrength = getPasswordStrength(formData.password);

  /**
   * Handle Google OAuth sign up
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
  const handleGoogleSignUp = async () => {
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

      console.log("Google sign up clicked - waiting for backend implementation");
      setError("Google sign up จะพร้อมใช้งานเมื่อ Supabase OAuth ถูก setup แล้ว");
      setGoogleLoading(false);

    } catch (err) {
      setError("เกิดข้อผิดพลาดในการสมัครสมาชิกด้วย Google");
      setGoogleLoading(false);
    }
  };

  /**
   * Handle form submission
   *
   * Flow:
   * 1. Validate all fields
   * 2. Check password strength
   * 3. Check password confirmation
   * 4. Call register API (TODO: implement)
   * 5. Auto login or redirect to login page
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
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

      // Password validation
      if (formData.password.length < 8) {
        setError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("รหัสผ่านไม่ตรงกัน");
        setLoading(false);
        return;
      }

      // TODO: Call backend API
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     password: formData.password
      //   })
      // });
      // const data = await response.json();

      // Mock success (for demo)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Save token (if auto login)
      // localStorage.setItem('token', data.token);

      // Redirect to dashboard or login
      router.push("/login");

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
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">สมัครสมาชิก</CardTitle>
        <CardDescription className="text-center">
          สร้างบัญชีใหม่เพื่อเริ่มใช้งาน AI Tools
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
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input
              id="name"
              type="text"
              placeholder="สมชาย ใจดี"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              required
            />
          </div>

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
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
              required
            />
            {passwordStrength && (
              <div className="flex gap-1">
                <div className={`h-1 flex-1 rounded ${
                  passwordStrength === "weak" ? "bg-destructive" :
                  passwordStrength === "medium" ? "bg-yellow-500" :
                  "bg-green-500"
                }`} />
                <div className={`h-1 flex-1 rounded ${
                  passwordStrength === "medium" || passwordStrength === "strong" ?
                  passwordStrength === "medium" ? "bg-yellow-500" : "bg-green-500" :
                  "bg-muted"
                }`} />
                <div className={`h-1 flex-1 rounded ${
                  passwordStrength === "strong" ? "bg-green-500" : "bg-muted"
                }`} />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              ใช้อย่างน้อย 8 ตัวอักษร พร้อมตัวพิมพ์ใหญ่ เล็ก และตัวเลข
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
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
            onClick={handleGoogleSignUp}
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
                สมัครด้วย Google
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
