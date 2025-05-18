# UI Implementation Guide

## Scanlines Pattern

The scanlines effect is implemented using a specific pattern to maintain positioning while applying the effect:

```tsx
<div className="relative">
  <div className="scanlines">
    <div className="your-content-styling">
      Content here
    </div>
  </div>
</div>
```

Key points:
- Outer div with `relative` positioning to maintain layout
- Middle div with `scanlines` class that applies the effect
- Inner div with actual content and styling

## CSS Implementation

The scanlines effect is defined in `src/index.css`:

```css
.scanlines::before {
  content: '';
  position: absolute; 
  inset: 0;
  background-image: repeating-linear-gradient(
    rgba(0,0,0,0.1) 0px,
    rgba(0,0,0,0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 2;
}
.scanlines { 
  position: relative; 
  overflow: hidden; 
}
```

## Common UI Elements

### Tabs
```tsx
<div className="scanlines">
  <button className="w-full px-4 py-2 text-sm uppercase glow border-t border-r border-b border-red-600 tab-active">
    Tab Label
  </button>
</div>
```

### Stats Boxes
```tsx
<div className="relative">
  <div className="scanlines">
    <div className="border-2 border-red-600 glow rounded px-2 py-1 text-xs bg-[#181f2a]">
      Stat Label: Value
    </div>
  </div>
</div>
```

### Tables
```tsx
<div className="relative">
  <div className="scanlines">
    <div className="bg-[#181f2a] border-2 border-red-600 glow rounded text-xs">
      <div className="bg-red-600 text-[#181f2a] px-2 py-1 uppercase">Header</div>
      <div className="flex justify-between px-2 py-1 border-t border-red-600">
        <span>Label</span>
        <span>Value</span>
      </div>
    </div>
  </div>
</div>
```

## Colors

- Background: `#181f2a`
- Accent: `#DC2626` (red-600)
- Text: `#F87171` (red-400)
- Active Text: `#1F2937` (gray-900)

## Common Classes

- `glow`: Adds red glow effect
- `scanlines`: Adds scanlines effect
- `tab-active`: Active tab styling
- `tab-inactive`: Inactive tab styling
- `warning`: Warning element styling with animation 