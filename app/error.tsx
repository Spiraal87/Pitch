'use client';

import Link from 'next/link';

export default function GlobalError() {
  return (
    <div className="max-w-[640px] mx-auto px-[18px] pt-16 pb-32 text-center">
      <p className="font-sans text-[13px] text-pitch-ink-light">
        Something went wrong loading this page.
      </p>
      <Link href="/" className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green mt-4 inline-block">
        ← Home
      </Link>
    </div>
  );
}
