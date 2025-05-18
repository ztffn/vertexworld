# World Map Loading Plan

## Overview
We will implement a 3D world map using our existing wireframe mesh approach, rendered from real-world heightmap data. The map will be interactive, supporting panning, zoom, and (eventually) resource overlays. The camera will focus on the user's geolocated position (using IP or other means) in future iterations.

## Height Data Sources
We will use real-world elevation data to generate our heightmaps. The main sources considered are:

### 1. Mapzen/Nextzen Terrain Tiles
- **Format:** PNG raster tiles (Terrarium format), web-mercator z/x/y tiling.
- **How to use:** Download tiles by URL, decode PNG to get elevation values.
- **Example tile URL:**
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`
- **Decoding formula:**
  ```
  elevation = (Red * 256 + Green + Blue / 256) - 32768
  ```
- **Docs:**
  - [Mapzen Terrain Tiles Blog](https://www.mapzen.com/blog/elevation/)
  - [Nextzen Terrain Tiles](https://github.com/tilezen/joerd/blob/master/docs/terrain.md)
  - [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)

### 2. SRTM (Shuttle Radar Topography Mission)
- **Format:** GeoTIFFs, 30m or 90m resolution.
- **How to use:** Download by region, extract elevation, convert to heightmap.
- **Docs:**
  - [NASA SRTM Data](https://www2.jpl.nasa.gov/srtm/)
  - [USGS EarthExplorer](https://earthexplorer.usgs.gov/)

### 3. OpenTopography
- **Format:** Various, including SRTM, ASTER, LIDAR.
- **How to use:** Download by bounding box or region.
- **Docs:**
  - [OpenTopography](https://opentopography.org/)

**For this project, we will start with Mapzen/Nextzen Terrain Tiles for easy integration and prototyping.**

## Approach
- **Rendering:**
  - Use Three.js to render a 3D wireframe mesh.
  - The mesh will be generated from real-world elevation data (heightmap).
- **Data Source:**
  - Use publicly available elevation data (e.g., Mapzen Terrain Tiles, SRTM, NASA DEM, or similar).
  - Download and process heightmap tiles as needed.
- **Interactivity:**
  - Support panning and zooming.
  - Plan for overlays (resources, units, etc.) in future updates.
- **Geolocation:**
  - In future, geolocate users and focus the camera on their real-world location.
- **Scale:**
  - Support multiple zoom levels (e.g., regional, city, local).

## Progress Plan
1. **Research & Data Acquisition**
   - [ ] Evaluate and select a public elevation data source (Mapzen, SRTM, etc.).
   - [ ] Prototype downloading and parsing a heightmap tile.
2. **Mesh Generation**
   - [ ] Write a utility to convert heightmap data to a Three.js mesh.
   - [ ] Render the mesh as a wireframe in the existing scene.
3. **Basic Interactivity**
   - [ ] Implement camera panning and zoom controls.
   - [ ] Add basic UI for map navigation.
4. **Zoom Levels**
   - [ ] Support loading and displaying different zoom levels (LOD or tile-based loading).
5. **Geolocation**
   - [ ] Integrate IP-based geolocation to focus the map on the user's region.
6. **Resource/Overlay System (Future)**
   - [ ] Design a system for displaying resources, units, or other overlays on the map.
7. **Performance & Streaming**
   - [ ] Optimize mesh generation and rendering for large areas.
   - [ ] Implement streaming/partial loading for large maps if needed.

## Future Considerations
- Integrate with backend/game state for persistent world data.
- Allow user interaction with map elements (select, build, etc.).
- Support for custom or fictional maps as an option.

---

**References:**
- [Mapzen Terrain Tiles](https://www.mapzen.com/blog/elevation/)
- [NASA SRTM Data](https://www2.jpl.nasa.gov/srtm/)
- [Three.js Heightmap Example](https://threejs.org/examples/?q=terrain#webgl_geometry_terrain) 