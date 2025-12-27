/**
 * Video Feature Component
 *
 * Video Generator แบบ Freepik style
 */

'use client';

import { GraphicGenerator } from '@/components/graphic/GraphicGenerator';

export function VideoFeature() {
  return (
    <div className="h-full overflow-y-auto">
      <GraphicGenerator type="video" />
    </div>
  );
}
