import { supabase } from '@/lib/supabase';
import { isTournamentLive, teamSlug } from '@/lib/utils';
import { Player, Match, Standing, Team } from '@/lib/types';
import Masthead from '@/components/Masthead';
import SectionFlag from '@/components/SectionFlag';
import AskBar from '@/components/AskBar';
import MatchCard from '@/components/MatchCard';
import PlayerCard from '@/components/PlayerCard';
import GroupCard from '@/components/GroupCard';
import UpcomingMatches from '@/components/UpcomingMatches';
import AllGroupsStandings from '@/components/AllGroupsStandings';
import TournamentLeaders from '@/components/TournamentLeaders';
import PageNav from '@/components/PageNav';
import WorldCupBanner from '@/components/WorldCupBanner';
import TeamFinder from '@/components/TeamFinder';
import FaqAccordion from '@/components/FaqAccordion';
import Link from 'next/link';

const FEATURED_TEAM_ORDER = ['Spain', 'Argentina', 'France', 'Brazil', 'England', 'Norway'];


const TEAM_NARRATIVES: Record<string, { label: string; body: string }> = {
  Spain: {
    label: 'Favorites',
    body: 'Spain are built around 18-year-old Lamine Yamal, arguably the most exciting teenager in world football. Reigning European champions, technically brilliant, and terrifyingly deep. Watch whether their youth can hold up when knockout pressure arrives.',
  },
  Argentina: {
    label: 'Defending champions',
    body: "Messi's final World Cup felt like fate in 2022 — this one is the victory lap. Argentina arrive as the team to beat, with a settled squad built around their greatest ever player. The question isn't if they'll go deep; it's who can stop them.",
  },
  France: {
    label: 'Contenders',
    body: "Les Bleus have the most individually gifted squad in the tournament. Mbappé, Griezmann, Camavinga — names that mean something even if you've never watched a match. They've come close twice in a row and this feels like their moment.",
  },
  Brazil: {
    label: 'The entertainers',
    body: "It's been over two decades since Brazil won a World Cup, an eternity for the most successful nation in tournament history. Vinicius Jr is the talisman — electric, unpredictable, impossible to stop when he's on. The pressure of a nation rides with them.",
  },
  England: {
    label: 'The nearly men',
    body: "England have been heartbreakingly close in back-to-back major tournaments. This squad is genuinely world class — Saka, Bellingham, Kane — but can they finally get over the line? The nation oscillates between belief and bracing for disappointment.",
  },
  Norway: {
    label: 'Outsiders worth watching',
    body: "Norway haven't been to a World Cup since 1998, and they got here almost entirely because of Erling Haaland. The world's best striker, playing at his first World Cup, with everything to prove. Pure sporting storyline.",
  },
};

const FLAG_CODES: Record<string, string> = {
  Spain: 'es', Argentina: 'ar', France: 'fr', Brazil: 'br',
  England: 'gb-eng', Norway: 'no', Morocco: 'ma', USA: 'us',
  Japan: 'jp', Senegal: 'sn', Croatia: 'hr',
};

const UNDERDOG_ORDER = ['Morocco', 'USA', 'Japan', 'Senegal', 'Croatia'];

const UNDERDOG_NARRATIVES: Record<string, { label: string; body: string }> = {
  Morocco: {
    label: 'Africa\'s finest',
    body: "In 2022 they became the first African nation to reach a World Cup semi-final. That wasn't a fluke — this is a well-organised, defensively superb team that nobody enjoys playing. The question is whether they can go one better.",
  },
  USA: {
    label: 'Home advantage',
    body: "Playing on home soil for the first time since 1994, and this US squad is the most talented in a generation. Pulisic, Reyna, McKennie — genuinely good players, not just hopeful ones. The crowd will carry them further than their ranking suggests.",
  },
  Japan: {
    label: 'The giant killers',
    body: "Japan keep doing things they're not supposed to do. They beat Germany and Spain in 2022. They press relentlessly, defend as a unit, and play without fear. Don't look away when they're on.",
  },
  Senegal: {
    label: 'Mané\'s redemption',
    body: "Sadio Mané missed the 2022 World Cup through injury — one of the cruelest moments in recent tournament history. He's back, he's hungry, and Senegal have the defensive organisation to go deep if the attack clicks.",
  },
  Croatia: {
    label: 'Last dance',
    body: "Luka Modrić is 40 years old and still running midfields. Croatia have punched above their weight for a decade on his back. This will almost certainly be his final World Cup, and he has a habit of saving his best for the biggest stages.",
  },
};

