import React from 'react';

interface StatBoxProps {
  label: string;
  value: string | number;
  className?: string;
}

export default function StatBox({ label, value, className = "" }: StatBoxProps) {
  return (
    <div className="relative">
      <div className="scanlines">
        <div className={`border-2 border-red-600 glow rounded px-2 py-1 text-xs bg-[#181f2a] ${className}`}>
          {label}: {value}
        </div>
      </div>
    </div>
  );
} 