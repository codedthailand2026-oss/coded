/**
 * Register Page
 *
 * หน้าสมัครสมาชิก
 *
 * Features:
 * - Full name, Email, Password validation
 * - Password strength indicator
 * - Error handling
 * - Loading state
 * - Link ไป Login page (สำหรับ Google OAuth)
 *
 * Note: Google OAuth อยู่ที่หน้า Login เท่านั้น
 * เพราะ OAuth จะจัดการทั้ง login และ register อัตโนมัติ
 *
 * TODO: เชื่อมต่อ Supabase Auth
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
            disabled={loading}
          >
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
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

          <div className="text-center text-xs text-muted-foreground">
            หรือสามารถ{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              เข้าสู่ระบบด้วย Google
            </Link>
            {" "}ได้ที่หน้า Login
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