const HOW_IT_WORKS = [
  {
    label: 'The format',
    body: "48 teams are split into 12 groups of 4. Each team plays the other 3 once. The top two from each group advance — that's 24 teams into a knockout bracket. Win or go home from there.",
  },
  {
    label: 'Why 48 teams?',
    body: "FIFA expanded the tournament from 32 teams for 2026. More nations, more stories, more upsets. Critics say it waters down the group stage; fans say it brings in the whole world. You'll have a view by the end.",
  },
];

const GENERAL_FAQ = [
  {
    label: 'When is the 2026 World Cup?',
    body: 'The tournament begins on June 11, 2026 and runs through the final in July. It is the first men\'s World Cup with 48 teams.',
  },
  {
    label: 'Where is it being played?',
    body: 'The 2026 World Cup is co-hosted by the United States, Canada, and Mexico. Matches will be spread across host cities in all three countries.',
  },
  {
    label: 'How do teams advance?',
    body: 'Each team plays three group-stage matches. The top two teams in every group, plus the eight best third-place teams, move on to the knockout rounds.',
  },
  ...HOW_IT_WORKS.map((item) => ({
    label: item.label === 'The format' ? 'What is the World Cup format?' : item.label,
    body: item.body,
  })),
  {
    label: 'Why does this World Cup feel different?',
    body: 'It is the biggest World Cup ever, with more teams, more host cities, and more matches than any previous edition. That means more underdogs, more travel, and a much wider range of storylines.',
  },
];

async function getHomeData(forceLive = false) {
  const live = isTournamentLive() || forceLive;

  // Preview mode: use real DB data but mark as live so TournamentHome renders
  if (forceLive && !isTournamentLive()) {
    const [standingsRes, upcomingRes, playersRes] = await Promise.all([
      supabase.from('standings').select('*, team:teams(*)').order('group_letter').order('points', { ascending: false }),
      supabase.from('matches').select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)').gte('date', new Date().toISOString()).order('date').limit(12),
      supabase.from('players').select('*, team:teams(*)').eq('is_featured', true).limit(10),
    ]);
    return {
      live: true,
      teams: [],
      standings: standingsRes.data ?? [],
      todayMatches: [],
      yesterdayMatches: [],
      upcomingMatches: upcomingRes.data ?? [],
      topPlayers: [],
      players: playersRes.data ?? [],
    };
  }

  if (!live) {
    const [teamsRes, standingsRes, playersRes] = await Promise.all([
      supabase
        .from('teams')
        .select('id, name, group_letter, fifa_rank, bio_text, is_featured, generated_at, created_at')
        .order('name'),
      supabase
        .from('standings')
        .select('*, team:teams(*)')
        .in('group_letter', ['A', 'B', 'C', 'D']),
      supabase
        .from('players')
        .select('*, team:teams(*)')
        .eq('is_featured', true)
        .in('id', ['lionel-messi', 'erling-haaland', 'kylian-mbappe', 'lamine-yamal', 'vinicius-jr', 'cristiano-ronaldo', 'jude-bellingham', 'bukayo-saka', 'christian-pulisic', 'harry-kane'])
        .limit(10),
    ]);

    return {
      live,
      teams: teamsRes.data ?? [],
      standings: standingsRes.data ?? [],
      todayMatches: [],
      yesterdayMatches: [],
      players: playersRes.data ?? [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const threeDaysOut = new Date(today);
  threeDaysOut.setDate(today.getDate() + 4);

  const [teamsRes, todayRes, yesterdayRes, upcomingRes, allStandingsRes, topPlayersRes, playersRes] = await Promise.all([
    supabase
      .from('teams')
      .select('id, name, group_letter, fifa_rank, bio_text, is_featured, generated_at, created_at')
      .order('name'),
    supabase
      .from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .order('date'),
    supabase
      .from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
      .gte('date', yesterday.toISOString())
      .lt('date', today.toISOString())
      .order('date'),
    supabase
      .from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
      .gte('date', tomorrow.toISOString())
      .lte('date', threeDaysOut.toISOString())
      .order('date')
      .limit(12),
    supabase
      .from('standings')
      .select('*, team:teams(*)')
      .order('group_letter')
      .order('points', { ascending: false }),
    supabase
      .from('players')
      .select('id, name, position, image_url, goals, assists, team:teams(name, group_letter)')
      .or('goals.gt.0,assists.gt.0')
      .order('goals', { ascending: false })
      .limit(20),
    supabase
      .from('players')
      .select('id, name, position, image_url, age, bio_text, team:teams(*)')
      .eq('is_featured', true)
      .limit(10),
  ]);

  return {
    live,
    teams: teamsRes.data ?? [],
    standings: allStandingsRes.data ?? [],
    todayMatches: todayRes.data ?? [],
    yesterdayMatches: yesterdayRes.data ?? [],
    upcomingMatches: upcomingRes.data ?? [],
    topPlayers: topPlayersRes.data ?? [],
    players: playersRes.data ?? [],
  };
}

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: { live?: string } }) {
  const forceLive = searchParams.live === '1';
  const data = await getHomeData(forceLive);
  const isLive = data.live;
  const isPreview = forceLive && !data.live;

  return (
    <>
      {(isLive || forceLive)
        ? <TournamentHome data={data} isPreview={isPreview} />
        : <PreTournamentHome data={data} />
      }
    </>
  );
}

