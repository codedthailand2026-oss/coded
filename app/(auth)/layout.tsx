/**
 * Auth Layout
 *
 * Layout สำหรับหน้า authentication (Login, Register)
 * ไม่มี sidebar, แสดงเฉพาะ content กลางจอ
 *
 * Features:
 * - Centered design
 * - Theme switcher ที่มุมขวาบน
 * - Logo ที่มุมซ้ายบน
 * - Responsive design
 */

"use client";

import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useState, useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              AI
            </div>
            <span className="text-lg">Coded</span>
          </Link>

          {/* Theme Switcher */}
          {mounted && (
            <div className="flex items-center gap-2">
              <ThemeSwitcher compact />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex min-h-screen items-center justify-center p-4 pt-20">
        {children}
      </main>
    </div>
  );
}
