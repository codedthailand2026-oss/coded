/**
 * Register Page
 *
 * หน้าสมัครสมาชิก - เชื่อมต่อ Supabase Auth แล้ว
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
 * Flow หลัง Register (Auto by Supabase Trigger):
 * 1. สร้าง user profile
 * 2. สร้าง subscription (Free plan)
 * 3. สร้าง credits record (50 chat, 3 image)
 */

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
   * 4. Call Supabase signUp
   * 5. Show success message หรือ redirect
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
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

      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // ส่งชื่อไปเก็บใน user metadata
          data: {
            display_name: formData.name,
          },
          // หลัง verify email redirect มาที่ไหน
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // แปลง error message เป็นภาษาไทย
        if (error.message === "User already registered") {
          setError("อีเมลนี้ถูกใช้งานแล้ว");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      // เช็คว่าต้อง verify email หรือไม่
      if (data.user && !data.session) {
        // ต้อง verify email ก่อน
        setSuccess(true);
        setLoading(false);
      } else {
        // Auto confirm enabled - login สำเร็จเลย
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // แสดงหน้า success ถ้าสมัครสำเร็จแต่ต้อง verify email
  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            สมัครสมาชิกสำเร็จ!
          </CardTitle>
          <CardDescription className="text-center">
            กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>
            เราได้ส่งลิงก์ยืนยันไปที่{" "}
            <span className="font-medium">{formData.email}</span>
          </p>
          <p className="mt-2">คลิกลิงก์ในอีเมลเพื่อเริ่มใช้งาน</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/login">
            <Button variant="outline">กลับไปหน้าเข้าสู่ระบบ</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

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
