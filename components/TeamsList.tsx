'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Team } from '@/lib/types';
import Flag from '@/components/Flag';
import { teamSlug } from '@/lib/utils';

interface TeamsListProps {
  teams: Team[];
}

export default function TeamsList({ teams }: TeamsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const query = searchQuery.toLowerCase();
    return teams.filter((team) =>
      team.name.toLowerCase().includes(query) ||
      (team.fifa_rank && team.fifa_rank.toString().includes(query))
    );
  }, [teams, searchQuery]);

  return (
    <>
      {/* Search Input */}
      <div className="px-[18px] pb-4 pt-2">
        <input
          type="text"
          placeholder="Search teams by name or FIFA rank..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-pitch-white border border-pitch-rule rounded-lg font-sans text-[14px] text-pitch-ink placeholder-pitch-ink-light focus:outline-none focus:border-pitch-green focus:ring-2 focus:ring-pitch-green/10"
        />
      </div>

      {/* Teams Grid */}
      <div className="px-[18px] pb-6">
        <div className="grid grid-cols-2 gap-3">
          {filteredTeams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${teamSlug(team.name)}`}
              className="flex flex-col items-center justify-center px-3 py-4 bg-pitch-white border border-pitch-rule rounded-lg hover:bg-[#F0F5EA] hover:border-pitch-green transition-colors cursor-pointer text-center"
            >
              <Flag name={team.name} size="md" />
              <p className="font-sans text-[13px] font-medium text-pitch-ink mt-2">
                {team.name}
              </p>
              {team.fifa_rank && (
                <p className="font-sans text-[10px] text-pitch-ink-light mt-1">
                  FIFA #{team.fifa_rank}
                </p>
              )}
            </Link>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <p className="text-center py-8 font-sans text-[13px] text-pitch-ink-light">
            No teams found matching &quot;{searchQuery}&quot;
          </p>
        )}
      </div>
    </>
  );
}
