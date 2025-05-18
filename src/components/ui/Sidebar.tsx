import React, { useState, useRef, useEffect } from 'react';
import CommandList from "./CommandList";
import Preview from "./Preview";
import AssetPreview3D from './AssetPreview3D';
// animejs import and usage will be deferred due to import issues

const tabs = [
  { id: "intel", label: "Intel" },
  { id: "build", label: "Build" }
];

// As per uistyle.html and guide
const intelCommandsData = [
  { name: 'Approach Vehicles 0/5', sub: [] },
  { name: 'Weapons', sub: ['Pistol', 'Rifle', 'Grenade'] },
  { name: 'Disruption', sub: ['EMP', 'Hack Drone'] },
  { name: 'Equipment', sub: ['Armor', 'Shield'] }
];
const buildCommandsData = [
  { name: 'Data Center', sub: ['Small DC', 'Large DC'] },
  { name: 'Firewall Node', sub: [] }
];

// Plan for future: this state will be managed by game logic and/or backend
interface BuildQueueItem {
  name: string;
  queueCount: number;
  progress: number; // 0-1
}

type BuildQueueState = Record<string, BuildQueueItem>;

interface SidebarProps {
  // onCommand prop might be needed if App.tsx handles command logic globally
}

export default function Sidebar({}: SidebarProps) {
  const [activeTab, setActiveTab] = useState("intel");
  const [buildQueue, setBuildQueue] = useState<BuildQueueState>({});
  const buildQueueRef = useRef(buildQueue);

  // Keep a ref in sync with state for interval callback
  useEffect(() => {
    buildQueueRef.current = buildQueue;
  }, [buildQueue]);

  // Dummy build progress simulation: interval always runs
  useEffect(() => {
    const interval = setInterval(() => {
      setBuildQueue((prev) => {
        const next = { ...prev };
        const active = Object.values(next).find(item => item.queueCount > 0);
        if (active) {
          active.progress += 0.02;
          if (active.progress >= 1) {
            active.progress = 0;
            active.queueCount -= 1;
          }
        }
        // Remove items with queueCount <= 0
        Object.keys(next).forEach(key => {
          if (next[key].queueCount <= 0) delete next[key];
        });
        return { ...next };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Handle build command click
  const handleCommandSelected = (commandName: string) => {
    if (activeTab === "build") {
      setBuildQueue((prev) => {
        const item = prev[commandName] || { name: commandName, queueCount: 0, progress: 0 };
        return {
          ...prev,
          [commandName]: {
            ...item,
            queueCount: item.queueCount + 1,
          },
        };
      });
    } else {
      // For non-build commands, just log for now
      console.log(`Sidebar: Command selected - ${commandName}, Active Tab: ${activeTab}`);
    }
  };

  const currentCommands = activeTab === "intel" ? intelCommandsData : buildCommandsData;

  // Map buildQueue to CommandList format
  const buildQueueForList = buildCommandsData.reduce((acc, cmd) => {
    acc[cmd.name] = buildQueue[cmd.name] || { queueCount: 0, progress: 0 };
    return acc;
  }, {} as Record<string, { queueCount: number; progress: number }>);

  return (
    <div className="flex flex-col gap-4 h-full">
      <ul role="tablist" className="flex w-full bg-[#181f2a]">
        <li role="presentation" className="w-1/2">
          <div className="scanlines">
            <button
              id="tab-intel"
              role="tab"
              aria-selected={activeTab === "intel"}
              className={`w-full px-4 py-2 text-sm uppercase glow border-t border-r border-b border-red-600 ${
                activeTab === "intel" ? "tab-active" : "tab-inactive"
              }`}
              onClick={() => setActiveTab("intel")}
            >
              Intel
            </button>
          </div>
        </li>
        <li role="presentation" className="w-1/2">
          <div className="scanlines">
            <button
              id="tab-build"
              role="tab"
              aria-selected={activeTab === "build"}
              className={`w-full px-4 py-2 text-sm uppercase glow border-t border-r border-b border-red-600 ${
                activeTab === "build" ? "tab-active" : "tab-inactive"
              }`}
              onClick={() => setActiveTab("build")}
            >
              Build
            </button>
          </div>
        </li>
      </ul>
      <CommandList
        commands={currentCommands}
        onCommand={handleCommandSelected}
        isBuildTab={activeTab === "build"}
        buildQueue={activeTab === "build" ? buildQueueForList : {}}
      />
      <div className="border-2 border-red-600 h-32 scanlines overflow-hidden flex items-center justify-center glow relative">
        <AssetPreview3D />
      </div>
      <div className="text-xs uppercase bg-[#181f2a] px-2 py-1 mt-4">Status: Online</div>
    </div>
  );
} 