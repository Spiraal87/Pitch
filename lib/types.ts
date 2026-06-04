export interface Team {
  id: string;
  name: string;
  group_letter: string;
  fifa_rank: number | null;
  bio_text: string | null;
  is_featured: boolean;
  generated_at: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  name: string;
  team_id: string;
  position: string | null;
  age: number | null;
  bio_text: string | null;
  is_featured: boolean;
  goals: number;
  assists: number;
  generated_at: string | null;
  created_at: string;
  team?: Team;
}

export interface Match {
  id: string;
  date: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  group_letter: string | null;
  matchday: number | null;
  stage: string;
  context_line: string | null;
  recap_line: string | null;
  created_at: string;
  home_team?: Team;
  away_team?: Team;
}

export interface Standing {
  team_id: string;
  group_letter: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  status_label: string | null;
  updated_at: string;
  team?: Team;
}

export interface Briefing {
  id: string;
  date: string;
  type: string;
  text: string;
  generated_at: string;
}
