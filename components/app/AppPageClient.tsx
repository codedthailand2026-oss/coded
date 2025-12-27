/**
 * App Page Client Component
 *
 * Client component สำหรับหน้า /app
 * แยกออกมาเพื่อให้ page.tsx เป็น server component
 */

'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/app/AppSidebar';
import { ChatFeature } from '@/components/features/ChatFeature';
import { ImageFeature } from '@/components/features/ImageFeature';
import { VideoFeature } from '@/components/features/VideoFeature';
import { AudioFeature } from '@/components/features/AudioFeature';

export type FeatureTab = 'chat' | 'image' | 'video' | 'audio';

export function AppPageClient() {
  const [activeFeature, setActiveFeature] = useState<FeatureTab>('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Render feature based on active tab
  const renderFeature = () => {
    switch (activeFeature) {
      case 'chat':
        return <ChatFeature />;
      case 'image':
        return <ImageFeature />;
      case 'video':
        return <VideoFeature />;
      case 'audio':
        return <AudioFeature />;
      default:
        return <ChatFeature />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AppSidebar
        activeFeature={activeFeature}
        onFeatureChange={setActiveFeature}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderFeature()}
      </main>
    </div>
  );
}
