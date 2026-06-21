import Link from 'next/link';
import AskBar from '@/components/AskBar';
import Masthead from '@/components/Masthead';
import { getServiceClient } from '@/lib/supabase';
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
];

async function getLatestBriefing(): Promise<{ briefing: Briefing | null; isToday: boolean }> {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: todayData } = await supabase
    .from('briefings')
    .select('*')
    .eq('date', today)
    .eq('type', 'daily')
    .maybeSingle();

  if (todayData) return { briefing: todayData, isToday: true };

  const { data: recentData } = await supabase
    .from('briefings')
    .select('*')
    .eq('type', 'daily')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { briefing: recentData ?? null, isToday: false };
}

export const dynamic = 'force-dynamic';

export default async function BriefingPage() {
  const { briefing, isToday } = await getLatestBriefing();
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
          <h1 className="font-serif text-[24px] font-medium text-pitch-ink mb-1">
            {live ? 'Tournament overview' : 'Lead-up briefing'}
          </h1>
          <div className="w-8 h-[2px] bg-pitch-green mb-5" />

          {briefing ? (() => {
            const lines = briefing.text.split('\n');
            const bodyText = (lines[0].startsWith('#') ? lines.slice(1) : lines).join('\n').trim();
            const paragraphs = bodyText.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
            const briefingDate = new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            });
            return (
              <div className="border-t border-pitch-rule pt-5">
                {!isToday && (
                  <p className="font-sans text-[12px] text-pitch-ink-light italic mb-4">
                    Today&apos;s briefing hasn&apos;t generated yet — showing {briefingDate}&apos;s overview.
                  </p>
                )}
                <div className="space-y-4">
                  {paragraphs.map((para, i) => (
                    <p key={i} className={`font-sans text-[14px] text-pitch-ink leading-[1.75] ${i === 0 ? 'font-medium' : ''}`}>
                      {para}
                    </p>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t border-pitch-rule flex items-center justify-center gap-3">
                  <p className="font-sans text-[11px] text-pitch-ink-light">
                    Generated {new Date(briefing.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  <span className="text-pitch-rule">·</span>
                  <p className="font-sans text-[11px] text-pitch-ink-light">
                    {isToday ? 'Next update tomorrow at 6am ET' : 'New briefing generates at 6am ET'}
                  </p>
                </div>
              </div>
            );
          })() : (
            <div className="border-t border-pitch-rule pt-4">
              <p className="font-sans text-[13px] text-pitch-ink-mid leading-[1.5] mb-4">
                {live
                  ? 'No written overview yet for today — check back at 6am ET when the daily briefing generates. In the meantime, the ask bar below can catch you up on any team, player, or result.'
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
