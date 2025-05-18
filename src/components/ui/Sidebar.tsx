import React, { useState, useEffect } from 'react';
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
    <aside className="w-1/4 border-2 border-red-600 p-4 space-y-4 bg-gray-900 text-red-400 font-mono">
      <ul role="tablist" className="flex w-full">
        {tabs.map(tab => (
          <li key={tab.id} className="w-1/2">
            <button
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`w-full px-4 py-2 text-sm uppercase glow scanlines ${activeTab === tab.id ? "tab-active" : "tab-inactive"} ${activeTab === 'intel' && tab.id === 'build' ? 'border-l-0' : ''} ${activeTab === 'build' && tab.id === 'intel' ? 'border-r-0' : ''} border-t border-b border-red-600 ${ (activeTab === tab.id) ? 'border-x-red-600' : (tab.id === 'intel' ? 'border-l-red-600' : 'border-r-red-600')}`}
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
      <div className="text-xs uppercase">Status: Online</div>
    </aside>
  );
} 