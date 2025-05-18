import React from 'react';

export default function Footer() {
  return (
    <footer className="flex justify-between text-xs uppercase mt-4 text-red-400 font-mono">
      <div className="space-x-4">
        <span className="bg-[#181f2a] px-2 py-1 rounded">Menu: Esc</span>
        <span className="bg-[#181f2a] px-2 py-1 rounded">Overlay: Tab</span>
        <span className="bg-[#181f2a] px-2 py-1 rounded">PX Zoom: Z/X</span>
      </div>
      <div className="space-x-4">
        <span className="bg-[#181f2a] px-2 py-1 rounded">Deploy: D</span>
        <span className="bg-[#181f2a] px-2 py-1 rounded">Build: B</span>
        <span className="bg-[#181f2a] px-2 py-1 rounded">Hack: H</span>
      </div>
    </footer>
  );
} 