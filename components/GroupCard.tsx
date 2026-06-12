import Link from 'next/link';
import { Standing } from '@/lib/types';
import Flag from '@/components/Flag';

const HOST_NATIONS = new Set(['Mexico', 'USA', 'Canada']);

interface GroupCardProps {
  group: string;
  standings: Standing[];
  showFavorite?: boolean;
  showStats?: boolean;
  isGroupOfDeath?: boolean;
  maybeTeamIds?: Set<string>;
}

export default function GroupCard({ group, standings, showFavorite = false, showStats = true, isGroupOfDeath = false, maybeTeamIds }: GroupCardProps) {
  const sorted = [...standings].sort((a, b) => b.points - a.points || b.goals_for - a.goals_for);
  const tournamentStarted = showStats;

  return (
    <Link href={`/groups/${group.toLowerCase()}`}>
      <div className="bg-pitch-white border border-pitch-rule rounded-lg overflow-hidden card-hover cursor-pointer">
        {/* Header */}
        <div className="px-3 py-2 border-b border-pitch-rule flex items-center justify-between">
          <p className="font-sans text-[10px] uppercase font-medium tracking-[0.08em] text-pitch-green-mid">
            Group {group}
          </p>
          {isGroupOfDeath && (
            <span className="font-sans text-[8px] uppercase tracking-[0.06em] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-200 leading-none">
              💀 Group of Death
            </span>
          )}
        </div>

        {/* Team rows */}
        <div>
          {sorted.map((s, i) => {
            const advances = i < 2;
            const maybe = tournamentStarted && maybeTeamIds != null && maybeTeamIds.has(s.team_id);

            return (
              <div
                key={s.team_id}
                className={`flex items-center justify-between px-3 py-2 border-b border-pitch-rule last:border-0 ${
                  advances
                    ? 'bg-[#f4faf0] border-l-2 border-l-pitch-green'
                    : maybe
                      ? 'bg-[#fffbf0] border-l-2 border-l-amber-400'
                      : 'bg-pitch-cream opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`font-sans text-[10px] w-3 flex-shrink-0 ${advances ? 'text-pitch-green font-medium' : maybe ? 'text-amber-500 font-medium' : 'text-pitch-ink-light'}`}>
                    {i + 1}
                  </span>
                  <span className="font-sans text-[12px] text-pitch-ink truncate flex items-center gap-1.5">
                    <Flag name={s.team?.name ?? s.team_id} />
                    <span>{s.team?.name ?? s.team_id}</span>
                    {s.team?.fifa_rank && (
                      <span className="font-sans text-[9px] text-pitch-ink-light flex-shrink-0">#{s.team.fifa_rank}</span>
                    )}
                    {HOST_NATIONS.has(s.team?.name ?? '') && (
                      <span className="font-sans text-[8px] uppercase tracking-[0.05em] font-medium px-1 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 leading-none flex-shrink-0">Host</span>
                    )}
                  </span>
                  {showFavorite && i === 0 && (
                    <span className="bg-pitch-green text-white font-sans text-[9px] font-medium px-1 py-0.5 rounded leading-none ml-0.5 flex-shrink-0">
                      ★
                    </span>
                  )}
                </div>

                {tournamentStarted && (
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    <span className="font-sans text-[11px] font-medium text-pitch-ink">{s.points}pts</span>
                    <span className={`font-sans text-[10px] ${
                      s.goals_for - s.goals_against > 0 ? 'text-pitch-green-mid' :
                      s.goals_for - s.goals_against < 0 ? 'text-red-400' : 'text-pitch-ink-light'
                    }`}>
                      {s.goals_for - s.goals_against > 0 ? '+' : ''}{s.goals_for - s.goals_against}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Advance legend */}
        <div className="px-3 py-1.5 flex items-center gap-3 border-t border-pitch-rule bg-pitch-cream/50">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-pitch-green" />
            <span className="font-sans text-[9px] text-pitch-ink-light/70 uppercase tracking-[0.07em]">Advance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-sans text-[9px] text-pitch-ink-light/70 uppercase tracking-[0.07em]">Maybe</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
