import React, { useRef, useEffect, forwardRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControllerProps {
  onCameraMove?: (position: THREE.Vector3, target: THREE.Vector3) => void;
  onTerrainDrag?: ((dx: number, dy: number, isDragging: boolean) => void) | null;
  minDistance?: number;
  maxDistance?: number;
  enableRotate?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
}

const CameraController = forwardRef<any, CameraControllerProps>(({
  onCameraMove,
  onTerrainDrag,
  minDistance = 100,
  maxDistance = 500,
  enableRotate = true,
  enablePan = true,
  enableZoom = true,
}, ref) => {
  const { camera, gl } = useThree();
  const orbitControlsRef = useRef<any>(null);
  
  // Mouse interaction states
  const isDraggingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const shiftPressedRef = useRef(false);

  // Notify parent components about camera movement
  useEffect(() => {
    if (!orbitControlsRef.current || !onCameraMove) return;
    
    const controls = orbitControlsRef.current;
    
    // Add event listener for camera changes
    const handleChange = () => {
      if (onCameraMove) {
        onCameraMove(camera.position.clone(), controls.target.clone());
      }
    };
    
    controls.addEventListener('change', handleChange);
    
    return () => {
      controls.removeEventListener('change', handleChange);
    };
  }, [camera, onCameraMove]);

  // Handle key events for modifier keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        shiftPressedRef.current = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        shiftPressedRef.current = false;
        isRotatingRef.current = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Custom mouse event handling
  useEffect(() => {
    const canvasElement = document.querySelector('canvas');
    if (!canvasElement || !onTerrainDrag) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      
      if (shiftPressedRef.current) {
        // Shift+drag = rotation (handled by OrbitControls)
        isRotatingRef.current = true;
        isDraggingRef.current = false;
        
        // Enable rotation in OrbitControls
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enableRotate = true;
        }
      } else {
        // Regular drag = terrain pan (custom handling)
        isDraggingRef.current = true;
        isRotatingRef.current = false;
        
        // Disable rotation in OrbitControls to prevent conflicts
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enableRotate = false;
        }
        
        // Notify terrain component that dragging has started
        onTerrainDrag(0, 0, true);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      
      if (isDraggingRef.current && onTerrainDrag) {
        // Pass movement to terrain component
        onTerrainDrag(dx, dy, true);
      }
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = () => {
      if (isDraggingRef.current && onTerrainDrag) {
        // Notify terrain component that dragging has ended
        onTerrainDrag(0, 0, false);
      }
      
      isDraggingRef.current = false;
      isRotatingRef.current = false;
      
      // Restore original OrbitControls settings
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enableRotate = enableRotate;
      }
    };
    
    canvasElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvasElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onTerrainDrag, enableRotate]);

  return (
    <OrbitControls
      ref={(node) => {
        orbitControlsRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={Math.PI / 2}
      enableRotate={enableRotate}
      enablePan={enablePan}
      enableZoom={enableZoom}
      screenSpacePanning={false}
      rotateSpeed={0.5}
      panSpeed={0.5}
      zoomSpeed={0.5}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
    />
  );
});

export default CameraController;
