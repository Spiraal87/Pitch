import Link from 'next/link';
import { Match } from '@/lib/types';
import { playerSlug, teamSlug } from '@/lib/utils';
import Flag from '@/components/Flag';

interface TopPlayer {
  id: string;
  name: string;
  position: string | null;
  goals: number;
  assists: number;
  is_featured?: boolean;
  team: { name: string; group_letter: string } | null;
}

interface TournamentLeadersProps {
  topPlayers: TopPlayer[];
  completedMatches: Match[];
}

interface LeaderRow {
  id: string;
  name: string;
  team: string;
  count: number;
  href: string;
}

function LeaderSection({ title, rows, unit, icon }: { title: string; rows: LeaderRow[]; unit: string; icon: string }) {
  if (!rows.length) return (
    <div className="mb-4">
      <p className="font-sans text-[10px] uppercase font-medium tracking-[0.06em] text-pitch-green-mid px-[18px] mb-1">{title}</p>
      <p className="font-sans text-[12px] text-pitch-ink-light px-[18px] py-2">No {unit} recorded yet.</p>
    </div>
  );

  return (
    <div className="mb-2">
      <p className="font-sans text-[10px] uppercase font-medium tracking-[0.06em] text-pitch-green-mid px-[18px] mb-2">{title}</p>
      {rows.map((row, i) => (
        <Link key={row.id} href={row.href}>
          <div className="flex items-center gap-3 px-[18px] py-2.5 border-b border-pitch-rule hover:bg-pitch-cream transition-colors cursor-pointer">
            <span className="font-sans text-[11px] text-pitch-ink-light/50 w-4 flex-shrink-0 tabular-nums">{i + 1}</span>
            <div className="flex-shrink-0">
              <Flag name={row.team} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[13px] font-medium text-pitch-ink leading-tight truncate">{row.name}</p>
              <p className="font-sans text-[10px] text-pitch-ink-light">{row.team}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-serif text-[20px] font-medium text-pitch-ink tabular-nums">{row.count}</span>
              <span className="text-[11px] text-pitch-ink-light/60">{icon}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function TournamentLeaders({ topPlayers, completedMatches }: TournamentLeadersProps) {
  // Top scorers
  const scorers: LeaderRow[] = topPlayers
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team?.name ?? '',
      count: p.goals,
      href: p.is_featured ? `/players/${playerSlug(p.name)}` : `/teams/${teamSlug(p.team?.name ?? '')}`,
    }));

  // Top assists
  const assisters: LeaderRow[] = topPlayers
    .filter((p) => p.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team?.name ?? '',
      count: p.assists,
      href: p.is_featured ? `/players/${playerSlug(p.name)}` : `/teams/${teamSlug(p.team?.name ?? '')}`,
    }));

  // Clean sheets — computed from completed match data
  const cleanSheetMap: Record<string, { name: string; count: number }> = {};
  for (const m of completedMatches) {
    if (m.home_score === null || m.away_score === null) continue;
    if (m.away_score === 0 && m.home_team) {
      const id = m.home_team_id;
      if (!cleanSheetMap[id]) cleanSheetMap[id] = { name: m.home_team.name, count: 0 };
      cleanSheetMap[id].count++;
    }
    if (m.home_score === 0 && m.away_team) {
      const id = m.away_team_id;
      if (!cleanSheetMap[id]) cleanSheetMap[id] = { name: m.away_team.name, count: 0 };
      cleanSheetMap[id].count++;
    }
  }

  const cleanSheets: LeaderRow[] = Object.entries(cleanSheetMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([id, val]) => ({
      id,
      name: val.name,
      team: val.name,
      count: val.count,
      href: `/teams/${teamSlug(val.name)}`,
    }));

  return (
    <div>
      <LeaderSection title="Top scorers" rows={scorers} unit="goals" icon="⚽" />
      <LeaderSection title="Top assists" rows={assisters} unit="assists" icon="🎯" />
      <LeaderSection title="Clean sheets" rows={cleanSheets} unit="clean sheets" icon="🧤" />
    </div>
  );
}
