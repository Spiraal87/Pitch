import { isTournamentLive, daysUntilTournament, getCurrentStage } from '@/lib/utils';

export default function WorldCupBanner() {
  const live = isTournamentLive();

  const subtitle = live
    ? getCurrentStage()
    : `Starts in ${daysUntilTournament()} day${daysUntilTournament() !== 1 ? 's' : ''}`;

  return (
    <div className="max-w-[640px] mx-auto px-[18px] pt-5 pb-4 border-b border-pitch-rule">
      <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-pitch-green font-medium mb-1">
        Section
      </p>
      <div className="flex items-end justify-between">
        <h2 className="font-serif text-[22px] font-medium text-pitch-ink leading-tight">
          World Cup 2026
        </h2>
        <p className="font-sans text-[11px] text-pitch-ink-light pb-0.5">
          {subtitle}
        </p>
      </div>
      <p className="font-sans text-[11px] text-pitch-ink-light mt-1">
        June 11 – July 19 · USA · Canada · Mexico
      </p>
    </div>
  );
}
