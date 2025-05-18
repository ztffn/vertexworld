import React, { useState, useEffect } from 'react';

interface PreviewProps {
  // Props for currently selected command, queue status etc. can be added here
  // For now, it will replicate the static parts from uistyle.html
}

const icons: { [key: string]: string } = {
  'Weapons': '🔫', 'Pistol': '🔫', 'Rifle': '🗡️', 'Grenade': '💣',
  'EMP': '⚡', 'Hack Drone': '🤖', 'Armor': '🛡️', 'Shield': '🛡️',
  'Approach Vehicles 0/5': '🚗', 'Data Center': '🏭', 'Small DC': '🏭', 'Large DC': '🏭', 'Firewall Node': '🔒'
  // Add more icons as needed
};

export default function Preview({}: PreviewProps) {
  // State for preview content and queue would go here
  const [previewCmd, setPreviewCmd] = useState<string | null>('Select a command');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildQueueCount, setBuildQueueCount] = useState(0);

  // This is a placeholder for actual logic that would update the preview
  // For example, from props or a global state

  return (
    <div id="preview" className="border-2 border-red-600 h-32 scanlines overflow-hidden flex items-center justify-center glow relative">
      <div id="preview-content" className="flex flex-col items-center text-xs uppercase text-center">
        {previewCmd && (
          <>
            <div className="text-3xl">{icons[previewCmd] || (previewCmd !== 'Select a command' ? '❓' : '')}</div>
            <span>{previewCmd}</span>
          </>
        )}
        {isBuilding && (
          <div className="mt-2 w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      {buildQueueCount > 0 && (
        <div id="queue-indicator" className="absolute top-1 right-1 bg-red-600 text-gray-900 text-[10px] px-1 rounded animate-pulse">
          +{buildQueueCount}
        </div>
      )}
    </div>
  );
} 