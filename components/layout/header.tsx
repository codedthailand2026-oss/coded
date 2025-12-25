/**
 * Header Component
 *
 * แสดง header bar ด้านบนของแต่ละหน้า
 *
 * Features:
 * - แสดง page title (รับจาก props)
 * - Mobile: แสดง hamburger menu button
 * - Actions buttons (optional)
 */

"use client";

import { ReactNode } from "react";
import { MobileSidebar } from "./mobile-sidebar";

interface HeaderProps {
  /**
   * ชื่อหน้าที่จะแสดงใน header
   */
  title: string;

  /**
   * คำอธิบายหน้า (optional)
   */
  description?: string;

  /**
   * Actions/buttons ที่จะแสดงด้านขวาของ header (optional)
   * เช่น ปุ่ม "New Chat", "Upload Image", etc.
   */
  actions?: ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold lg:text-xl">{title}</h1>
            {description && (
              <p className="hidden text-sm text-muted-foreground sm:block">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
