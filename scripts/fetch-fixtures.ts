import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEAM_NAME_MAP: Record<string, string> = {
  'United States': 'USA',
  'Korea Republic': 'South Korea',
  "Côte d'Ivoire": 'Ivory Coast',
  'Congo DR': 'DR Congo',
  'Bosnia and Herzegovina': 'Bosnia-Herzegovina',
  'Curacao': 'Curaçao',
  'Turkey': 'Türkiye',
  'Cape Verde Islands': 'Cape Verde',
};

function teamId(name: string | null): string {
  if (!name) return 'tbd';
  const mapped = TEAM_NAME_MAP[name] ?? name;
  return mapped.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function main() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error('No FOOTBALL_DATA_API_KEY');

  console.log('Fetching fixtures from football-data.org...');
  const res = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
    { headers: { 'X-Auth-Token': apiKey } }
  );

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = await res.json();
  const matches = data.matches ?? [];
  console.log(`Got ${matches.length} matches`);

  // Get valid team IDs from DB
  const { data: teams } = await supabase.from('teams').select('id');
  const validIds = new Set((teams ?? []).map((t: { id: string }) => t.id));

  // Log first match to see available fields
  if (matches[0]) console.log('Sample match fields:', JSON.stringify(matches[0], null, 2));

  const rows = matches
    .map((m: {
      id: number;
      utcDate: string;
      homeTeam: { name: string };
      awayTeam: { name: string };
      score: { fullTime: { home: number | null; away: number | null } };
      group: string | null;
      matchday: number;
      stage: string;
      venue?: string;
    }) => ({
      id: `wc2026-${m.id}`,
      date: m.utcDate,
      home_team_id: teamId(m.homeTeam.name),
      away_team_id: teamId(m.awayTeam.name),
      home_score: m.score?.fullTime?.home ?? null,
      away_score: m.score?.fullTime?.away ?? null,
      group_letter: m.group?.replace('GROUP_', '') ?? null,
      matchday: m.matchday,
      stage: m.stage === 'GROUP_STAGE' ? 'group' : m.stage.toLowerCase(),
    }))
    .filter((m: { home_team_id: string; away_team_id: string }) => {
      const valid = validIds.has(m.home_team_id) && validIds.has(m.away_team_id);
      if (!valid) console.warn(`  Skipping unknown teams: ${m.home_team_id} vs ${m.away_team_id}`);
      return valid;
    });

  const { error } = await supabase.from('matches').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`Insert error: ${JSON.stringify(error)}`);

  console.log(`✅ Inserted ${rows.length} fixtures`);
}

main().catch(console.error);
