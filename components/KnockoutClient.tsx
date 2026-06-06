'use client';

import { useState, useMemo } from 'react';
import { Match } from '@/lib/types';
import MatchCard from '@/components/MatchCard';

const ROUNDS: { key: string; label: string }[] = [
  { key: 'round_of_32',    label: 'R32' },
  { key: 'round_of_16',    label: 'R16' },
  { key: 'quarter_finals', label: 'QF' },
  { key: 'semi_finals',    label: 'SF' },
  { key: 'third_place',    label: '3rd' },
  { key: 'final',          label: 'Final' },
];

interface KnockoutClientProps {
  matches: Match[];
}

export default function KnockoutClient({ matches }: KnockoutClientProps) {
  const presentRounds = useMemo(
    () => ROUNDS.filter((r) => matches.some((m) => m.stage === r.key)),
    [matches]
  );

  const [activeRound, setActiveRound] = useState<string>(
    () => presentRounds[0]?.key ?? ROUNDS[0].key
  );

  const roundMatches = useMemo(
    () => matches.filter((m) => m.stage === activeRound),
    [matches, activeRound]
  );

  const activeLabel = ROUNDS.find((r) => r.key === activeRound)?.label ?? activeRound;

  if (presentRounds.length === 0) {
    return (
      <p className="px-[18px] py-6 font-sans text-[13px] text-pitch-ink-light">
        Knockout fixtures will appear here once the group stage concludes.
      </p>
    );
  }

  return (
    <>
      {/* Round tabs */}
      <div className="px-[18px] pb-3 overflow-x-auto">
        <div className="flex gap-1.5 w-max">
          {presentRounds.map((r) => (
            <button
              key={r.key}
              onClick={() => setActiveRound(r.key)}
              className={`font-sans text-[11px] px-3 py-1 rounded-full border transition-colors ${
                activeRound === r.key
                  ? 'border-pitch-green bg-pitch-green text-white'
                  : 'border-pitch-rule text-pitch-ink-light hover:border-pitch-green-mid'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Round header */}
      <div className="px-[18px] pb-2">
        <p className="font-sans text-[11px] uppercase tracking-[0.08em] text-pitch-ink-light">
          {activeLabel} · {roundMatches.length} match{roundMatches.length !== 1 ? 'es' : ''}
        </p>
      </div>

      {/* Matches */}
      {roundMatches.length === 0 ? (
        <p className="px-[18px] py-4 font-sans text-[13px] text-pitch-ink-light border-b border-pitch-rule">
          No fixtures scheduled yet for this round.
        </p>
      ) : (
        roundMatches.map((m) => {
          const isResult = m.home_score !== null && m.away_score !== null;
          return <MatchCard key={m.id} match={m} compact={isResult} />;
        })
      )}
    </>
  );
}
