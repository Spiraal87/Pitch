import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateTeamBio(name: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write a 2-3 sentence plain English summary of ${name} for someone who doesn't follow soccer closely. Cover: what kind of team are they, what's their story going into the 2026 World Cup, and one thing to watch for. Casual tone, no jargon. Don't start with the team name.`,
    }],
  });
  return (msg.content[0] as { type: string; text: string }).text;
}

async function generatePlayerBio(name: string, team: string, position: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 250,
    messages: [{
      role: 'user',
      content: `Write a 3-4 sentence plain English bio of ${name} (${team}, ${position}) for someone who doesn't follow soccer. Cover: what makes them special, why they matter at the 2026 World Cup, what a casual fan should watch for. Casual tone. Don't start with the player's name.`,
    }],
  });
  return (msg.content[0] as { type: string; text: string }).text;
}

async function regenerateAllTeams() {
  const { data: teams } = await supabase.from('teams').select('id, name');

  if (!teams?.length) {
    console.log('No teams found.');
    return;
  }

  console.log(`\nRegenerating bios for all ${teams.length} teams with Sonnet 4.6...\n`);
  for (const team of teams) {
    const bio = await generateTeamBio(team.name);
    await supabase
      .from('teams')
      .update({ bio_text: bio, generated_at: new Date().toISOString() })
      .eq('id', team.id);
    console.log(`  ✓ ${team.name}`);
  }
}

async function regenerateAllPlayers() {
  const { data: players } = await supabase
    .from('players')
    .select('id, name, position, team:teams(name)')
    .eq('is_featured', true);

  if (!players?.length) {
    console.log('No featured players found.');
    return;
  }

  console.log(`\nRegenerating bios for all ${players.length} featured players with Sonnet 4.6...\n`);
  for (const player of players) {
    const bio = await generatePlayerBio(
      player.name,
      (Array.isArray(player.team) ? (player.team[0] as { name: string })?.name : (player.team as unknown as { name: string })?.name) ?? '',
      player.position ?? 'Player'
    );
    await supabase
      .from('players')
      .update({ bio_text: bio, generated_at: new Date().toISOString() })
      .eq('id', player.id);
    console.log(`  ✓ ${player.name}`);
  }
}

async function main() {
  console.log('🎯 Regenerating all team and player bios with Sonnet 4.6...');
  await regenerateAllTeams();
  await regenerateAllPlayers();
  console.log('\n✅ Regeneration complete');
}

main().catch(console.error);
