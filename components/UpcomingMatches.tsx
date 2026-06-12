import Link from 'next/link';
import { Match } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import MatchCard from '@/components/MatchCard';

interface UpcomingMatchesProps {
  matches: Match[];
}

export default function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  if (!matches.length) return null;

  // Group by date in Pacific Time so late PT matches (e.g. 6 PM PDT = 01:00 UTC next day)
  // appear under the correct local date label rather than the next UTC day.
  const byDate = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const day = new Date(m.date).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  const dates = Object.keys(byDate).sort().slice(0, 2);

  return (
    <div>
      {dates.map((date) => (
        <div key={date}>
          <div className="px-[18px] pt-4 pb-1">
            <p className="font-sans text-[11px] uppercase tracking-[0.08em] text-pitch-ink-light">
              {formatDate(date)}
            </p>
          </div>
          {byDate[date].map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      ))}
      <div className="px-[18px] pt-2 pb-1">
        <Link href="/schedule" className="font-sans text-[11px] text-pitch-green-mid hover:text-pitch-green">
          Full schedule →
        </Link>
      </div>
    </div>
  );
}
