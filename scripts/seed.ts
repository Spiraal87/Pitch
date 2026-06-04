import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// All 48 teams grouped
const GROUPS: Record<string, string[]> = {
  A: ['Mexico', 'South Korea', 'South Africa', 'Czechia'],
  B: ['Canada', 'Switzerland', 'Qatar', 'Bosnia-Herzegovina'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};

const FEATURED_TEAMS = [
  'Spain', 'Argentina', 'France', 'Brazil',
  'England', 'Norway', 'USA', 'Portugal',
];

const FIFA_RANKS: Record<string, number> = {
  Argentina: 1, France: 2, England: 3, Brazil: 4,
  Portugal: 6, Spain: 8, Netherlands: 7, Belgium: 5,
  Germany: 12, USA: 13, Mexico: 15, Morocco: 14,
  Japan: 17, Croatia: 10, Uruguay: 20, Switzerland: 19,
  Norway: 65, 'South Korea': 22, Ecuador: 40, Tunisia: 35,
  'Ivory Coast': 42, Sweden: 24, Canada: 41, Egypt: 38,
  Iran: 27, Australia: 23, 'Saudi Arabia': 56, Senegal: 18,
  Colombia: 9, 'DR Congo': 50, Czechia: 33, Austria: 25,
  Scotland: 32, Paraguay: 53, Algeria: 31, 'South Africa': 55,
  Qatar: 37, 'Bosnia-Herzegovina': 51, Haiti: 83, 'Curaçao': 82,
  Uzbekistan: 70, Jordan: 87, 'New Zealand': 90,
  'Cape Verde': 73, Ghana: 60, Iraq: 58, Panama: 62,
};

interface FeaturedPlayer {
  id: string;
  name: string;
  teamName: string;
  position: string;
  age: number;
}

const FEATURED_PLAYERS: FeaturedPlayer[] = [
  { id: 'lamine-yamal', name: 'Lamine Yamal', teamName: 'Spain', position: 'Winger', age: 18 },
  { id: 'erling-haaland', name: 'Erling Haaland', teamName: 'Norway', position: 'Striker', age: 25 },
  { id: 'lionel-messi', name: 'Lionel Messi', teamName: 'Argentina', position: 'Forward', age: 38 },
  { id: 'kylian-mbappe', name: 'Kylian Mbappé', teamName: 'France', position: 'Forward', age: 27 },
  { id: 'bukayo-saka', name: 'Bukayo Saka', teamName: 'England', position: 'Winger', age: 24 },
  { id: 'vinicius-jr', name: 'Vinicius Jr', teamName: 'Brazil', position: 'Winger', age: 24 },
  { id: 'cristiano-ronaldo', name: 'Cristiano Ronaldo', teamName: 'Portugal', position: 'Forward', age: 41 },
  { id: 'christian-pulisic', name: 'Christian Pulisic', teamName: 'USA', position: 'Midfielder', age: 27 },
];

// football-data.org uses different names for some teams — map to our canonical names
const TEAM_NAME_MAP: Record<string, string> = {
  'United States': 'USA',
  'Korea Republic': 'South Korea',
  'Iran': 'Iran',
  'Türkiye': 'Türkiye',
  'Turkey': 'Türkiye',
  'Ivory Coast': 'Ivory Coast',
  "Côte d'Ivoire": 'Ivory Coast',
  'DR Congo': 'DR Congo',
  'Congo DR': 'DR Congo',
  'Bosnia and Herzegovina': 'Bosnia-Herzegovina',
  'Curaçao': 'Curaçao',
  'Curacao': 'Curaçao',
  'New Zealand': 'New Zealand',
  'Saudi Arabia': 'Saudi Arabia',
  'Cape Verde': 'Cape Verde',
  'South Africa': 'South Africa',
};

function teamId(name: string | null): string {
  if (!name) return 'tbd';
  const mapped = TEAM_NAME_MAP[name] ?? name;
  return mapped.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function generateTeamBio(name: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write a 2-3 sentence plain English summary of ${name} for someone who doesn't follow soccer closely. Cover: what kind of team are they, what's their story going into this World Cup, and one thing to watch for. Casual tone, no jargon. Don't start with the team name.`,
    }],
  });
  return (message.content[0] as { type: string; text: string }).text;
}

