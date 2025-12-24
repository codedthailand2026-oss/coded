/**
 * Sidebar Component
 *
 * แสดง navigation menu หลักของ application
 *
 * Features:
 * - เมนูหลัก: Chat, Image to Video, Analytics
 * - แสดง credits คงเหลือของ user (hardcoded ตอนนี้ รอเชื่อม Supabase)
 * - User profile section
 *
 * TODO: เชื่อมต่อ Supabase เพื่อดึงข้อมูล user และ credits จริง
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Video,
  BarChart3,
  Settings,
  LogOut,
  Coins
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

/**
 * รายการเมนูหลัก
 * icon: ใช้ lucide-react icons
 * label: ชื่อเมนู (ภาษาไทย)
 * href: URL path
 */
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

export function Sidebar() {
  const pathname = usePathname();

  // TODO: ดึงข้อมูลจาก Supabase
  // - user profile (name, email, avatar)
  // - credits (chat_credits, image_credits)
  // - plan (free, starter, pro, enterprise)
  const mockUser = {
    name: "User Demo",
    email: "demo@coded.com",
    avatar: "",
    chatCredits: 50,
    imageCredits: 3,
    plan: "Free",
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
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
            // ตรวจสอบว่าเป็นหน้าปัจจุบันหรือไม่
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
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
            <DropdownMenuItem>
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
