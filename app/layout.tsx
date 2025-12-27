import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/context";

/**
 * Layout หลักของ Application
 *
 * Features:
 * - ใช้ system fonts แทน Google Fonts เพื่อหลีกเลี่ยงปัญหา TLS
 * - ThemeProvider สำหรับจัดการ theme colors (dark, blue, purple, green)
 * - I18nProvider สำหรับ multi-language support (EN/TH)
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
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
