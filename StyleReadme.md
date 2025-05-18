# UI Style Implementation Plan

## Overview
This document outlines the plan to implement the retro-style UI from `uistyle.html` as the main UI and stylesheet for the application.

## Components to Implement

### 1. Base Styles
- [ ] Create `src/styles/base.css` with:
  - Root variables for colors and effects
  - CRT noise effect
  - Scanlines effect
  - Glow effects
  - Base typography styles

### 2. UI Components
- [ ] Create `src/components/ui/` directory with:
  - [ ] `Tab.tsx` - Tab component with active/inactive states
  - [ ] `CommandList.tsx` - Command list with dropdown functionality
  - [ ] `Preview.tsx` - Preview panel with queue indicator
  - [ ] `StatusBar.tsx` - Status indicators
  - [ ] `MainPanel.tsx` - Main content area with grid
  - [ ] `Footer.tsx` - Keyboard shortcuts and controls

### 3. Layout Structure
- [ ] Implement main layout in `App.tsx`:
  - Sidebar with tabs and command list
  - Main content area
  - Status indicators
  - Footer with controls

### 4. Animations
- [ ] Set up animation system:
  - [ ] Install and configure `animejs`
  - [ ] Create animation hooks for:
    - Tab transitions
    - Command list dropdowns
    - Preview panel updates
    - Status indicators

### 5. Theme Configuration
- [ ] Create `src/styles/theme.ts` with:
  - Color palette
  - Typography settings
  - Spacing and layout constants
  - Animation timings

## Implementation Steps

1. **Setup Base Styles**
   ```css
   :root {
     --noise-opacity: 0.02;
     --glow-color: rgba(255,50,50,0.3);
     --border-color: #DC2626;
     --text-color: #F87171;
     --bg-color: #111827;
   }
   ```

2. **Create Component Structure**
   ```tsx
   // Example Tab component
   interface TabProps {
     active: boolean;
     label: string;
     onClick: () => void;
   }
   ```

3. **Implement Layout**
   ```tsx
   // Main layout structure
   <div className="h-screen flex relative">
     <aside className="w-1/4">
       <TabList />
       <CommandList />
       <Preview />
     </aside>
     <main className="flex-1">
       <MainPanel />
       <Footer />
     </main>
   </div>
   ```

4. **Add Effects**
   - CRT noise overlay
   - Scanlines
   - Glow effects
   - Hover states

## Dependencies to Install
- animejs
- @types/animejs
- tailwindcss
- postcss
- autoprefixer

## CSS Classes to Implement

### Base Effects
```css
.glow { box-shadow: 0 0 2px var(--glow-color); }
.scanlines::before { /* scanline effect */ }
.crt-noise { /* noise effect */ }
```

### Component Classes
```css
.tab-active { /* active tab styles */ }
.tab-inactive { /* inactive tab styles */ }
.dropdown-content { /* dropdown styles */ }
```

## Animation Configuration
```typescript
const animations = {
  glow: {
    boxShadow: ['0 0 2px rgba(255,50,50,0.3)', '0 0 6px rgba(255,50,50,0.5)'],
    duration: 2000,
    easing: 'easeInOutSine',
    direction: 'alternate',
    loop: true
  }
}
```

## Anime.js React Integration

### Setup
1. Install dependencies:
```bash
npm i animejs
```

### Import Usage
When using Anime.js with Vite, use the following import pattern:
```tsx
// Correct import
import anime from 'animejs';

// Avoid using these patterns as they may cause issues:
// ❌ import { animate } from 'animejs'
// ❌ import anime from 'animejs/lib/anime.esm.js'
// ❌ import anime from 'animejs/lib/anime.es.js'
```

### Usage with React
Anime.js can be integrated with React using `useEffect` and `createScope`. Here's how to implement it:

```tsx
import { animate, createScope, createSpring, createDraggable } from 'animejs';
import { useEffect, useRef, useState } from 'react';

function Component() {
  const root = useRef(null);
  const scope = useRef(null);
  const [state, setState] = useState(0);

  useEffect(() => {
    // Create animation scope
    scope.current = createScope({ root }).add(self => {
      // All anime.js instances here are scoped to <div ref={root}>
      
      // Example animation
      animate('.element', {
        scale: [
          { to: 1.25, ease: 'inOut(3)', duration: 200 },
          { to: 1, ease: createSpring({ stiffness: 300 }) }
        ],
        loop: true,
        loopDelay: 250,
      });

      // Register methods for external use
      self.add('customAnimation', (value) => {
        animate('.element', {
          rotate: value * 360,
          ease: 'out(4)',
          duration: 1500,
        });
      });
    });

    // Cleanup on unmount
    return () => scope.current.revert();
  }, []);

  const handleAction = () => {
    setState(prev => {
      const newState = prev + 1;
      scope.current.methods.customAnimation(newState);
      return newState;
    });
  };

  return (
    <div ref={root}>
      <div className="element">Animated Content</div>
      <button onClick={handleAction}>Trigger Animation</button>
    </div>
  );
}
```

### Key Features
- Scoped animations using `createScope`
- Spring animations with `createSpring`
- Draggable elements with `createDraggable`
- Method registration for external control
- Proper cleanup on component unmount

### Best Practices
1. Always use `useRef` for DOM references
2. Clean up animations in `useEffect` return
3. Scope animations to specific elements
4. Use spring animations for natural movement
5. Register reusable animation methods

## Testing Plan
1. Test each component in isolation
2. Verify animations and transitions
3. Check responsive behavior
4. Validate accessibility
5. Performance testing

## Next Steps
1. Set up base styles and theme
2. Create component structure
3. Implement layout
4. Add animations
5. Test and refine 