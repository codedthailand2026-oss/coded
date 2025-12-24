/**
 * Header Component
 *
 * แสดง header bar ด้านบนของแต่ละหน้า
 *
 * Features:
 * - แสดง page title (รับจาก props)
 * - แสดง breadcrumbs (optional)
 * - Mobile responsive (จะเพิ่ม hamburger menu สำหรับ mobile ในอนาคต)
 *
 * TODO: เพิ่ม mobile menu toggle button
 */

"use client";

import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

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
    <div className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Title + Description */}
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Right: Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
