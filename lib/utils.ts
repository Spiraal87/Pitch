export const TOURNAMENT_START = new Date('2026-06-11T13:00:00-06:00');

export function isTournamentLive(): boolean {
  return new Date() >= TOURNAMENT_START;
}

export function daysUntilTournament(): number {
  const diff = TOURNAMENT_START.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  });

  if (sameDay(date, today)) return `TODAY · ${timeStr}`;
  if (sameDay(date, tomorrow)) return `TOMORROW · ${timeStr}`;
  if (sameDay(date, yesterday)) return 'YESTERDAY';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  }).toUpperCase();
}

export function teamSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function playerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function getTop4ThirdPlace(byGroup: Record<string, {
  team_id: string;
  points: number;
  goals_for: number;
  goals_against: number;
  played: number;
}[]>): Set<string> {
  const thirdPlace = Object.values(byGroup)
    .map(standings => {
      const sorted = [...standings].sort((a, b) =>
        b.points - a.points || (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against) || b.goals_for - a.goals_for
      );
      return sorted[2] ?? null;
    })
    .filter((s): s is NonNullable<typeof s> => s != null && s.played > 0);

  const top4 = [...thirdPlace]
    .sort((a, b) =>
      b.points - a.points || (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against) || b.goals_for - a.goals_for
    )
    .slice(0, 8);

  return new Set(top4.map(s => s.team_id));
}

export function getGroupOfDeath(byGroup: Record<string, { team?: { fifa_rank?: number | null } | null }[]>): string {
  let hardestGroup = '';
  let lowestAvgRank = Infinity;
  for (const [g, standings] of Object.entries(byGroup)) {
    const ranks = standings
      .map(s => s.team?.fifa_rank)
      .filter((r): r is number => r != null)
      .sort((a, b) => a - b)
      .slice(0, 2);
    if (ranks.length < 2) continue;
    const avg = (ranks[0] + ranks[1]) / 2;
    if (avg < lowestAvgRank) { lowestAvgRank = avg; hardestGroup = g; }
  }
  return hardestGroup;
}

export function getCurrentStage(): string {
  const now = new Date();
  const start = TOURNAMENT_START;
  const day = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (day <= 16) return `Group Stage · Day ${day}`;
  if (day <= 20) return 'Round of 32';
  if (day <= 24) return 'Round of 16';
  if (day <= 28) return 'Quarter-finals';
  if (day <= 32) return 'Semi-finals';
  if (day <= 37) return 'Final';
  return 'World Cup 2026';
}
