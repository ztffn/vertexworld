import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AssetPreview3DProps {
  className?: string;
}

function RotatingWireframeBox() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ff5050" wireframe />
    </mesh>
  );
}

export default function AssetPreview3D({ className = '' }: AssetPreview3DProps) {
  return (
    <div className={`w-full h-32 bg-transparent ${className}`}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <RotatingWireframeBox />
      </Canvas>
    </div>
  );
} 