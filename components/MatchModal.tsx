'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Match, Standing } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import Flag from '@/components/Flag';
import { formatMatchDate, teamSlug, isTournamentLive } from '@/lib/utils';
import { getMatchVenue } from '@/lib/venues';

interface MatchModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

interface MatchDetail {
  standings: Standing[];
  players: any[];
}

async function fetchMatchDetail(homeId: string, awayId: string): Promise<MatchDetail> {
  const [standingsRes, playersRes] = await Promise.all([
    supabase.from('standings').select('*').in('team_id', [homeId, awayId]),
    supabase
      .from('players')
      .select('id, name, position, image_url, team:teams(name)')
      .eq('is_featured', true)
      .in('team_id', [homeId, awayId])
      .limit(6),
  ]);
  return {
    standings: (standingsRes.data ?? []) as Standing[],
    players: (playersRes.data ?? []) as any[],
  };
}

export default function MatchModal({ match, isOpen, onClose }: MatchModalProps) {
  const [detail, setDetail] = useState<MatchDetail | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDetail(null);
    fetchMatchDetail(match.home_team_id, match.away_team_id).then(setDetail);
  }, [isOpen, match.home_team_id, match.away_team_id]);

  if (!isOpen) return null;

  const isResult = match.home_score !== null && match.away_score !== null;
  const dateLabel = formatMatchDate(match.date);
  const groupLabel = match.group_letter ? `GROUP ${match.group_letter}` : match.stage?.toUpperCase() ?? '';
  const venue = getMatchVenue(match.home_team_id, match.away_team_id);
  const locationLabel = venue ? `${venue.city}, ${venue.country}` : null;
  const homeName = match.home_team?.name ?? match.home_team_id;
  const awayName = match.away_team?.name ?? match.away_team_id;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-pitch-white rounded-xl max-w-[640px] w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pitch-rule flex items-center justify-between sticky top-0 bg-pitch-white">
          <p className="font-sans text-[11px] uppercase tracking-widest text-pitch-ink-light">
            {groupLabel} · {dateLabel}
          </p>
          <button
            onClick={onClose}
            className="text-pitch-ink-light hover:text-pitch-ink text-2xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Score Section with FIFA Ranks */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex-1">
                <Link href={`/teams/${teamSlug(homeName)}`}>
                  <div className="hover:opacity-75 transition-opacity">
                    <Flag name={homeName} size="lg" />
                    <p className="font-sans text-[16px] font-medium text-pitch-ink mt-2">
                      {homeName}
                    </p>
                    {match.home_team?.fifa_rank && (
                      <p className="font-sans text-[11px] text-pitch-ink-light mt-1">
                        FIFA #{match.home_team.fifa_rank}
                      </p>
                    )}
                  </div>
                </Link>
              </div>

              <div className="text-center">
                {isResult ? (
                  <p className="font-serif text-[48px] font-bold text-pitch-ink leading-none">
                    {match.home_score} – {match.away_score}
                  </p>
                ) : (
                  <p className="font-sans text-[14px] text-pitch-ink-light">vs</p>
                )}
              </div>

              <div className="flex-1">
                <Link href={`/teams/${teamSlug(awayName)}`}>
                  <div className="hover:opacity-75 transition-opacity">
                    <Flag name={awayName} size="lg" />
                    <p className="font-sans text-[16px] font-medium text-pitch-ink mt-2">
                      {awayName}
                    </p>
                    {match.away_team?.fifa_rank && (
                      <p className="font-sans text-[11px] text-pitch-ink-light mt-1">
                        FIFA #{match.away_team.fifa_rank}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Why This Match Matters */}
          {(match.context_line || match.recap_line) && (
            <div className="px-4 py-4 bg-pitch-green-light/30 border border-pitch-green-light/50 rounded-lg">
              <p className="font-sans text-[12px] uppercase tracking-widest text-pitch-green font-medium mb-2">
                Why This Match Matters
              </p>
              <p className="font-sans text-[13px] text-pitch-ink leading-[1.6]">
                {isResult ? match.recap_line : match.context_line}
              </p>
            </div>
          )}

          {/* Team Bios */}
          {(match.home_team?.bio_text || match.away_team?.bio_text) && (
            <div className="grid grid-cols-2 gap-4">
              {match.home_team?.bio_text && (
                <div className="px-3 py-3 bg-pitch-cream rounded-lg">
                  <p className="font-sans text-[10px] uppercase tracking-widest text-pitch-green font-medium mb-2">
                    {homeName}
                  </p>
                  <p className="font-sans text-[12px] text-pitch-ink leading-[1.5]">
                    {match.home_team.bio_text.split('.')[0]}.
                  </p>
                </div>
              )}
              {match.away_team?.bio_text && (
                <div className="px-3 py-3 bg-pitch-cream rounded-lg">
                  <p className="font-sans text-[10px] uppercase tracking-widest text-pitch-green font-medium mb-2">
                    {awayName}
                  </p>
                  <p className="font-sans text-[12px] text-pitch-ink leading-[1.5]">
                    {match.away_team.bio_text.split('.')[0]}.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Standings (Tournament Only) */}
          {isTournamentLive() && detail?.standings.length ? (
            <div className="space-y-2">
              <p className="font-sans text-[11px] uppercase tracking-widest text-pitch-ink-light font-medium">
                Current Standings
              </p>
              <div className="grid grid-cols-2 gap-3">
                {detail.standings.map((s) => (
                  <div key={s.team_id} className="px-3 py-2 bg-pitch-cream rounded border border-pitch-rule">
                    <p className="font-sans text-[10px] font-medium text-pitch-ink mb-1">
                      {s.team?.name}
                    </p>
                    <p className="font-sans text-[10px] text-pitch-ink-light">
                      {s.played}P · {s.won}W {s.drawn}D {s.lost}L · {s.points}pts
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Players to Watch */}
          {detail?.players.length ? (
            <div className="space-y-2">
              <p className="font-sans text-[11px] uppercase tracking-widest text-pitch-ink-light font-medium">
                Players to Watch
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  detail.players.filter((p: any) => p.team?.name === homeName).slice(0, 2),
                  detail.players.filter((p: any) => p.team?.name === awayName).slice(0, 2),
                ].map((players, i) => (
                  <div key={i} className="space-y-2">
                    {players.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-2 p-2 bg-pitch-cream rounded">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-[11px] font-medium text-pitch-ink truncate">
                            {p.name}
                          </p>
                          <p className="font-sans text-[9px] text-pitch-ink-light">
                            {p.position}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Match Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-3 bg-pitch-cream rounded-lg">
              <span className="font-sans text-[12px] text-pitch-ink-light uppercase tracking-wide">
                Kickoff
              </span>
              <p className="font-sans text-[14px] font-medium text-pitch-ink">
                {new Date(match.date).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })} MST
              </p>
            </div>

            {locationLabel && (
              <div className="flex items-center justify-between px-4 py-3 bg-pitch-cream rounded-lg">
                <span className="font-sans text-[12px] text-pitch-ink-light uppercase tracking-wide">
                  Venue
                </span>
                <p className="font-sans text-[14px] font-medium text-pitch-ink text-right">
                  {locationLabel}
                </p>
              </div>
            )}
          </div>

          {/* Team Links */}
          <div className="flex gap-3">
            <Link
              href={`/teams/${teamSlug(homeName)}`}
              className="flex-1 px-4 py-3 bg-pitch-green text-white font-sans text-[13px] font-medium rounded-lg hover:bg-pitch-green-mid transition-colors text-center"
            >
              View {homeName}
            </Link>
            <Link
              href={`/teams/${teamSlug(awayName)}`}
              className="flex-1 px-4 py-3 bg-pitch-green text-white font-sans text-[13px] font-medium rounded-lg hover:bg-pitch-green-mid transition-colors text-center"
            >
              View {awayName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
