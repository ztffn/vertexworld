import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export default function WireframeGrid() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.05;
      meshRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]}>
      <boxGeometry args={[20, 20, 20, 20, 20, 20]} />
      <meshBasicMaterial 
        color="#ff3232" 
        wireframe 
        transparent 
        opacity={0.3}
      />
    </mesh>
  );
} 