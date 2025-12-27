/**
 * Audio Generator Page
 *
 * สร้างเสียงพูด Text-to-Speech (Freepik API)
 *
 * Features:
 * - Thai + English voices
 * - Natural pronunciation
 * - Export: MP3
 *
 * TODO: Integrate Freepik API
 */

'use client';

import { GraphicGenerator } from '@/components/graphic/GraphicGenerator';

export default function AudioPage() {
  return <GraphicGenerator type="audio" />;
}
