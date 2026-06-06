'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Masthead() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="bg-pitch-green sticky top-0 z-40 shadow-sm">
      <div className="max-w-[640px] mx-auto px-[18px] pt-4 pb-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:opacity-75 transition-opacity">
            <Image
              src="/pitch-logo.svg"
              alt="PitchNotes"
              width={200}
              height={60}
              priority
            />
          </Link>
          <p className="font-sans text-[11px] text-pitch-white">{today}</p>
        </div>
      </div>
    </header>
  );
}
