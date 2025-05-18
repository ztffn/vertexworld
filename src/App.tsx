import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { animate } from 'animejs';
import Sidebar from './components/ui/Sidebar';
import Footer from './components/ui/Footer';
import CRTNoise from './components/ui/CRTNoise';
import Terrain from './components/Terrain';
import Water from './components/Water';
import TerrainGUI from './components/TerrainGUI';

function App() {
  useEffect(() => {
    // Glow effect for elements with .glow class
    animate('.glow', {
      boxShadow: ['0 0 2px rgba(255,50,50,0.3)', '0 0 6px rgba(255,50,50,0.5)'],
      duration: 2000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });

    // Warning text animation
    animate('.warning', {
      opacity: [0.6, 1],
      duration: 1000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });
  }, []);

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Main row - fills most of screen */}
      <div className="flex flex-1 w-full">
        {/* Sidebar with opacity */}
        <div className="w-[340px] min-w-[340px] flex-shrink-0 bg-opacity-40 bg-[#181f2a] border-r-2 border-red-600 flex flex-col p-4 gap-4 z-10">
          <Sidebar />
        </div>
        
        {/* Main viewport with 3D scene */}
        <div className="flex-grow relative">
          {/* 3D Canvas */}
          <Canvas
            className="absolute inset-0"
            camera={{ position: [0, 5, 10], fov: 75 }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Terrain />
            <Water />
            <OrbitControls 
              makeDefault 
              enablePan 
              enableZoom 
              enableRotate
            />
          </Canvas>
          
          {/* UI Elements - positioned above canvas */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="border-2 border-red-600 rounded px-2 py-1 text-xs bg-[#181f2a]">CPU Cores: 128</div>
            <div className="border-2 border-red-600 rounded px-2 py-1 text-xs bg-[#181f2a]">Bandwidth: 10Gbps</div>
            <div className="border-2 border-red-600 rounded px-2 py-1 text-xs bg-[#181f2a]">Energon: 75%</div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="uppercase text-xs text-red-400 opacity-75">3D Wireframe Grid</span>
          </div>
          
          <div className="absolute bottom-20 left-4 w-48 bg-[#181f2a] border-2 border-red-600 rounded text-xs z-10">
            <div className="bg-red-600 text-[#181f2a] px-2 py-1 uppercase">Player Take</div>
            <div className="flex justify-between px-2 py-1 border-t border-red-600"><span>Host</span><span>2,550,000</span></div>
            <div className="flex justify-between px-2 py-1 border-t border-red-600"><span>Player 1</span><span>1,200,000</span></div>
            <div className="flex justify-between px-2 py-1 border-t border-red-600"><span>Player 2</span><span>900,000</span></div>
          </div>
          
          <div className="absolute bottom-4 right-4 border-2 border-red-600 px-4 py-1 uppercase text-xs text-center bg-red-600 text-[#181f2a] rounded warning z-10">
            ▲ Hard Mode Active ▲
          </div>
          
          {/* Border */}
          <div className="absolute inset-4 border-2 border-red-600 rounded-lg pointer-events-none"></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="w-full border-t-2 border-red-600 bg-[#181f2a] bg-opacity-40 text-xs flex items-center justify-between px-4 py-2 z-10">
        <Footer />
      </div>
      
      {/* CRT Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-30">
        <CRTNoise />
      </div>
    </div>
  );
}

export default App;
