'use client';

import Link from 'next/link';
import Flag from '@/components/Flag';
import { teamSlug } from '@/lib/utils';

interface LiveMatchProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  group: string;
  events?: Array<{
    type: 'goal' | 'card' | 'sub';
    team: string;
    player: string;
    minute: number;
  }>;
}

export default function LiveMatch({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  minute,
  group,
  events = [],
}: LiveMatchProps) {
  const homeGoals = events.filter((e) => e.type === 'goal' && e.team === homeTeam);
  const awayGoals = events.filter((e) => e.type === 'goal' && e.team === awayTeam);

  return (
    <div className="border-2 border-red-500 rounded-lg overflow-hidden bg-pitch-white mx-[18px] my-3">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-red-25">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <p className="font-sans text-[11px] uppercase font-bold tracking-widest text-red-600">
              Live · {minute}&apos;
            </p>
          </div>
          <p className="font-sans text-[10px] text-pitch-ink-light uppercase tracking-wide">
            {group}
          </p>
        </div>
      </div>

      {/* Score */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 text-center">
            <Link href={`/teams/${teamSlug(homeTeam)}`}>
              <div className="flex items-center justify-center gap-2 mb-2 hover:opacity-75 transition-opacity">
                <Flag name={homeTeam} />
                <p className="font-sans text-[13px] font-medium text-pitch-ink">
                  {homeTeam}
                </p>
              </div>
            </Link>
          </div>

          <div className="text-center">
            <p className="font-serif text-[32px] font-bold text-pitch-ink leading-none">
              {homeScore}
            </p>
            <p className="font-sans text-[11px] text-pitch-ink-light mt-1">vs</p>
            <p className="font-serif text-[32px] font-bold text-pitch-ink leading-none">
              {awayScore}
            </p>
          </div>

          <div className="flex-1 text-center">
            <Link href={`/teams/${teamSlug(awayTeam)}`}>
              <div className="flex items-center justify-center gap-2 mb-2 hover:opacity-75 transition-opacity">
                <p className="font-sans text-[13px] font-medium text-pitch-ink">
                  {awayTeam}
                </p>
                <Flag name={awayTeam} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Goal scorers */}
      {(homeGoals.length > 0 || awayGoals.length > 0) && (
        <>
          <div className="border-t border-pitch-rule mx-4" />
          <div className="px-4 py-3 space-y-2">
            {homeGoals.length > 0 && (
              <p className="font-sans text-[12px] text-pitch-ink-light">
                <span className="font-medium text-pitch-ink">⚽ {homeTeam}:</span>{' '}
                {homeGoals.map((g) => `${g.player} ${g.minute}'`).join(', ')}
              </p>
            )}
            {awayGoals.length > 0 && (
              <p className="font-sans text-[12px] text-pitch-ink-light">
                <span className="font-medium text-pitch-ink">⚽ {awayTeam}:</span>{' '}
                {awayGoals.map((g) => `${g.player} ${g.minute}'`).join(', ')}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
