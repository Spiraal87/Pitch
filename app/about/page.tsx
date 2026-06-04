import Link from 'next/link';
import Masthead from '@/components/Masthead';

export const metadata = {
  title: 'About — Pitch',
};

export default function AboutPage() {
  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto px-[18px] pb-32">
        {/* Back nav */}
        <div className="pt-4 pb-4">
          <Link href="/" className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green">
            ← Home
          </Link>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          <h1 className="font-serif text-[28px] font-medium text-pitch-ink mb-4">
            About Pitch
          </h1>

          <div className="space-y-4 font-sans text-[14px] text-pitch-ink-mid leading-[1.7]">
            <p>
              Pitch is a sports intelligence app for fans, newcomers, and everyone in between. Our mission is simple: <strong className="text-pitch-ink">understand the game, not just the score.</strong>
            </p>

            <p>
              Traditional sports coverage assumes you follow every league and know every player. Pitch doesn't. We provide editorial context, team stories, player profiles, and AI-powered briefings in plain English — so any fan can follow along, no matter how closely they follow the sport.
            </p>

            <div className="border-l-2 border-pitch-green pl-4 py-1">
              <p className="font-sans text-[12px] text-pitch-green-mid uppercase tracking-[0.10em] font-medium mb-1">
                What We Cover
              </p>
              <ul className="font-sans text-[13px] text-pitch-ink-mid space-y-1">
                <li>• Tournament group standings and match schedules</li>
                <li>• Team profiles and player spotlights</li>
                <li>• Match context and storylines</li>
                <li>• Tournament strategy and analysis</li>
              </ul>
            </div>

            <p>
              Built with Next.js 14, powered by Claude AI, and backed by the football-data.org API. Hosted on Vercel.
            </p>

            <p>
              Questions? Reach out at{' '}
              <a href="mailto:cdjohnsonzero@gmail.com" className="text-pitch-green hover:text-pitch-green-mid">
                cdjohnsonzero@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