function PreTournamentHome({ data }: { data: Awaited<ReturnType<typeof getHomeData>> }) {
  const allTeams = data.teams as Team[];

  const standingsByGroup = (data.standings as Standing[]).reduce<Record<string, Standing[]>>(
    (acc, s) => {
      const g = s.group_letter ?? 'A';
      if (!acc[g]) acc[g] = [];
      acc[g].push(s);
      return acc;
    },
    {}
  );

  return (
    <>
      <Masthead />
      <WorldCupBanner />
      <div className="max-w-[640px] mx-auto">
        <PageNav items={[
          { label: 'Teams to watch', href: '#teams' },
          { label: 'Players', href: '#players' },
          { label: 'Underdogs', href: '#underdogs' },
          { label: 'FAQ', href: '#faq' },
          { label: 'Groups', href: '#groups' },
          { label: 'Schedule', href: '/schedule' },
          { label: 'Knockout', href: '/knockout' },
        ]} />
      </div>
      <main className="max-w-[640px] mx-auto pb-52">
        {/* Hero */}
        <div className="px-[18px] py-6 text-center">
          <div className="mb-6">
            <p className="font-serif text-[25px] font-semibold leading-[1.12] text-pitch-ink">
              48 teams. 3 host nations. One trophy.
            </p>
            <p className="mt-2 font-sans text-[14px] font-semibold leading-[1.45] text-pitch-green-mid">
              Here&apos;s everything you need to understand what&apos;s happening.
            </p>
          </div>
          <Link
            href="/briefing"
            className="group block w-full max-w-[calc(100%-36px)] mx-auto bg-pitch-green text-white font-sans text-[13px] font-medium py-3 rounded-lg hover:bg-pitch-green-mid hover:shadow-md hover:-translate-y-0.5 transition-all text-center active:scale-95"
          >
            Get me up to speed{' '}
            <span className="inline-block opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              →
            </span>
          </Link>
          <TeamFinder teams={allTeams} />
        </div>

        <div className="border-t border-pitch-rule" />

        <div className="mx-[18px] mb-4 bg-pitch-green-light/50 border border-pitch-green-light rounded-lg p-4">
          <p className="font-sans text-[11px] uppercase tracking-[0.10em] text-pitch-green font-medium mb-1">
            Live from June 11, 2026
          </p>
          <p className="font-sans text-[13px] text-pitch-ink-mid leading-[1.6] mb-3">
            Scores, standings, match recaps, and daily briefings go live when the tournament starts. Preview the experience now.
          </p>
          <Link
            href="/?live=1"
            className="block w-full text-center bg-pitch-white text-pitch-green border-2 border-pitch-green font-sans text-[13px] font-medium py-2.5 rounded-lg hover:bg-pitch-green-light/50 transition-colors active:scale-95"
          >
            Preview the live experience →
          </Link>
        </div>

        <div className="border-t-2 border-pitch-rule" />

        {/* Teams to watch */}
        <div id="teams" />
        <SectionFlag label="Teams to watch" linkText="All teams" linkHref="/teams" />
        <div className="px-[18px] pb-6">
          <div className="grid grid-cols-2 gap-3">
            {FEATURED_TEAM_ORDER.map((name) => {
              const narrative = TEAM_NARRATIVES[name];
              if (!narrative) return null;
              return (
                <Link key={name} href={`/teams/${teamSlug(name)}`}>
                  <div className="border border-pitch-rule rounded-lg p-4 hover:border-pitch-green hover:bg-[#F0F5EA] transition-colors flex flex-col justify-between min-h-[84px]">
                    <p className="font-sans text-[10px] uppercase font-medium tracking-[0.06em] text-pitch-green-mid mb-2">
                      {narrative.label}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        {FLAG_CODES[name] && (
                          <span className={`fi fi-${FLAG_CODES[name]}`} style={{ fontSize: '14px', lineHeight: 1 }} />
                        )}
                        <p className="font-sans text-[14px] font-medium text-pitch-ink leading-tight">{name}</p>
                      </div>
                      <span className="text-pitch-green text-[12px] flex-shrink-0">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t-2 border-pitch-rule mt-2" />

        {/* Players to know */}
        <div id="players" />
        <SectionFlag label="Players to know" linkText="All players" linkHref="/players" />
        {(data.players as Player[]).slice(0, 3).map((p) => (
          <PlayerCard key={p.id} player={p} showTeam />
        ))}
        {data.players.length === 0 && (
          <p className="px-[18px] py-3 font-sans text-[13px] text-pitch-ink-light border-b border-pitch-rule">
            Player profiles coming soon.
          </p>
        )}

        <div className="border-t-2 border-pitch-rule mt-6" />

        {/* Underdogs to watch */}
        <div id="underdogs" />
        <SectionFlag label="Underdogs to watch" />
        <div className="px-[18px] pb-6">
          <div className="grid grid-cols-2 gap-3">
            {UNDERDOG_ORDER.map((name) => {
              const narrative = UNDERDOG_NARRATIVES[name];
              if (!narrative) return null;
              return (
                <Link key={name} href={`/teams/${teamSlug(name)}`}>
                  <div className="border border-pitch-rule rounded-lg p-4 hover:border-pitch-green hover:bg-[#F0F5EA] transition-colors flex flex-col justify-between min-h-[84px]">
                    <p className="font-sans text-[10px] uppercase font-medium tracking-[0.06em] text-pitch-green-mid mb-2">
                      {narrative.label}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        {FLAG_CODES[name] && (
                          <span className={`fi fi-${FLAG_CODES[name]}`} style={{ fontSize: '14px', lineHeight: 1 }} />
                        )}
                        <p className="font-sans text-[14px] font-medium text-pitch-ink leading-tight">{name}</p>
                      </div>
                      <span className="text-pitch-green text-[12px] flex-shrink-0">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t-2 border-pitch-rule mt-2" />

        {/* Groups at a glance */}
        <div id="groups" />
        <SectionFlag label="Groups at a glance" linkText="All groups" linkHref="/groups" />
        <div className="px-[18px] pb-6">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(standingsByGroup).slice(0, 4).map(([group, standings]) => (
              <GroupCard key={group} group={group} standings={standings} showFavorite />
            ))}
          </div>
          {Object.keys(standingsByGroup).length === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {['A', 'B', 'C', 'D'].map((g) => (
                <Link key={g} href={`/groups/${g.toLowerCase()}`}>
                  <div className="bg-pitch-cream border border-pitch-rule rounded-lg p-3 hover:border-pitch-green-accent transition-colors">
                    <p className="font-sans text-[10px] uppercase font-medium tracking-[0.08em] text-pitch-green-mid mb-2">
                      Group {g}
                    </p>
                    <p className="font-sans text-[12px] text-pitch-ink-light">View group →</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <FaqSection />
      </main>
      <AskBar placeholder="Who should I watch? What's at stake?" />
    </>
  );
}

function TournamentHome({ data, isPreview }: { data: Awaited<ReturnType<typeof getHomeData>>; isPreview?: boolean }) {
  const completedMatches = [...(data.todayMatches as Match[]), ...(data.yesterdayMatches as Match[])].filter(
    (m) => m.home_score !== null
  );
  const allTeams = data.teams as Team[];

  return (
    <>
      <Masthead />
      <WorldCupBanner />
      <div className="max-w-[640px] mx-auto">
        <PageNav items={[
          { label: 'Today', href: '#today' },
          { label: 'Up next', href: '#upcoming' },
          { label: 'Standings', href: '#standings' },
          { label: 'Leaders', href: '#leaders' },
          { label: 'Players', href: '#players' },
          { label: 'Underdogs', href: '#underdogs' },
          { label: 'Teams', href: '#teams' },
          { label: 'Schedule', href: '/schedule' },
          { label: 'Knockout', href: '/knockout' },
          { label: 'FAQs', href: '#how' },
        ]} />
      </div>
      <main className="max-w-[640px] mx-auto pb-52">
        {/* Preview banner */}
        {isPreview && (
          <div className="mx-[18px] mt-4 bg-pitch-green-light/60 border border-pitch-green-light rounded-lg px-4 py-3 flex items-start gap-3">
            <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-pitch-green font-medium whitespace-nowrap mt-0.5">June 11</span>
            <p className="font-sans text-[12px] text-pitch-ink-mid leading-[1.5]">
              This is a preview of the live experience. Scores, standings, and recaps will update automatically once the tournament kicks off on June 11.{' '}
              <a href="/" className="text-pitch-green hover:text-pitch-green-mid underline">← Back to home</a>
            </p>
          </div>
        )}

        {/* Catch me up */}
        <div className="px-[18px] pt-4 pb-2">
          <Link
            href="/briefing"
            className="block w-full bg-pitch-green text-white font-sans text-[13px] font-medium py-3 rounded-lg hover:bg-pitch-green-mid transition-colors text-center"
          >
            Catch me up
          </Link>
          <TeamFinder teams={allTeams} />
        </div>

        {/* Today's matches */}
        <div id="today" />
        <SectionFlag label="Today's matches" />
        {data.todayMatches.length > 0 ? (
          (data.todayMatches as Match[]).map((m) => <MatchCard key={m.id} match={m} />)
        ) : (
          <p className="px-[18px] py-3 font-sans text-[13px] text-pitch-ink-light border-b border-pitch-rule">
            No matches today.
          </p>
        )}

        {/* Yesterday's results */}
        <div className="border-t-2 border-pitch-rule mt-4" />
        <SectionFlag label="Yesterday's results" />
        {data.yesterdayMatches.length > 0 ? (
          (data.yesterdayMatches as Match[]).map((m) => <MatchCard key={m.id} match={m} compact />)
        ) : (
          <p className="px-[18px] py-3 font-sans text-[13px] text-pitch-ink-light border-b border-pitch-rule">
            No results yet.
          </p>
        )}

        {/* Up next */}
        <div id="upcoming" />
        <div className="border-t-2 border-pitch-rule mt-4" />
        <SectionFlag label="Up next" linkText="Full schedule" linkHref="/schedule" />
        {(data as { upcomingMatches?: Match[] }).upcomingMatches?.length ? (
          <UpcomingMatches matches={(data as { upcomingMatches: Match[] }).upcomingMatches} />
        ) : (
          <p className="px-[18px] py-3 font-sans text-[13px] text-pitch-ink-light border-b border-pitch-rule">
            No upcoming fixtures in the next few days.
          </p>
        )}

        {/* All group standings */}
        <div id="standings" />
        <div className="border-t-2 border-pitch-rule mt-4" />
        <SectionFlag label="Group standings" linkText="All groups" linkHref="/groups" />
        {data.standings.length > 0 ? (
          <AllGroupsStandings standings={data.standings as Standing[]} />
        ) : (
          <p className="px-[18px] py-3 font-sans text-[13px] text-pitch-ink-light border-b border-pitch-rule">
            Standings will update as matches are played.
          </p>
        )}

        {/* Tournament leaders */}
        <div id="leaders" />
        <>
          <div className="border-t-2 border-pitch-rule mt-4" />
          <SectionFlag label="Tournament leaders" />
          <TournamentLeaders
            topPlayers={(data as { topPlayers?: [] }).topPlayers ?? []}
            completedMatches={completedMatches}
          />
        </>

        {/* Players to know */}
        <div id="players" />
        {data.players.length > 0 && (
          <>
            <div className="border-t-2 border-pitch-rule mt-4" />
            <SectionFlag label="Players to know" linkText="All players" linkHref="/players" />
            {(data.players as Player[]).map((p) => (
              <PlayerCard key={p.id} player={p} showTeam />
            ))}
          </>
        )}

        {/* Underdogs to watch */}
        <div id="underdogs" />
        <div className="border-t-2 border-pitch-rule mt-6" />
        <SectionFlag label="Underdogs to watch" />
        <div className="px-[18px] pb-6">
          <div className="grid grid-cols-2 gap-3">
            {UNDERDOG_ORDER.map((name) => {
              const narrative = UNDERDOG_NARRATIVES[name];
              if (!narrative) return null;
              return (
                <Link key={name} href={`/teams/${teamSlug(name)}`}>
                  <div className="border border-pitch-rule rounded-lg p-4 hover:border-pitch-green hover:bg-[#F0F5EA] transition-colors flex flex-col justify-between min-h-[84px]">
                    <p className="font-sans text-[10px] uppercase font-medium tracking-[0.06em] text-pitch-green-mid mb-2">
                      {narrative.label}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        {FLAG_CODES[name] && (
                          <span className={`fi fi-${FLAG_CODES[name]}`} style={{ fontSize: '14px', lineHeight: 1 }} />
                        )}
                        <p className="font-sans text-[14px] font-medium text-pitch-ink leading-tight">{name}</p>
                      </div>
                      <span className="text-pitch-green text-[12px] flex-shrink-0">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Teams to watch */}
        <div id="teams" />
        <div className="border-t-2 border-pitch-rule mt-2" />
        <SectionFlag label="Teams to watch" linkText="All teams" linkHref="/teams" />
        <div className="px-[18px] pb-6">
          <div className="grid grid-cols-2 gap-3">
            {FEATURED_TEAM_ORDER.map((name) => {
              const narrative = TEAM_NARRATIVES[name];
              if (!narrative) return null;
              return (
                <Link key={name} href={`/teams/${teamSlug(name)}`}>
                  <div className="border border-pitch-rule rounded-lg p-4 hover:border-pitch-green hover:bg-[#F0F5EA] transition-colors flex flex-col justify-between min-h-[84px]">
                    <p className="font-sans text-[10px] uppercase font-medium tracking-[0.06em] text-pitch-green-mid mb-2">
                      {narrative.label}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        {FLAG_CODES[name] && (
                          <span className={`fi fi-${FLAG_CODES[name]}`} style={{ fontSize: '14px', lineHeight: 1 }} />
                        )}
                        <p className="font-sans text-[14px] font-medium text-pitch-ink leading-tight">{name}</p>
                      </div>
                      <span className="text-pitch-green text-[12px] flex-shrink-0">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <FaqSection />
      </main>
      <AskBar />
    </>
  );
}

function FaqSection() {
  return (
    <>
      <div id="faq" />
      <div className="border-t-2 border-pitch-rule mt-6" />
      <SectionFlag label="World Cup FAQ" />
      <FaqAccordion items={GENERAL_FAQ} />
    </>
  );
}
