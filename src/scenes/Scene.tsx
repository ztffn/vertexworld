import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import StatBox from '../components/ui/StatBox';
import PlayerTakeTable from '../components/ui/PlayerTakeTable';
import WarningBanner from '../components/ui/WarningBanner';
import { glowAnimation, warningAnimation } from '../utils/animations';
import type { HeightmapTile } from '../utils/heightmapProvider';
import TerrainDebugMap from '../components/TerrainDebugMap';

interface SceneProps {
  onDebugData?: (data: {
    heightData: HeightmapTile | null;
    center: { x: number; y: number } | null;
    zoom: number;
  }) => void;
}

const Scene: React.FC<SceneProps> = ({ onDebugData }) => {
  // Debug overlay state - set to true by default to always show
  const [showDebugHeightmap, setShowDebugHeightmap] = useState(true);
  // const [heightData, setHeightData] = useState<HeightmapTile | null>(null); // Removed: Managed by TerrainDebugMap
  // const debugCanvasRef = useRef<HTMLCanvasElement>(null); // Removed: Managed by TerrainDebugMap

  // State for data from Terrain component to pass to TerrainDebugMap
  const [terrainDebugData, setTerrainDebugData] = useState<{
    heightData: HeightmapTile | null;
    center: { x: number; y: number } | null;
    zoom: number;
  }>({ heightData: null, center: null, zoom: 256 });

  // Track clicked position for updating Terrain
  const [clickedCenter, setClickedCenter] = useState<{ x: number; y: number } | null>(null);

  // Add a reference to the OrbitControls
  const orbitControlsRef = useRef(null);

  // Listen for 'h' key globally to toggle debug map visibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h') setShowDebugHeightmap(v => !v);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Forward terrain debug data to parent component if needed
  useEffect(() => {
    if (onDebugData && terrainDebugData.heightData) {
      onDebugData(terrainDebugData);
    }
  }, [terrainDebugData, onDebugData]);

  // Removed: Old useEffect for drawing heightmap to canvas. This is now handled by TerrainDebugMap.

  // Effect for animations
  useEffect(() => {
    // Import anime.js dynamically
    import('animejs').then(({ animate }) => {
      // Animate glowing elements
      animate('.glow', glowAnimation);

      // Animate warning element
      animate('.warning', warningAnimation);
    });
  }, []);

  const stats = [
    { label: 'CPU Cores', value: '128' },
    { label: 'Bandwidth', value: '10Gbps' },
    { label: 'Energon', value: '75%' }
  ];

  const players = [
    { name: 'Host', value: 2550000 },
    { name: 'Player 1', value: 1200000 },
    { name: 'Player 2', value: 900000 }
  ];

  // Handler for when user clicks on the map in TerrainDebugMap
  const handleMapClick = useCallback((x: number, y: number) => {
    console.log(`[Scene] Map clicked at x=${x}, y=${y}`);
    // Store the clicked position
    setClickedCenter({ x, y });
    // Also update terrainDebugData to keep sidebar in sync
    setTerrainDebugData(prev => ({
      ...prev,
      center: { x, y },
    }));
  }, []);

  return (
    <div className="relative w-full h-full">
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
        <Terrain 
          onDebugData={setTerrainDebugData} 
          orbitControlsRef={orbitControlsRef} 
          externalCenter={clickedCenter}
        />
        
        {/* Water */}
        <Water />
        
        {/* Controls - completely disable default mouse behaviors */}
        <OrbitControls 
          ref={orbitControlsRef}
          makeDefault
          enableDamping 
          dampingFactor={0.05}
          minDistance={50}
          maxDistance={1000}
          maxPolarAngle={Math.PI / 2}
          enableRotate={false}  // Disable default rotation
          enablePan={false}     // Disable default panning
          enableZoom={true}     // Keep zoom enabled
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,  // Regular click always rotates
            MIDDLE: THREE.MOUSE.DOLLY, // Middle button zooms
            RIGHT: THREE.MOUSE.ROTATE  // Right click also rotates (effectively disabled)
          }}
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
          {/* Sidebar - with 0.4 opacity background - Pass terrain debug data */}
          <Scanlines className="w-[340px] min-w-[340px] max-w-[340px] bg-[#181f2a] bg-opacity-90 border-r-2 border-red-600 glow flex flex-col p-4 gap-4 pointer-events-auto">
            <Sidebar 
              terrainDebugData={terrainDebugData}
              showTerrainDebug={showDebugHeightmap}
              onMapClick={handleMapClick}
            />
          </Scanlines>
          
          {/* Main window area */}
          <main className="flex-1 flex flex-col min-h-0 pointer-events-none">
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <Scanlines className="relative flex-1 border-2 border-red-600 glow rounded-lg flex flex-col overflow-hidden">
                {/* System stats */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-auto">
                  {stats.map(stat => (
                    <StatBox key={stat.label} label={stat.label} value={stat.value} />
                  ))}
                </div>
                
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="uppercase text-xs text-red-400 opacity-75">3D Wireframe Grid</span>
                </div>
                
                {/* Player stats */}
                <div className="absolute bottom-20 left-4 z-10 pointer-events-auto">
                  <PlayerTakeTable players={players} />
                </div>
                
                {/* Warning */}
                <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
                  <WarningBanner message="Hard Mode Active" />
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