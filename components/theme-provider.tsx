/**
 * Theme Provider
 *
 * จัดการ theme ของ application (dark, light)
 *
 * Features:
 * - เก็บ theme preference ใน localStorage
 * - เปลี่ยน CSS class ของ html element
 * - Provide theme context สำหรับ components อื่น
 *
 * Themes:
 * - dark (default) - สีดำ พื้นฐานของ app
 * - light - สีขาว สำหรับคนที่ชอบสว่าง
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // เริ่มต้นด้วย dark theme (default)
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Set mounted state first
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load theme จาก localStorage เมื่อ component mount
  useEffect(() => {
    if (!mounted) return;

    const savedTheme = localStorage.getItem("coded-theme") as Theme;
    if (savedTheme && ["dark", "light"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, [mounted]);

  // อัพเดท html class และ localStorage เมื่อ theme เปลี่ยน
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // ลบ theme classes เก่าทั้งหมด
    root.classList.remove("dark", "light");

    // เพิ่ม theme class ใหม่
    root.classList.add(theme);

    // บันทึกลง localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("coded-theme", theme);
    }
  }, [theme, mounted]);

  // Always provide context, even before mounted
  // This prevents "useTheme must be used within ThemeProvider" error
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