async function generatePlayerBio(player: FeaturedPlayer): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 250,
    messages: [{
      role: 'user',
      content: `Write a 3-4 sentence plain English bio of ${player.name} (${player.teamName}, ${player.position}) for someone who doesn't follow soccer. Cover: what makes them special, why they matter at this World Cup, what a casual fan should watch for. Casual tone. Don't start with the player's name.`,
    }],
  });
  return (message.content[0] as { type: string; text: string }).text;
}

async function fetchFixtures(): Promise<void> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    console.log('No FOOTBALL_DATA_API_KEY — skipping fixture fetch');
    return;
  }

  const res = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
    { headers: { 'X-Auth-Token': apiKey } }
  );

  if (!res.ok) {
    console.warn('Failed to fetch fixtures:', res.status);
    return;
  }

  const data = await res.json();
  const matches = data.matches ?? [];

  const rows = matches.map((m: {
    id: number;
    utcDate: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
    score: { fullTime: { home: number | null; away: number | null } };
    group: string | null;
    matchday: number;
    stage: string;
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
  }));

  const { error } = await supabase.from('matches').upsert(rows, { onConflict: 'id' });
  if (error) console.error('Error inserting matches:', error);
  else console.log(`Seeded ${rows.length} fixtures`);
}

async function seedTeams(): Promise<void> {
  const rows = [];
  for (const [group, teams] of Object.entries(GROUPS)) {
    for (const name of teams) {
      rows.push({
        id: teamId(name),
        name,
        group_letter: group,
        fifa_rank: FIFA_RANKS[name] ?? null,
        is_featured: FEATURED_TEAMS.includes(name),
      });
    }
  }

  const { error } = await supabase.from('teams').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`Error seeding teams: ${JSON.stringify(error)}`);
  console.log(`Seeded ${rows.length} teams`);
}

async function seedPlayers(): Promise<void> {
  // Get team IDs for featured players
  const { data: teams } = await supabase.from('teams').select('id, name');
  const teamMap = Object.fromEntries((teams ?? []).map((t: { id: string; name: string }) => [t.name, t.id]));

  const rows = FEATURED_PLAYERS.map((p) => ({
    id: p.id,
    name: p.name,
    team_id: teamMap[p.teamName],
    position: p.position,
    age: p.age,
    is_featured: true,
  }));

  const { error } = await supabase.from('players').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`Error seeding players: ${JSON.stringify(error)}`);
  console.log(`Seeded ${rows.length} players`);
}

async function seedStandings(): Promise<void> {
  const rows = [];
  for (const [group, teams] of Object.entries(GROUPS)) {
    for (const name of teams) {
      rows.push({
        team_id: teamId(name),
        group_letter: group,
        played: 0, won: 0, drawn: 0, lost: 0,
        goals_for: 0, goals_against: 0, points: 0,
      });
    }
  }

  const { error } = await supabase.from('standings').upsert(rows, { onConflict: 'team_id' });
  if (error) throw new Error(`Error seeding standings: ${JSON.stringify(error)}`);
  console.log(`Seeded ${rows.length} standings rows`);
}

async function generateContent(skipAI = false): Promise<void> {
  if (skipAI) {
    console.log('Skipping AI generation (--skip-ai flag)');
    return;
  }

  console.log('Generating team bios for featured teams...');
  for (const name of FEATURED_TEAMS) {
    const bio = await generateTeamBio(name);
    await supabase
      .from('teams')
      .update({ bio_text: bio, generated_at: new Date().toISOString() })
      .eq('id', teamId(name));
    console.log(`  ✓ ${name}`);
  }

  console.log('Generating player bios...');
  for (const player of FEATURED_PLAYERS) {
    const bio = await generatePlayerBio(player);
    await supabase
      .from('players')
      .update({ bio_text: bio, generated_at: new Date().toISOString() })
      .eq('id', player.id);
    console.log(`  ✓ ${player.name}`);
  }
}

async function main() {
  const skipAI = process.argv.includes('--skip-ai');

  console.log('🌱 Seeding Pitch database...\n');
  await seedTeams();
  await seedPlayers();
  await seedStandings();
  await fetchFixtures();
  await generateContent(skipAI);
  console.log('\n✅ Seed complete');
}

main().catch(console.error);
