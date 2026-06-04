'use client';

import Link from 'next/link';

export default function Masthead() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="bg-pitch-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-[640px] mx-auto px-[18px] pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="font-serif text-[30px] font-semibold text-pitch-ink leading-none tracking-tight hover:text-pitch-green-mid">
              Pitch
            </h1>
          </Link>
          <p className="font-sans text-[11px] text-pitch-ink-light">{today}</p>
        </div>
      </div>
      <div className="border-b-2 border-pitch-ink" />
      <div className="border-b-2 border-pitch-green" />
    </header>
  );
}
