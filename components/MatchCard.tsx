import Link from 'next/link';
import { Match } from '@/lib/types';
import { formatMatchDate, teamSlug } from '@/lib/utils';
import { getMatchVenue } from '@/lib/venues';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export default function MatchCard({ match, compact = false }: MatchCardProps) {
  const isResult = match.home_score !== null && match.away_score !== null;
  const dateLabel = formatMatchDate(match.date);
  const groupLabel = match.group_letter ? `GROUP ${match.group_letter}` : match.stage?.toUpperCase() ?? '';
  const venue = getMatchVenue(match.home_team_id, match.away_team_id);
  const locationLabel = venue ? `${venue.city}` : null;

  if (compact && isResult) {
    return (
      <div className="px-[18px] py-3 border-b border-pitch-rule hover:bg-pitch-cream cursor-pointer">
        <p className="font-sans text-[10px] uppercase tracking-wider text-pitch-ink-light mb-1">{dateLabel}</p>
        <div className="flex items-center justify-between">
          <Link href={`/teams/${teamSlug(match.home_team?.name ?? match.home_team_id)}`} className="font-sans text-[13px] font-medium text-pitch-ink hover:text-pitch-green">
            {match.home_team?.name ?? match.home_team_id}
          </Link>
          <span className="font-serif text-[16px] font-medium text-pitch-ink px-3">
            {match.home_score} – {match.away_score}
          </span>
          <Link href={`/teams/${teamSlug(match.away_team?.name ?? match.away_team_id)}`} className="font-sans text-[13px] font-medium text-pitch-ink hover:text-pitch-green text-right">
            {match.away_team?.name ?? match.away_team_id}
          </Link>
        </div>
        {match.recap_line && (
          <p className="font-sans text-[12px] italic text-pitch-ink-mid mt-1">{match.recap_line}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-pitch-white border border-pitch-rule mx-[18px] my-3 shadow-sm card-hover">
      <div className="px-4 pt-3 pb-2">
        <p className="font-sans text-[10px] uppercase tracking-wider text-pitch-ink-light mb-3">
          {groupLabel} · {dateLabel}{locationLabel ? ` · ${locationLabel}` : ''}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Link href={`/teams/${teamSlug(match.home_team?.name ?? match.home_team_id)}`}>
              <p className="font-sans text-[14px] font-medium text-pitch-ink hover:text-pitch-green">
                {match.home_team?.name ?? match.home_team_id}
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
            <Link href={`/teams/${teamSlug(match.away_team?.name ?? match.away_team_id)}`}>
              <p className="font-sans text-[14px] font-medium text-pitch-ink hover:text-pitch-green">
                {match.away_team?.name ?? match.away_team_id}
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
