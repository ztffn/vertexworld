import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Grid } from '@react-three/drei';
import * as THREE from 'three';
import Terrain from '../components/Terrain';
import Water from '../components/Water';
import TerrainGUI from '../components/TerrainGUI';

const Scene: React.FC = () => {
  return (
    <>
      <TerrainGUI />
      <Canvas
        camera={{
          position: [400, 200, 0],
          fov: 60,
          near: 1,
          far: 3000
        }}
        shadows
      >
        <color attach="background" args={['#1d3d70']} />
        <fog attach="fog" args={['#1d3d70', 0.001]} />
        
        {/* Debug helpers */}
        <Grid
          args={[1000, 1000]}
          position={[0, -0.01, 0]}
          cellSize={10}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={50}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={400}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
        <primitive object={new THREE.AxesHelper(100)} />
        
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[1, 1, 1]} 
          intensity={0.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Terrain */}
        <Terrain />
        
        {/* Water */}
        <Water />
        
        {/* Controls */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={50}
          maxDistance={1000}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Stats */}
        <Stats />
      </Canvas>
    </>
  );
};

export default Scene; 