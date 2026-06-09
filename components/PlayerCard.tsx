import Link from 'next/link';
import { Player } from '@/lib/types';
import { playerSlug } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  showTeam?: boolean;
}

function cleanBio(text: string, maxLen: number): string {
  const cleaned = text
    .replace(/^#+\s+[^\n]*\n*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();
  return cleaned.slice(0, maxLen) + (cleaned.length > maxLen ? '…' : '');
}

export default function PlayerCard({ player, showTeam = false }: PlayerCardProps) {
  const meta = [
    showTeam && player.team ? player.team.name : null,
    player.jersey_number ? `#${player.jersey_number}` : null,
    player.position,
  ].filter(Boolean).join(' · ');

  return (
    <Link href={`/players/${playerSlug(player.name)}`}>
      <div className="group flex gap-3 px-[18px] py-3 border-b border-pitch-rule hover:bg-[#F0F5EA] hover:border-l-2 hover:border-l-pitch-green cursor-pointer">
        <div className="flex-shrink-0 w-[40px] h-[40px] rounded-full overflow-hidden bg-pitch-green-light flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={player.image_url ?? '/player-placeholder.svg'}
            alt={player.name}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="min-w-0">
          <p className="font-sans text-[13px] font-medium text-pitch-ink leading-tight group-hover:text-pitch-green">
            {player.name}
          </p>
          {meta && (
            <p className="font-sans text-[11px] text-pitch-ink-light">
              {meta}
            </p>
          )}
          {player.bio_text && (
            <p className="font-sans text-[13px] italic text-pitch-ink-mid leading-[1.4] mt-1">
              {cleanBio(player.bio_text, 120)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
