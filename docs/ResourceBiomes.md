# Resource/Biome Overlay & Simulation Plan for Vertexworld

## Vision

Create a persistent, multiplayer, zoomable (Earth-to-street) world inspired by Colonization/Openage, with:
- Real-world terrain (heightmaps, multi-resolution).
- Dynamic resources (forest, minerals, farmland, water, etc.) with regrowth/consumption.
- Structures and units (villages, forts, mines, logging camps, ships, caravans, trade routes) that interact with the terrain and resources.
- At max zoom, see procedural buildings, roads, and resource effects.
- Multiplayer, with trade, competition, and persistent world changes.

---

## 1. Terrain & Mesh System

### 1.1. Data Sources
- Use tiled elevation data (Mapzen, SRTM, Copernicus) at various zooms.
- Each tile has a base resolution (e.g. 256x256 or 512x512 vertices).
- Tiles are streamed in/out as user pans and zooms, using LOD (Level of Detail).

### 1.2. Mesh Generation
- At global view: single low-vertex mesh per tile (sampled every Nth pixel).
- As user zooms: progressively swap in higher-vertex mesh for higher detail.
- Store mesh & texture caches for quick LOD swapping.

### 1.3. Streetview/Building Detail
- At max zoom, overlay building footprints, roads, etc. using procedural generation, OpenStreetMap, or asset packs.
- Each building/footprint links to underlying coordinates (lat/lon).

---

## 2. Overlay Data: Resource & Biome

### 2.1. Overlay Representation

#### 2.1.1. RGBA Resource Maps (Dense)
- Each tile has a resource RGBA map:  
  - R = Trees/Forest density  
  - G = Farmland/Grass  
  - B = Minerals/Ore  
  - A = Water/Fish  
  - ...Extend with more channels or use multi-layer textures if needed
- Resolution: Match or exceed mesh (e.g., 512x512 RGBA per tile).

#### 2.1.2. Sparse Entity/Feature List (Selective, for gameplay)
- For each tile, keep a list of resource “entities”:
  - Tree cluster, mine, individual landmark, large forest patch, quarry, etc.
  - Each entity: position, type, current state (full, depleted, regrowing, etc.), last update tick.

#### 2.1.3. Hybrid (Recommended)
- Use RGBA maps for background density, regrowth simulation, and visual overlays.
- Use sparse entity list for interactable/gameplay resources (harvestable forests, mines, farm plots, etc.).
- At low zoom, render only the density overlays; at high zoom, instantiate mesh objects for entities and blend with density for immersion.

---

## 3. Resource Simulation & Dynamics

### 3.1. Regrowth & Depletion

#### 3.1.1. Regrowth
- Each tick (server and/or client):  
  - For each pixel in RGBA overlay, increment value by regrowth rate (per channel/type), capped at maximum.
  - Regrowth rate can depend on biome, climate, season, and proximity to existing resources.

#### 3.1.2. Depletion (Harvesting, Mining, Logging)
- When structure (e.g., sawmill, mine) or unit (e.g., ship, trade caravan) operates:
  - Identify affected area (AoE, circle around structure, or defined region).
  - For each affected pixel/entity: decrease resource value or entity state.
  - If pixel/entity depleted, mark as empty or dead; trigger regrowth process.

#### 3.1.3. Entity Promotion/Demotion
- If RGBA density in an area exceeds a threshold, spawn a gameplay entity (forest patch, mineable node).
- If entity is depleted or density drops, demote to overlay only.

### 3.2. Environmental Simulation
- Periodically, simulate:
  - Natural disasters (fire, flood, pest, etc.) that affect overlays/entities.
  - Climate/seasonal cycles affecting regrowth rates and resource yields.
  - Human impact: over-harvesting slows regrowth, structures can “sterilize” land.

---

## 4. Structures, Buildings, Villages

### 4.1. Placement
- Players can build on eligible tiles (based on resource/biome, proximity to water, terrain slope, etc.).
- Building placement checks both mesh and overlay/entity state.

### 4.2. Building Effects
- Each structure has an effect radius (AoE):
  - Sawmill: automatically harvests trees within radius each tick.
  - Mine: depletes ore in the area.
  - Village/farm: converts trees/grass to farmland.
- Each structure's operation updates the overlay and/or entity list.

### 4.3. Visual Representation
- At high zoom, instantiate building meshes, procedural roads, fences, etc.
- Overlay icons at lower zoom for summary view (e.g., mine symbol, village marker).

---

## 5. Units, Trade, and Routes

### 5.1. Unit Types
- Trade groups: ships, caravans, wagons.
- Combat/utility groups: soldiers, engineers.

### 5.2. Trade Route System
- Players define start/end points and waypoints on the map (can be tiles, villages, ports).
- Trade units move along routes, taking goods between settlements.
- Goods movement depends on resource overlays/entities (e.g., cannot harvest timber unless forest density above threshold).

