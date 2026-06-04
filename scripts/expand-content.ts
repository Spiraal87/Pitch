import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function playerSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function teamId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Additional standout players beyond the original 8
const EXTRA_PLAYERS = [
  // Spain
  { name: 'Pedri', teamName: 'Spain', position: 'Midfielder', age: 23 },
  { name: 'Rodri', teamName: 'Spain', position: 'Midfielder', age: 25 },
  // Argentina
  { name: 'Julián Álvarez', teamName: 'Argentina', position: 'Forward', age: 24 },
  { name: 'Enzo Fernández', teamName: 'Argentina', position: 'Midfielder', age: 24 },
  // France
  { name: 'Antoine Griezmann', teamName: 'France', position: 'Forward', age: 35 },
  { name: 'Aurélien Tchouaméni', teamName: 'France', position: 'Midfielder', age: 25 },
  // Brazil
  { name: 'Rodrygo', teamName: 'Brazil', position: 'Forward', age: 24 },
  { name: 'Endrick', teamName: 'Brazil', position: 'Forward', age: 18 },
  // England
  { name: 'Jude Bellingham', teamName: 'England', position: 'Midfielder', age: 22 },
  { name: 'Harry Kane', teamName: 'England', position: 'Striker', age: 32 },
  // Portugal
  { name: 'Bruno Fernandes', teamName: 'Portugal', position: 'Midfielder', age: 31 },
  { name: 'Rafael Leão', teamName: 'Portugal', position: 'Winger', age: 25 },
  // Netherlands
  { name: 'Virgil van Dijk', teamName: 'Netherlands', position: 'Defender', age: 33 },
  { name: 'Xavi Simons', teamName: 'Netherlands', position: 'Midfielder', age: 22 },
  // Germany
  { name: 'Florian Wirtz', teamName: 'Germany', position: 'Midfielder', age: 21 },
  { name: 'Jamal Musiala', teamName: 'Germany', position: 'Midfielder', age: 22 },
  // Belgium
  { name: 'Kevin De Bruyne', teamName: 'Belgium', position: 'Midfielder', age: 34 },
  { name: 'Romelu Lukaku', teamName: 'Belgium', position: 'Striker', age: 32 },
  // Morocco
  { name: 'Achraf Hakimi', teamName: 'Morocco', position: 'Defender', age: 27 },
  { name: 'Hakim Ziyech', teamName: 'Morocco', position: 'Winger', age: 32 },
  // Japan
  { name: 'Takefusa Kubo', teamName: 'Japan', position: 'Winger', age: 23 },
  // Croatia
  { name: 'Luka Modrić', teamName: 'Croatia', position: 'Midfielder', age: 40 },
  // Uruguay
  { name: 'Darwin Núñez', teamName: 'Uruguay', position: 'Striker', age: 25 },
  { name: 'Federico Valverde', teamName: 'Uruguay', position: 'Midfielder', age: 25 },
  // Colombia
  { name: 'Luis Díaz', teamName: 'Colombia', position: 'Winger', age: 28 },
  { name: 'James Rodríguez', teamName: 'Colombia', position: 'Midfielder', age: 34 },
  // Senegal
  { name: 'Sadio Mané', teamName: 'Senegal', position: 'Forward', age: 34 },
  // South Korea
  { name: 'Son Heung-min', teamName: 'South Korea', position: 'Forward', age: 33 },
  // Mexico
  { name: 'Santiago Giménez', teamName: 'Mexico', position: 'Striker', age: 23 },
  // Ecuador
  { name: 'Moisés Caicedo', teamName: 'Ecuador', position: 'Midfielder', age: 23 },
  // USA
  { name: 'Tyler Adams', teamName: 'USA', position: 'Midfielder', age: 25 },
  { name: 'Weston McKennie', teamName: 'USA', position: 'Midfielder', age: 26 },
  { name: 'Ricardo Pepi', teamName: 'USA', position: 'Striker', age: 22 },
  { name: 'Gio Reyna', teamName: 'USA', position: 'Midfielder', age: 22 },
  { name: 'Antonee Robinson', teamName: 'USA', position: 'Defender', age: 27 },
  { name: 'Matt Turner', teamName: 'USA', position: 'Goalkeeper', age: 30 },
  // Australia
  { name: 'Mitchell Duke', teamName: 'Australia', position: 'Striker', age: 33 },
  // Switzerland
  { name: 'Granit Xhaka', teamName: 'Switzerland', position: 'Midfielder', age: 33 },
  // Canada
  { name: 'Alphonso Davies', teamName: 'Canada', position: 'Defender', age: 24 },
];

async function generateTeamBio(name: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write a 2-3 sentence plain English summary of ${name} for someone who doesn't follow soccer closely. Cover: what kind of team are they, what's their story going into this World Cup, and one thing to watch for. Casual tone, no jargon. Don't start with the team name.`,
    }],
  });
  return (msg.content[0] as { type: string; text: string }).text;
}

async function generatePlayerBio(name: string, team: string, position: string): Promise<string> {
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

async function generateAllTeamBios() {
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .is('bio_text', null);

  if (!teams?.length) {
    console.log('All teams already have bios.');
    return;
  }

  console.log(`\nGenerating bios for ${teams.length} remaining teams...`);
  for (const team of teams) {
    const bio = await generateTeamBio(team.name);
    await supabase
      .from('teams')
      .update({ bio_text: bio, generated_at: new Date().toISOString() })
      .eq('id', team.id);
    console.log(`  ✓ ${team.name}`);
  }
}

async function seedExtraPlayers() {
  // Get all team IDs
  const { data: teams } = await supabase.from('teams').select('id, name');
  const teamMap = Object.fromEntries((teams ?? []).map((t: { id: string; name: string }) => [t.name, t.id]));

  // Check which players already exist
  const { data: existing } = await supabase.from('players').select('id');
  const existingIds = new Set((existing ?? []).map((p: { id: string }) => p.id));

  const newPlayers = EXTRA_PLAYERS.filter(p => !existingIds.has(playerSlug(p.name)));

  if (!newPlayers.length) {
    console.log('All extra players already seeded.');
    return;
  }

  // Insert player rows
  const rows = newPlayers.map(p => ({
    id: playerSlug(p.name),
    name: p.name,
    team_id: teamMap[p.teamName],
    position: p.position,
    age: p.age,
    is_featured: true,
  }));

  const { error } = await supabase.from('players').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`Error inserting players: ${JSON.stringify(error)}`);
  console.log(`\nSeeded ${rows.length} additional players`);

  // Generate bios
  console.log('Generating player bios...');
  for (const p of newPlayers) {
    const bio = await generatePlayerBio(p.name, p.teamName, p.position);
    await supabase
      .from('players')
      .update({ bio_text: bio, generated_at: new Date().toISOString() })
      .eq('id', playerSlug(p.name));
    console.log(`  ✓ ${p.name}`);
  }
}

async function main() {
  console.log('🌱 Expanding Pitch content...');
  await generateAllTeamBios();
  await seedExtraPlayers();
  console.log('\n✅ Done');
}

main().catch(console.error);
