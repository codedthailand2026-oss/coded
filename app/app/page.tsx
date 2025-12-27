/**
 * Main App Page - SPA Style (Freepik-like)
 *
 * ทุก features อยู่ในหน้าเดียว:
 * - Sidebar ซ้าย (พับเก็บได้)
 * - Content area ขวา
 * - Tab-based navigation (ไม่มีการเปลี่ยนหน้า)
 *
 * Features:
 * - AI Chat
 * - Image Generator
 * - Video Generator
 * - Audio Generator
 */

import { AppPageClient } from '@/components/app/AppPageClient';

// Force dynamic rendering - ห้าม static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AppPage() {
  return <AppPageClient />;
}
