import Link from 'next/link';
import AskBar from '@/components/AskBar';
import Masthead from '@/components/Masthead';
import { supabase } from '@/lib/supabase';
import { Briefing } from '@/lib/types';
import { daysUntilTournament, isTournamentLive } from '@/lib/utils';

const PRE_TOURNAMENT_UPDATES = [
  'Squads are effectively set now, so the biggest stories are injuries, final lineup calls, and who looks sharp in the last warm-up matches.',
  'Teams are arriving across North America for base camps and friendlies, which is when the tournament starts to feel real instead of theoretical.',
  'The opening match is on June 11, 2026 in Mexico City, so the next few days are mostly about readiness, rhythm, and avoiding late setbacks.',
];

const LIVE_FALLBACK_UPDATES = [
  'The tournament is underway, so this page becomes the fast read on what matters today.',
  'Use the homepage for live matches, standings, and leaders, then come here for a plain-English summary of the bigger story.',
  "If today's written briefing has not generated yet, the ask bar below can still catch you up on any team, player, or result.",
];

async function getTodaysBriefing(): Promise<Briefing | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('briefings')
    .select('*')
    .eq('date', today)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  return data ?? null;
}

export const dynamic = 'force-dynamic';

export default async function BriefingPage() {
  const briefing = await getTodaysBriefing();
  const live = isTournamentLive();
  const days = daysUntilTournament();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-32">
        <div className="px-[18px] pt-4 pb-2">
          <Link href="/" className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green">
            {'<- Home'}
          </Link>
        </div>

        <div className="px-[18px] pb-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-pitch-ink-light mb-2">
            {today}
          </p>
          <h1 className="font-serif text-[22px] font-medium text-pitch-ink mb-4">
            {live ? 'Tournament overview' : 'Lead-up briefing'}
          </h1>

          {briefing ? (
            <div className="border-t border-pitch-rule pt-4">
              <p className="font-sans text-[14px] text-pitch-ink leading-[1.6] whitespace-pre-wrap">
                {briefing.text}
              </p>
              <p className="font-sans text-[11px] text-pitch-ink-light mt-4">
                Generated {new Date(briefing.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          ) : (
            <div className="border-t border-pitch-rule pt-4">
              <p className="font-sans text-[13px] text-pitch-ink-mid leading-[1.5] mb-4">
                {live
                  ? 'No full written overview has been generated yet, but the tournament is live and the main storylines are already moving.'
                  : `We are ${days} day${days !== 1 ? 's' : ''} from kickoff, so this page is your quick read on what matters before the games begin.`}
              </p>

              <div className="space-y-3 mb-4">
                {(live ? LIVE_FALLBACK_UPDATES : PRE_TOURNAMENT_UPDATES).map((item) => (
                  <div key={item} className="px-4 py-3 bg-pitch-cream border border-pitch-rule rounded-lg">
                    <p className="font-sans text-[13px] text-pitch-ink leading-[1.5]">{item}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {!live && (
                  <Link
                    href="/groups"
                    className="block px-4 py-3 bg-pitch-cream border border-pitch-rule rounded-lg hover:border-pitch-green-accent transition-colors"
                  >
                    <p className="font-sans text-[13px] font-medium text-pitch-ink">{'Browse all groups ->'}</p>
                    <p className="font-sans text-[12px] text-pitch-ink-light">See all 48 teams and their groups</p>
                  </Link>
                )}

                <Link
                  href={live ? '/' : '/schedule'}
                  className="block px-4 py-3 bg-pitch-cream border border-pitch-rule rounded-lg hover:border-pitch-green-accent transition-colors"
                >
                  <p className="font-sans text-[13px] font-medium text-pitch-ink">
                    {live ? "See what's happening now ->" : 'View the schedule ->'}
                  </p>
                  <p className="font-sans text-[12px] text-pitch-ink-light">
                    {live ? 'Live matches, standings, and tournament leaders' : 'All 104 matches, dates, and times'}
                  </p>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <AskBar placeholder="Ask anything about the World Cup..." />
    </>
  );
}
