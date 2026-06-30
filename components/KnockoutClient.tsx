'use client';

import { useState, useMemo } from 'react';
import { Match } from '@/lib/types';
import { MatchPrediction } from '@/app/knockout/page';
import MatchCard from '@/components/MatchCard';
import Flag from '@/components/Flag';
import MatchModal from '@/components/MatchModal';
import LocalKickoff from '@/components/LocalKickoff';
import { getMatchVenue } from '@/lib/venues';

const ROUND_CONFIG: Record<string, {
  shortLabel: string;
  label: string;
  stakes: string;
  sublabel: string;
  stars: number;
}> = {
  round_of_32:    { shortLabel: 'R32',   label: 'Round of 32',    sublabel: '32 teams',  stakes: '16 advance',            stars: 0 },
  round_of_16:    { shortLabel: 'R16',   label: 'Round of 16',    sublabel: '16 remain', stakes: '8 advance',             stars: 0 },
  quarter_finals: { shortLabel: 'QF',    label: 'Quarter Finals', sublabel: '8 remain',  stakes: '4 advance',             stars: 1 },
  semi_finals:    { shortLabel: 'SF',    label: 'Semi Finals',    sublabel: '4 remain',  stakes: '2 reach the final',     stars: 2 },
  third_place:    { shortLabel: '3rd',   label: 'Third Place',    sublabel: '',          stakes: 'The battle for bronze', stars: 1 },
  final:          { shortLabel: 'Final', label: 'The Final',      sublabel: '2 teams',   stakes: '1 champion crowned',   stars: 3 },
};

const ROUNDS = Object.keys(ROUND_CONFIG).map(key => ({ key, ...ROUND_CONFIG[key] }));

interface KnockoutClientProps {
  matches: Match[];
  predictions: Record<string, MatchPrediction>;
}

