import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isTournamentLive } from '@/lib/utils';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function buildTournamentContext(): Promise<string> {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split('T')[0];

  const [todayMatchesRes, recentResultsRes, , briefingRes] = await Promise.all([
    supabase
      .from('matches')
      .select('date, group_letter, stage, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name), home_score, away_score')
      .gte('date', `${today}T00:00:00`)
      .lte('date', `${today}T23:59:59`)
      .order('date')
      .limit(8),
    supabase
      .from('matches')
      .select('date, group_letter, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name), home_score, away_score')
      .not('home_score', 'is', null)
      .order('date', { ascending: false })
      .limit(6),
    supabase
      .from('standings')
      .select('group_letter, points, played, team:teams(name), status_label')
      .order('group_letter')
      .order('points', { ascending: false }),
    supabase
      .from('briefings')
      .select('text')
      .eq('date', today)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  const live = isTournamentLive();
  const stage = live ? 'Tournament is live' : 'Pre-tournament';

  type MatchRow = Record<string, unknown>;
  const getTeamName = (team: unknown): string => {
    if (Array.isArray(team)) return (team[0] as { name: string })?.name ?? '';
    if (team && typeof team === 'object') return (team as { name: string }).name ?? '';
    return '';
  };

  const todayMatches = (todayMatchesRes.data ?? []).map((m: MatchRow) =>
    `${getTeamName(m.home_team)} vs ${getTeamName(m.away_team)} (Group ${m.group_letter})`
  ).join(', ');

  const recentResults = (recentResultsRes.data ?? []).map((m: MatchRow) =>
    `${getTeamName(m.home_team)} ${m.home_score}–${m.away_score} ${getTeamName(m.away_team)}`
  ).join('; ');

  return `Current date: ${today}. Stage: ${stage}.
Today's matches: ${todayMatches || 'None'}.
Recent results: ${recentResults || 'None yet'}.
${briefingRes.data?.text ? `Today's briefing: ${briefingRes.data.text}` : ''}`;
}

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question?.trim()) {
      return new Response('Question is required', { status: 400 });
    }

    const tournamentContext = await buildTournamentContext();

    const systemPrompt = `You are a helpful sports guide for Pitch, an app that helps casual fans understand the 2026 FIFA World Cup. Speak in plain, casual English. No jargon. Keep answers to 2-4 sentences unless more detail is needed. Never mention scores for upcoming matches. Focus on stories, players, context.

Current tournament context:
${tournamentContext}
${context ? `\nPage context: ${context}` : ''}`;

    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Ask API error:', err);
    return new Response('Sorry, something went wrong.', { status: 500 });
  }
}
