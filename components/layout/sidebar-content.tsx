/**
 * Sidebar Content Component
 *
 * เนื้อหาของ Sidebar ที่ใช้ร่วมกันระหว่าง Desktop และ Mobile
 * แยกออกมาเพื่อให้ใช้ซ้ำได้ทั้ง Sidebar และ Sheet (mobile menu)
 *
 * Features:
 * - Navigation menu
 * - Credits display
 * - Theme switcher
 * - User profile
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Video,
  BarChart3,
  Settings,
  LogOut,
  Coins,
  Palette,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";

const menuItems = [
  {
    icon: MessageSquare,
    label: "Chat / Content",
    href: "/chat",
  },
  {
    icon: Video,
    label: "Image to Video",
    href: "/image-to-video",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/analytics",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
];

interface SidebarContentProps {
  /**
   * Callback เมื่อคลิก menu item (สำหรับปิด mobile menu)
   */
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // ป้องกัน hydration mismatch สำหรับ ThemeSwitcher
  useEffect(() => {
    setMounted(true);
  }, []);

  // TODO: ดึงข้อมูลจาก Supabase
  const mockUser = {
    name: "User Demo",
    email: "demo@coded.com",
    avatar: "",
    chatCredits: 50,
    imageCredits: 3,
    plan: "Free",
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          onClick={onNavigate}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            AI
          </div>
          <span className="text-lg">Coded</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Credits Display */}
        <div className="space-y-2 rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Coins className="h-4 w-4" />
            <span>Credits</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Chat:</span>
              <span className="font-medium text-foreground">
                {mockUser.chatCredits}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Image:</span>
              <span className="font-medium text-foreground">
                {mockUser.imageCredits}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-2">
            อัพเกรด Plan
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Theme Switcher */}
        {mounted && (
          <div className="space-y-2 rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Palette className="h-4 w-4" />
              <span>Theme</span>
            </div>
            <ThemeSwitcher compact />
          </div>
        )}
      </ScrollArea>

      {/* User Profile Section (Bottom) */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback>
                  {mockUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{mockUser.name}</span>
                <span className="text-xs text-muted-foreground">
                  {mockUser.plan}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{mockUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {mockUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onNavigate}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