function FinalCard({ match }: { match: Match }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isResult = match.home_score !== null && match.away_score !== null;
  const homeName = match.home_team?.name ?? match.home_team_id;
  const awayName = match.away_team?.name ?? match.away_team_id;
  const venue = getMatchVenue(match.home_team_id, match.away_team_id);
  const locationLabel = venue ? venue.city : null;

  return (
    <>
      <div
        className="mx-[18px] my-4 rounded-xl overflow-hidden bg-[#111111] cursor-pointer shadow-xl"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 14px), linear-gradient(to bottom, #111111 0%, #111111 50%, #1a1200 100%)',
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="px-6 pt-6 pb-5">
          {/* Gold stars */}
          <div className="flex justify-center gap-1 mb-5">
            <span className="text-[18px] text-yellow-400">&#9733;</span>
            <span className="text-[18px] text-yellow-400">&#9733;</span>
            <span className="text-[18px] text-yellow-400">&#9733;</span>
          </div>

          {/* Labels */}
          <p className="text-center font-sans text-[11px] uppercase tracking-[0.20em] text-white/40 mb-1">
            The Final
          </p>
          <p className="text-center font-sans text-[10px] uppercase tracking-[0.14em] text-white/30 mb-6">
            <LocalKickoff date={match.date} />
            {locationLabel ? ` · ${locationLabel}` : ''}
          </p>

          {/* Teams */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-col items-center gap-2.5">
              <Flag name={homeName} size="lg" />
              <p className="font-serif text-[22px] text-white text-center leading-tight">{homeName}</p>
            </div>
            <div className="px-2 text-center flex-shrink-0">
              {isResult ? (
                <p className="font-serif text-[40px] font-bold text-yellow-400 leading-none">
                  {match.home_score} – {match.away_score}
                </p>
              ) : (
                <p className="font-sans text-[12px] text-white/20 tracking-widest">vs</p>
              )}
            </div>
            <div className="flex-1 flex flex-col items-center gap-2.5">
              <Flag name={awayName} size="lg" />
              <p className="font-serif text-[22px] text-white text-center leading-tight">{awayName}</p>
            </div>
          </div>

          {(match.context_line || match.recap_line) && (
            <p className="font-sans text-[12px] italic text-white/50 text-center mt-5 leading-[1.6]">
              {isResult ? match.recap_line : match.context_line}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between">
          <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-yellow-400/50">
            FIFA World Cup 2026
          </p>
          <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-white/30">
            Tap for details &#8594;
          </p>
        </div>
      </div>
      <MatchModal match={match} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default function KnockoutClient({ matches, predictions }: KnockoutClientProps) {
  const presentRounds = useMemo(
    () => ROUNDS.filter((r) => matches.some((m) => m.stage === r.key)),
    [matches]
  );

  const [activeRound, setActiveRound] = useState<string>(
    () => presentRounds[0]?.key ?? ROUNDS[0].key
  );

  const roundMatches = useMemo(
    () => matches.filter((m) => m.stage === activeRound),
    [matches, activeRound]
  );

  const config = ROUND_CONFIG[activeRound];

  if (presentRounds.length === 0) {
    return (
      <p className="px-[18px] py-6 font-sans text-[13px] text-pitch-ink-light">
        Knockout fixtures will appear here once the group stage concludes.
      </p>
    );
  }

  return (
    <>
      {/* Round tabs */}
      <div className="px-[18px] pb-4 overflow-x-auto">
        <div className="flex gap-1.5 w-max">
          {presentRounds.map((r) => {
            const isFinal = r.key === 'final';
            const isActive = activeRound === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setActiveRound(r.key)}
                className={`font-sans text-[11px] px-3 py-1 rounded-full border transition-colors ${
                  isFinal
                    ? isActive
                      ? 'border-pitch-green bg-pitch-green text-white font-medium'
                      : 'border-pitch-green text-pitch-green hover:bg-pitch-green hover:text-white'
                    : isActive
                      ? 'border-pitch-green bg-pitch-green text-white'
                      : 'border-pitch-rule text-pitch-ink-light hover:border-pitch-green-mid'
                }`}
              >
                {r.shortLabel}{r.stars > 0 && (
                  <span className="ml-1 tracking-tight text-yellow-500">
                    {'★'.repeat(r.stars)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Round header */}
      <div className="px-[18px] mb-3">
        <div className={`rounded-lg px-4 py-3 border ${
          activeRound === 'final'
            ? 'bg-[#111111] border-[#111111]'
            : activeRound === 'semi_finals'
              ? 'bg-pitch-ink border-pitch-ink'
              : activeRound === 'quarter_finals'
                ? 'bg-pitch-ink/90 border-pitch-ink/90'
                : 'bg-pitch-cream border-pitch-rule'
        }`}>
          <p className={`font-serif text-[22px] font-medium leading-tight ${
            activeRound === 'final' || activeRound === 'semi_finals' || activeRound === 'quarter_finals'
              ? 'text-white'
              : 'text-pitch-ink'
          }`}>
            {config.label}
            {config.stars > 0 && (
              <span className="ml-2 text-[14px] tracking-tight text-yellow-400">
                {'★'.repeat(config.stars)}
              </span>
            )}
          </p>
          <p className={`font-sans text-[12px] mt-0.5 ${
            activeRound === 'final' || activeRound === 'semi_finals' || activeRound === 'quarter_finals'
              ? 'text-white/50'
              : 'text-pitch-ink-light'
          }`}>
            {config.sublabel && `${config.sublabel} · `}{config.stakes}
          </p>
        </div>
      </div>

      {/* Matches */}
      {roundMatches.length === 0 ? (
        <p className="px-[18px] py-4 font-sans text-[13px] text-pitch-ink-light border-b border-pitch-rule">
          No fixtures scheduled yet for this round.
        </p>
      ) : activeRound === 'final' ? (
        roundMatches.map((m) => <FinalCard key={m.id} match={m} />)
      ) : (
        roundMatches.map((m) => {
          const isResult = m.home_score !== null && m.away_score !== null;
          return <MatchCard key={m.id} match={m} compact={isResult} prediction={predictions[m.id]} />;
        })
      )}
    </>
  );
}
