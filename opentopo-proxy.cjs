const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { GeoTIFF } = require('geotiff');

const app = express();
const port = 4000;

app.use(cors());

app.get('/api/heightmap', async (req, res) => {
  try {
    const { south, north, west, east } = req.query;
    const apiKey = '2c23752a27db60c1d1b2a1c9ba672980';
    
    const url = `https://portal.opentopography.org/API/globaldem?demtype=SRTMGL3&south=${south}&north=${north}&west=${west}&east=${east}&outputFormat=GTiff&API_Key=${apiKey}`;
    
    console.log('Fetching from OpenTopography:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the GeoTIFF data as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Parse the GeoTIFF
    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const rasters = await image.readRasters();
    
    // Get the elevation data (first band)
    const elevationData = rasters[0];
    const width = image.getWidth();
    const height = image.getHeight();
    
    // Convert to 2D array
    const data = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        // Normalize to 0-255 range
        const value = Math.max(0, Math.min(255, (elevationData[idx] + 1000) / 8000 * 255));
        row.push(value);
      }
      data.push(row);
    }
    
    res.json({
      width,
      height,
      data
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`OpenTopo proxy running on http://localhost:${port}`);
}); 