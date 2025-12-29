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
  BarChart3,
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
import type { FeatureTab } from '@/components/app/AppPageClient';

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
  { id: 'analytics' as FeatureTab, icon: BarChart3, labelKey: 'nav.analytics' },
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
        'bg-card/95 backdrop-blur-sm border-r border-border/50 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Header */}
      <div className="h-14 border-b border-border/50 flex items-center justify-between px-3">
        {!collapsed && (
          <div className="flex items-center gap-2 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs">
              AI
            </div>
            <span>Coded</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="ml-auto h-7 w-7"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Features */}
      <div className="flex-1 p-2 space-y-1">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;

          return (
            <button
              key={feature.id}
              onClick={() => onFeatureChange(feature.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200',
                'text-sm font-medium',
                isActive
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
              title={!collapsed ? undefined : t(feature.labelKey)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="text-xs">{t(feature.labelKey)}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border/50 p-2 space-y-2">
        {/* Credits */}
        {!collapsed && (
          <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-primary/10">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1.5">
              <Coins className="h-3 w-3" />
              <span>Credits</span>
            </div>
            <div className="text-2xl font-bold mb-2">{user.graphicCredits}</div>
            <Button
              size="sm"
              className="w-full h-7 text-xs font-medium"
            >
              Upgrade
            </Button>
          </div>
        )}

        {/* Theme + Language */}
        {!collapsed && mounted && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 bg-muted/30 rounded-md p-0.5">
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1 h-6 text-xs"
              >
                <Moon className="h-3 w-3" />
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1 h-6 text-xs"
              >
                <Sun className="h-3 w-3" />
              </Button>
            </div>
            <LanguageSwitcher />
          </div>
        )}

        {/* User Profile */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-all duration-200"
        >
          <Avatar className="h-7 w-7 ring-1 ring-border">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-primary font-semibold text-xs">
              {user.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <div className="text-xs font-semibold">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              <LogOut className="h-3 w-3 text-muted-foreground" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
