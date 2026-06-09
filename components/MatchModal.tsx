'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    players: (playersRes.data ?? []) as any[],
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function MatchModal({ match, isOpen, onClose }: MatchModalProps) {
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDetail(null);
    setPreview(null);
    fetchMatchDetail(match.home_team_id, match.away_team_id).then(setDetail);

    // Fetch AI match preview for upcoming matches
    const isResult = match.home_score !== null && match.away_score !== null;
    if (!isResult) {
      setPreviewLoading(true);
      fetch(`/api/match-preview/${match.id}`)
        .then(r => r.json())
        .then(data => { if (data.preview) setPreview(data.preview); })
        .finally(() => setPreviewLoading(false));
    }
  }, [isOpen, match.id, match.home_team_id, match.away_team_id, match.home_score, match.away_score]);

  if (!isOpen) return null;

  const isResult = match.home_score !== null && match.away_score !== null;
  const dateLabel = formatMatchDate(match.date);
  const groupLabel = match.group_letter ? `GROUP ${match.group_letter}` : match.stage?.toUpperCase() ?? '';
  const venue = getMatchVenue(match.home_team_id, match.away_team_id);
  const locationLabel = venue ? `${venue.city}, ${venue.country}` : null;
  const homeName = match.home_team?.name ?? match.home_team_id;
  const awayName = match.away_team?.name ?? match.away_team_id;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 pb-[160px] sm:pb-4">
      <div className="bg-pitch-white rounded-xl max-w-[640px] w-full max-h-[calc(100dvh-200px)] sm:max-h-[90vh] overflow-y-auto overscroll-contain shadow-xl">
        {/* Drag handle — mobile sheet affordance */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-pitch-rule" />
        </div>
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-pitch-rule flex items-center justify-between sticky top-0 bg-pitch-white">
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

        <div className="px-4 py-4 space-y-4 sm:px-6 sm:py-5 sm:space-y-5">
          {/* Score Section with FIFA Ranks */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Link href={`/teams/${teamSlug(homeName)}`} className="flex-1 hover:opacity-70 transition-opacity">
                <Flag name={homeName} size="lg" />
                <p className="font-sans text-[16px] font-medium text-pitch-ink mt-2">
                  {homeName}
                </p>
                {match.home_team?.fifa_rank && (
                  <p className="font-sans text-[11px] text-pitch-ink-light mt-1">
                    FIFA #{match.home_team.fifa_rank}
                  </p>
                )}
              </Link>

              <div className="text-center">
                {isResult ? (
                  <p className="font-serif text-[48px] font-bold text-pitch-ink leading-none">
                    {match.home_score} – {match.away_score}
                  </p>
                ) : (
                  <p className="font-sans text-[14px] text-pitch-ink-light">vs</p>
                )}
              </div>

              <Link href={`/teams/${teamSlug(awayName)}`} className="flex-1 hover:opacity-70 transition-opacity">
                <Flag name={awayName} size="lg" />
                <p className="font-sans text-[16px] font-medium text-pitch-ink mt-2">
                  {awayName}
                </p>
                {match.away_team?.fifa_rank && (
                  <p className="font-sans text-[11px] text-pitch-ink-light mt-1">
                    FIFA #{match.away_team.fifa_rank}
                  </p>
                )}
              </Link>
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

          {/* AI Match Preview */}
          {!isResult && (
            <div className="space-y-2">
              <p className="font-sans text-[11px] uppercase tracking-widest text-pitch-ink-light font-medium">
                Match Preview
              </p>
              {previewLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-pitch-rule rounded w-full" />
                  <div className="h-3 bg-pitch-rule rounded w-5/6" />
                  <div className="h-3 bg-pitch-rule rounded w-full" />
                  <div className="h-3 bg-pitch-rule rounded w-4/6 mt-3" />
                  <div className="h-3 bg-pitch-rule rounded w-full" />
                  <div className="h-3 bg-pitch-rule rounded w-5/6 mt-3" />
                  <div className="h-3 bg-pitch-rule rounded w-3/4" />
                </div>
              ) : preview ? (
                <div className="space-y-3">
                  {preview.split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="font-sans text-[13px] text-pitch-ink leading-[1.6]">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (match.home_team?.bio_text || match.away_team?.bio_text) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {match.home_team?.bio_text && (
                    <Link href={`/teams/${teamSlug(homeName)}`} className="px-3 py-2.5 bg-pitch-cream rounded-lg hover:bg-[#E8F0E2] transition-colors block">
                      <p className="font-sans text-[10px] uppercase tracking-widest text-pitch-green font-medium mb-1.5">
                        {homeName} →
                      </p>
                      <p className="font-sans text-[12px] text-pitch-ink leading-[1.5]">
                        {match.home_team.bio_text.split('.')[0]}.
                      </p>
                    </Link>
                  )}
                  {match.away_team?.bio_text && (
                    <Link href={`/teams/${teamSlug(awayName)}`} className="px-3 py-2.5 bg-pitch-cream rounded-lg hover:bg-[#E8F0E2] transition-colors block">
                      <p className="font-sans text-[10px] uppercase tracking-widest text-pitch-green font-medium mb-1.5">
                        {awayName} →
                      </p>
                      <p className="font-sans text-[12px] text-pitch-ink leading-[1.5]">
                        {match.away_team.bio_text.split('.')[0]}.
                      </p>
                    </Link>
                  )}
                </div>
              ) : null}
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {[
                  detail.players.filter((p: any) => p.team?.name === homeName).slice(0, 2),
                  detail.players.filter((p: any) => p.team?.name === awayName).slice(0, 2),
                ].map((players, i) => (
                  <div key={i} className="space-y-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {players.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-2 p-2 bg-pitch-cream rounded">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-pitch-cream">
                          {p.image_url && (
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 object-cover object-top"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                        </div>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2.5 bg-pitch-cream rounded-lg">
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
              <div className="flex items-center justify-between px-3 py-2.5 bg-pitch-cream rounded-lg">
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
          <div className="flex gap-2">
            <Link
              href={`/teams/${teamSlug(homeName)}`}
              className="flex-1 px-3 py-2.5 bg-pitch-green text-white font-sans text-[12px] font-medium rounded-lg hover:bg-pitch-green-mid transition-colors text-center"
            >
              View {homeName}
            </Link>
            <Link
              href={`/teams/${teamSlug(awayName)}`}
              className="flex-1 px-3 py-2.5 bg-pitch-green text-white font-sans text-[12px] font-medium rounded-lg hover:bg-pitch-green-mid transition-colors text-center"
            >
              View {awayName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
