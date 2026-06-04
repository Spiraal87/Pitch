import { supabase } from '@/lib/supabase';
import { Player } from '@/lib/types';
import Masthead from '@/components/Masthead';
import PlayersFilter from '@/components/PlayersFilter';
import AskBar from '@/components/AskBar';
import Link from 'next/link';

export const metadata = { title: 'Players to Know — Pitch' };
export const dynamic = 'force-dynamic';

export default async function PlayersPage() {
  const { data: players } = await supabase
    .from('players')
    .select('*, team:teams(*)')
    .eq('is_featured', true)
    .order('name');

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-52">
        <div className="px-[18px] pt-4 pb-2">
          <Link href="/" className="font-sans text-[12px] text-pitch-green-mid hover:text-pitch-green">
            ← Home
          </Link>
        </div>

        <div className="px-[18px] pb-4 border-b border-pitch-rule">
          <h1 className="font-serif text-[28px] font-medium text-pitch-ink">
            Players to Know
          </h1>
          <p className="font-sans text-[13px] text-pitch-ink-mid mt-1">
            The players who'll define the 2026 World Cup.
          </p>
        </div>

        <PlayersFilter players={(players as Player[]) ?? []} />
      </main>
      <AskBar context="The user is browsing players to know for the 2026 World Cup." />
    </>
  );
}
