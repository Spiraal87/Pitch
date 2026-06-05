import { supabase } from '@/lib/supabase';
import { Match } from '@/lib/types';
import Masthead from '@/components/Masthead';
import SectionFlag from '@/components/SectionFlag';
import AskBar from '@/components/AskBar';
import ScheduleClient from '@/components/ScheduleClient';

async function getAllMatches() {
  const { data } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
    .order('date');
  return data ?? [];
}

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const matches = await getAllMatches() as Match[];

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-32">
        <SectionFlag label="Full Match Schedule" />
        <p className="px-[18px] pb-2 font-sans text-[13px] text-pitch-ink-mid">All 104 matches · times shown in your local timezone</p>
        <ScheduleClient matches={matches} />
      </main>
      <AskBar placeholder="Ask about the schedule..." />
    </>
  );
}
