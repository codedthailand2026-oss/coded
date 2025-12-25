/**
 * Theme Switcher Component
 *
 * ให้ user เลือก theme color (dark, blue, purple, green)
 *
 * Design:
 * - แสดงเป็น color circles พร้อม label
 * - Highlight theme ที่เลือกอยู่
 * - เหมาะกับการแสดงใน sidebar หรือ settings
 *
 * Themes:
 * - Dark (⚫) - Classic black theme
 * - Blue (🔵) - Professional blue
 * - Purple (🟣) - Creative purple
 * - Green (🟢) - Calm green
 */

"use client";

import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const themes = [
  {
    id: "dark" as const,
    name: "Dark",
    description: "Classic",
    color: "bg-neutral-900",
  },
  {
    id: "blue" as const,
    name: "Blue",
    description: "Professional",
    color: "bg-blue-600",
  },
  {
    id: "purple" as const,
    name: "Purple",
    description: "Creative",
    color: "bg-purple-600",
  },
  {
    id: "green" as const,
    name: "Green",
    description: "Calm",
    color: "bg-green-600",
  },
];

interface ThemeSwitcherProps {
  /**
   * Compact mode จะแสดงเฉพาะ color circles (สำหรับ mobile)
   */
  compact?: boolean;
}

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    // Compact mode: แสดงเฉพาะ color circles
    return (
      <div className="flex items-center gap-2">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "relative h-6 w-6 rounded-full transition-all hover:scale-110",
              t.color,
              theme === t.id && "ring-2 ring-offset-2 ring-offset-background"
            )}
            title={`${t.name} Theme`}
          >
            {theme === t.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Full mode: แสดงทั้ง circles + labels
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Theme Color</div>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg border-2 p-3 transition-all hover:bg-muted/50",
              theme === t.id
                ? "border-primary bg-muted"
                : "border-transparent"
            )}
          >
            <div
              className={cn(
                "relative h-8 w-8 rounded-full flex-shrink-0",
                t.color
              )}
            >
              {theme === t.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">{t.name}</span>
              <span className="text-xs text-muted-foreground">
                {t.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
