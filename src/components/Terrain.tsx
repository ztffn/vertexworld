import React, { useMemo, useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/examples/jsm/lines/WireframeGeometry2.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { useTerrainStore } from '../store/terrainStore';
import type { HeightmapTile } from '../utils/heightmapProvider';
import { OpenTopographyProvider } from '../utils/heightmapProvider';

const provider = new OpenTopographyProvider('2c23752a27db60c1d1b2a1c9ba672980');

interface TerrainProps {
  setHeightData?: (data: HeightmapTile | null) => void;
}

const Terrain: React.FC<TerrainProps> = ({ setHeightData }) => {
  const [heightData, _setHeightData] = useState<HeightmapTile | null>(null);
  const [showDebugHeightmap, setShowDebugHeightmap] = useState(false);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const size = useThree((state) => state.size);
  const [terrainMeshRef, setTerrainMeshRef] = useState<THREE.Mesh | null>(null);
  
  const {
    wireframeWidth,
    waterColor,
    heightScale,
    segments,
    size: terrainSize,
    showDiagonals,
  } = useTerrainStore();

  useEffect(() => {
    provider.getHeightmapTile(6, 33, 22)
      .then((data) => {
        console.log('Terrain loaded heightData:', data);
        // Log min/max elevation
        let min = Infinity, max = -Infinity;
        for (let y = 0; y < data.height; y++) {
          for (let x = 0; x < data.width; x++) {
            const v = data.data[y][x];
            if (v < min) min = v;
            if (v > max) max = v;
          }
        }
        console.log('Elevation min:', min, 'max:', max);
        _setHeightData(data);
        if (setHeightData) {
          console.log('Calling setHeightData prop from Terrain');
          setHeightData(data);
        }
      })
      .catch((err) => {
        console.error('Error loading heightData from provider:', err);
      });
  }, [setHeightData]);

  // Add a simple test mesh to debug water intersection
  const testMesh = useMemo(() => {
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geometry, material);
  }, []);

  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    if (heightData) {
      const { data, width, height } = heightData;
      const vertices = geometry.attributes.position.array;

      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];

        const u = (x + terrainSize/2) / terrainSize;
        const v = (z + terrainSize/2) / terrainSize;
        
        const px = Math.floor(u * (width - 1));
        const py = Math.floor((1 - v) * (height - 1));
        
        const validPx = Math.max(0, Math.min(px, width - 1));
        const validPy = Math.max(0, Math.min(py, height - 1));

        // Use the mock provider's data directly
        const heightValue = data[validPy][validPx] / 255;
        vertices[i + 1] = heightValue * heightScale;
      }

      geometry.computeVertexNormals();
      geometry.attributes.position.needsUpdate = true;
    }

    return geometry;
  }, [heightData, heightScale, segments, terrainSize]);

  // Create wireframe using the WireframeGeometry2 approach (with diagonals)
  const wireframeWithDiagonals = useMemo(() => {
    // Use WireframeGeometry2 for full wireframe with diagonals
    const wireframeGeometry = new WireframeGeometry2(geometry);
    
    const wireframeMaterial = new LineMaterial({
      color: waterColor,
      linewidth: wireframeWidth,
      resolution: new THREE.Vector2(size.width, size.height)
    });

    const wireframe = new Wireframe(wireframeGeometry, wireframeMaterial);
    wireframe.computeLineDistances();
    wireframe.renderOrder = 1;
    
    return wireframe;
  }, [geometry, wireframeWidth, waterColor, size.width, size.height]);

  // Create grid wireframe without diagonals
  const wireframeWithoutDiagonals = useMemo(() => {
    // Create arrays to store line positions
    const positions = [];
    const vertices = geometry.attributes.position.array;

    // Create horizontal lines
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j < segments; j++) {
        const idx1 = i * (segments + 1) + j;
        const idx2 = i * (segments + 1) + (j + 1);

        positions.push(
          vertices[idx1 * 3], vertices[idx1 * 3 + 1], vertices[idx1 * 3 + 2],
          vertices[idx2 * 3], vertices[idx2 * 3 + 1], vertices[idx2 * 3 + 2]
        );
      }
    }

    // Create vertical lines
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const idx1 = i * (segments + 1) + j;
        const idx2 = (i + 1) * (segments + 1) + j;

        positions.push(
          vertices[idx1 * 3], vertices[idx1 * 3 + 1], vertices[idx1 * 3 + 2],
          vertices[idx2 * 3], vertices[idx2 * 3 + 1], vertices[idx2 * 3 + 2]
        );
      }
    }

    // Create line segments geometry
    const lineGeometry = new LineSegmentsGeometry();
    lineGeometry.setPositions(positions);

    const lineMaterial = new LineMaterial({
      color: waterColor,
      linewidth: wireframeWidth,
      resolution: new THREE.Vector2(size.width, size.height)
    });

    const lines = new LineSegments2(lineGeometry, lineMaterial);
    lines.computeLineDistances();
    lines.renderOrder = 1;
    
    return lines;
  }, [geometry, wireframeWidth, waterColor, size.width, size.height, segments]);

  // Update resolution when viewport changes
  useEffect(() => {
    const activeMaterial = showDiagonals 
      ? (wireframeWithDiagonals.material as LineMaterial)
      : (wireframeWithoutDiagonals.material as LineMaterial);
    
    if (activeMaterial) {
      activeMaterial.resolution.set(size.width, size.height);
    }
  }, [wireframeWithDiagonals, wireframeWithoutDiagonals, showDiagonals, size]);

  // Toggle wireframe type with 'w' key
  useEffect(() => {
    const { setShowDiagonals } = useTerrainStore.getState();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w') {
        setShowDiagonals(!showDiagonals);
        console.log('Wireframe with diagonals:', !showDiagonals);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDiagonals]);

  // Create terrain mesh
  const terrainMesh = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: 0x5E85B0,
      roughness: 0.8,
      metalness: 0.2,
      // Enable polygon offset to prevent z-fighting with the wireframe
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    
    // Set lower render order to ensure it renders before the wireframe
    mesh.renderOrder = 0;
    
    return mesh;
  }, [geometry]);

  // Store reference to the mesh
  useEffect(() => {
    setTerrainMeshRef(terrainMesh);
    console.log('Terrain mesh created');
    return () => setTerrainMeshRef(null);
  }, [terrainMesh]);

  // Toggle debug box visibility with key 'b'
  const [showDebugBox, setShowDebugBox] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b') {
        setShowDebugBox(prev => !prev);
        console.log('Debug box:', !showDebugBox);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDebugBox]);

  // Log when heightData is loaded
  useEffect(() => {
    if (heightData) {
      console.log('Height data loaded', heightData);
    }
  }, [heightData]);

  // Debug: draw heightmap to canvas when data changes
  useEffect(() => {
    if (!showDebugHeightmap) return;
    if (!heightData) {
      console.log('Debug window open, but no heightData');
      return;
    }
    if (!debugCanvasRef.current) {
      console.log('Debug window open, but no canvas ref');
      return;
    }
    const { width, height, data } = heightData;
    const canvas = debugCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.createImageData(width, height);
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
    ctx.putImageData(imgData, 0, 0);
    console.log('Rendered debug heightmap to canvas');
  }, [showDebugHeightmap, heightData]);

  // Toggle debug heightmap with 'h' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h') {
        setShowDebugHeightmap(v => {
          console.log('Toggling debug window:', !v);
          return !v;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Only log outside of JSX
  useEffect(() => {
    if (showDebugHeightmap && heightData) {
      console.log('Rendering debug window with heightData');
    }
  }, [showDebugHeightmap, heightData]);

  return (
    <>
      <primitive object={terrainMesh} />
      {showDiagonals ? (
        <primitive object={wireframeWithDiagonals} />
      ) : (
        <primitive object={wireframeWithoutDiagonals} />
      )}
      {showDebugBox && (
        <mesh position={[0, 50, 0]}>
          <boxGeometry args={[100, 100, 100]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </>
  );
};

export default Terrain; 