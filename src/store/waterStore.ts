import { create } from 'zustand';

interface WaterStore {
  threshold: number;
  waterLevel: number;
  secondaryFoamScale: number;
  secondaryFoamWidth: number;
  setThreshold: (value: number) => void;
  setWaterLevel: (value: number) => void;
  setSecondaryFoamScale: (value: number) => void;
  setSecondaryFoamWidth: (value: number) => void;
}

export const useWaterStore = create<WaterStore>((set) => ({
  // Initial values from test.html
  threshold: 0.75,
  waterLevel: 20,
  secondaryFoamScale: 31.437,
  secondaryFoamWidth: 4.3134,
  
  setThreshold: (value) => set({ threshold: value }),
  setWaterLevel: (value) => set({ waterLevel: value }),
  setSecondaryFoamScale: (value) => set({ secondaryFoamScale: value }),
  setSecondaryFoamWidth: (value) => set({ secondaryFoamWidth: value }),
})); 