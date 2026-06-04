import { supabase } from '@/lib/supabase';
import { Standing, Match } from '@/lib/types';
import { teamSlug, isTournamentLive } from '@/lib/utils';
import Flag from '@/components/Flag';
import Masthead from '@/components/Masthead';
import SectionFlag from '@/components/SectionFlag';
import AskBar from '@/components/AskBar';
import MatchCard from '@/components/MatchCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const ALL_GROUPS = ['a','b','c','d','e','f','g','h','i','j','k','l'];

async function getGroupData(group: string) {
  const g = group.toUpperCase();

  const [standingsRes, matchesRes] = await Promise.all([
    supabase
      .from('standings')
      .select('*, team:teams(*)')
      .eq('group_letter', g)
      .order('points', { ascending: false }),
    supabase
      .from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
      .eq('group_letter', g)
      .order('date'),
  ]);

  return {
    standings: standingsRes.data ?? [],
    matches: matchesRes.data ?? [],
  };
}

function getStatusColor(label: string | null): string {
  if (!label) return '';
  const l = label.toLowerCase();
  if (l.includes('advancing') || l.includes('through') || l.includes('safe'))
    return 'bg-[#EBF2E3] text-[#2D5016]';
  if (l.includes('must') || l.includes('danger')) return 'bg-[#FEE2E2] text-[#991B1B]';
  if (l.includes('eliminated')) return 'bg-[#F3F4F6] text-[#6B7280]';
  return 'bg-[#FEF3C7] text-[#92400E]';
}

export const dynamic = 'force-dynamic';

export default async function GroupDetailPage({ params }: { params: { group: string } }) {
  if (!ALL_GROUPS.includes(params.group.toLowerCase())) notFound();

  const { standings, matches } = await getGroupData(params.group);
  const groupLabel = params.group.toUpperCase();
  const live = isTournamentLive();

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-32">
        {/* Back nav */}
        <div className="px-[18px] pt-4 pb-2">
          <Link href="/groups" className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green">
            ← All groups
          </Link>
        </div>

        {/* Group heading */}
        <div className="px-[18px] pb-4">
          <h1 className="font-serif text-[22px] font-medium text-pitch-ink">
            Group {groupLabel}
          </h1>
        </div>

        {/* Standings table */}
        <SectionFlag label="Standings" />
        <div className="mx-[18px] bg-pitch-cream border border-pitch-rule rounded-lg overflow-hidden mb-4">
          {/* Header row */}
          <div className="flex items-center px-4 py-2 border-b border-pitch-rule">
            <span className="font-sans text-[10px] uppercase text-pitch-ink-light w-6">#</span>
            <span className="font-sans text-[10px] uppercase text-pitch-ink-light flex-1">Team</span>
            {live && (
              <>
                <span className="font-sans text-[10px] uppercase text-pitch-ink-light w-8 text-center">P</span>
                <span className="font-sans text-[10px] uppercase text-pitch-ink-light w-8 text-center">W</span>
                <span className="font-sans text-[10px] uppercase text-pitch-ink-light w-8 text-center">D</span>
                <span className="font-sans text-[10px] uppercase text-pitch-ink-light w-8 text-center">L</span>
                <span className="font-sans text-[10px] uppercase text-pitch-ink-light w-8 text-center">Pts</span>
              </>
            )}
          </div>
          {standings.map((s: Standing, i: number) => (
            <div key={s.team_id} className="flex items-center px-4 py-2.5 border-b border-pitch-rule last:border-0">
              <span className="font-sans text-[12px] text-pitch-ink-light w-6">{i + 1}</span>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <Link href={`/teams/${teamSlug(s.team?.name ?? s.team_id)}`} className="flex items-center gap-1.5">
                  <Flag name={s.team?.name ?? s.team_id} />
                  <span className="font-sans text-[12px] text-pitch-ink hover:text-pitch-green">
                    {s.team?.name ?? s.team_id}
                  </span>
                </Link>
                {s.status_label && live && (
                  <span className={`font-sans text-[10px] font-medium px-1.5 py-0.5 rounded ${getStatusColor(s.status_label)}`}>
                    {s.status_label}
                  </span>
                )}
              </div>
              {live && (
                <>
                  <span className="font-sans text-[12px] text-pitch-ink-light w-8 text-center">{s.played}</span>
                  <span className="font-sans text-[12px] text-pitch-ink-light w-8 text-center">{s.won}</span>
                  <span className="font-sans text-[12px] text-pitch-ink-light w-8 text-center">{s.drawn}</span>
                  <span className="font-sans text-[12px] text-pitch-ink-light w-8 text-center">{s.lost}</span>
                  <span className="font-sans text-[12px] font-medium text-pitch-ink w-8 text-center">{s.points}</span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Matches */}
        <SectionFlag label="Matches" />
        {matches.length > 0 ? (
          (matches as Match[]).map((m) => <MatchCard key={m.id} match={m} />)
        ) : (
          <p className="px-[18px] py-4 font-sans text-[13px] text-pitch-ink-light">
            Fixtures will appear once the schedule is confirmed.
          </p>
        )}
      </main>
      <AskBar
        placeholder={`Ask about Group ${groupLabel}...`}
        context={`The user is viewing Group ${groupLabel}. Teams: ${standings.map((s: Standing) => s.team?.name ?? s.team_id).join(', ')}.`}
      />
    </>
  );
}
