/**
 * Image Generator Page
 *
 * สร้างรูปภาพด้วย AI (Freepik API)
 *
 * Features:
 * - Text to Image
 * - Style reference
 * - Character reference
 * - High quality output (Free: 512x512, Paid: 1024x1024 or 4K)
 *
 * TODO: Integrate Freepik API
 */

'use client';

import { GraphicGenerator } from '@/components/graphic/GraphicGenerator';

export default function ImagePage() {
  return <GraphicGenerator type="image" />;
}
