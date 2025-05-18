import React, { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { useTerrainStore } from '../store/terrainStore';

interface HeightData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

function getHeightData(img: HTMLImageElement): HeightData | null {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get 2D context');
    return null;
  }
  
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  return {
    data: imageData.data,
    width: imageData.width,
    height: imageData.height
  };
}

const Terrain: React.FC = () => {
  const [heightData, setHeightData] = useState<HeightData | null>(null);
  const size = useThree((state) => state.size);
  const [terrainMeshRef, setTerrainMeshRef] = useState<THREE.Mesh | null>(null);
  
  const {
    wireframeWidth,
    waterColor,
    heightScale,
    segments,
    size: terrainSize,
  } = useTerrainStore();

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const data = getHeightData(img);
      if (data) {
        setHeightData(data);
      }
    };
    img.onerror = (err) => {
      console.error('Error loading image:', err);
    };
    img.src = '/assets/heightmap.png';
  }, []);

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

        const heightValue = data[(validPy * width + validPx) * 4] / 255;
        vertices[i + 1] = heightValue * heightScale;
      }

      geometry.computeVertexNormals();
      geometry.attributes.position.needsUpdate = true;
    }

    return geometry;
  }, [heightData, heightScale, segments, terrainSize]);

  const wireframe = useMemo(() => {
    // Create arrays to store line positions
    const positions = [];
    const vertices = geometry.attributes.position.array;
    const segmentSize = terrainSize / segments;

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

    // Create line material
    const lineMaterial = new LineMaterial({
      color: waterColor,
      linewidth: wireframeWidth,
      opacity: 1.0, // Make it fully opaque for better visibility
      transparent: true,
      resolution: new THREE.Vector2(size.width, size.height),
      dashed: false,
      alphaToCoverage: true
    });

    // Create line segments
    const lines = new LineSegments2(lineGeometry, lineMaterial);
    lines.computeLineDistances();

    return lines;
  }, [geometry, wireframeWidth, waterColor, size.width, size.height, segments, terrainSize]);

  // Update resolution when viewport changes
  useEffect(() => {
    if (wireframe.material) {
      (wireframe.material as LineMaterial).resolution.set(
        size.width,
        size.height
      );
    }
  }, [wireframe, size]);

  // Create terrain mesh
  const terrainMesh = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: 0x5E85B0,
      roughness: 0.8,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
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

  return (
    <>
      <primitive object={terrainMesh} />
      <primitive object={wireframe} />
      
      {/* Optional debug box to test water intersection */}
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