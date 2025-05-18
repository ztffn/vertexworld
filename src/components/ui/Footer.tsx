import React from 'react';

export default function Footer() {
  return (
    <footer className="flex justify-between text-xs uppercase mt-4 text-red-400 font-mono">
      <div className="space-x-4"><span>Menu: Esc</span><span>Overlay: Tab</span><span>PX Zoom: Z/X</span></div>
      <div className="space-x-4"><span>Deploy: D</span><span>Build: B</span><span>Hack: H</span></div>
    </footer>
  );
} 