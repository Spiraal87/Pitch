'use client';

import { useState, useMemo } from 'react';
import { Match } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import MatchCard from '@/components/MatchCard';

interface ScheduleClientProps {
  matches: Match[];
  initialGroup?: string;
}

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function groupByDate(matches: Match[]): Record<string, Match[]> {
  return matches.reduce<Record<string, Match[]>>((acc, m) => {
    const day = localDateKey(new Date(m.date));
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});
}

function isToday(dateStr: string): boolean {
  return dateStr === localDateKey(new Date());
}

export default function ScheduleClient({ matches, initialGroup }: ScheduleClientProps) {
  const [activeGroup, setActiveGroup] = useState(initialGroup ?? '');
  const [teamSearch, setTeamSearch] = useState('');

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const homeName = m.home_team?.name ?? '';
      const awayName = m.away_team?.name ?? '';

      const groupMatch = !activeGroup
        || (activeGroup === 'KO' ? m.group_letter === null : m.group_letter === activeGroup);
      const searchMatch = !teamSearch.trim() ||
        homeName.toLowerCase().includes(teamSearch.toLowerCase()) ||
        awayName.toLowerCase().includes(teamSearch.toLowerCase());

      return groupMatch && searchMatch;
    });
  }, [matches, activeGroup, teamSearch]);

  const byDate = groupByDate(filtered);
  const dates = Object.keys(byDate).sort();
  const todayStr = localDateKey(new Date());

  return (
    <>
      {/* Group filter */}
      <div className="px-[18px] pb-3 overflow-x-auto">
        <p className="font-sans text-[10px] uppercase tracking-[0.08em] text-pitch-ink-light mb-2">Filter by group</p>
        <div className="flex gap-1.5 w-max">
          <button
            onClick={() => setActiveGroup('')}
            className={`font-sans text-[11px] px-3 py-1 rounded-full border transition-colors ${
              !activeGroup
                ? 'border-pitch-green bg-pitch-green text-white'
                : 'border-pitch-rule text-pitch-ink-light hover:border-pitch-green-mid'
            }`}
          >
            All
          </button>
          {ALL_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(activeGroup === g ? '' : g)}
              className={`font-sans text-[11px] px-3 py-1 rounded-full border transition-colors ${
                activeGroup === g
                  ? 'border-pitch-green bg-pitch-green text-white'
                  : 'border-pitch-rule text-pitch-ink-light hover:border-pitch-green-mid'
              }`}
            >
              {g}
            </button>
          ))}
          <button
            onClick={() => setActiveGroup(activeGroup === 'KO' ? '' : 'KO')}
            className={`font-sans text-[11px] px-3 py-1 rounded-full border transition-colors ${
              activeGroup === 'KO'
                ? 'border-pitch-green bg-pitch-green text-white'
                : 'border-pitch-rule text-pitch-ink-light hover:border-pitch-green-mid'
            }`}
          >
            Knockout
          </button>
        </div>
      </div>

      {/* Team search */}
      <div className="px-[18px] pb-4">
        <input
          type="text"
          value={teamSearch}
          onChange={(e) => setTeamSearch(e.target.value)}
          placeholder="Search by team name..."
          className="w-full font-sans text-[16px] bg-pitch-white border border-pitch-rule rounded-lg px-4 py-2.5 text-pitch-ink placeholder-pitch-ink-light focus:outline-none focus:border-pitch-green-mid"
        />
      </div>

      {/* Results */}
      {dates.length === 0 && (
        <p className="px-[18px] py-4 font-sans text-[13px] text-pitch-ink-light">
          {teamSearch ? `No matches found for "${teamSearch}".` : 'No fixtures found.'}
        </p>
      )}

      {dates.map((date) => {
        const dayMatches = byDate[date];
        const isPast = date < todayStr;
        const isCurrentDay = isToday(date);

        return (
          <div key={date} id={isCurrentDay ? 'today' : undefined}>
            <div className={`px-[18px] pt-4 pb-1 ${isCurrentDay ? 'sticky top-[73px] bg-pitch-cream z-10' : ''}`}>
              <div className="flex items-center gap-2">
                <p className="font-sans text-[11px] uppercase tracking-[0.08em] text-pitch-ink-light">
                  {formatDate(date)}
                </p>
                {isCurrentDay && (
                  <span className="font-sans text-[10px] font-medium px-1.5 py-0.5 rounded bg-pitch-green text-white">
                    Today
                  </span>
                )}
              </div>
            </div>
            {dayMatches.map((m) => (
              <MatchCard key={m.id} match={m} compact={isPast} />
            ))}
          </div>
        );
      })}
    </>
  );
}
