// HeightmapProvider interface and mock provider for world map loading

export interface HeightmapTile {
  width: number;
  height: number;
  data: number[][]; // 2D array of elevation values
}

export interface HeightmapProvider {
  getHeightmapTile(z: number, x: number, y: number): Promise<HeightmapTile>;
}

// Mock provider: returns a simple sine wave heightmap for testing
export class MockHeightmapProvider implements HeightmapProvider {
  async getHeightmapTile(z: number, x: number, y: number): Promise<HeightmapTile> {
    const width = 64;
    const height = 64;
    const data: number[][] = [];
    for (let i = 0; i < height; i++) {
      const row: number[] = [];
      for (let j = 0; j < width; j++) {
        // Simple sine wave pattern for demo
        row.push(Math.sin(i / 8) * Math.cos(j / 8) * 100);
      }
      data.push(row);
    }
    return { width, height, data };
  }
}

// Helper: convert z/x/y to bounding box (lat/lon)
function tile2boundingBox(z: number, x: number, y: number) {
  // Web Mercator to lat/lon
  const n = Math.pow(2, z);
  const lon_deg_w = x / n * 360.0 - 180.0;
  const lon_deg_e = (x + 1) / n * 360.0 - 180.0;
  const lat_rad_n = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
  const lat_rad_s = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
  const lat_deg_n = lat_rad_n * 180.0 / Math.PI;
  const lat_deg_s = lat_rad_s * 180.0 / Math.PI;
  return {
    north: lat_deg_n,
    south: lat_deg_s,
    west: lon_deg_w,
    east: lon_deg_e
  };
}

// OpenTopography provider (real implementation)
export class OpenTopographyProvider implements HeightmapProvider {
  // No API key in frontend
  constructor(_apiKey: string) {}

  async getHeightmapTile(z: number, x: number, y: number): Promise<HeightmapTile> {
    const { north, south, west, east } = tile2boundingBox(z, x, y);
    // Use local proxy endpoint
    const url = `http://localhost:4000/api/heightmap?south=${south}&north=${north}&west=${west}&east=${east}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenTopography proxy error: ${response.status}`);
    }
    const text = await response.text();
    console.log('Raw response from OpenTopo proxy:', text.slice(0, 500)); // log first 500 chars
    // Parse AAIGrid (ASCII grid) format
    const lines = text.split('\n').filter(line => line.trim() !== '');
    // Header lines start with ncols, nrows, xllcorner, yllcorner, cellsize, NODATA_value
    const ncols = parseInt(lines[0].split(/\s+/)[1], 10);
    const nrows = parseInt(lines[1].split(/\s+/)[1], 10);
    const data: number[][] = [];
    for (let i = 6; i < lines.length; i++) {
      const row = lines[i].split(/\s+/).map(Number);
      if (row.length === ncols) {
        data.push(row);
      }
    }
    return { width: ncols, height: nrows, data };
  }
} 