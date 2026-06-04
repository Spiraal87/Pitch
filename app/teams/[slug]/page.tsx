import { supabase } from '@/lib/supabase';
import { Team, Player, Match } from '@/lib/types';
import { teamSlug, isTournamentLive } from '@/lib/utils';
import Flag from '@/components/Flag';
import Masthead from '@/components/Masthead';
import SectionFlag from '@/components/SectionFlag';
import AskBar from '@/components/AskBar';
import MatchCard from '@/components/MatchCard';
import PlayerCard from '@/components/PlayerCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getTeamBySlug(slug: string) {
  const { data: teams } = await supabase.from('teams').select('*');
  if (!teams) return null;
  return teams.find((t: Team) => teamSlug(t.name) === slug) ?? null;
}

async function getTeamData(team: Team) {
  const [playersRes, matchesRes, standingRes] = await Promise.all([
    supabase
      .from('players')
      .select('*, team:teams(*)')
      .eq('team_id', team.id)
      .limit(4),
    supabase
      .from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
      .order('date'),
    supabase
      .from('standings')
      .select('*, team:teams(*)')
      .eq('team_id', team.id)
      .single(),
  ]);

  return {
    players: playersRes.data ?? [],
    matches: matchesRes.data ?? [],
    standing: standingRes.data ?? null,
  };
}

export const dynamic = 'force-dynamic';

export default async function TeamPage({ params }: { params: { slug: string } }) {
  const team = await getTeamBySlug(params.slug);
  if (!team) notFound();

  const { players, matches, standing } = await getTeamData(team as Team);
  const live = isTournamentLive();

  const askContext = `The user is viewing the ${team.name} page. They are in Group ${team.group_letter}. ${team.bio_text ?? ''}`;

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-32">
        {/* Back nav */}
        <div className="px-[18px] pt-4 pb-2">
          <Link href="/groups" className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green">
            ← Groups
          </Link>
        </div>

        {/* Team header */}
        <div className="px-[18px] pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.10em] text-pitch-green-mid mb-1">
                Group {team.group_letter}
              </p>
              <h1 className="font-serif text-[28px] font-medium text-pitch-ink leading-tight">
                {team.name}
              </h1>
              {team.fifa_rank && (
                <p className="font-sans text-[12px] text-pitch-ink-light mt-1">
                  FIFA rank #{team.fifa_rank}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 w-[48px] h-[36px] flex items-center justify-center mt-1">
              <Flag name={team.name} size="lg" />
            </div>
          </div>

          {team.bio_text && (
            <p className="font-sans text-[13px] text-pitch-ink-mid leading-[1.5] mt-4 border-t border-pitch-rule pt-4">
              {team.bio_text}
            </p>
          )}
        </div>

        {/* Standing (if tournament live) */}
        {live && standing && (
          <>
            <SectionFlag label={`Group ${team.group_letter} standing`} linkText={`Full group`} linkHref={`/groups/${team.group_letter?.toLowerCase()}`} />
            <div className="mx-[18px] mb-4 bg-pitch-cream border border-pitch-rule rounded-lg px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[12px] text-pitch-ink flex items-center gap-1.5">
                  <Flag name={team.name} />
                  <span>{team.name}</span>
                </span>
                <div className="flex gap-4">
                  <span className="font-sans text-[12px] text-pitch-ink-light">{standing.played}G</span>
                  <span className="font-sans text-[12px] text-pitch-ink-light">{standing.won}W {standing.drawn}D {standing.lost}L</span>
                  <span className="font-sans text-[12px] font-medium text-pitch-ink">{standing.points}pts</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Key players */}
        {players.length > 0 && (
          <>
            <SectionFlag label="Key players" />
            {(players as Player[]).map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </>
        )}

        {/* Matches */}
        {matches.length > 0 && (
          <>
            <div className="border-t-2 border-pitch-rule mt-4" />
            <SectionFlag label="Matches" linkText="Full schedule" linkHref="/schedule" />
            {(matches as Match[]).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </>
        )}
      </main>
      <AskBar
        placeholder={`Ask about ${team.name}...`}
        context={askContext}
      />
    </>
  );
}
