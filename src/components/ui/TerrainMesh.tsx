import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, PlaneGeometry, MeshStandardMaterial, Vector3 } from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise';

export default function TerrainMesh() {
  const meshRef = useRef<Mesh>(null);
  const waterRef = useRef<Mesh>(null);
  const simplex = useMemo(() => new SimplexNoise(), []);

  // Generate terrain height map
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(100, 100, 128, 128);
    const vertices = geo.attributes.position.array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      vertices[i + 1] = simplex.noise(x * 0.02, z * 0.02) * 5;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [simplex]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = -Math.PI / 2;
    }
    if (waterRef.current) {
      waterRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial 
          color="#2c3e50"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      <mesh ref={waterRef} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#3498db"
          transparent
          opacity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
} 