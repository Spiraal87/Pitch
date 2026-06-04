'use client';

import { useEffect, useState } from 'react';
import { TOURNAMENT_START } from '@/lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, TOURNAMENT_START.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function CountdownUnit({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="flex min-w-[34px] flex-col items-center justify-center rounded-md border border-pitch-green-light bg-pitch-cream px-1.5 py-1">
      <span className="font-sans text-[13px] font-semibold leading-none tabular-nums text-pitch-ink">
        {value}
      </span>
      <span className="mt-0.5 font-sans text-[8px] uppercase leading-none tracking-[0.08em] text-pitch-ink-light">
        {label}
      </span>
    </span>
  );
}

export default function TournamentCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!timeLeft) {
    return (
      <div className="flex items-center rounded-md border border-pitch-rule bg-pitch-cream px-2 py-1">
        <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-pitch-ink-light">
          Kickoff June 11
        </span>
      </div>
    );
  }

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <p className="rounded-md border border-pitch-green-light bg-pitch-green-light px-2.5 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-pitch-green">
        Live now
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <span className="hidden font-sans text-[9px] font-semibold uppercase tracking-[0.10em] text-pitch-green sm:inline">
        Kickoff
      </span>
      <div className="grid grid-cols-4 gap-1">
        <CountdownUnit value={timeLeft.days} label="days" />
        <CountdownUnit value={pad(timeLeft.hours)} label="hrs" />
        <CountdownUnit value={pad(timeLeft.minutes)} label="min" />
        <CountdownUnit value={pad(timeLeft.seconds)} label="sec" />
      </div>
    </div>
  );
}
