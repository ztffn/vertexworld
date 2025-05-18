import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import CRTNoise from "./components/ui/CRTNoise";
import Sidebar from "./components/ui/Sidebar";
import Scanlines from "./components/ui/Scanlines";
import Footer from "./components/ui/Footer";
import BackgroundMesh from "./components/ui/BackgroundMesh";
import DarkOverlay from "./components/ui/DarkOverlay";
import TerrainMesh from "./components/ui/TerrainMesh";
import { animate } from 'animejs';
import { OrbitControls } from '@react-three/drei';

const App: React.FC = () => {
  useEffect(() => {
    animate('.glow', {
      boxShadow: ['0 0 2px rgba(255,50,50,0.3)', '0 0 6px rgba(255,50,50,0.5)'],
      duration: 2000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });

    animate('.warning', {
      opacity: [0.6, 1],
      duration: 1000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });
  }, []);

  return (
    <div className="h-screen flex relative bg-gray-900 text-red-400 font-mono antialiased">
      <Canvas 
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        camera={{ position: [0, 20, 20], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <BackgroundMesh />
        <DarkOverlay />
      </Canvas>
      <CRTNoise />
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 relative z-10">
        <div className="flex-1 relative">
          {/* This Scanlines is for the overlay effect on the main panel as in uistyle.html */}
          <Scanlines className="absolute inset-0 mix-blend-overlay border-2 border-red-600 glow pointer-events-none z-10" />
          <div className="relative h-full bg-gray-800/50 border-2 border-red-600 rounded-lg flex items-center justify-center glow scanlines">
            {/* Content from main panel of uistyle.html - R3F Canvas will be added here later */}
            <div className="absolute top-4 left-4 space-y-1 text-left text-xs" aria-live="polite">
              <div className="border-2 border-red-600 p-1 rounded scanlines">CPU Cores: 128</div>
              <div className="border-2 border-red-600 p-1 rounded scanlines">Bandwidth: 10Gbps</div>
              <div className="border-2 border-red-600 p-1 rounded scanlines">Energon: 75%</div>
            </div>
            <div className="relative w-full h-full">
              <Canvas 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                camera={{ position: [0, 15, 15], fov: 50 }}
              >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <TerrainMesh />
                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
            </div>
            <div className="absolute bottom-16 left-4 w-40 bg-gray-900 border-2 border-red-600 glow scanlines text-xs">
              <div className="bg-red-600 px-2 py-1 uppercase">Player Take</div>
              <div className="flex justify-between px-2 py-1 border-t border-red-600"><span>Host</span><span>2,550,000</span></div>
              <div className="flex justify-between px-2 py-1 border-t border-red-600"><span>Player 1</span><span>1,200,000</span></div>
              <div className="flex justify-between px-2 py-1 border-t border-red-600"><span>Player 2</span><span>900,000</span></div>
            </div>
            <div className="absolute bottom-4 right-4 border-2 border-red-600 px-4 py-1 uppercase text-xs text-center bg-red-600 text-gray-900 glow scanlines warning" role="alert">
              ⚠ Hard Mode Active ⚠
            </div>
            {/* <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}> */}
              {/* <Scene /> */}
            {/* </Canvas> */}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default App;
