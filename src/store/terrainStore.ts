import { create } from 'zustand';

interface TerrainState {
  wireframeWidth: number;
  waterColor: string;
  heightScale: number;
  segments: number;
  size: number;
  setWireframeWidth: (width: number) => void;
  setWaterColor: (color: string) => void;
  setHeightScale: (scale: number) => void;
  setSegments: (segments: number) => void;
  setSize: (size: number) => void;
}

export const useTerrainStore = create<TerrainState>((set) => ({
  wireframeWidth: 4,
  waterColor: '#ffffff',
  heightScale: 60,
  segments: 64,
  size: 640,
  setWireframeWidth: (width) => set({ wireframeWidth: width }),
  setWaterColor: (color) => set({ waterColor: color }),
  setHeightScale: (scale) => set({ heightScale: scale }),
  setSegments: (segments) => set({ segments }),
  setSize: (size) => set({ size }),
})); 