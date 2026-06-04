import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

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

async function generatePlayerBio(
  name: string,
  team: string,
  position: string
): Promise<string> {
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

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type } = await req.json();
  const supabase = getServiceClient();

  if (type === 'teams' || type === 'all') {
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name')
      .eq('is_featured', true);

    for (const team of (teams ?? [])) {
      const bio = await generateTeamBio(team.name);
      await supabase
        .from('teams')
        .update({ bio_text: bio, generated_at: new Date().toISOString() })
        .eq('id', team.id);
    }
  }

  if (type === 'players' || type === 'all') {
    const { data: players } = await supabase
      .from('players')
      .select('id, name, position, team:teams(name)')
      .eq('is_featured', true);

    for (const player of (players ?? [])) {
      const bio = await generatePlayerBio(
        player.name,
        (Array.isArray(player.team) ? (player.team[0] as { name: string })?.name : (player.team as unknown as { name: string })?.name) ?? '',
        player.position ?? 'Player'
      );
      await supabase
        .from('players')
        .update({ bio_text: bio, generated_at: new Date().toISOString() })
        .eq('id', player.id);
    }
  }

  if (type === 'briefing' || type === 'all') {
    // Trigger the sync endpoint which also generates the briefing
    const syncUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/sync`;
    await fetch(syncUrl, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
  }

  return NextResponse.json({ ok: true, type });
}
