import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Matches the TEAM_NAME_MAP in scripts/seed.ts — must stay in sync
const TEAM_NAME_MAP: Record<string, string> = {
  'United States': 'USA',
  'Korea Republic': 'South Korea',
  'Turkey': 'Türkiye',
  "Côte d'Ivoire": 'Ivory Coast',
  'Congo DR': 'DR Congo',
  'Bosnia and Herzegovina': 'Bosnia-Herzegovina',
  'Curacao': 'Curaçao',
  'Cape Verde Islands': 'Cape Verde',
};

// Returns null for unknown/TBD teams so FK violations don't abort the batch
function teamId(name: string | null): string | null {
  if (!name) return null;
  const mapped = TEAM_NAME_MAP[name] ?? name;
  return mapped.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || null;
}

async function generateContextLine(
  homeTeam: string,
  awayTeam: string,
  group: string,
  matchday: number,
  standingsSummary: string
): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 60,
    messages: [{
      role: 'user',
      content: `Write a single sentence of context for this upcoming World Cup match that helps a casual fan understand what's at stake. Match: ${homeTeam} vs ${awayTeam}, Group ${group}, Matchday ${matchday}. Standings: ${standingsSummary}. Under 15 words. Examples: "Senegal need a point to stay alive." "Norway's first World Cup match since 1998."`,
    }],
  });
  return (msg.content[0] as { type: string; text: string }).text.replace(/^"|"$/g, '');
}

