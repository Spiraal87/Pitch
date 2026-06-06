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
