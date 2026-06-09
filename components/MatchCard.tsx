'use client';

import { useState } from 'react';
import { Match } from '@/lib/types';
import { getMatchVenue } from '@/lib/venues';
import Flag from '@/components/Flag';
import LocalKickoff from '@/components/LocalKickoff';
import MatchModal from '@/components/MatchModal';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

function isLive(dateStr: string, hasResult: boolean): boolean {
  if (hasResult) return false;
  const start = new Date(dateStr).getTime();
  const now = Date.now();
  return now >= start && now <= start + 115 * 60 * 1000;
}

export default function MatchCard({ match, compact = false }: MatchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isResult = match.home_score !== null && match.away_score !== null;
  const live = isLive(match.date, isResult);
  const groupLabel = match.group_letter ? `GROUP ${match.group_letter}` : (match.stage?.replace(/_/g, ' ').toUpperCase() ?? '');
  const venue = getMatchVenue(match.home_team_id, match.away_team_id);
  const locationLabel = venue ? `${venue.city}` : null;
  const homeName = match.home_team?.name ?? match.home_team_id;
  const awayName = match.away_team?.name ?? match.away_team_id;

  if (compact && isResult) {
    return (
      <>
        <div onClick={() => setIsModalOpen(true)} className="px-[18px] py-3 border-b border-pitch-rule hover:bg-pitch-cream cursor-pointer">
          <p className="font-sans text-[10px] uppercase tracking-wider text-pitch-ink-light mb-1">
            <LocalKickoff date={match.date} />
          </p>
          <div className="flex items-center justify-between">
            <div className="font-sans text-[13px] font-medium text-pitch-ink flex items-center gap-1.5">
              <Flag name={homeName} />
              <span>{homeName}</span>
            </div>
            <span className="font-serif text-[16px] font-medium text-pitch-ink px-3">
              {match.home_score} – {match.away_score}
            </span>
            <div className="font-sans text-[13px] font-medium text-pitch-ink flex items-center justify-end gap-1.5">
              <span>{awayName}</span>
              <Flag name={awayName} />
            </div>
          </div>
          {match.recap_line && (
            <p className="font-sans text-[12px] italic text-pitch-ink-mid mt-1">{match.recap_line}</p>
          )}
        </div>
        <MatchModal match={match} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
        <div className="bg-pitch-white border border-pitch-rule rounded-lg overflow-hidden mx-[18px] my-3 shadow-sm card-hover">
          <div className="px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-sans text-[10px] uppercase tracking-wider text-pitch-ink-light">
                {groupLabel} · <LocalKickoff date={match.date} />{locationLabel ? ` · ${locationLabel}` : ''}
              </p>
              {live && (
                <span className="flex items-center gap-1 bg-red-500 text-white font-sans text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                  Live
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-sans text-[14px] font-medium text-pitch-ink flex items-center gap-1.5">
                  <Flag name={homeName} />
                  <span>{homeName}</span>
                </p>
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
                <p className="font-sans text-[14px] font-medium text-pitch-ink flex items-center justify-end gap-1.5">
                  <span>{awayName}</span>
                  <Flag name={awayName} />
                </p>
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
          <div className="border-t border-pitch-rule px-4 py-2 flex justify-end">
            <p className="font-sans text-[10px] uppercase tracking-[0.10em] text-pitch-ink-light/60">
              Tap for details →
            </p>
          </div>
        </div>
      </div>
      <MatchModal match={match} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
