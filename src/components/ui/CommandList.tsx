import React, { useRef } from 'react';
import { animate } from 'animejs';

interface Command {
  name: string;
  sub: string[];
}

interface CommandListProps {
  commands: Command[];
  onCommand: (commandName: string) => void;
}

const icons: { [key: string]: string } = {
  'Weapons': '🔫', 'Pistol': '🔫', 'Rifle': '🗡️', 'Grenade': '💣',
  'EMP': '⚡', 'Hack Drone': '🤖', 'Armor': '🛡️', 'Shield': '🛡️',
  'Approach Vehicles 0/5': '🚗', 'Data Center': '🏭', 'Small DC': '🏭', 'Large DC': '🏭', 'Firewall Node': '🔒'
};

export default function CommandList({ commands, onCommand }: CommandListProps) {
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
      {commands.map((item, index) => (
        <li key={index} className="relative">
          <button 
            className="w-full text-left px-3 py-2 text-sm uppercase border-2 border-red-600 hover:bg-red-600 hover:text-gray-900 transition glow scanlines"
            onClick={(e) => {
              const nextElement = e.currentTarget.nextElementSibling as HTMLUListElement | null;
              if (item.sub && item.sub.length) {
                toggleDropdown(nextElement);
              } else {
                onCommand(item.name);
              }
            }}
          >
            {icons[item.name] || '❓'} {item.name}
          </button>
          {item.sub && item.sub.length > 0 && (
            <ul className="dropdown-content bg-gray-800 mt-1 overflow-hidden" style={{ height: '0px' }}>
              {item.sub.map(subItem => (
                <li key={subItem}>
                  <button 
                    className="w-full text-left px-4 py-1 text-xs uppercase border-l-2 border-red-600 hover:bg-red-600 hover:text-gray-900 transition glow scanlines build-sub"
                    onClick={() => onCommand(subItem)}
                  >
                    {icons[subItem] || '❓'} {subItem}
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