/**
 * App Sidebar Component - Freepik Style
 *
 * Sidebar สำหรับ SPA แบบ Freepik:
 * - พับเก็บได้ (collapsed mode)
 * - แสดง features เป็น tabs
 * - Profile + Settings ด้านล่าง
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  MessageSquare,
  Image as ImageIcon,
  Video,
  Mic,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Coins,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/context';
import { useTheme } from '@/components/theme-provider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { FeatureTab } from '@/app/(app)/page';

interface AppSidebarProps {
  activeFeature: FeatureTab;
  onFeatureChange: (feature: FeatureTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const features = [
  { id: 'chat' as FeatureTab, icon: MessageSquare, labelKey: 'nav.chat' },
  { id: 'image' as FeatureTab, icon: ImageIcon, labelKey: 'nav.image' },
  { id: 'video' as FeatureTab, icon: Video, labelKey: 'nav.video' },
  { id: 'audio' as FeatureTab, icon: Mic, labelKey: 'nav.audio' },
];

export function AppSidebar({
  activeFeature,
  onFeatureChange,
  collapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState({
    name: 'User',
    email: '',
    avatar: '',
    graphicCredits: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user data
  useEffect(() => {
    if (!mounted) return;

    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, credits(*)')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({
          name: profile.full_name || authUser.email?.split('@')[0] || 'User',
          email: profile.email,
          avatar: profile.avatar_url || '',
          graphicCredits: profile.credits?.graphic_credits || 0,
        });
      }
    }

    loadUser();
  }, [mounted, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div
      className={cn(
        'bg-card border-r flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm">
              AI
            </div>
            <span>Coded</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Features */}
      <div className="flex-1 p-3 space-y-1">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;

          return (
            <button
              key={feature.id}
              onClick={() => onFeatureChange(feature.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              )}
              title={!collapsed ? undefined : t(feature.labelKey)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{t(feature.labelKey)}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="border-t p-3 space-y-3">
        {/* Credits */}
        {!collapsed && (
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Coins className="h-3 w-3" />
              <span>{t('credits.graphic')}</span>
            </div>
            <div className="text-2xl font-bold">{user.graphicCredits}</div>
            <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
              อัพเกรด
            </Button>
          </div>
        )}

        {/* Theme + Language */}
        {!collapsed && mounted && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="h-4 w-4" />
              </Button>
            </div>
            <LanguageSwitcher />
          </div>
        )}

        {/* User Profile */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
