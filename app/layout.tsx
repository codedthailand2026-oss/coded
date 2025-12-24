import type { Metadata } from "next";
import "./globals.css";

/**
 * Layout หลักของ Application
 *
 * ใช้ system fonts แทน Google Fonts เพื่อหลีกเลี่ยงปัญหา TLS
 * และลดเวลา loading (ไม่ต้อง fetch fonts จาก external source)
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
        {children}
      </body>
    </html>
  );
}
