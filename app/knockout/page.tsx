import { supabase } from '@/lib/supabase';
import { Match, Standing } from '@/lib/types';
import Masthead from '@/components/Masthead';
import SectionFlag from '@/components/SectionFlag';
import AskBar from '@/components/AskBar';
import KnockoutClient from '@/components/KnockoutClient';
import Anthropic from '@anthropic-ai/sdk';

const KNOCKOUT_STAGES = ['round_of_32', 'round_of_16', 'quarter_finals', 'semi_finals', 'third_place', 'final'];

export interface MatchPrediction {
  home_pct: number;
  away_pct: number;
  reason: string;
}

async function getKnockoutMatches() {
  const { data } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
    .in('stage', KNOCKOUT_STAGES)
    .order('date');
  return data ?? [];
}

async function getStandings() {
  const { data } = await supabase.from('standings').select('*');
  return data ?? [];
}

async function generatePredictions(
  matches: Match[],
  standings: Standing[]
): Promise<Record<string, MatchPrediction>> {
  if (!process.env.ANTHROPIC_API_KEY) return {};

  const upcoming = matches.filter(
    (m) => m.home_score === null && m.home_team?.name && m.away_team?.name
  );
  if (upcoming.length === 0) return {};

  const standingsMap = Object.fromEntries(standings.map((s) => [s.team_id, s]));

  const matchDescriptions = upcoming
    .map((m) => {
      const home = m.home_team!;
      const away = m.away_team!;
      const hs = standingsMap[m.home_team_id];
      const as_ = standingsMap[m.away_team_id];
      const fmt = (s: typeof hs) =>
        s ? `${s.points}pts ${s.won}W${s.drawn}D${s.lost}L GD${s.goals_for - s.goals_against}` : 'no group data';
      return `ID:${m.id} | ${home.name} (rank #${home.fifa_rank ?? '?'}, ${fmt(hs)}) vs ${away.name} (rank #${away.fifa_rank ?? '?'}, ${fmt(as_)})`;
    })
    .join('\n');

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are predicting FIFA World Cup 2026 knockout match outcomes. For each match give a win probability and a brief plain-English reason a casual fan would understand. Consider FIFA ranking, group stage form, goal difference, and known strengths. One team must win — no draws in knockout.

Matches:
${matchDescriptions}

Respond with ONLY a JSON array, no markdown, no other text:
[{"id":"<match-id>","home_pct":<0-100>,"away_pct":<0-100>,"reason":"<one sentence, max 12 words>"}]`,
        },
      ],
    });

    const text = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(text) as Array<{
      id: string;
      home_pct: number;
      away_pct: number;
      reason: string;
    }>;

    return Object.fromEntries(
      parsed.map((p) => [p.id, { home_pct: p.home_pct, away_pct: p.away_pct, reason: p.reason }])
    );
  } catch {
    return {};
  }
}

export const dynamic = 'force-dynamic';

export default async function KnockoutPage() {
  const [matches, standings] = await Promise.all([getKnockoutMatches(), getStandings()]);
  const typedMatches = matches as Match[];
  const predictions = await generatePredictions(typedMatches, standings as Standing[]);

  return (
    <>
      <Masthead />
      <main className="max-w-[640px] mx-auto pb-32">
        <SectionFlag label="Knockout Rounds" />
        <p className="px-[18px] pb-3 font-sans text-[13px] text-pitch-ink-mid">
          Round of 32 through the Final · win or go home
        </p>
        <KnockoutClient matches={typedMatches} predictions={predictions} />
      </main>
      <AskBar placeholder="Ask about the knockout rounds..." />
    </>
  );
}
