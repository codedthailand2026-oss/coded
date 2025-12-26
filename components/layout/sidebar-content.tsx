/**
 * Sidebar Content Component
 *
 * เนื้อหาของ Sidebar ที่ใช้ร่วมกันระหว่าง Desktop และ Mobile
 * แยกออกมาเพื่อให้ใช้ซ้ำได้ทั้ง Sidebar และ Sheet (mobile menu)
 *
 * Features:
 * - Navigation menu
 * - Credits display (real-time from Supabase)
 * - Theme switcher
 * - User profile (real data from Supabase)
 * - Logout function
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  // User data state
  const [user, setUser] = useState({
    name: "Loading...",
    email: "",
    avatar: "",
    chatCredits: 0,
    imageCredits: 0,
    plan: "Free",
  });
  const [loading, setLoading] = useState(true);

  // ป้องกัน hydration mismatch สำหรับ ThemeSwitcher
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * ดึงข้อมูล User จาก Supabase
   *
   * Flow:
   * 1. Get user จาก auth
   * 2. Query profile, credits, subscription จาก database
   * 3. Update state
   */
  useEffect(() => {
    async function loadUserData() {
      try {
        // 1. Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.error('Auth error:', authError);
          // ถ้าไม่มี user ให้ redirect ไป login
          router.push('/login');
          return;
        }

        // 2. Query user data from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            credits(*),
            subscriptions(*, plan:plans(*))
          `)
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          // ถ้าไม่มี profile อาจเป็นเพราะ trigger ยังไม่ทำงาน
          // แสดงข้อมูลจาก auth อย่างน้อย
          setUser({
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            avatar: authUser.user_metadata?.avatar_url || '',
            chatCredits: 0,
            imageCredits: 0,
            plan: 'Free',
          });
        } else {
          // มี profile ครบ
          setUser({
            name: profile.full_name || authUser.email?.split('@')[0] || 'User',
            email: profile.email,
            avatar: profile.avatar_url || '',
            chatCredits: profile.credits?.chat_credits || 0,
            imageCredits: profile.credits?.image_credits || 0,
            plan: profile.subscriptions?.plan?.name || 'Free',
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [supabase, router]);

  /**
   * Handle Logout
   *
   * Flow:
   * 1. Sign out จาก Supabase (ลบ session cookies)
   * 2. Redirect ไป /login
   */
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        return;
      }
      // Redirect ไป login page
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
                {loading ? "..." : user.chatCredits}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Image:</span>
              <span className="font-medium text-foreground">
                {loading ? "..." : user.imageCredits}
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
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.plan}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onNavigate}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
