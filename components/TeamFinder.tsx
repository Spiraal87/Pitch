'use client';

import { FormEvent, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { teamSlug } from '@/lib/utils';

interface TeamOption {
  id: string;
  name: string;
}

interface TeamFinderProps {
  teams: TeamOption[];
}

function normalizeTeamName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '');
}

export default function TeamFinder({ teams }: TeamFinderProps) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  function findTeamMatch(value: string) {
    const normalizedQuery = normalizeTeamName(value);
    if (!normalizedQuery) return null;

    const exact = teams.find((team) => normalizeTeamName(team.name) === normalizedQuery);
    if (exact) return exact;

    const startsWith = teams.find((team) => normalizeTeamName(team.name).startsWith(normalizedQuery));
    if (startsWith) return startsWith;

    return teams.find((team) => normalizeTeamName(team.name).includes(normalizedQuery)) ?? null;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const match = findTeamMatch(query);
    if (!match) {
      setError('Try a team name like Brazil, Japan, or USA.');
      return;
    }

    setError('');
    router.push(`/teams/${teamSlug(match.name)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[calc(100%-36px)] mx-auto mt-3 text-left">
      <label htmlFor={listId} className="block font-sans text-[10px] uppercase tracking-[0.10em] text-pitch-ink-light mb-2">
        Find my team
      </label>
      <div className="flex gap-2 items-center">
        <input
          id={listId}
          list={`${listId}-teams`}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError('');
          }}
          placeholder="Search for a team"
          className="flex-1 font-sans text-[16px] bg-pitch-cream border border-pitch-rule rounded-[20px] px-4 py-2 text-pitch-ink placeholder-pitch-ink-light focus:outline-none focus:border-pitch-green-mid"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="font-sans text-[12px] border border-pitch-green text-pitch-green rounded-[20px] px-4 py-2 hover:bg-pitch-green-light transition-colors disabled:opacity-40 whitespace-nowrap"
        >
          Go
        </button>
      </div>
      <datalist id={`${listId}-teams`}>
        {teams.map((team) => (
          <option key={team.id} value={team.name} />
        ))}
      </datalist>
      {error ? (
        <p className="font-sans text-[11px] text-pitch-green-mid mt-2">{error}</p>
      ) : (
        <p className="font-sans text-[11px] text-pitch-ink-light mt-2">
          Start typing and we&apos;ll take you straight to that team page.
        </p>
      )}
    </form>
  );
}
