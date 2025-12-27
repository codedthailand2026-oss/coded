/**
 * Audio Feature Component
 *
 * Audio Generator แบบ Freepik style
 */

'use client';

import { GraphicGenerator } from '@/components/graphic/GraphicGenerator';

export function AudioFeature() {
  return (
    <div className="h-full overflow-y-auto">
      <GraphicGenerator type="audio" />
    </div>
  );
}
