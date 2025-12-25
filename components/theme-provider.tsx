/**
 * Theme Provider
 *
 * จัดการ theme ของ application (dark, blue, purple, green)
 *
 * Features:
 * - เก็บ theme preference ใน localStorage
 * - เปลี่ยน CSS class ของ html element
 * - Provide theme context สำหรับ components อื่น
 *
 * Themes:
 * - dark (default) - สีดำ เหมาะกับการทำงานนาน ลดแสงจอ
 * - blue - สีน้ำเงิน professional สำหรับ corporate
 * - purple - สีม่วง creative สำหรับ content creator
 * - green - สีเขียว calm สำหรับงาน focus
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "blue" | "purple" | "green";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // เริ่มต้นด้วย dark theme
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Load theme จาก localStorage เมื่อ component mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("coded-theme") as Theme;
    if (savedTheme && ["dark", "blue", "purple", "green"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // อัพเดท html class และ localStorage เมื่อ theme เปลี่ยน
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // ลบ theme classes เก่าทั้งหมด
    root.classList.remove("dark", "theme-blue", "theme-purple", "theme-green");

    // เพิ่ม theme class ใหม่
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("dark", `theme-${theme}`);
    }

    // บันทึกลง localStorage
    localStorage.setItem("coded-theme", theme);
  }, [theme, mounted]);

  // ป้องกัน hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook สำหรับใช้งาน theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
