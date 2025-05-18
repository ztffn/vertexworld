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
- ❌ Issue: Only a single line appears down the center instead of outlining the entire terrain intersection

## Debug Keyboard Controls

We've added several keyboard controls to help debug the water shader:

- Press `d` to toggle debug mode in the water shader (shows depth texture directly)
- Press `t` to toggle visualization of the depth texture
- Press `b` to toggle a debug box that should intersect with the water

## Root Cause Analysis

After comparing our implementation with test.html, I've identified these likely causes:

1. **Depth Buffer Capture Issue**
   - The depth buffer might not be capturing the entire terrain mesh correctly
   - React Three Fiber's render loop differs from the manual approach in test.html

2. **Scene Management**
   - The way we're handling scene.overrideMaterial might be different than test.html
   - Object visibility might not be properly toggled between render passes

3. **Shader Uniform Synchronization**
   - Camera properties and shader uniforms need to be perfectly synchronized

## Implementation Changes

To address these issues, we've made the following changes:

1. **Material Handling Improvement**
   - Now directly setting material on meshes instead of using scene.overrideMaterial
   - Added explicit tracking of terrain meshes in the scene

2. **Debug Visualization**
   - Added ability to visualize the depth texture directly in the shader
   - Added a debug box to test water intersections

3. **Terrain Mesh Refinement**
   - Made terrain mesh fully opaque for better visibility
   - Made terrain mesh explicitly cast/receive shadows

4. **Improved Scene Management**
   - Added proper tracking of scene objects
   - Applied depth material directly to terrain meshes

## Next Steps

If the water shader is still not working correctly, try:

1. **Check Console Output**
   - Look for logs about terrain meshes found (should be > 0)
   - Verify texture loading is complete

2. **Check Depth Buffer**
   - Press `t` to visualize the depth buffer
   - Press `d` to see raw depth values in shader
   - Press `b` to add a test box that should definitely intersect with water

3. **Compare with test.html**
   - Compare the real-time behavior with test.html
   - Review texture parameters and shader uniforms

4. **Alternative Approaches**
   - If material approach fails, try using custom render passes 
   - Consider simplifying the shader for testing

This document will be updated as we make progress on the water shader implementation.
