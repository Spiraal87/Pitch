import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch recent results from DB (no external API needed)
  const { data: recentResultData } = await supabase
    .from('matches')
    .select('home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name), home_score, away_score, date')
    .not('home_score', 'is', null)
    .order('date', { ascending: false })
    .limit(10);

  const { data: todayMatchData } = await supabase
    .from('matches')
    .select('home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name), group_letter')
    .gte('date', `${todayStr}T00:00:00`)
    .lte('date', `${todayStr}T23:59:59`);

  const { data: standingsData } = await supabase
    .from('standings')
    .select('team_id, points, played, group_letter')
    .order('points', { ascending: false })
    .limit(12);

  type MatchRow = Record<string, unknown>;
  const getTeamName = (team: unknown): string => {
    if (Array.isArray(team)) return (team[0] as { name: string })?.name ?? '';
    if (team && typeof team === 'object') return (team as { name: string }).name ?? '';
    return '';
  };

  const recentResultStr = (recentResultData ?? []).map((m: MatchRow) =>
    `${getTeamName(m.home_team)} ${m.home_score}–${m.away_score} ${getTeamName(m.away_team)}`
  ).join('; ');

  const todayMatchStr = (todayMatchData ?? []).map((m: MatchRow) =>
    `${getTeamName(m.home_team)} vs ${getTeamName(m.away_team)}`
  ).join(', ');

  const standingsSummary = (standingsData ?? [])
    .map((s: { team_id: string; points: number; played: number }) => `${s.team_id} ${s.points}pts (${s.played}G)`)
    .join(', ');

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Write a tournament briefing for today (${todayStr}) in 2-3 short paragraphs. Each paragraph should be 2-3 sentences. Paragraph 1: what happened recently and who moved through or is in trouble. Paragraph 2: what to watch today and why it matters. Paragraph 3 (optional): one broader storyline or thing that makes the tournament interesting right now. Tone: a friend texting you the highlights — casual, no jargon. Separate paragraphs with a blank line. No heading, no bullet points. Data: Recent results: ${recentResultStr || 'No recent results'}. Today's matches: ${todayMatchStr || 'No matches today'}. Standings summary: ${standingsSummary || 'Tournament not started'}`,
    }],
  });

  const briefingText = (msg.content[0] as { type: string; text: string }).text;

  await supabase.from('briefings').delete().eq('date', todayStr).eq('type', 'daily');
  await supabase.from('briefings').insert({ date: todayStr, type: 'daily', text: briefingText });

  return NextResponse.json({ ok: true, date: todayStr, length: briefingText.length });
}
