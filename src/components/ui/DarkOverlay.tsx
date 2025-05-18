import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export default function DarkOverlay() {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={[0, 0, -4]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial 
        color="#000000" 
        transparent 
        opacity={0.7}
      />
    </mesh>
  );
} 