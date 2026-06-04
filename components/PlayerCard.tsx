import Link from 'next/link';
import { Player } from '@/lib/types';
import { playerSlug, getInitials } from '@/lib/utils';

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
  return (
    <Link href={`/players/${playerSlug(player.name)}`}>
      <div className="group flex gap-3 px-[18px] py-3 border-b border-pitch-rule hover:bg-[#F0F5EA] hover:border-l-2 hover:border-l-pitch-green cursor-pointer">
        <div className="flex-shrink-0 w-[40px] h-[40px] rounded-full overflow-hidden bg-pitch-green-light flex items-center justify-center">
          {player.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.image_url}
              alt={player.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <span className="font-sans text-[11px] font-medium text-pitch-green">
              {getInitials(player.name)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-sans text-[13px] font-medium text-pitch-ink leading-tight group-hover:text-pitch-green">
            {player.name}
          </p>
          <p className="font-sans text-[11px] text-pitch-ink-light">
            {showTeam && player.team ? `${player.team.name} · ` : ''}{player.position}
          </p>
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
