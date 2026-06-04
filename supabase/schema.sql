-- Pitch: 2026 FIFA World Cup app schema

create table if not exists teams (
  id text primary key,
  name text not null,
  group_letter text,
  fifa_rank integer,
  bio_text text,
  is_featured boolean default false,
  generated_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists players (
  id text primary key,
  name text not null,
  team_id text references teams(id),
  position text,
  age integer,
  bio_text text,
  is_featured boolean default false,
  goals integer default 0,
  assists integer default 0,
  generated_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists matches (
  id text primary key,
  date timestamptz not null,
  home_team_id text references teams(id),
  away_team_id text references teams(id),
  home_score integer,
  away_score integer,
  group_letter text,
  matchday integer,
  stage text default 'group',
  context_line text,
  recap_line text,
  created_at timestamptz default now()
);

create table if not exists standings (
  team_id text references teams(id),
  group_letter text,
  played integer default 0,
  won integer default 0,
  drawn integer default 0,
  lost integer default 0,
  goals_for integer default 0,
  goals_against integer default 0,
  points integer default 0,
  status_label text,
  updated_at timestamptz default now(),
  primary key (team_id)
);

create table if not exists briefings (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  type text not null,
  text text not null,
  generated_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists matches_date_idx on matches(date);
create index if not exists matches_group_idx on matches(group_letter);
create index if not exists standings_group_idx on standings(group_letter);
create index if not exists players_team_idx on players(team_id);
create index if not exists players_featured_idx on players(is_featured);
create index if not exists teams_featured_idx on teams(is_featured);
