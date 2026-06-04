'use client';

import { useState } from 'react';
import { Player } from '@/lib/types';
import PlayerCard from '@/components/PlayerCard';

const POSITION_GROUPS: Record<string, string[]> = {
  'Attacker':   ['forward', 'striker', 'winger', 'attacker'],
  'Midfielder': ['midfielder'],
  'Defender':   ['defender'],
  'Goalkeeper': ['goalkeeper', 'keeper'],
};

const FILTERS = ['All', 'Attacker', 'Midfielder', 'Defender', 'Goalkeeper'];

export default function PlayersFilter({ players }: { players: Player[] }) {
  const [active, setActive] = useState('All');

  const filtered = active === 'All'
    ? players
    : players.filter((p) => {
        const pos = p.position?.toLowerCase() ?? '';
        return POSITION_GROUPS[active]?.some((g) => pos.includes(g));
      });

  const available = FILTERS.filter(
    (f) => f === 'All' || players.some((p) => {
      const pos = p.position?.toLowerCase() ?? '';
      return POSITION_GROUPS[f]?.some((g) => pos.includes(g));
    })
  );

  return (
    <>
      {/* Filter pills */}
      <div className="flex gap-2 px-[18px] py-3 overflow-x-auto border-b border-pitch-rule">
        {available.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`font-sans text-[11px] font-medium px-3 py-1.5 rounded-full border whitespace-nowrap flex-shrink-0 transition-colors ${
              active === f
                ? 'bg-pitch-green border-pitch-green text-white'
                : 'border-pitch-rule text-pitch-ink-light hover:border-pitch-green hover:text-pitch-green'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Player list */}
      {filtered.length > 0 ? (
        filtered.map((p) => <PlayerCard key={p.id} player={p} showTeam />)
      ) : (
        <p className="px-[18px] py-4 font-sans text-[13px] text-pitch-ink-light">
          No players found.
        </p>
      )}
    </>
  );
}
