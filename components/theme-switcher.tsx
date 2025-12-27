/**
 * Theme Switcher Component
 *
 * ให้ user เลือก theme (dark, light)
 *
 * Design:
 * - Toggle switch แบบ modern
 * - Dark (ดำ) / Light (ขาว)
 */

"use client";

import { useTheme } from "./theme-provider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("dark")}
        className="flex-1 gap-2"
      >
        <Moon className="h-4 w-4" />
        <span className="text-xs">Dark</span>
      </Button>
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("light")}
        className="flex-1 gap-2"
      >
        <Sun className="h-4 w-4" />
        <span className="text-xs">Light</span>
      </Button>
    </div>
  );
}
