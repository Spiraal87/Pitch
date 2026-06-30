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
  { name: 'Mike Maignan',        teamName: 'France',      age: 29 },
  { name: 'Manuel Neuer',        teamName: 'Germany',     age: 39 },
  { name: 'Unai Simón',          teamName: 'Spain',       age: 27 },
  { name: 'Diogo Costa',         teamName: 'Portugal',    age: 25 },
  { name: 'Dominik Livaković',   teamName: 'Croatia',     age: 29 },
  { name: 'Guillermo Ochoa',     teamName: 'Mexico',      age: 39 },
  { name: 'Edouard Mendy',       teamName: 'Senegal',     age: 32 },
  { name: 'Gregor Kobel',        teamName: 'Switzerland', age: 27 },
  { name: 'Bart Verbruggen',     teamName: 'Netherlands', age: 22 },
  { name: 'Sergio Rochet',       teamName: 'Uruguay',     age: 29 },
];

const WIKIPEDIA_TITLES: Record<string, string> = {
  'Mike Maignan':       'Mike_Maignan',
  'Manuel Neuer':       'Manuel_Neuer',
  'Unai Simón':         'Unai_Simón',
  'Diogo Costa':        'Diogo_Costa_(footballer,_born_2000)',
  'Dominik Livaković':  'Dominik_Livaković',
  'Guillermo Ochoa':    'Guillermo_Ochoa',
  'Edouard Mendy':      'Édouard_Mendy',
  'Gregor Kobel':       'Gregor_Kobel',
  'Bart Verbruggen':    'Bart_Verbruggen',
  'Sergio Rochet':      'Sergio_Rochet',
};

const HEADERS = { 'User-Agent': 'PitchApp/1.0 (cdjohnsonzero@gmail.com)' };

function playerSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

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

async function main() {
  console.log('Adding more goalkeepers...\n');

  const { data: teams } = await supabase.from('teams').select('id, name');
  const teamMap = Object.fromEntries((teams ?? []).map((t: { id: string; name: string }) => [t.name, t.id]));

  const { data: existing } = await supabase.from('players').select('id');
  const existingIds = new Set((existing ?? []).map((p: { id: string }) => p.id));

  const toAdd = KEEPERS.filter(k => !existingIds.has(playerSlug(k.name)));

  if (!toAdd.length) {
    console.log('All keepers already exist.');
    return;
  }

  console.log(`Adding ${toAdd.length} keepers (${KEEPERS.length - toAdd.length} already exist)...\n`);

  for (const k of toAdd) {
    const teamId = teamMap[k.teamName];
    if (!teamId) { console.log(`  ✗ ${k.name} — team "${k.teamName}" not found`); continue; }

    const [bio, imageUrl] = await Promise.all([
      generateBio(k.name, k.teamName),
      fetchImage(k.name),
    ]);

    const { error } = await supabase.from('players').upsert({
      id: playerSlug(k.name),
      name: k.name,
      team_id: teamId,
      position: 'Goalkeeper',
      age: k.age,
      bio_text: bio,
      image_url: imageUrl,
      is_featured: true,
      goals: 0,
      assists: 0,
    }, { onConflict: 'id' });

    if (error) {
      console.log(`  ✗ ${k.name} — ${error.message}`);
    } else {
      console.log(`  ✓ ${k.name}${imageUrl ? ' (with photo)' : ' (no photo)'}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\nDone.');
}

main().catch(console.error);
