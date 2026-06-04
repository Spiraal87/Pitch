import { supabase } from '@/lib/supabase';
import { Standing } from '@/lib/types';
import Masthead from '@/components/Masthead';
import SectionFlag from '@/components/SectionFlag';
import AskBar from '@/components/AskBar';
import GroupCard from '@/components/GroupCard';

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

async function getAllStandings() {
  const { data } = await supabase
    .from('standings')
    .select('*, team:teams(*)')
    .order('points', { ascending: false });
  return data ?? [];
}

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const standings = await getAllStandings() as Standing[];

  const byGroup = standings.reduce<Record<string, Standing[]>>((acc, s) => {
    const g = s.group_letter ?? '';
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {});

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-32">
        <SectionFlag label="All groups" />
        <div className="px-[18px] pb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_GROUPS.map((g) => {
              const groupStandings = byGroup[g] ?? [];
              return (
                <GroupCard
                  key={g}
                  group={g}
                  standings={groupStandings}
                  showFavorite
                />
              );
            })}
          </div>
        </div>
      </main>
      <AskBar placeholder="Ask about any group or team..." />
    </>
  );
}
