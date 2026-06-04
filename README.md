# Pitch

**Understand the game.**

Pitch is a soccer intelligence app for casual fans who want context, not just scores. The goal is to make any soccer competition — any league, any tournament, anywhere in the world — immediately understandable to someone who doesn't follow the sport closely.

**v1 is focused on the 2026 FIFA World Cup** (June 11 – July 19, hosted across the USA, Canada, and Mexico). Plain English team stories, player bios, match context, and an AI assistant that answers any question about the tournament in real time.

---

## What it does

- **Pre-tournament mode** — teams to watch, underdogs, format explainer, groups at a glance, full fixture schedule
- **Live tournament mode** — today's matches, yesterday's results, upcoming fixtures, all 12 group standings, tournament leaders (goals, assists, clean sheets)
- **Team pages** — AI-generated bios, key players, fixtures, group standing
- **Player pages** — AI-generated bios, stats, team context
- **Schedule** — all 104 fixtures, filterable by group or team name
- **Ask Pitch** — a persistent AI assistant (Claude) that answers any question about the tournament in plain English, with streaming responses
- **Daily briefing** — a plain English tournament overview generated each morning

The home page automatically switches from pre-tournament to live dashboard on June 11, 2026.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS with custom design system |
| Database | Supabase (Postgres) |
| AI | Anthropic Claude API (Haiku 4.5 for background jobs, Sonnet 4.6 for ask bar) |
| Sports data | football-data.org |
| Hosting | Vercel |
| Cron | Vercel Cron Jobs (6am ET daily) |

---

## Getting started

```bash
git clone https://github.com/Spiraal87/Pitch.git
cd Pitch
npm install
cp .env.local.example .env.local  # fill in all values
```

Run `supabase/schema.sql` in the Supabase SQL editor, then seed:

```bash
npm run seed        # teams, players, fixtures, AI bios
npm run expand      # bios for all 48 teams + 40 more players
npm run fixtures    # re-fetch fixtures only
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Add `?live=1` to preview the live dashboard before June 11.

Deploy to Vercel — add env vars and the `vercel.json` cron handles daily score syncing automatically.

---

## Project structure

```
app/
  page.tsx              # Home — pre-tournament + live dashboard (auto-switches Jun 11)
  groups/               # All 12 groups grid
  groups/[group]/       # Group detail: standings table + fixtures
  teams/[slug]/         # Team page: bio, players, matches, standing
  players/[slug]/       # Player page: bio, stats, team card
  schedule/             # Full 104-match schedule with search + group filter
  briefing/             # Daily AI tournament briefing
  api/ask/              # Streaming Claude endpoint for AskBar
  api/sync/             # Daily cron: fetch scores, update standings, generate briefing
  api/generate/         # Admin: trigger AI content regeneration

components/
  Masthead.tsx           # "Pitch" brand header (sticky)
  WorldCupBanner.tsx     # Section identifier below masthead
  PageNav.tsx            # Scroll-aware horizontal anchor nav
  AskBar.tsx             # Persistent AI question bar (bottom of every page)
  MatchCard.tsx          # Full + compact match card variants
  PlayerCard.tsx         # Player bio row with gradient avatar
  GroupCard.tsx          # Compact group standings card
  AllGroupsStandings.tsx # All 12 groups grid with GD column
  TournamentLeaders.tsx  # Goals / assists / clean sheets leaderboard
  UpcomingMatches.tsx    # Next 2 days of fixtures
  ScheduleClient.tsx     # Client-side schedule with live search + filter

lib/
  supabase.ts            # Supabase client (anon + service role)
  types.ts               # TypeScript interfaces
  utils.ts               # Date helpers, slug generation, tournament state
  venues.ts              # Hardcoded venue lookup for all 104 fixtures

scripts/
  seed.ts                # Initial database seed
  expand-content.ts      # Extended team + player bios
  fetch-fixtures.ts      # Standalone fixture fetch/resync
```

---

## Design system

Pitch is designed to feel like a matchday programme that lives on your phone — editorial and considered, not an ESPN dashboard.

- **Fonts**: Playfair Display (serif) for section headings, Inter (sans-serif) for everything else
- **Palette**: Forest green `#2D5016` as the primary accent, warm cream `#FAFAF7` background, near-black `#1A1A18` text
- **Rules**: No gradients, no decorative shadows, generous whitespace, content-forward layout

Custom Tailwind tokens are under the `pitch` namespace in `tailwind.config.ts`. CSS variables are in `app/globals.css`.

---

## Roadmap

v1 is the 2026 World Cup. The longer-term vision for Pitch is a comprehensive soccer intelligence platform covering major leagues and tournaments worldwide — same editorial approach, same AI-powered context, expanded to the full sport.
