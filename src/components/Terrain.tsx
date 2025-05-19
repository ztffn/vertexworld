import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
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
import ReactDOM from 'react-dom';
import { OrbitControls } from '@react-three/drei';
// Import animate from animejs v4
import { animate, createScope, createSpring } from 'animejs';

const provider = new OpenTopographyProvider('2c23752a27db60c1d1b2a1c9ba672980');

interface TerrainProps {
  setHeightData?: (data: HeightmapTile | null) => void;
  onDebugData?: (data: { heightData: HeightmapTile | null, center: {x: number, y: number} | null, zoom: number }) => void;
  orbitControlsRef?: React.RefObject<any>;
  externalCenter?: { x: number, y: number } | null;
}

const Terrain: React.FC<TerrainProps> = ({ setHeightData, onDebugData, orbitControlsRef, externalCenter }) => {
  const [heightData, _setHeightData] = useState<HeightmapTile | null>(null);
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);
  const [terrainMeshRef, setTerrainMeshRef] = useState<THREE.Mesh | null>(null);
  
  // Mouse interaction states
  const isDraggingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  
  // Animation state
  const isAnimating = useRef(false);
  const animationTarget = useRef({ x: 0, y: 0 });
  const animation = useRef<any>(null);
  const tempCenterRef = useRef<{ x: number; y: number } | null>(null);
  const animScope = useRef<any>(null);
  
  const {
    wireframeWidth,
    waterColor,
    heightScale,
    segments,
    size: terrainSize,
    showDiagonals,
  } = useTerrainStore();

  // --- Add state for center and zoom ---
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null); // Center of the map
  const [zoom, setZoom] = useState<number>(256); // Default for small images

  // Set initial center after heightData loads
  useEffect(() => {
    if (heightData && !center) {
      setCenter({ x: Math.floor(heightData.width / 2), y: Math.floor(heightData.height / 2) });
      setZoom(Math.min(256, heightData.width, heightData.height));
    }
  }, [heightData, center]);

  // Initialize animation scope
  useEffect(() => {
    animScope.current = createScope();
    return () => {
      if (animScope.current) {
        animScope.current.revert();
      }
    };
  }, []);

  // Animate center position changes for smooth transitions
  const animateToPosition = useCallback((targetX: number, targetY: number, duration = 400) => {
    if (!center || !heightData || !animScope.current) return;
    
    // Don't animate if already at the target
    if (center.x === targetX && center.y === targetY) return;
    
    // Don't start a new animation if one is in progress to the same target
    if (isAnimating.current && 
        animationTarget.current.x === targetX && 
        animationTarget.current.y === targetY) return;
    
    // Update the animation target
    animationTarget.current = { x: targetX, y: targetY };
    isAnimating.current = true;
    
    // Create a target object for the animation
    const animTarget = { x: center.x, y: center.y };
    
    // Use the animation scope to animate
    animate(animTarget, {
      x: targetX,
      y: targetY,
      ease: createSpring({ stiffness: 150, damping: 15 }),
      duration: duration,
      update: () => {
        setCenter({ 
          x: Math.round(animTarget.x), 
          y: Math.round(animTarget.y) 
        });
      },
      complete: () => {
        isAnimating.current = false;
      }
    });
  }, [center, heightData]);
  
  // --- Mouse interaction handlers ---
  useEffect(() => {
    const canvasElement = document.querySelector('canvas');
    if (!canvasElement) return;
    
    // Track if shift key is pressed
    let shiftPressed = false;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        shiftPressed = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        shiftPressed = false;
        isRotatingRef.current = false;
      }
    };
    
    // Mouse down handler
    const handleMouseDown = (e: MouseEvent) => {
      if (!heightData || !center) return;
      
      // Stop any running animations
      if (isAnimating.current && animScope.current) {
        animScope.current.revert();
        isAnimating.current = false;
      }
      
      // Store initial positions
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      dragStartPos.current = { x: center.x, y: center.y };
      tempCenterRef.current = { ...center };
      
      if (shiftPressed) {
        // Shift+drag = rotation
        isRotatingRef.current = true;
        isDraggingRef.current = false;
        isDragging.current = false;
      } else {
        // Regular drag = pan terrain
        isDraggingRef.current = true;
        isRotatingRef.current = false;
        isDragging.current = true;
      }
    };
    
    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!heightData || !center || !tempCenterRef.current) return;
      
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      
      if (isRotatingRef.current && orbitControlsRef?.current) {
        // Handle rotation manually
        const orbit = orbitControlsRef.current;
        const rotateSpeed = 1.0;
        
        // The orbit controls internal API
        const orbitObj = orbit as any;
        if (orbitObj.rotateLeft && orbitObj.rotateUp) {
          orbitObj.rotateLeft(dx * 0.01 * rotateSpeed);
          orbitObj.rotateUp(dy * 0.01 * rotateSpeed);
          orbitObj.update();
        } 
        else if (orbitObj.spherical && orbitObj.sphericalDelta) {
          orbitObj.sphericalDelta.theta -= dx * 0.01 * rotateSpeed;
          orbitObj.sphericalDelta.phi -= dy * 0.01 * rotateSpeed;
          orbitObj.update();
        }
        else if (camera instanceof THREE.PerspectiveCamera) {
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -dx * 0.01 * rotateSpeed);
          camera.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), -dy * 0.01 * rotateSpeed);
          camera.lookAt(0, 0, 0);
        }
      } 
      else if (isDraggingRef.current) {
        // Calculate the new center position based on mouse movement
        // Use a smoother scaling factor based on zoom level
        const scale = Math.max(0.5, zoom / 512);  // Adjust scale based on zoom level
        
        const moveX = dx * scale;
        const moveY = dy * scale;
        
        // Update the temporary center position (stored in ref to avoid re-renders)
        tempCenterRef.current = {
          x: dragStartPos.current.x - moveX,
          y: dragStartPos.current.y + moveY  // Invert Y because heightmap Y is top-to-bottom
        };
        
        // Clamp to ensure the sampling window stays within the heightmap
        const half = Math.floor(zoom / 2);
        tempCenterRef.current.x = Math.max(half, Math.min(heightData.width - half, tempCenterRef.current.x));
        tempCenterRef.current.y = Math.max(half, Math.min(heightData.height - half, tempCenterRef.current.y));
        
        // Update state with smoothed value
        setCenter({
          x: Math.round(tempCenterRef.current.x),
          y: Math.round(tempCenterRef.current.y)
        });
      }
    };
    
    // Mouse up handler with inertia for natural feel
    const handleMouseUp = (e: MouseEvent) => {
      if (!heightData || !center || !isDragging.current || !tempCenterRef.current) {
        isDraggingRef.current = false;
        isRotatingRef.current = false;
        isDragging.current = false;
        return;
      }
      
      // Determine if this was a real drag or just a click
      const totalDragDistanceX = Math.abs(e.clientX - lastMousePos.current.x);
      const totalDragDistanceY = Math.abs(e.clientY - lastMousePos.current.y);
      
      // Only apply inertia if the drag was significant
      if (totalDragDistanceX > 5 || totalDragDistanceY > 5) {
        // Calculate drag velocity for inertia
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        
        // Scale affects how much inertia we apply
        const scale = Math.max(0.5, zoom / 512);
        
        // Apply momentum based on recent movement
        const inertiaX = dx * scale * 2; // 2x multiplier for inertia
        const inertiaY = dy * scale * 2;
        
        // Target position with inertia
        let targetX = tempCenterRef.current.x - inertiaX;
        let targetY = tempCenterRef.current.y + inertiaY;
        
        // Clamp to ensure the sampling window stays within the heightmap
        const half = Math.floor(zoom / 2);
        targetX = Math.max(half, Math.min(heightData.width - half, targetX));
        targetY = Math.max(half, Math.min(heightData.height - half, targetY));
        
        // Animate to the target position with spring physics
        animateToPosition(targetX, targetY, 600);
      }
      
      isDraggingRef.current = false;
      isRotatingRef.current = false;
      isDragging.current = false;
      tempCenterRef.current = null;
    };
    
    // Blur handler
    const handleBlur = () => {
      isDraggingRef.current = false;
      isRotatingRef.current = false;
      isDragging.current = false;
    };
    
    // Add all event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvasElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvasElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [heightData, center, zoom, orbitControlsRef, camera, animateToPosition]);

  // --- Keyboard controls for panning and zooming ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!heightData || !center) return;
      
      // Don't handle arrow keys if they're meant for other UI elements
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }
      
      let targetX = center.x;
      let targetY = center.y;
      let changed = false;
      const panStep = Math.max(4, Math.floor(zoom / 16));
      
      switch (e.key) {
        case 'ArrowUp':
          targetY = Math.max(0, targetY - panStep);
          changed = true;
          break;
        case 'ArrowDown':
          targetY = Math.min(heightData.height - 1, targetY + panStep);
          changed = true;
          break;
        case 'ArrowLeft':
          targetX = Math.max(0, targetX - panStep);
          changed = true;
          break;
        case 'ArrowRight':
          targetX = Math.min(heightData.width - 1, targetX + panStep);
          changed = true;
          break;
        case '+':
        case '=':
          setZoom(z => Math.max(16, z - 32));
          break;
        case '-':
        case '_':
          setZoom(z => Math.min(Math.min(heightData.width, heightData.height), z + 32));
          break;
        default:
          break;
      }
      
      // Clamp center so region stays in bounds
      const half = Math.floor(zoom / 2);
      targetX = Math.max(half, Math.min(heightData.width - half, targetX));
      targetY = Math.max(half, Math.min(heightData.height - half, targetY));
      
      if (changed) {
        // Animate movement for keyboard controls too
        animateToPosition(targetX, targetY, 300);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [center, heightData, zoom, animateToPosition]);

  // --- Extract region from heightmap based on center and zoom ---
  const regionData = useMemo(() => {
    if (!heightData || !center) return null;
    const { data, width, height } = heightData;
    const regionSize = Math.min(zoom, width, height);
    const half = Math.floor(regionSize / 2);
    let startX = center.x - half;
    let startY = center.y - half;
    startX = Math.max(0, Math.min(width - regionSize, startX));
    startY = Math.max(0, Math.min(height - regionSize, startY));
    const region: number[][] = [];
    for (let y = 0; y < regionSize; y++) {
      const row: number[] = [];
      for (let x = 0; x < regionSize; x++) {
        row.push(data[startY + y][startX + x]);
      }
      region.push(row);
    }
    return { data: region, width: regionSize, height: regionSize };
  }, [heightData, center, zoom]);

  // --- Update geometry to use regionData ---
  const geometry = useMemo(() => {
    const planeGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    planeGeometry.rotateX(-Math.PI / 2);

    if (regionData) {
      const { data: rData, width: rWidth, height: rHeight } = regionData;
      const vertices = planeGeometry.attributes.position.array as Float32Array | Float64Array;
      
      // Log some sampling data for debugging
      if (rHeight > 0 && rWidth > 0) {
        console.log(`[Terrain.tsx] Sample rData[0][0]: ${rData[0][0]}`);
        if (rHeight > 10 && rWidth > 10) {
          console.log(`[Terrain.tsx] Sample rData[10][10]: ${rData[10][10]}`);
        }
        if (rHeight >= 128 && rWidth >= 128 && rData[128] !== undefined && rData[128][128] !== undefined) { 
            console.log(`[Terrain.tsx] Sample rData[128][128] (center of region): ${rData[128][128]}`);
        }
      }
      
      // For each vertex in the plane geometry
      for (let i = 0, l = vertices.length; i < l; i += 3) {
        // Get vertex position in normalized coordinates (-0.5 to 0.5)
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // Convert to UV coordinates (0 to 1)
        const u = (x / terrainSize) + 0.5;
        const v = (z / terrainSize) + 0.5;
        
        // Map to pixel coordinates in the regionData
        const px = Math.floor(u * (rWidth - 1));
        const py = Math.floor((1 - v) * (rHeight - 1));
        
        // Clamp to valid range
        const validPx = Math.max(0, Math.min(px, rWidth - 1));
        const validPy = Math.max(0, Math.min(py, rHeight - 1));
        
        // Apply height value to vertex Y coordinate, normalized to 0-1 range
        const heightValue = rData[validPy][validPx] / 255.0;
        vertices[i + 1] = heightValue * heightScale;
      }
      
      planeGeometry.computeVertexNormals();
      planeGeometry.attributes.position.needsUpdate = true;
    }
    return planeGeometry;
  }, [regionData, heightScale, segments, terrainSize]);

  // Load the full heightmap image
  useEffect(() => {
    console.log('[Terrain.tsx] Attempting to load heightmap image...');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Only use supported event handlers
    img.onload = () => {
      console.log('[Terrain.tsx] Image loaded successfully:', img.width, 'x', img.height);
      console.log('[Terrain.tsx] Image URL:', img.src);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('[Terrain.tsx] CRITICAL ERROR: Failed to get 2D context for image processing.');
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      console.log('[Terrain.tsx] Raw ImageData obtained:', imageData.width, 'x', imageData.height);
      
      // Log some raw pixel values from imageData.data (RGBA format)
      let rawPixelSamples = 'Raw pixel samples (RGBA): ';
      for (let i = 0; i < 5; i++) { // First 5 pixels
        const offset = i * 4;
        rawPixelSamples += `[${imageData.data[offset]}, ${imageData.data[offset+1]}, ${imageData.data[offset+2]}, ${imageData.data[offset+3]}] `;
      }
      console.log('[Terrain.tsx]', rawPixelSamples);
      const midPixelOffset = (Math.floor(img.height / 2) * img.width + Math.floor(img.width / 2)) * 4;
      console.log(`[Terrain.tsx] Mid pixel raw sample: [${imageData.data[midPixelOffset]}, ${imageData.data[midPixelOffset+1]}, ${imageData.data[midPixelOffset+2]}, ${imageData.data[midPixelOffset+3]}]`);

      const processedDataArray: number[][] = [];
      let minVal = Infinity, maxVal = -Infinity;
      
      for (let y = 0; y < img.height; y++) {
        const row: number[] = [];
        for (let x = 0; x < img.width; x++) {
          const idx = (y * img.width + x) * 4; // Red channel index
          const value = imageData.data[idx];   // Using only the Red channel for height
          if (value < minVal) minVal = value;
          if (value > maxVal) maxVal = value;
          row.push(value);
        }
        processedDataArray.push(row);
      }
      
      console.log('!!!!!!!!!! TERRAIN IMAGE LOAD !!!!!!!!!!');
      console.log('[Terrain.tsx] Height data PROCESSED by img.onload. Min:', minVal, 'Max:', maxVal);
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      
      const loadedHeightData: HeightmapTile = {
        width: img.width,
        height: img.height,
        data: processedDataArray
      };
      
      _setHeightData(loadedHeightData);
      if (setHeightData) {
        setHeightData(loadedHeightData);
      }
      
      // Immediately send debug data to parent if callback is provided
      if (onDebugData) {
        onDebugData({
          heightData: loadedHeightData,
          center: { x: Math.floor(img.width / 2), y: Math.floor(img.height / 2) },
          zoom: Math.min(256, img.width, img.height)
        });
      }
    };
    
    img.onerror = (error) => {
      console.error('[Terrain.tsx] CRITICAL ERROR: Failed to load heightmap image. Path: /assets/cropped_norw_1024.png', error);
      console.error('[Terrain.tsx] Image URL attempted:', img.src);
      
      // Check if the file exists by using fetch as an alternative
      fetch('/assets/cropped_norw_1024.png')
        .then(response => {
          if (response.ok) {
            console.log('[Terrain.tsx] File exists according to fetch, but Image couldn\'t load it');
          } else {
            console.error('[Terrain.tsx] File does not exist according to fetch. Status:', response.status);
          }
        })
        .catch(err => {
          console.error('[Terrain.tsx] Fetch check also failed:', err);
        });
    };
    
    console.log('[Terrain.tsx] Setting image source to /assets/cropped_norw_1024.png');
    // Force an absolute URL to avoid path issues
    const baseUrl = window.location.origin;
    const imageUrl = `${baseUrl}/assets/cropped_norw_1024.png`;
    console.log('[Terrain.tsx] Full image URL:', imageUrl);
    img.src = imageUrl;
  }, [setHeightData, onDebugData]);

  // Calculate sampling rate based on camera distance
  const getSamplingRate = (cameraDistance: number) => {
    // Adjust these values to control the zoom levels
    if (cameraDistance < 200) return 1; // Max zoom: sample every pixel
    if (cameraDistance < 400) return 2; // Medium zoom: sample every 2nd pixel
    if (cameraDistance < 600) return 4; // Far zoom: sample every 4th pixel
    return 8; // Very far: sample every 8th pixel
  };

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
        console.log('[Terrain.tsx] Wireframe with diagonals:', !showDiagonals);
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
    console.log('[Terrain.tsx] Terrain mesh created/updated');
    return () => setTerrainMeshRef(null);
  }, [terrainMesh]);

  // Log mesh world position when center or zoom changes
  useEffect(() => {
    if (terrainMeshRef && (center || zoom)) {
      const worldPos = new THREE.Vector3();
      terrainMeshRef.getWorldPosition(worldPos);
      // console.log('[Terrain.tsx] Mesh world position:', worldPos.x.toFixed(2), worldPos.y.toFixed(2), worldPos.z.toFixed(2));
    }
  }, [terrainMeshRef, center, zoom]);

  // Toggle debug box visibility with key 'b'
  const [showDebugBox, setShowDebugBox] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b') {
        setShowDebugBox(prev => !prev);
        console.log('[Terrain.tsx] Debug box toggled:', !showDebugBox);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDebugBox]);

  // Log when heightData is loaded
  useEffect(() => {
    if (heightData) {
      // console.log('[Terrain.tsx] Internal heightData state updated', heightData.width, heightData.height);
    }
  }, [heightData]);

  // Call onDebugData when debug data changes
  useEffect(() => {
    if (onDebugData) {
      onDebugData({ heightData, center, zoom });
    }
  }, [onDebugData, heightData, center, zoom]);

  // Watch for external center position updates (like from map clicks)
  useEffect(() => {
    // Only update if we have heightData, externalCenter, and our own center
    if (externalCenter && heightData && center) {
      // Only update if the center actually changed
      if (center.x !== externalCenter.x || center.y !== externalCenter.y) {
        console.log(`[Terrain] Syncing to external center position: x=${externalCenter.x}, y=${externalCenter.y}`);
        // Animate to the external center position
        animateToPosition(externalCenter.x, externalCenter.y, 500);
      }
    }
  }, [externalCenter, heightData, center, animateToPosition]);

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