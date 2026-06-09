import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLAYERS = [
  { name: 'Mohamed Salah',          teamName: 'Egypt',       position: 'Forward',    age: 33 },
  { name: 'Phil Foden',             teamName: 'England',     position: 'Midfielder', age: 25 },
  { name: 'Declan Rice',            teamName: 'England',     position: 'Midfielder', age: 26 },
  { name: 'Trent Alexander-Arnold', teamName: 'England',     position: 'Midfielder', age: 27 },
  { name: 'Lautaro Martínez',       teamName: 'Argentina',   position: 'Striker',    age: 27 },
  { name: 'Ousmane Dembélé',        teamName: 'France',      position: 'Winger',     age: 28 },
  { name: 'Marcus Thuram',          teamName: 'France',      position: 'Striker',    age: 27 },
  { name: 'Raphinha',               teamName: 'Brazil',      position: 'Winger',     age: 28 },
  { name: 'Gabriel Martinelli',     teamName: 'Brazil',      position: 'Forward',    age: 24 },
  { name: 'Cody Gakpo',             teamName: 'Netherlands', position: 'Forward',    age: 25 },
  { name: 'Ilkay Gündogan',         teamName: 'Germany',     position: 'Midfielder', age: 34 },
  { name: 'Leroy Sané',             teamName: 'Germany',     position: 'Winger',     age: 29 },
  { name: 'Alexander Isak',         teamName: 'Sweden',      position: 'Striker',    age: 25 },
  { name: 'Dejan Kulusevski',       teamName: 'Sweden',      position: 'Midfielder', age: 25 },
  { name: 'Riyad Mahrez',           teamName: 'Algeria',     position: 'Winger',     age: 34 },
  { name: 'Kaoru Mitoma',           teamName: 'Japan',       position: 'Winger',     age: 28 },
  { name: 'Dani Olmo',              teamName: 'Spain',       position: 'Midfielder', age: 27 },
  { name: 'Gavi',                   teamName: 'Spain',       position: 'Midfielder', age: 21 },
  { name: 'Nuno Mendes',            teamName: 'Portugal',    position: 'Defender',   age: 23 },
  { name: 'Ivan Perišić',           teamName: 'Croatia',     position: 'Winger',     age: 36 },
];

const WIKIPEDIA_TITLES: Record<string, string> = {
  'Mohamed Salah':          'Mohamed_Salah',
  'Phil Foden':             'Phil_Foden',
  'Declan Rice':            'Declan_Rice',
  'Trent Alexander-Arnold': 'Trent_Alexander-Arnold',
  'Lautaro Martínez':       'Lautaro_Martínez',
  'Ousmane Dembélé':        'Ousmane_Dembélé',
  'Marcus Thuram':          'Marcus_Thuram',
  'Raphinha':               'Raphinha_(footballer)',
  'Gabriel Martinelli':     'Gabriel_Martinelli',
  'Cody Gakpo':             'Cody_Gakpo',
  'Ilkay Gündogan':         'İlkay_Gündoğan',
  'Leroy Sané':             'Leroy_Sané',
  'Alexander Isak':         'Alexander_Isak',
  'Dejan Kulusevski':       'Dejan_Kulusevski',
  'Riyad Mahrez':           'Riyad_Mahrez',
  'Kaoru Mitoma':           'Kaoru_Mitoma',
  'Dani Olmo':              'Dani_Olmo',
  'Gavi':                   'Gavi_(footballer)',
  'Nuno Mendes':            'Nuno_Mendes_(footballer)',
  'Ivan Perišić':           'Ivan_Perišić',
};

const HEADERS = { 'User-Agent': 'PitchApp/1.0 (cdjohnsonzero@gmail.com)' };

function playerSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function generateBio(name: string, team: string, position: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 250,
    messages: [{
      role: 'user',
      content: `Write a 3-4 sentence plain English bio of ${name} (${team}, ${position}) for someone who doesn't follow soccer. Cover: what makes them special, why they matter at this World Cup, what a casual fan should watch for. Casual tone. Don't start with the player's name.`,
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
  console.log('Adding 20 new players...\n');

  const { data: teams } = await supabase.from('teams').select('id, name');
  const teamMap = Object.fromEntries((teams ?? []).map((t: { id: string; name: string }) => [t.name, t.id]));

  const { data: existing } = await supabase.from('players').select('id');
  const existingIds = new Set((existing ?? []).map((p: { id: string }) => p.id));

  const toAdd = PLAYERS.filter(p => !existingIds.has(playerSlug(p.name)));

  if (!toAdd.length) {
    console.log('All players already exist.');
    return;
  }

  console.log(`Adding ${toAdd.length} players (${PLAYERS.length - toAdd.length} already exist)...\n`);

  for (const p of toAdd) {
    const teamId = teamMap[p.teamName];
    if (!teamId) { console.log(`  ✗ ${p.name} — team "${p.teamName}" not found`); continue; }

    const [bio, imageUrl] = await Promise.all([
      generateBio(p.name, p.teamName, p.position),
      fetchImage(p.name),
    ]);

    const { error } = await supabase.from('players').upsert({
      id: playerSlug(p.name),
      name: p.name,
      team_id: teamId,
      position: p.position,
      age: p.age,
      bio_text: bio,
      image_url: imageUrl,
      is_featured: true,
      goals: 0,
      assists: 0,
    }, { onConflict: 'id' });

    if (error) {
      console.log(`  ✗ ${p.name} — ${error.message}`);
    } else {
      console.log(`  ✓ ${p.name}${imageUrl ? ' (with photo)' : ' (no photo)'}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\nDone.');
}

main().catch(console.error);
