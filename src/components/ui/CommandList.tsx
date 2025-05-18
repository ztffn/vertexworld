import React, { useRef } from 'react';
import { animate } from 'animejs';
import BuildButton from './BuildButton';

interface Command {
  name: string;
  sub: string[];
}

interface CommandListProps {
  commands: Command[];
  onCommand: (commandName: string) => void;
  isBuildTab?: boolean;
  buildQueue?: Record<string, { queueCount: number; progress: number }>;
}

const icons: { [key: string]: string } = {
  'Weapons': '🔫', 'Pistol': '🔫', 'Rifle': '🗡️', 'Grenade': '💣',
  'EMP': '⚡', 'Hack Drone': '🤖', 'Armor': '🛡️', 'Shield': '🛡️',
  'Approach Vehicles 0/5': '🚗', 'Data Center': '🏭', 'Small DC': '🏭', 'Large DC': '🏭', 'Firewall Node': '🔒'
};

export default function CommandList({ commands, onCommand, isBuildTab = false, buildQueue = {} }: CommandListProps) {
  const activeDropdownRef = useRef<HTMLUListElement | null>(null);

  const toggleDropdown = (dropdownElement: HTMLUListElement | null) => {
    if (!dropdownElement) return;

    const isOpen = dropdownElement.style.height && dropdownElement.style.height !== '0px';

    if (activeDropdownRef.current && activeDropdownRef.current !== dropdownElement && activeDropdownRef.current.style.height !== '0px') {
      animate(activeDropdownRef.current, {
        height: [activeDropdownRef.current.scrollHeight + 'px', '0px'],
        easing: 'easeOutQuad',
        duration: 300
      });
    }

    animate(dropdownElement, {
      height: isOpen ? [dropdownElement.scrollHeight + 'px', '0px'] : ['0px', dropdownElement.scrollHeight + 'px'],
      easing: 'easeOutQuad',
      duration: 300,
      begin: () => {
        if (!isOpen) {
          dropdownElement.style.display = 'block';
        }
      },
      complete: () => {
        if (isOpen) {
          dropdownElement.style.height = '0px';
        } else {
          dropdownElement.style.height = 'auto';
        }
      }
    });
    activeDropdownRef.current = isOpen ? null : dropdownElement;
  };

  return (
    <ul id="command-list" className="space-y-2" aria-live="polite">
      {commands.map((cmd) => (
        <li key={cmd.name} className="relative">
          {isBuildTab ? (
            <BuildButton
              label={cmd.name}
              queueCount={buildQueue[cmd.name]?.queueCount || 1}
              progress={buildQueue[cmd.name]?.progress || 0}
              onClick={() => onCommand(cmd.name)}
            />
          ) : (
            <button
              className="w-full text-left px-3 py-2 text-sm uppercase border-2 border-red-600 bg-[#181f2a] bg-opacity-100 hover:bg-red-600 hover:text-gray-900 transition glow scanlines"
              onClick={(e) => {
                const nextElement = e.currentTarget.nextElementSibling as HTMLUListElement | null;
                if (cmd.sub && cmd.sub.length) {
                  toggleDropdown(nextElement);
                } else {
                  onCommand(cmd.name);
                }
              }}
            >
              {icons[cmd.name] || '❓'} {cmd.name}
            </button>
          )}
          {cmd.sub && cmd.sub.length > 0 && (
            <ul className="dropdown-content scanlines bg-[#181f2a] mt-1 overflow-hidden" style={{ height: '0px' }}>
              {cmd.sub.map((sub) => (
                <li key={sub}>
                  <button
                    className="w-full text-left px-4 py-1 text-xs uppercase border-l-2 border-red-600 bg-[#181f2a] hover:bg-red-600 hover:text-gray-900 transition glow scanlines build-sub"
                    onClick={() => onCommand(sub)}
                  >
                    {icons[sub] || '❓'} {sub}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
} 