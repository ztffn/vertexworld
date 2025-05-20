import React from 'react';

interface WarningBannerProps {
  message: string;
  className?: string;
}

export default function WarningBanner({ message, className = "" }: WarningBannerProps) {
  return (
    <div className="relative">
      <div className="scanlines">
        <div className={`border-2 border-red-600 glow px-4 py-1 uppercase text-xs text-center bg-red-600 text-[#181f2a] rounded warning ${className}`}>
          ▲ {message} ▲
        </div>
      </div>
    </div>
  );
} 