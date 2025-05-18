import React, { useState } from 'react';
import CommandList from "./CommandList";
import Preview from "./Preview";
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

interface SidebarProps {
  // onCommand prop might be needed if App.tsx handles command logic globally
}

export default function Sidebar({}: SidebarProps) {
  const [activeTab, setActiveTab] = useState("intel");
  
  // Simplified command handling for now
  const handleCommandSelected = (commandName: string) => {
    console.log(`Sidebar: Command selected - ${commandName}, Active Tab: ${activeTab}`);
    // Here you would typically update Preview state, manage a build queue, etc.
    // For example, update Preview component through props or context
  };

  const currentCommands = activeTab === "intel" ? intelCommandsData : buildCommandsData;

  return (
    <div className="w-full h-full">
      <ul role="tablist" className="flex w-full bg-[#181f2a]">
        {tabs.map(tab => (
          <li key={tab.id} role="presentation" className="w-1/2">
            <button
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`w-full px-4 py-2 text-sm uppercase glow scanlines bg-[#181f2a] ${activeTab === tab.id ? "tab-active" : "tab-inactive"} ${tab.id === 'build' ? 'border-t border-r border-b border-red-600' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      <CommandList
        commands={currentCommands}
        onCommand={handleCommandSelected} 
      />
      <Preview /> 
      <div className="text-xs uppercase bg-[#181f2a] px-2 py-1 mt-4">Status: Online</div>
    </div>
  );
} 