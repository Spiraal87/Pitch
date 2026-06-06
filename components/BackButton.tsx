'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green"
    >
      ← Back
    </button>
  );
}
