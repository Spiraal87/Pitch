import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

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

function teamId(name: string | null): string | null {
  if (!name) return null;
  const mapped = TEAM_NAME_MAP[name] ?? name;
  return mapped.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || null;
}

export async function GET(req: NextRequest) {
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
    const res = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
      { headers: { 'X-Auth-Token': apiKey } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `football-data.org error: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    const matches = data.matches ?? [];

    // Update match scores
    const matchRows = matches.map((m: {
      id: number;
      utcDate: string;
      homeTeam: { name: string };
      awayTeam: { name: string };
      score: { fullTime: { home: number | null; away: number | null } };
      group: string | null;
      matchday: number;
      stage: string;
    }) => ({
      id: `wc2026-${m.id}`,
      date: m.utcDate,
      home_team_id: teamId(m.homeTeam.name),
      away_team_id: teamId(m.awayTeam.name),
      home_score: m.score?.fullTime?.home ?? null,
      away_score: m.score?.fullTime?.away ?? null,
      group_letter: m.group?.replace('GROUP_', '') ?? null,
      matchday: m.matchday,
      stage: m.stage === 'GROUP_STAGE' ? 'group' : m.stage.toLowerCase(),
    }));

    // Filter out TBD/unknown teams — FK violations abort the entire batch
    const validMatchRows = matchRows.filter((m: { home_team_id: string | null; away_team_id: string | null }) =>
      m.home_team_id !== null && m.away_team_id !== null
    );
    const { error: matchUpsertError } = await supabase.from('matches').upsert(validMatchRows, { onConflict: 'id' });
    if (matchUpsertError) console.error('Match upsert error:', matchUpsertError);

    // Recalculate group standings from completed matches
    const completed = validMatchRows.filter((m: { home_score: number | null }) => m.home_score !== null);

    const table: Record<string, {
      team_id: string; group_letter: string;
      played: number; won: number; drawn: number; lost: number;
      goals_for: number; goals_against: number; points: number;
    }> = {};

    const init = (id: string, group: string) => {
      if (!table[id]) table[id] = { team_id: id, group_letter: group, played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0 };
    };

    for (const m of completed) {
      if (!m.group_letter) continue;
      init(m.home_team_id, m.group_letter);
      init(m.away_team_id, m.group_letter);

      const home = table[m.home_team_id];
      const away = table[m.away_team_id];
      const hs = m.home_score as number;
      const as_ = m.away_score as number;

      home.played++; away.played++;
      home.goals_for += hs; home.goals_against += as_;
      away.goals_for += as_; away.goals_against += hs;

      if (hs > as_) { home.won++; home.points += 3; away.lost++; }
      else if (hs < as_) { away.won++; away.points += 3; home.lost++; }
      else { home.drawn++; home.points++; away.drawn++; away.points++; }
    }

    if (Object.keys(table).length > 0) {
      await supabase.from('standings').upsert(Object.values(table), { onConflict: 'team_id' });
    }

    // Fetch top scorers from football-data.org
    const scorersRes = await fetch(
      'https://api.football-data.org/v4/competitions/WC/scorers?season=2026&limit=20',
      { headers: { 'X-Auth-Token': apiKey } }
    );

    let scorersUpdated = 0;
    if (scorersRes.ok) {
      const scorersData = await scorersRes.json();
      const scorers = scorersData.scorers ?? [];

      for (const entry of scorers) {
        const player = entry.player;
        const team = entry.team;
        if (!player?.name) continue;

        const playerId = teamId(player.name);
        const playerTeamId = teamId(team?.name ?? '');
        const goals = entry.goals ?? 0;
        const assists = entry.assists ?? 0;

        // Upsert — creates minimal record if player not in DB, updates stats if they are
        await supabase.from('players').upsert({
          id: playerId,
          name: player.name,
          team_id: playerTeamId || null,
          position: player.position ?? null,
          goals,
          assists,
          is_featured: false,
          image_url: null,
          bio_text: null,
        }, { onConflict: 'id', ignoreDuplicates: false });

        scorersUpdated++;
      }
    }

    return NextResponse.json({
      ok: true,
      matchesUpdated: validMatchRows.length,
      standingsUpdated: Object.keys(table).length,
      scorersUpdated,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
