import Link from 'next/link';
import Masthead from '@/components/Masthead';

export const metadata = {
  title: 'Terms of Use — Pitch',
};

export default function TermsPage() {
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
        <div className="space-y-6">
          <h1 className="font-serif text-[28px] font-medium text-pitch-ink">
            Terms of Use
          </h1>

          <div className="font-sans text-[13px] text-pitch-ink-mid leading-[1.7] space-y-4">
            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Agreement to Terms</h2>
              <p>
                By accessing Pitch, you agree to these terms of use. If you do not agree, please do not use the app.
              </p>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Use License</h2>
              <p>
                You may access and use Pitch for personal, non-commercial purposes. You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Reproduce, modify, or distribute content without permission</li>
                <li>Use automated tools or bots to scrape or extract data</li>
                <li>Interfere with or disrupt the app&apos;s operation</li>
                <li>Reverse-engineer or attempt to bypass any feature</li>
              </ul>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Disclaimer of Warranties</h2>
              <p>
                Pitch is provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not guarantee the accuracy, completeness, or reliability of the content or AI-generated responses.
              </p>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Limitation of Liability</h2>
              <p>
                Pitch and its creators will not be liable for any indirect, incidental, or consequential damages arising from your use of the app.
              </p>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Attribution</h2>
              <p>
                Tournament data provided by football-data.org. AI responses powered by Anthropic Claude. Pitch is not affiliated with FIFA, individual teams, or leagues.
              </p>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Changes to Terms</h2>
              <p>
                We may update these terms at any time. Your continued use of Pitch constitutes acceptance of changes.
              </p>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Contact</h2>
              <p>
                For questions about these terms, email{' '}
                <a href="mailto:cdjohnsonzero@gmail.com" className="text-pitch-green hover:text-pitch-green-mid">
                  cdjohnsonzero@gmail.com
                </a>.
              </p>
            </div>

            <p className="text-[12px] text-pitch-ink-light pt-4 border-t border-pitch-rule">
              Last updated: June 2026
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
