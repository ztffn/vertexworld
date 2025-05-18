# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Water Shader Debugging Guide - vertexworld

## Current Status

The water shader in vertexworld has the following status:

- ✅ Controls are now working correctly
- ✅ Water level adjusts correctly
- ✅ Foam color updates from the terrainStore
- ✅ Secondary foam parameters are working
- ✅ Terrain wireframe displays properly with clean lines
- ✅ Shader now properly outlines the entire terrain intersection

## Debug Keyboard Controls

We've added several keyboard controls to help debug and customize the visualization:

- Press `d` to toggle debug mode in the water shader (shows depth texture directly)
- Press `t` to toggle visualization of the depth texture
- Press `b` to toggle a debug box that should intersect with the water
- Press `w` to toggle wireframe diagonals on/off

## Root Cause Analysis

The issues we fixed were:

1. **Depth Buffer Capture Issue**
   - Fixed by ensuring the water is hidden during depth capture
   - Used the same overrideMaterial approach as in test.html

2. **Scene Management**
   - Improved render order to ensure proper layering
   - Added polygon offset to prevent z-fighting

3. **Shader Uniform Synchronization**
   - Locked camera properties to stable values
   - Set exact texture parameters to match test.html

## Implementation Changes

The key improvements include:

1. **Material Handling Improvement**
   - Now using same wireframe approach as test.html
   - Fixed polygon offset for clean wireframe rendering

2. **Debug Visualization**
   - Added ability to visualize the depth texture
   - Added toggles for different visualization modes

3. **Terrain Mesh Refinement**
   - Added option to toggle wireframe diagonals
   - Fixed wireframe rendering issues

4. **Improved Scene Management**
   - Set proper render order for objects
   - Added proper reference handling for Three.js objects

## Next Steps

Some possible enhancements for the future:

1. **Performance Optimization**
   - Reduce render resolution for mobile devices
   - Add level-of-detail for terrain mesh

2. **Extend Functionality**
   - Add more water shader effects like caustics
   - Support for dynamic terrain editing

3. **UI Improvements**
   - Add onscreen controls for mobile users
   - Create a help screen with keyboard controls

This document will be updated as we make further improvements to the water shader implementation.
