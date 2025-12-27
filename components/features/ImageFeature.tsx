/**
 * Image Feature Component
 *
 * Image Generator แบบ Freepik style
 */

'use client';

import { GraphicGenerator } from '@/components/graphic/GraphicGenerator';

export function ImageFeature() {
  return (
    <div className="h-full overflow-y-auto">
      <GraphicGenerator type="image" />
    </div>
  );
}
