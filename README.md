# Vertex World MMO Project

## 1. Project Vision & Scope

This project aims to build a large-scale, stylized 3D world with MMO (Massively Multiplayer Online) resource management gameplay.

**Core Ideas:**

*   **Huge Map (Potentially Entire World):** Start with a large, procedurally generated or heightmap-based continent/region, designed for future scalability.
*   **Stylized Visuals:** Employ a low-resolution grid-line aesthetic for the heightmap mesh, achieved via shaders on a dynamically updated single plane.
*   **Gameplay - MMO Resource Management:** A top-down or isometric perspective where players can place buildings, gather resources, and interact with a persistent world and other players.
*   **Dynamic Vertex Updates:** The world will be a single, large plane. As the camera/viewport moves, the vertices of the plane will be updated based on the visible portion of a large heightmap.

## 2. Roles

*   **AI (Claude):** Programmer. Responsible for implementing the code, solving technical problems, and providing technical advice.
*   **User (You):** Creative Lead. Responsible for defining the vision, providing feedback, and making creative decisions.

## 3. Proposed Tech Stack

### Frontend:

*   **Rendering Engine:**
    *   **React Three Fiber (`@react-three/fiber`):** For declarative 3D scene construction using React.
    *   **`@react-three/drei`:** Essential helpers and components for R3F. ([pmndrs/drei on GitHub](https://github.com/pmndrs/drei))
*   **Build Tool & Dev Environment:**
    *   **Vite:** For fast, modern ESM-based development.
*   **State Management:**
    *   **Zustand:** Lightweight, hook-based state management for React. ([pmndrs/zustand on GitHub](https://github.com/pmndrs/zustand))
*   **Animation:**
    *   **`anime.js`:** For procedural animations. ([juliangarnier/anime on GitHub](https://github.com/juliangarnier/anime))
    *   *Alternatives:* `@react-spring/three` or `framer-motion` for R3F integration.
*   **UI Components:**
    *   Options: Material UI, Chakra UI, Ant Design, or Tailwind CSS.

### 3D Map Specifics & Dynamic Vertex Updates:

*   **Single Plane with Dynamic Vertex Updates:**
    *   **Heightmap Processing:** Tiled heightmaps for the vast world.
    *   **Dynamic Vertex Updates:** As the camera/viewport moves, calculate which portion of the large heightmap corresponds to the current view. Update the vertices of the single plane to match the heights from that visible portion of the heightmap.
    *   **Mesh Generation:** Potentially in Web Workers for terrain chunks.
    *   **LOD Management:** Simulate LOD by reducing the number of segments in the plane for distant views.
    *   **Instancing:** `THREE.InstancedMesh` via R3F for numerous similar objects.
    *   *Inspiration:* `surviving-maps-3d` ([Ocelloid/surviving-maps-3d on GitHub](https://github.com/Ocelloid/surviving-maps-3d)).

### Backend & Multiplayer:

*   **Language & Framework Options:**
    *   **Node.js with TypeScript:**
        *   **NestJS:** Scalable server-side applications.
        *   *Alternatives:* Express.js, Fastify.
    *   **Specialized Game Servers:**
        *   **Nakama (Heroic Labs):** Open-source, scalable game server.
        *   **Colyseus:** Open-source multiplayer game server for Node.js.
*   **Real-time Communication:**
    *   **WebSockets:** Using libraries like `Socket.IO` or built-in features of Nakama/Colyseus.
*   **Database:**
    *   **Primary (Player Data, Game State):** PostgreSQL (with PostGIS for geospatial queries) or MongoDB.
    *   **Caching/Session Store:** Redis.
*   **Architecture:** Authoritative server, state synchronization, persistence, long-term scalability considerations.

### Version Control:

*   **Git & GitHub/GitLab/Bitbucket.**

## 4. Development Plan - Phased Approach

1.  **Phase 1: Vertical Slice - Core Rendering (Frontend)**
    *   **Setup:** Initialize project with Vite, React, React Three Fiber, and Drei.
    *   **Terrain:** Create a single, large, procedurally generated or static heightmap-based terrain plane.
    *   **Styling:** Implement the grid-line shader on the terrain.
    *   **Camera:** Set up camera controls suitable for a top-down/isometric view (e.g., `MapControls` or `OrbitControls` from Drei, configured appropriately).
    *   **Dynamic Vertex Updates:** Implement the logic to update the vertices of the plane based on the camera position and the visible portion of the heightmap.

2.  **Phase 2: LOD & Optimization (Frontend)**
    *   **LOD Implementation:** Introduce a simple LOD system by reducing the number of segments in the plane for distant views.
    *   **Performance Optimization:** Profile and optimize the dynamic vertex update process.
    *   **Consider using Web Workers for vertex calculations.**

3.  **Phase 3: Basic Gameplay Mechanics (Client-Side)**
    *   **State Management:** Integrate Zustand for managing UI and client-side game state.
    *   **Interaction:** Allow basic interaction, e.g., selecting a point on the terrain.
    *   **Building Placement (Mock):** Implement client-side logic for placing a simple building (e.g., a cube) on the terrain. State managed by Zustand.

4.  **Phase 4: Backend Setup & Initial Multiplayer**
    *   **Server Choice:** Select and set up a basic backend (e.g., Node.js with NestJS or Nakama).
    *   **Communication:** Implement WebSocket communication.
    *   **User Accounts:** Basic user authentication and session management.
    *   **Persistence:** Store basic player data (e.g., position, placed buildings) in a database.
    *   **Synchronization:** Synchronize the placement of a simple object across connected clients. What one player places, others see.

5.  **Phase 5: Expanding Gameplay & Features (Iterative)**
    *   **Resource System:** Design and implement resource nodes on the map and resource gathering.
    *   **Building Mechanics:** Develop more complex building types with functions.
    *   **UI/UX:** Refine the user interface for gameplay actions.
    *   **Map Expansion:** Gradually increase the size of the explorable world, refining the dynamic vertex update system.
    *   **Advanced Multiplayer:** Implement more complex interactions, trading, etc.
    *   **Optimization:** Continuously profile and optimize both frontend and backend performance.

## 5. Todo List

### Phase 1: Vertical Slice - Core Rendering (Frontend)

*   [ ] Initialize project with Vite, React, React Three Fiber, and Drei.
*   [ ] Create a single, large, procedurally generated or static heightmap-based terrain plane.
*   [ ] Implement the grid-line shader on the terrain.
*   [ ] Set up camera controls suitable for a top-down/isometric view.
*   [ ] Implement the logic to update the vertices of the plane based on the camera position and the visible portion of the heightmap.

### Phase 2: LOD & Optimization (Frontend)

*   [ ] Introduce a simple LOD system by reducing the number of segments in the plane for distant views.
*   [ ] Profile and optimize the dynamic vertex update process.
*   [ ] Consider using Web Workers for vertex calculations.

### Phase 3: Basic Gameplay Mechanics (Client-Side)

*   [ ] Integrate Zustand for managing UI and client-side game state.
*   [ ] Allow basic interaction, e.g., selecting a point on the terrain.
*   [ ] Implement client-side logic for placing a simple building (e.g., a cube) on the terrain. State managed by Zustand.

### Phase 4: Backend Setup & Initial Multiplayer

*   [ ] Select and set up a basic backend (e.g., Node.js with NestJS or Nakama).
*   [ ] Implement WebSocket communication.
*   [ ] Basic user authentication and session management.
*   [ ] Store basic player data (e.g., position, placed buildings) in a database.
*   [ ] Synchronize the placement of a simple object across connected clients.

### Phase 5: Expanding Gameplay & Features (Iterative)

*   [ ] Design and implement resource nodes on the map and resource gathering.
*   [ ] Develop more complex building types with functions.
*   [ ] Refine the user interface for gameplay actions.
*   [ ] Gradually increase the size of the explorable world, refining the dynamic vertex update system.
*   [ ] Implement more complex interactions, trading, etc.
*   [ ] Continuously profile and optimize both frontend and backend performance.

## 6. Next Immediate Steps

1.  Initialize this `vertexworld_mmo` directory as a Git repository.
2.  Commit this `README.md`.
3.  Set up the initial Vite + React + R3F project structure within this directory.
4.  Begin implementing Phase 1: Core Rendering.

---
*This plan is a living document and will evolve as the project progresses.* 