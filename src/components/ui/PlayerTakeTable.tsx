import React from 'react';

interface Player {
  name: string;
  value: number;
}

interface PlayerTakeTableProps {
  players: Player[];
  className?: string;
}

export default function PlayerTakeTable({ players, className = "" }: PlayerTakeTableProps) {
  return (
    <div className="relative">
      <div className="scanlines">
        <div className={`bg-[#181f2a] border-2 border-red-600 glow rounded text-xs ${className}`}>
          <div className="bg-red-600 text-[#181f2a] px-2 py-1 uppercase">Player Take</div>
          {players.map((player, index) => (
            <div key={player.name} className="flex justify-between px-2 py-1 border-t border-red-600">
              <span>{player.name}</span>
              <span>{player.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 