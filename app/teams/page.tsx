import { supabase } from '@/lib/supabase';
import { Team } from '@/lib/types';
import Masthead from '@/components/Masthead';
import SectionFlag from '@/components/SectionFlag';
import AskBar from '@/components/AskBar';
import TeamsList from '@/components/TeamsList';

async function getAllTeams() {
  const { data } = await supabase
    .from('teams')
    .select('*')
    .order('name');
  return data ?? [];
}

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const teams = (await getAllTeams()) as Team[];

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-32">
        <SectionFlag label="All teams" />
        <TeamsList teams={teams} />
      </main>
      <AskBar placeholder="Ask about any team..." />
    </>
  );
}