### 5.3. Resource Transport and Storage
- Each settlement/building maintains inventory of goods.
- Goods/fuel are loaded onto units for transport.

### 5.4. Fortifications & Defense
- Defensive structures can be built; each can affect or protect resources (e.g., walls prevent forest encroachment, forts deter raiding).

---

## 6. Map Streaming, LOD, and Performance

### 6.1. Chunking & Streaming
- World is divided into tiles/chunks (e.g., 16km x 16km in real world, matching heightmap tile).
- Only tiles/chunks in/near view are loaded (heightmap, overlays, entities).
- Unused tiles are cached or unloaded.

### 6.2. LOD Management
- At lower zooms:  
  - Render base mesh, low-res resource overlays, icons for settlements.
- At higher zooms:  
  - Render detailed mesh, spawn entity meshes (trees, mines, buildings), procedural decorations.

### 6.3. Instancing & Batching
- Instanced rendering for trees, rocks, buildings for performance.
- Use GPU-friendly data formats for overlays (compressed textures, typed arrays).

---

## 7. Multiplayer & Backend

### 7.1. World State
- Server maintains authoritative state of overlays, entities, units, structures, and player inventories.
- State is chunked for efficient streaming/sync.

### 7.2. Sync Model
- Clients request state for visible chunks.
- Server sends initial chunk data, then only diffs (changed overlays/entities) per game tick.
- All player actions (building, unit moves, trade) are validated server-side and broadcast as events/diffs.

### 7.3. Persistence
- Server saves chunk overlays, entity lists, unit/structure states regularly.
- Each chunk can be loaded/unloaded as needed.

---

## 8. Data Model Sketch

### 8.1. Overlay Map
```typescript
interface ResourceOverlayTile {
  rgbaData: Uint8Array; // e.g., 512x512x4 = 1MB per tile
  timestamp: number; // Last updated
}
```

### 8.2. Resource Entity
```typescript
interface ResourceEntity {
  id: string;
  type: "forest" | "ore" | "fish" | "field" | ...;
  position: { x: number, y: number };
  state: "full" | "depleted" | "regrowing";
  lastUpdate: number;
  // Optional: link to overlay px/region
}
```

### 8.3. Structure
```typescript
interface Structure {
  id: string;
  type: "village" | "mine" | "lumber_camp" | "fort" | ...;
  position: { x: number, y: number };
  owner: string; // player id
  effectRadius: number;
  inventory: Record<string, number>;
}
```

### 8.4. Unit
```typescript
interface UnitGroup {
  id: string;
  type: "ship" | "caravan" | ...;
  position: { x: number, y: number };
  route: Array<{ x: number, y: number }>;
  cargo: Record<string, number>;
  owner: string;
}
```

---

## 9. Implementation Roadmap

1. **Overlay Prototype**
    - Implement RGBA overlay generation and display as shader heatmap.
    - Add regrowth tick logic (CPU or compute shader).
    - Add simple harvesting (click to deplete area, see regrowth).

2. **Entity Extraction**
    - Identify high-density areas, spawn gameplay resource entities.
    - Show entity mesh at high zoom, overlay at low zoom.

3. **Building Placement**
    - Allow player to place a structure, show AoE.
    - Implement harvesting/mining/farming logic tied to overlays/entities.

4. **Trade Units**
    - Add unit group (ship/caravan), allow user to define routes.
    - Implement cargo movement and trade UI.

5. **Sync/Streaming**
    - Chunked server model: send overlays/entities for visible area.
    - Diff updates for changes, periodic save/load.

6. **Performance**
    - Test LOD, instancing, overlay compression.
    - Optimize streaming and memory use.

7. **Scaling**
    - Simulate “planet scale”—test loading and zooming from global to street.
    - Stress-test with many players, large world, many entities.

8. **Polish**
    - Add procedural buildings, roads, decorations at streetview.
    - Refine regrowth/mining/harvesting logic and visuals.

---

## 10. Open Technical Questions

- **Overlay/entity granularity:** What is the optimal resolution? How to balance memory and interactivity?
- **Server tick rate:** How often to update overlays/entities for regrowth and harvesting? What is feasible for scaling?
- **Procedural mesh decoration:** How to blend procedural buildings with real-world data at max zoom?
- **User experience:** How to make navigation from global to village scale seamless, and keep performance high?

---

## 11. References

- [openage resource simulation](https://github.com/SFTtech/openage/blob/master/doc/ideas/gameplay.md)
- [OpenFrontIO architecture](https://github.com/openfrontio/OpenFrontIO)
- [Three.js instancing](https://threejs.org/docs/#api/en/objects/InstancedMesh)
- [Efficient tiled overlays](https://www.mapbox.com/help/define-mapbox-gl-tilesets/)
- [Procedural building generation](https://osmbuildings.org/)
