import { supabase } from '@/lib/supabase';
import { Player, Team } from '@/lib/types';
import { playerSlug, teamSlug } from '@/lib/utils';
import Flag from '@/components/Flag';
import Masthead from '@/components/Masthead';
import AskBar from '@/components/AskBar';
import Link from 'next/link';
import { notFound } from 'next/navigation';

function cleanBio(text: string): string {
  return text
    .replace(/^#+\s+[^\n]*\n*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();
}

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
            <Link href={`/teams/${teamSlug(team.name)}`} className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green flex items-center gap-1.5">
              ← <Flag name={team.name} /> {team.name}
            </Link>
          )}
        </div>

        {/* Player header */}
        <div className="px-[18px] pb-6">
          <div className="flex items-start gap-4">
            {/* Avatar / photo */}
            <div className="flex-shrink-0 w-[64px] h-[64px] rounded-full overflow-hidden bg-pitch-green-light flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={player.image_url ?? '/player-placeholder.svg'}
                alt={player.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div>
              <h1 className="font-serif text-[28px] font-medium text-pitch-ink leading-tight">
                {player.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {team && (
                  <Link href={`/teams/${teamSlug(team.name)}`} className="flex items-center gap-1.5">
                    <Flag name={team.name} />
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
                {player.jersey_number && (
                  <>
                    <span className="text-pitch-rule">·</span>
                    <span className="font-sans text-[12px] text-pitch-ink-light">#{player.jersey_number}</span>
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
                  <Flag name={team.name} size="md" />
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
