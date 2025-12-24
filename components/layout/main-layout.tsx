/**
 * MainLayout Component
 *
 * Layout wrapper หลักของ application ที่รวม Sidebar + Content area
 *
 * Structure:
 * ┌─────────────────────────────┐
 * │ Sidebar │ Content Area      │
 * │         │ ┌───────────────┐ │
 * │         │ │ Children      │ │
 * │         │ │ (Pages)       │ │
 * │         │ └───────────────┘ │
 * └─────────────────────────────┘
 *
 * Usage:
 * - ใช้ wrap ทุกหน้าที่ต้องการ sidebar
 * - หน้า auth (login/register) ไม่ควรใช้ layout นี้
 */

"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
