import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ViewportRulerProps {
  zoom: number;      // Current zoom level (1.0 = normal, 2.0 = 2x zoom, etc)
  center: {          // Current center position in world coordinates
    x: number;
    y: number;
  };
  cameraPosition: THREE.Vector3;  // Current camera position
}

const ViewportRuler: React.FC<ViewportRulerProps> = ({ zoom, center, cameraPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get container dimensions
    const container = canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const height = 40; // Fixed height for the ruler

    // Calculate ruler width as 60% of container
    const rulerWidth = containerWidth * 0.6;
    const rulerStart = (containerWidth - rulerWidth) / 2;

    // Set canvas dimensions
    canvas.width = containerWidth;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, height);

    // Draw baseline
    ctx.strokeStyle = '#9d4b4b'; // Same red as borders
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rulerStart, height);
    ctx.lineTo(rulerStart + rulerWidth, height);
    ctx.stroke();

    // Compute spacing and ticks
    const baseSpacing = 20;      // px per 10° at zoom=1
    const degPerTick = 10;       // degrees per minor tick
    const majorEvery = 3;        // every 3 ticks (30°) is major
    const shortHeight = 10;
    const longHeight = 20;

    // Adjust spacing based on camera height
    const cameraHeight = cameraPosition.y;
    const heightScale = Math.max(0.5, Math.min(2, cameraHeight / 200));
    const spacing = baseSpacing * zoom * heightScale;

    // Calculate the center offset based on the terrain's center position
    // Increase sensitivity by multiplying the offset
    const centerOffset = center ? (center.x / 256) * spacing * 2 : 0;

    const minIndex = Math.ceil(-rulerWidth / 2 / spacing);
    const maxIndex = Math.floor(rulerWidth / 2 / spacing);

    // Draw ticks and labels
    for (let worldIndex = minIndex; worldIndex <= maxIndex; worldIndex++) {
      const x = rulerStart + rulerWidth / 2 + worldIndex * spacing - centerOffset;
      const degrees = ((worldIndex * degPerTick + 180) % 360) - 180;
      const isMajor = (worldIndex % majorEvery === 0);
      const tickHeight = isMajor ? longHeight : shortHeight;

      // Draw tick
      ctx.lineWidth = isMajor ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x, height - tickHeight);
      ctx.stroke();

      // Draw label for major ticks
      if (isMajor) {
        ctx.fillStyle = '#9d4b4b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${degrees}°`, x, height - tickHeight - 4);
      }
    }

    // Draw zoom level
    ctx.fillStyle = '#9d4b4b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`×${zoom.toFixed(2)}`, rulerStart + rulerWidth - 8, height - 8);
  }, [zoom, center, cameraPosition]);

  return (
    <div className="w-full h-10 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default ViewportRuler; 