async function generateDailyBriefing(
  date: string,
  todayMatches: string,
  recentResults: string,
  standingsSummary: string
): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Write a tournament briefing for today (${date}) in 2-3 short paragraphs. Each paragraph should be 2-3 sentences. Paragraph 1: what happened yesterday and who moved through or is in trouble. Paragraph 2: what to watch today and why it matters. Paragraph 3 (optional): one broader storyline or thing that makes the group stage interesting right now. Tone: a friend texting you the highlights — casual, no jargon. Separate paragraphs with a blank line. No heading, no bullet points. Data: Recent results: ${recentResults}. Today's matches: ${todayMatches}. Standings summary: ${standingsSummary}`,
    }],
  });
  return (msg.content[0] as { type: string; text: string }).text;
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'No FOOTBALL_DATA_API_KEY' }, { status: 500 });
  }

  try {
    // 1. Fetch latest data from football-data.org
    const res = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
      { headers: { 'X-Auth-Token': apiKey } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `football-data.org error: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    const matches = data.matches ?? [];

    // 2. Update matches
    const matchRows = matches.map((m: {
      id: number;
      utcDate: string;
      status: string;
      homeTeam: { name: string };
      awayTeam: { name: string };
      score: {
        fullTime: { home: number | null; away: number | null };
      };
      group: string | null;
      matchday: number;
      stage: string;
    }) => ({
      id: `wc2026-${m.id}`,
      date: m.utcDate,
      home_team_id: teamId(m.homeTeam.name),
      away_team_id: teamId(m.awayTeam.name),
      home_score: m.status === 'FINISHED' ? (m.score?.fullTime?.home ?? null) : null,
      away_score: m.status === 'FINISHED' ? (m.score?.fullTime?.away ?? null) : null,
      group_letter: m.group?.replace('GROUP_', '') ?? null,
      matchday: m.matchday,
      stage: m.stage === 'GROUP_STAGE' ? 'group' : m.stage.toLowerCase(),
    }));

    // Only upsert rows where both teams are known — unknown/TBD team IDs cause FK violations
    // that abort the entire batch, preventing scores from being written for completed matches.
    const validMatchRows = matchRows.filter((m: { home_team_id: string | null; away_team_id: string | null }) =>
      m.home_team_id !== null && m.away_team_id !== null
    );
    const { error: matchUpsertError } = await supabase.from('matches').upsert(validMatchRows, { onConflict: 'id' });
    if (matchUpsertError) console.error('Match upsert error:', matchUpsertError);

    // 3. Recalculate standings from match results
    const completedMatches = validMatchRows.filter((m: { home_score: number | null }) => m.home_score !== null);

    const standingsMap: Record<string, {
      team_id: string;
      group_letter: string;
      played: number; won: number; drawn: number; lost: number;
      goals_for: number; goals_against: number; points: number;
    }> = {};

    const initTeam = (teamId: string, group: string) => {
      if (!standingsMap[teamId]) {
        standingsMap[teamId] = {
          team_id: teamId, group_letter: group,
          played: 0, won: 0, drawn: 0, lost: 0,
          goals_for: 0, goals_against: 0, points: 0,
        };
      }
    };

    for (const m of completedMatches) {
      if (!m.group_letter) continue;
      initTeam(m.home_team_id, m.group_letter);
      initTeam(m.away_team_id, m.group_letter);

      const home = standingsMap[m.home_team_id];
      const away = standingsMap[m.away_team_id];
      const hs = m.home_score as number;
      const as_ = m.away_score as number;

      home.played++; away.played++;
      home.goals_for += hs; home.goals_against += as_;
      away.goals_for += as_; away.goals_against += hs;

      if (hs > as_) { home.won++; home.points += 3; away.lost++; }
      else if (hs < as_) { away.won++; away.points += 3; home.lost++; }
      else { home.drawn++; home.points++; away.drawn++; away.points++; }
    }

    if (Object.keys(standingsMap).length > 0) {
      await supabase.from('standings').upsert(
        Object.values(standingsMap),
        { onConflict: 'team_id' }
      );
    }

    // 4. Sync player goals/assists from scorers endpoint
    const scorersRes = await fetch(
      'https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=30',
      { headers: { 'X-Auth-Token': apiKey } }
    );

    if (scorersRes.ok) {
      const scorersData = await scorersRes.json();
      const scorers: Array<{
        player: { name: string };
        team: { name: string };
        goals: number;
        assists: number | null;
        penalties: number;
      }> = scorersData.scorers ?? [];

      // Known name mappings from football-data.org → our player IDs
      const PLAYER_NAME_MAP: Record<string, string> = {
        'Vinicius Junior': 'vinicius-jr',
        'Vinícius Júnior': 'vinicius-jr',
        'Kylian Mbappé': 'kylian-mbappe',
        'Kylian Mbappe': 'kylian-mbappe',
      };

      const playerSlug = (name: string) =>
        name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      for (const scorer of scorers) {
        const playerId = PLAYER_NAME_MAP[scorer.player.name] ?? playerSlug(scorer.player.name);
        const teamDbId = teamId(scorer.team.name);

        await supabase.from('players').upsert({
          id: playerId,
          name: scorer.player.name,
          team_id: teamDbId,
          goals: scorer.goals,
          assists: scorer.assists ?? 0,
        }, { onConflict: 'id', ignoreDuplicates: false });
      }
    }

    // 5. Generate context lines for upcoming matches without one
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const { data: upcomingMatches } = await supabase
      .from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
      .is('context_line', null)
      .is('home_score', null)
      .gte('date', today.toISOString())
      .lte('date', nextWeek.toISOString())
      .limit(10);

    for (const m of (upcomingMatches ?? [])) {
      if (!m.group_letter) continue;

      const groupStandings = Object.values(standingsMap)
        .filter((s) => s.group_letter === m.group_letter)
        .map((s) => `${s.team_id}: ${s.points}pts (${s.played}G)`)
        .join(', ');

      const contextLine = await generateContextLine(
        (m.home_team as { name: string })?.name ?? m.home_team_id,
        (m.away_team as { name: string })?.name ?? m.away_team_id,
        m.group_letter,
        m.matchday ?? 1,
        groupStandings || 'No matches played yet'
      );

      await supabase
        .from('matches')
        .update({ context_line: contextLine })
        .eq('id', m.id);
    }

    // 6. Generate daily briefing
    const todayStr = today.toISOString().split('T')[0];

    const { data: todayMatchData } = await supabase
      .from('matches')
      .select('home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name), group_letter')
      .gte('date', `${todayStr}T00:00:00`)
      .lte('date', `${todayStr}T23:59:59`);

    const { data: recentResultData } = await supabase
      .from('matches')
      .select('home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name), home_score, away_score')
      .not('home_score', 'is', null)
      .order('date', { ascending: false })
      .limit(8);

    type MatchRow = Record<string, unknown>;
    const getTeamName = (team: unknown): string => {
      if (Array.isArray(team)) return (team[0] as { name: string })?.name ?? '';
      if (team && typeof team === 'object') return (team as { name: string }).name ?? '';
      return '';
    };

    const todayMatchStr = (todayMatchData ?? []).map((m: MatchRow) =>
      `${getTeamName(m.home_team)} vs ${getTeamName(m.away_team)}`
    ).join(', ');

    const recentResultStr = (recentResultData ?? []).map((m: MatchRow) =>
      `${getTeamName(m.home_team)} ${m.home_score}–${m.away_score} ${getTeamName(m.away_team)}`
    ).join('; ');

    const topStandings = Object.values(standingsMap)
      .sort((a, b) => b.points - a.points)
      .slice(0, 8)
      .map((s) => `${s.team_id} ${s.points}pts`)
      .join(', ');

    const briefingText = await generateDailyBriefing(
      todayStr,
      todayMatchStr || 'No matches today',
      recentResultStr || 'No recent results',
      topStandings || 'Tournament not started'
    );

    await supabase.from('briefings').upsert({
      date: todayStr,
      type: 'daily',
      text: briefingText,
    }, { onConflict: 'date,type' });

    return NextResponse.json({
      ok: true,
      matchesUpdated: matchRows.length,
      standingsUpdated: Object.keys(standingsMap).length,
    });
  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
