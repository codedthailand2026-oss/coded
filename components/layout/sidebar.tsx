/**
 * Sidebar Component
 *
 * Desktop sidebar (แสดงเฉพาะหน้าจอใหญ่ >= 1024px)
 *
 * Mobile จะใช้ MobileSidebar แทน (hamburger menu)
 */

"use client";

import { SidebarContent } from "./sidebar-content";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r bg-card">
      <SidebarContent />
    </aside>
  );
}
