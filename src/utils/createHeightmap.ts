export function createHeightmap(width: number, height: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Create a gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'black');
  gradient.addColorStop(1, 'white');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
} 