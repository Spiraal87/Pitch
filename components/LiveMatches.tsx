import LiveMatch from '@/components/LiveMatch';

interface LiveMatch {
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

interface LiveMatchesProps {
  matches: LiveMatch[];
}

export default function LiveMatches({ matches }: LiveMatchesProps) {
  if (matches.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 px-[18px] pt-4 pb-2">
        <div className="w-[4px] h-[20px] bg-red-500 flex-shrink-0" />
        <span className="font-serif text-[19px] font-medium text-pitch-ink">
          Live Now
        </span>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      </div>

      {matches.map((match) => (
        <LiveMatch
          key={`${match.homeTeam}-${match.awayTeam}`}
          {...match}
        />
      ))}
    </div>
  );
}
