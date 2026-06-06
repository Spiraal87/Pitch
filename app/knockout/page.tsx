import { supabase } from '@/lib/supabase';
import { Match } from '@/lib/types';
import Masthead from '@/components/Masthead';
import SectionFlag from '@/components/SectionFlag';
import AskBar from '@/components/AskBar';
import KnockoutClient from '@/components/KnockoutClient';

const KNOCKOUT_STAGES = ['round_of_32', 'round_of_16', 'quarter_finals', 'semi_finals', 'third_place', 'final'];

async function getKnockoutMatches() {
  const { data } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
    .in('stage', KNOCKOUT_STAGES)
    .order('date');
  return data ?? [];
}

export const dynamic = 'force-dynamic';

export default async function KnockoutPage() {
  const matches = await getKnockoutMatches() as Match[];

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-32">
        <SectionFlag label="Knockout Rounds" />
        <p className="px-[18px] pb-3 font-sans text-[13px] text-pitch-ink-mid">
          Round of 32 through the Final · win or go home
        </p>
        <KnockoutClient matches={matches} />
      </main>
      <AskBar placeholder="Ask about the knockout rounds..." />
    </>
  );
}
