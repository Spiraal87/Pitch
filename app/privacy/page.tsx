import Link from 'next/link';
import Masthead from '@/components/Masthead';

export const metadata = {
  title: 'Privacy Policy — PitchGuide',
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <div className="font-sans text-[13px] text-pitch-ink-mid leading-[1.7] space-y-4">
            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Data Collection</h2>
              <p>
                PitchGuide does not require an account. We do not collect personal information like your name, email, or location.
              </p>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Ask Bar Questions</h2>
              <p>
                When you use the Ask feature, your question is sent to Anthropic&apos;s Claude API for processing. We do not store your questions or responses. Your questions are subject to Anthropic&apos;s{' '}
                <a href="https://www.anthropic.com/legal/privacy-policy" className="text-pitch-green hover:text-pitch-green-mid">
                  privacy policy
                </a>.
              </p>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Analytics</h2>
              <p>
                PitchGuide uses PostHog to understand how users interact with the app. Analytics are anonymized and do not track personal information.
              </p>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Third-Party Services</h2>
              <p>
                PitchGuide uses the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>football-data.org</strong> — provides tournament data
                </li>
                <li>
                  <strong>Supabase</strong> — database and hosting (see their{' '}
                  <a href="https://supabase.com/privacy" className="text-pitch-green hover:text-pitch-green-mid">
                    privacy policy
                  </a>
                  )
                </li>
                <li>
                  <strong>Anthropic Claude API</strong> — AI responses (see their{' '}
                  <a href="https://www.anthropic.com/legal/privacy-policy" className="text-pitch-green hover:text-pitch-green-mid">
                    privacy policy
                  </a>
                  )
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Cookies</h2>
              <p>
                PitchGuide uses session storage to track your question count within a browser session. No persistent cookies are set.
              </p>
            </div>

            <div>
              <h2 className="font-medium text-pitch-ink text-[15px] mb-2">Contact</h2>
              <p>
                If you have questions about this privacy policy, email{' '}
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
