/**
 * Video Generator Page
 *
 * แปลงรูปเป็นวิดีโอสำหรับ Reels/TikTok (Freepik API)
 *
 * Features:
 * - Image to Video
 * - Motion prompts (camera movement, effects)
 * - Duration: 3-5 seconds
 * - Export: MP4
 *
 * TODO: Integrate Freepik API
 */

'use client';

import { GraphicGenerator } from '@/components/graphic/GraphicGenerator';

export default function VideoPage() {
  return <GraphicGenerator type="video" />;
}
