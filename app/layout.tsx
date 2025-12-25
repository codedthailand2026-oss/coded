import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Layout หลักของ Application
 *
 * Features:
 * - ใช้ system fonts แทน Google Fonts เพื่อหลีกเลี่ยงปัญหา TLS
 * - ThemeProvider สำหรับจัดการ theme colors (dark, blue, purple, green)
 * - suppressHydrationWarning เพื่อป้องกัน warning จาก theme class
 */

export const metadata: Metadata = {
  title: "AI Tools Platform - Coded",
  description: "Platform รวม AI Tools ที่ปรับแต่งพร้อมใช้งานสำหรับคนทำงานไทย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
