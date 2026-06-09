import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t-2 border-pitch-rule bg-pitch-cream mt-6 pb-[180px]">
      <div className="max-w-[640px] mx-auto px-[18px] py-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-serif text-[14px] font-medium text-pitch-ink mb-2">
              PitchGuide
            </p>
            <p className="font-sans text-[12px] text-pitch-ink-mid leading-[1.6]">
              A sports intelligence app for fans, newcomers, and everyone in between. Understand the game, not just the score.
            </p>
          </div>

          <div className="flex gap-4 text-[12px]">
            <Link href="/about" className="text-pitch-green-mid hover:text-pitch-green">
              About
            </Link>
            <Link href="/privacy" className="text-pitch-green-mid hover:text-pitch-green">
              Privacy
            </Link>
            <Link href="/terms" className="text-pitch-green-mid hover:text-pitch-green">
              Terms
            </Link>
          </div>

          <p className="font-sans text-[11px] text-pitch-ink-light pt-2 border-t border-pitch-rule">
            © 2026 PitchGuide. Built with Next.js and Anthropic Claude.
          </p>
        </div>
      </div>
    </footer>
  );
}
