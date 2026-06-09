import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: { matchId: string } }
) {
  const supabase = getServiceClient();

  const { data: match } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
    .eq('id', params.matchId)
    .single();

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  if (match.preview_text) {
    return NextResponse.json({ preview: match.preview_text });
  }

  const homeName = match.home_team?.name ?? match.home_team_id;
  const awayName = match.away_team?.name ?? match.away_team_id;
  const homeRank = match.home_team?.fifa_rank ? `FIFA #${match.home_team.fifa_rank}` : 'unranked';
  const awayRank = match.away_team?.fifa_rank ? `FIFA #${match.away_team.fifa_rank}` : 'unranked';
  const stage = match.group_letter ? `Group ${match.group_letter}` : match.stage ?? 'knockout';
  const dateStr = new Date(match.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const homeBio = match.home_team?.bio_text?.slice(0, 300) ?? '';
  const awayBio = match.away_team?.bio_text?.slice(0, 300) ?? '';

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 120,
    messages: [{
      role: 'user',
      content: `Write a 2-3 sentence match preview for ${homeName} vs ${awayName} at the 2026 FIFA World Cup (${stage}, ${dateStr}).

Team context:
- ${homeName} (${homeRank}): ${homeBio}
- ${awayName} (${awayRank}): ${awayBio}

Cover what's at stake and one reason a casual fan should care. Plain English, no jargon, no bullet points. Don't use the word "crucial".`,
    }],
  });

  const preview = (msg.content[0] as { type: string; text: string }).text.trim();

  // Cache in DB (non-blocking)
  supabase
    .from('matches')
    .update({ preview_text: preview })
    .eq('id', params.matchId)
    .then();

  return NextResponse.json({ preview });
}
