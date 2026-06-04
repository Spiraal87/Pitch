import Link from 'next/link';
import { Standing } from '@/lib/types';

interface AllGroupsStandingsProps {
  standings: Standing[];
}

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export default function AllGroupsStandings({ standings }: AllGroupsStandingsProps) {
  const byGroup = standings.reduce<Record<string, Standing[]>>((acc, s) => {
    const g = s.group_letter ?? '';
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {});

  return (
    <div className="px-[18px] pb-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ALL_GROUPS.map((g) => {
          const rows = (byGroup[g] ?? []).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const gdA = a.goals_for - a.goals_against;
            const gdB = b.goals_for - b.goals_against;
            return gdB - gdA;
          });

          return (
            <Link key={g} href={`/groups/${g.toLowerCase()}`}>
              <div className="bg-pitch-cream border border-pitch-rule rounded-lg overflow-hidden card-hover cursor-pointer">
                <div className="px-3 py-2 border-b border-pitch-rule bg-pitch-white">
                  <p className="font-sans text-[10px] uppercase font-medium tracking-[0.08em] text-pitch-green-mid">
                    Group {g}
                  </p>
                </div>
                <div className="divide-y divide-pitch-rule">
                  {rows.length === 0
                    ? <p className="px-3 py-2 font-sans text-[11px] text-pitch-ink-light">TBD</p>
                    : rows.map((s, i) => {
                        const gd = s.goals_for - s.goals_against;
                        const isAdvancing = i < 2 && s.played > 0;
                        return (
                          <div
                            key={s.team_id}
                            className={`flex items-center justify-between px-3 py-1.5 ${
                              isAdvancing ? 'bg-pitch-green-light/30 border-l-2 border-l-pitch-green' : ''
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-sans text-[10px] text-pitch-ink-light w-3 flex-shrink-0">{i + 1}</span>
                              <span className="font-sans text-[11px] text-pitch-ink truncate">
                                {s.team?.name ?? s.team_id}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                              {s.played > 0 && (
                                <span className={`font-sans text-[10px] ${gd > 0 ? 'text-pitch-green-mid' : gd < 0 ? 'text-[#991B1B]' : 'text-pitch-ink-light'}`}>
                                  {gd > 0 ? `+${gd}` : gd}
                                </span>
                              )}
                              <span className="font-sans text-[11px] font-medium text-pitch-ink">
                                {s.played > 0 ? `${s.points}` : '—'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-2">
        <Link href="/groups" className="font-sans text-[11px] text-pitch-green-mid hover:text-pitch-green">
          Full standings →
        </Link>
      </div>
    </div>
  );
}
