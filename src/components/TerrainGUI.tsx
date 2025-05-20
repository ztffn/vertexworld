import React, { useEffect, useRef } from 'react';
import GUI from 'lil-gui';
import { useTerrainStore } from '../store/terrainStore';
import { useWaterStore } from '../store/waterStore';

const TerrainGUI: React.FC = () => {
  const guiRef = useRef<GUI | null>(null);
  const {
    wireframeWidth,
    waterColor,
    heightScale,
    segments,
    size,
    showDiagonals,
    setWireframeWidth,
    setWaterColor,
    setHeightScale,
    setSegments,
    setSize,
    setShowDiagonals
  } = useTerrainStore();

  const {
    threshold,
    waterLevel,
    secondaryFoamScale,
    secondaryFoamWidth,
    setThreshold,
    setWaterLevel,
    setSecondaryFoamScale,
    setSecondaryFoamWidth
  } = useWaterStore();

  useEffect(() => {
    console.log('TerrainGUI mounting...');
    
    // Clean up any existing GUI
    if (guiRef.current) {
      guiRef.current.destroy();
      guiRef.current = null;
    }

    // Create new GUI
    const gui = new GUI({ title: 'Terrain Controls' });
    guiRef.current = gui;
    console.log('GUI created:', gui);

    try {
      // Terrain folder
      const terrainFolder = gui.addFolder('Terrain');
      terrainFolder.add({ heightScale }, 'heightScale', 1, 200)
        .name('Height Scale')
        .onChange(setHeightScale);
      terrainFolder.add({ segments }, 'segments', 8, 128)
        .name('Segments')
        .step(8)
        .onChange(setSegments);
      terrainFolder.add({ size }, 'size', 100, 1000)
        .name('Size')
        .step(100)
        .onChange(setSize);

      // Wireframe folder
      const wireframeFolder = gui.addFolder('Wireframe');
      wireframeFolder.add({ wireframeWidth }, 'wireframeWidth', 1, 10)
        .name('Line Width')
        .onChange(setWireframeWidth);
      wireframeFolder.addColor({ waterColor }, 'waterColor')
        .name('Color')
        .onChange(setWaterColor);
      wireframeFolder.add({ showDiagonals }, 'showDiagonals')
        .name('Show Diagonals')
        .onChange(setShowDiagonals);

      // Water folder
      const waterFolder = gui.addFolder('Water');
      waterFolder.add({ threshold }, 'threshold', 0.1, 1)
        .name('Foam Thickness')
        .onChange(setThreshold);
      waterFolder.add({ waterLevel }, 'waterLevel', 0, 100)
        .name('Water Level')
        .onChange(setWaterLevel);
      waterFolder.add({ secondaryFoamScale }, 'secondaryFoamScale', 0.1, 50.0)
        .name('Foam Scale')
        .onChange(setSecondaryFoamScale);
      waterFolder.add({ secondaryFoamWidth }, 'secondaryFoamWidth', 0.1, 8.0)
        .name('Foam Width')
        .onChange(setSecondaryFoamWidth);

      // Export button
      gui.add({
        exportSettings: () => {
          // Get current values directly from the store
          const terrainSettings = useTerrainStore.getState();
          const waterSettings = useWaterStore.getState();
          console.log('Current Settings:', {
            heightScale: terrainSettings.heightScale,
            segments: terrainSettings.segments,
            size: terrainSettings.size,
            wireframeWidth: terrainSettings.wireframeWidth,
            waterColor: terrainSettings.waterColor,
            showDiagonals: terrainSettings.showDiagonals,
            threshold: waterSettings.threshold,
            waterLevel: waterSettings.waterLevel,
            secondaryFoamScale: waterSettings.secondaryFoamScale,
            secondaryFoamWidth: waterSettings.secondaryFoamWidth
          });
        }
      }, 'exportSettings').name('Export Settings');

      // Open terrain and wireframe folders by default
      terrainFolder.open();
      wireframeFolder.open();
      waterFolder.open();

      console.log('GUI setup complete');
      
      // Add clipboard permissions to any iframes
      document.querySelectorAll('iframe').forEach(iframe => {
        const currentAllow = iframe.getAttribute('allow') || '';
        if (!currentAllow.includes('clipboard-read') || !currentAllow.includes('clipboard-write')) {
          iframe.setAttribute('allow', `${currentAllow}${currentAllow ? '; ' : ''}clipboard-read; clipboard-write`);
        }
      });
    } catch (error) {
      console.error('Error setting up GUI:', error);
    }

    return () => {
      console.log('TerrainGUI unmounting...');
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
    };
  }, []);

  return null;
};

export default TerrainGUI; 