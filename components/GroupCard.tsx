import Link from 'next/link';
import { Standing } from '@/lib/types';

interface GroupCardProps {
  group: string;
  standings: Standing[];
  showFavorite?: boolean;
}

export default function GroupCard({ group, standings, showFavorite = false }: GroupCardProps) {
  const sorted = [...standings].sort((a, b) => b.points - a.points || b.goals_for - a.goals_for);

  return (
    <Link href={`/groups/${group.toLowerCase()}`}>
      <div className="bg-pitch-cream border border-pitch-rule rounded-lg overflow-hidden card-hover cursor-pointer">
        <div className="px-3 py-2 border-b border-pitch-rule">
          <p className="font-sans text-[10px] uppercase font-medium tracking-[0.08em] text-pitch-green-mid">
            Group {group}
          </p>
        </div>
        <div>
          {sorted.map((s, i) => (
            <div
              key={s.team_id}
              className={`flex items-center justify-between px-3 py-2 border-b border-pitch-rule last:border-0 ${
                i < 2 && s.played > 0 ? 'bg-pitch-green-light/30 border-l-2 border-l-pitch-green' : ''
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-sans text-[10px] text-pitch-ink-light w-3 flex-shrink-0">{i + 1}</span>
                <span className="font-sans text-[12px] text-pitch-ink truncate">
                  {s.team?.name ?? s.team_id}
                </span>
                {showFavorite && i === 0 && (
                  <span className="bg-pitch-green text-white font-sans text-[9px] font-medium px-1 py-0.5 rounded leading-none ml-0.5">
                    ★
                  </span>
                )}
              </div>
              {s.played > 0 && (
                <span className="font-sans text-[12px] font-medium text-pitch-ink ml-2 flex-shrink-0">
                  {s.points}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
