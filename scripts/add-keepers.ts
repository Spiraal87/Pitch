import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const KEEPERS = [
  { id: 'alisson-becker',       name: 'Alisson Becker',       teamName: 'Brazil',    age: 32 },
  { id: 'emiliano-martinez',    name: 'Emiliano Martínez',    teamName: 'Argentina', age: 32 },
  { id: 'thibaut-courtois',     name: 'Thibaut Courtois',     teamName: 'Belgium',   age: 32 },
  { id: 'yassine-bounou',       name: 'Yassine Bounou',       teamName: 'Morocco',   age: 33 },
  { id: 'jordan-pickford',      name: 'Jordan Pickford',      teamName: 'England',   age: 31 },
];

const WIKIPEDIA_TITLES: Record<string, string> = {
  'Alisson Becker':      'Alisson_Becker',
  'Emiliano Martínez':   'Emiliano_Martínez_(footballer)',
  'Thibaut Courtois':    'Thibaut_Courtois',
  'Yassine Bounou':      'Yassine_Bounou',
  'Jordan Pickford':     'Jordan_Pickford',
};

const HEADERS = { 'User-Agent': 'PitchApp/1.0 (cdjohnsonzero@gmail.com)' };

async function generateBio(name: string, team: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 250,
    messages: [{
      role: 'user',
      content: `Write a 3-4 sentence plain English bio of ${name} (${team} goalkeeper) for someone who doesn't follow soccer. Cover: what makes them special, why they matter at this World Cup, one thing a casual fan should watch for. Casual tone. Don't start with the player's name.`,
    }],
  });
  return (msg.content[0] as { type: string; text: string }).text;
}

async function fetchImage(name: string): Promise<string | null> {
  const title = WIKIPEDIA_TITLES[name] ?? name.replace(/ /g, '_');
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: HEADERS }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.thumbnail?.source ?? null;
  } catch { return null; }
}

async function getTeamId(teamName: string): Promise<string | null> {
  const { data } = await supabase.from('teams').select('id').eq('name', teamName).single();
  return data?.id ?? null;
}

async function main() {
  console.log('Adding goalkeepers...\n');

  for (const keeper of KEEPERS) {
    const teamId = await getTeamId(keeper.teamName);
    if (!teamId) { console.log(`  ✗ ${keeper.name} — team not found`); continue; }

    const [bio, imageUrl] = await Promise.all([
      generateBio(keeper.name, keeper.teamName),
      fetchImage(keeper.name),
    ]);

    const { error } = await supabase.from('players').upsert({
      id: keeper.id,
      name: keeper.name,
      team_id: teamId,
      position: 'Goalkeeper',
      age: keeper.age,
      bio_text: bio,
      image_url: imageUrl,
      is_featured: true,
      goals: 0,
      assists: 0,
    }, { onConflict: 'id' });

    if (error) {
      console.log(`  ✗ ${keeper.name} — ${error.message}`);
    } else {
      console.log(`  ✓ ${keeper.name}${imageUrl ? ' (with photo)' : ' (no photo)'}`);
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('\nDone.');
}

main().catch(console.error);
