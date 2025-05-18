import React, { useEffect, useRef } from 'react';

interface BuildButtonProps {
  label: string;
  queueCount?: number;
  progress?: number; // 0 to 1
  onClick?: () => void;
}

export default function BuildButton({ label, queueCount = 0, progress = 0, onClick }: BuildButtonProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      import('animejs').then((anime) => {
        // Support both ESM and CJS builds
        if ((anime as any).default) {
          (anime as any).default({
            targets: progressRef.current,
            width: `${Math.round(progress * 100)}%`,
            easing: 'linear',
            duration: 200,
          });
        } else {
          (anime as any)({
            targets: progressRef.current,
            width: `${Math.round(progress * 100)}%`,
            easing: 'linear',
            duration: 200,
          });
        }
      });
    }
  }, [progress]);

  return (
    <button
      className="relative w-full text-left px-3 py-2 text-sm uppercase border-2 border-red-600 hover:bg-red-600 hover:text-gray-900 transition glow scanlines flex items-center"
      onClick={onClick}
    >
      <span className="flex-1">{label}</span>
      {queueCount > 1 && (
        <span className="ml-2 bg-red-600 text-[#181f2a] text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
          +{queueCount - 1}
        </span>
      )}
      {/* Progress bar overlay */}
      <div className="absolute left-0 bottom-0 h-1 bg-red-600 opacity-70" ref={progressRef} style={{ width: `${Math.round(progress * 100)}%` }} />
    </button>
  );
} 