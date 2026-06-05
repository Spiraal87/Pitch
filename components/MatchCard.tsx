import Link from 'next/link';
import { Match } from '@/lib/types';
import { teamSlug } from '@/lib/utils';
import { getMatchVenue } from '@/lib/venues';
import Flag from '@/components/Flag';
import LocalKickoff from '@/components/LocalKickoff';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export default function MatchCard({ match, compact = false }: MatchCardProps) {
  const isResult = match.home_score !== null && match.away_score !== null;
  const groupLabel = match.group_letter ? `GROUP ${match.group_letter}` : match.stage?.toUpperCase() ?? '';
  const venue = getMatchVenue(match.home_team_id, match.away_team_id);
  const locationLabel = venue ? `${venue.city}` : null;
  const homeName = match.home_team?.name ?? match.home_team_id;
  const awayName = match.away_team?.name ?? match.away_team_id;

  if (compact && isResult) {
    return (
      <div className="px-[18px] py-3 border-b border-pitch-rule hover:bg-pitch-cream cursor-pointer">
        <p className="font-sans text-[10px] uppercase tracking-wider text-pitch-ink-light mb-1">
          <LocalKickoff date={match.date} />
        </p>
        <div className="flex items-center justify-between">
          <Link href={`/teams/${teamSlug(homeName)}`} className="font-sans text-[13px] font-medium text-pitch-ink hover:text-pitch-green flex items-center gap-1.5">
            <Flag name={homeName} />
            <span>{homeName}</span>
          </Link>
          <span className="font-serif text-[16px] font-medium text-pitch-ink px-3">
            {match.home_score} – {match.away_score}
          </span>
          <Link href={`/teams/${teamSlug(awayName)}`} className="font-sans text-[13px] font-medium text-pitch-ink hover:text-pitch-green flex items-center justify-end gap-1.5">
            <span>{awayName}</span>
            <Flag name={awayName} />
          </Link>
        </div>
        {match.recap_line && (
          <p className="font-sans text-[12px] italic text-pitch-ink-mid mt-1">{match.recap_line}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-pitch-white border border-pitch-rule rounded-lg overflow-hidden mx-[18px] my-3 shadow-sm card-hover">
      <div className="px-4 py-4">
        <p className="font-sans text-[10px] uppercase tracking-wider text-pitch-ink-light mb-2">
          {groupLabel} · <LocalKickoff date={match.date} />{locationLabel ? ` · ${locationLabel}` : ''}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Link href={`/teams/${teamSlug(homeName)}`}>
              <p className="font-sans text-[14px] font-medium text-pitch-ink hover:text-pitch-green flex items-center gap-1.5">
                <Flag name={homeName} />
                <span>{homeName}</span>
              </p>
            </Link>
          </div>
          <div className="px-4 text-center">
            {isResult ? (
              <span className="font-serif text-[22px] font-medium text-pitch-ink">
                {match.home_score} – {match.away_score}
              </span>
            ) : (
              <span className="font-sans text-[12px] text-pitch-ink-light">vs</span>
            )}
          </div>
          <div className="flex-1 text-right">
            <Link href={`/teams/${teamSlug(awayName)}`}>
              <p className="font-sans text-[14px] font-medium text-pitch-ink hover:text-pitch-green flex items-center justify-end gap-1.5">
                <span>{awayName}</span>
                <Flag name={awayName} />
              </p>
            </Link>
          </div>
        </div>
      </div>
      {(match.context_line || match.recap_line) && (
        <>
          <div className="border-t border-pitch-rule mx-4" />
          <div className="px-4 py-2.5">
            <p className="font-sans text-[12px] italic text-pitch-ink-mid leading-[1.5]">
              {isResult ? match.recap_line : match.context_line}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
