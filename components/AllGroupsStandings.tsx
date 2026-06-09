import Link from 'next/link';
import { Standing } from '@/lib/types';
import GroupCard from '@/components/GroupCard';
import { getGroupOfDeath, getTop4ThirdPlace } from '@/lib/utils';

interface AllGroupsStandingsProps {
  standings: Standing[];
}

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export default function AllGroupsStandings({ standings }: AllGroupsStandingsProps) {
  const byGroup = standings.reduce<Record<string, Standing[]>>((acc, s) => {
    const g = s.group_letter ?? '';
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {});

  const groupOfDeath = getGroupOfDeath(byGroup);
  const maybeTeamIds = getTop4ThirdPlace(byGroup);

  return (
    <div className="px-[18px] pb-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ALL_GROUPS.map((g) => (
          <GroupCard
            key={g}
            group={g}
            standings={byGroup[g] ?? []}
            showFavorite
            showStats={false}
            isGroupOfDeath={g === groupOfDeath}
            maybeTeamIds={maybeTeamIds}
          />
        ))}
      </div>
      <div className="mt-2">
        <Link href="/groups" className="font-sans text-[11px] text-pitch-green-mid hover:text-pitch-green">
          Full standings →
        </Link>
      </div>
    </div>
  );
}
