import { supabase } from '@/lib/supabase';
import { Player, Team } from '@/lib/types';
import { playerSlug, teamSlug, getInitials } from '@/lib/utils';

function cleanBio(text: string): string {
  return text
    .replace(/^#+\s+[^\n]*\n*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();
}
import Masthead from '@/components/Masthead';
import AskBar from '@/components/AskBar';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getPlayerBySlug(slug: string) {
  const { data: players } = await supabase
    .from('players')
    .select('*, team:teams(*)');
  if (!players) return null;
  return players.find((p: Player) => playerSlug(p.name) === slug) ?? null;
}

export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }: { params: { slug: string } }) {
  const player = await getPlayerBySlug(params.slug) as (Player & { team: Team }) | null;
  if (!player) notFound();

  const team = player.team;
  const askContext = `The user is viewing the player page for ${player.name}, who plays for ${team?.name ?? 'unknown'} as a ${player.position ?? 'player'}. ${player.bio_text ?? ''}`;

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-32">
        {/* Back nav */}
        <div className="px-[18px] pt-4 pb-2">
          {team && (
            <Link href={`/teams/${teamSlug(team.name)}`} className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green">
              ← {team.name}
            </Link>
          )}
        </div>

        {/* Player header */}
        <div className="px-[18px] pb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-[56px] h-[56px] rounded-full bg-pitch-green-light flex items-center justify-center">
              <span className="font-sans text-[16px] font-medium text-pitch-green">
                {getInitials(player.name)}
              </span>
            </div>
            <div>
              <h1 className="font-serif text-[28px] font-medium text-pitch-ink leading-tight">
                {player.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {team && (
                  <Link href={`/teams/${teamSlug(team.name)}`}>
                    <span className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green">
                      {team.name}
                    </span>
                  </Link>
                )}
                {player.position && (
                  <>
                    <span className="text-pitch-rule">·</span>
                    <span className="font-sans text-[12px] text-pitch-ink-light">{player.position}</span>
                  </>
                )}
                {player.age && (
                  <>
                    <span className="text-pitch-rule">·</span>
                    <span className="font-sans text-[12px] text-pitch-ink-light">Age {player.age}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {player.bio_text && (
            <p className="font-sans text-[13px] text-pitch-ink leading-[1.5] mt-5 border-t border-pitch-rule pt-4">
              {cleanBio(player.bio_text)}
            </p>
          )}

          {/* Stats */}
          {(player.goals > 0 || player.assists > 0) && (
            <div className="flex gap-6 mt-4 pt-4 border-t border-pitch-rule">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.10em] text-pitch-ink-light">Goals</p>
                <p className="font-sans text-[22px] font-medium text-pitch-ink">{player.goals}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.10em] text-pitch-ink-light">Assists</p>
                <p className="font-sans text-[22px] font-medium text-pitch-ink">{player.assists}</p>
              </div>
            </div>
          )}
        </div>

        {/* Team card */}
        {team && (
          <div className="mx-[18px] border-t border-pitch-rule pt-4">
            <Link href={`/teams/${teamSlug(team.name)}`}>
              <div className="flex items-center justify-between px-4 py-3 bg-pitch-cream border border-pitch-rule rounded-lg hover:border-pitch-green-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[30px] rounded-full bg-pitch-green-light flex items-center justify-center">
                    <span className="font-sans text-[10px] font-medium text-pitch-green">
                      {getInitials(team.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-sans text-[13px] font-medium text-pitch-ink">{team.name}</p>
                    <p className="font-sans text-[11px] text-pitch-ink-light">Group {team.group_letter}</p>
                  </div>
                </div>
                <span className="font-sans text-[12px] text-pitch-green-mid">View →</span>
              </div>
            </Link>
          </div>
        )}
      </main>
      <AskBar
        placeholder={`Ask about ${player.name}...`}
        context={askContext}
      />
    </>
  );
}
