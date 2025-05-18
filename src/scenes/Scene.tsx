import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Grid } from '@react-three/drei';
import * as THREE from 'three';
import Terrain from '../components/Terrain';
import Water from '../components/Water';
import TerrainGUI from '../components/TerrainGUI';
import Sidebar from '../components/ui/Sidebar';
import Footer from '../components/ui/Footer';
import CRTNoise from '../components/ui/CRTNoise';
import Scanlines from '../components/ui/Scanlines';

const Scene: React.FC = () => {
  // Effect for animations
  useEffect(() => {
    // Import anime.js dynamically
    import('animejs').then(({ animate }) => {
      // Animate glowing elements
      animate('.glow', {
        boxShadow: ['0 0 2px rgba(255,50,50,0.3)', '0 0 6px rgba(255,50,50,0.5)'],
        duration: 2000,
        easing: 'inOutSine',
        direction: 'alternate',
        loop: true
      });

      // Animate warning element
      animate('.warning', {
        opacity: [0.6, 1],
        duration: 1000,
        easing: 'inOutSine',
        direction: 'alternate',
        loop: true
      });
    });
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Original Canvas with all 3D elements - nothing changed */}
      <Canvas
        className="absolute inset-0"
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
      
      {/* CRT Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-30">
        <CRTNoise />
      </div>

      {/* UI Overlay - placed on top of the canvas */}
      <div className="absolute inset-0 pointer-events-none flex flex-col z-10">
        {/* Main row */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar - with 0.4 opacity background */}
          <Scanlines className="w-[340px] min-w-[340px] max-w-[340px] bg-[#181f2a] bg-opacity-90 border-r-2 border-red-600 glow flex flex-col p-4 gap-4 pointer-events-auto">
            <Sidebar />
          </Scanlines>
          
          {/* Main window area */}
          <main className="flex-1 flex flex-col min-h-0 pointer-events-none">
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <Scanlines className="relative flex-1 border-2 border-red-600 glow rounded-lg flex flex-col overflow-hidden">
                {/* System stats */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-auto">
                  <div className="relative">
                    <div className="scanlines">
                      <div className="border-2 border-red-600 glow rounded px-2 py-1 text-xs bg-[#181f2a]">CPU Cores: 128</div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="scanlines">
                      <div className="border-2 border-red-600 glow rounded px-2 py-1 text-xs bg-[#181f2a]">Bandwidth: 10Gbps</div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="scanlines">
                      <div className="border-2 border-red-600 glow rounded px-2 py-1 text-xs bg-[#181f2a]">Energon: 75%</div>
                    </div>
                  </div>
                </div>
                
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="uppercase text-xs text-red-400 opacity-75">3D Wireframe Grid</span>
                </div>
                
                {/* Player stats */}
                <div className="absolute bottom-20 left-4 w-48 z-10 pointer-events-auto">
                  <div className="scanlines">
                    <div className="bg-[#181f2a] border-2 border-red-600 glow rounded text-xs">
                      <div className="bg-red-600 text-[#181f2a] px-2 py-1 uppercase">Player Take</div>
                      <div className="flex justify-between px-2 py-1 border-t border-red-600"><span>Host</span><span>2,550,000</span></div>
                      <div className="flex justify-between px-2 py-1 border-t border-red-600"><span>Player 1</span><span>1,200,000</span></div>
                      <div className="flex justify-between px-2 py-1 border-t border-red-600"><span>Player 2</span><span>900,000</span></div>
                    </div>
                  </div>
                </div>
                
                {/* Warning */}
                <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
                  <div className="scanlines">
                    <div className="border-2 border-red-600 glow px-4 py-1 uppercase text-xs text-center bg-red-600 text-[#181f2a] rounded warning">
                      ▲ Hard Mode Active ▲
                    </div>
                  </div>
                </div>
              </Scanlines>
            </div>
          </main>
        </div>
        
        {/* Footer */}
        <Scanlines className="w-full border-t-2 border-red-600 glow bg-[#181f2a] bg-opacity-90 text-xs flex items-center justify-between px-4 py-2 pointer-events-auto">
          <Footer />
        </Scanlines>
      </div>
      
      {/* Keep TerrainGUI for adjusting terrain parameters */}
      <div className="absolute top-0 right-0 z-20">
        <TerrainGUI />
      </div>
    </div>
  );
};

export default Scene; 