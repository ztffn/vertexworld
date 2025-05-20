import React, { useRef, useEffect, useCallback } from 'react';
import type { HeightmapTile } from '../utils/heightmapProvider';

interface TerrainDebugMapProps {
  heightData: HeightmapTile | null;
  center: { x: number; y: number } | null;
  zoom: number;
  show: boolean;
  // Add optional callback for clicking on the map
  onMapClick?: (x: number, y: number) => void;
}

const TerrainDebugMap: React.FC<TerrainDebugMapProps> = ({ 
  heightData, 
  center, 
  zoom, 
  show,
  onMapClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInfoRef = useRef<{
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
  }>({ width: 0, height: 0, scaleX: 1, scaleY: 1 });

  // Click handler to update center position
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!heightData) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get click position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to heightmap coordinates
    const mapX = Math.floor(x / mapInfoRef.current.scaleX);
    const mapY = Math.floor(y / mapInfoRef.current.scaleY);
    
    // Ensure within bounds
    const clampedX = Math.max(0, Math.min(heightData.width - 1, mapX));
    const clampedY = Math.max(0, Math.min(heightData.height - 1, mapY));
    
    console.log(`[TerrainDebugMap] Clicked position: x=${clampedX}, y=${clampedY}`);
    
    // Use callback if provided
    if (onMapClick) {
      onMapClick(clampedX, clampedY);
    }
  }, [heightData, onMapClick]);

  useEffect(() => {
    if (!show || !heightData || !center || !zoom) {
      return;
    }
    const { width, height, data } = heightData;
    if (width === 0 || height === 0) {
      return;
    }
    
    // Draw to offscreen canvas at full resolution
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) {
      return;
    }
    
    const imgData = offCtx.createImageData(width, height);
    
    // Find min/max for normalization
    let min = Infinity, max = -Infinity;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = data[y][x];
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    
    // Write pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Normalize to 0-255
        const norm = (data[y][x] - min) / (max - min || 1);
        const val = Math.round(norm * 255);
        imgData.data[idx] = val;
        imgData.data[idx + 1] = val;
        imgData.data[idx + 2] = val;
        imgData.data[idx + 3] = 255;
      }
    }
    
    offCtx.putImageData(imgData, 0, 0);

    // Draw to visible canvas
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    
    // Calculate canvas size to maintain aspect ratio
    const container = canvas.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Determine dimensions that maintain aspect ratio while maximizing canvas size
    let canvasWidth, canvasHeight;
    const aspectRatio = width / height;
    
    if (containerWidth / containerHeight > aspectRatio) {
      // Container is wider than needed for the aspect ratio
      canvasHeight = containerHeight;
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      // Container is taller than needed for the aspect ratio
      canvasWidth = containerWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }
    
    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Store scale factors for click handling
    mapInfoRef.current = {
      width,
      height,
      scaleX: canvasWidth / width,
      scaleY: canvasHeight / height
    };
    
    // Draw scaled image
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(offscreen, 0, 0, width, height, 0, 0, canvasWidth, canvasHeight);
    
    // Draw rectangle showing the sampling window
    const regionSize = Math.min(zoom, width, height);
    const half = Math.floor(regionSize / 2);
    let startX = center.x - half;
    let startY = center.y - half;
    startX = Math.max(0, Math.min(width - regionSize, startX));
    startY = Math.max(0, Math.min(height - regionSize, startY));
    
    // Scale rectangle coordinates to visible canvas size
    const scaleX = canvasWidth / width;
    const scaleY = canvasHeight / height;
    
    // Draw sampling window rectangle with better visibility
    ctx.save();
    
    // Outer stroke (red)
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.strokeRect(startX * scaleX, startY * scaleY, regionSize * scaleX, regionSize * scaleY);
    
    // Inner stroke (white)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect((startX + 2) * scaleX, (startY + 2) * scaleY, (regionSize - 4) * scaleX, (regionSize - 4) * scaleY);
    
    // Draw center marker
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    const centerX = center.x * scaleX;
    const centerY = center.y * scaleY;
    const markerSize = 5;
    ctx.beginPath();
    ctx.moveTo(centerX - markerSize, centerY);
    ctx.lineTo(centerX + markerSize, centerY);
    ctx.moveTo(centerX, centerY - markerSize);
    ctx.lineTo(centerX, centerY + markerSize);
    ctx.stroke();
    
    ctx.restore();
  }, [show, heightData, center, zoom]);

  if (!show) {
    return null;
  }

  // If heightData isn't available, show static grid pattern
  if (!heightData || !center) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full hidden"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="w-full h-full grid grid-cols-4 grid-rows-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div 
              key={i} 
              className="border border-red-600 opacity-50"
              style={{ 
                background: i % 2 === 0 ? 'rgba(255,0,0,0.1)' : 'transparent'
              }} 
            />
          ))}
        </div>
      </div>
    );
  }
  
  // Normal render with heightData
  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{ imageRendering: 'pixelated' }}
        onClick={handleClick}
        title="Click to focus on this area"
      />
    </div>
  );
};

export default TerrainDebugMap; 