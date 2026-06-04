'use client';

import Link from 'next/link';

export default function PlayerError() {
  return (
    <div className="max-w-[640px] mx-auto px-[18px] pt-16 pb-32 text-center">
      <p className="font-sans text-[13px] text-pitch-ink-light">
        This player page couldn&apos;t be loaded.
      </p>
      <Link href="/groups" className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green mt-4 inline-block">
        ← Back to groups
      </Link>
    </div>
  );
}
