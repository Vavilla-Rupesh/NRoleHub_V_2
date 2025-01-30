import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Check, X, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTeamAttendance } from '../../../../lib/hooks/useTeamAttendance';
import LoadingSpinner from '../../../shared/LoadingSpinner';
import EmptyState from '../../../shared/EmptyState';
import { cn } from '../../../../lib/utils';

export default function TeamAttendanceManager() {
  const { eventId, subEventId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    teams, 
    loading, 
    markTeamAttendance,
    refreshTeams 
  } = useTeamAttendance(parseInt(eventId), parseInt(subEventId));

  if (loading) return <LoadingSpinner />;

  if (!teams?.length) {
    return (
      <EmptyState
        icon={Users}
        title="No Teams Found"
        message="There are no teams registered for this event yet."
      />
    );
  }

  const filteredTeams = teams.filter(team => 
    team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.TeamMembers?.some(member => 
      member.student?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Attendance</h1>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search teams..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="glass-card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{team.name}</h3>
                <div className="mt-2 space-y-1">
                  {team.TeamMembers?.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {member.student?.username}
                      </span>
                      {member.student_id === team.leader_id && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Leader
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {team.TeamMembers?.length < team.min_team_size && (
                  <div className="mt-2 text-sm text-red-500">
                    Team needs at least {team.min_team_size} members to mark attendance
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm",
                  team.attendance
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                )}>
                  {team.attendance ? 'Present' : 'Absent'}
                </span>
                <button
                  onClick={() => markTeamAttendance(team.id, !team.attendance)}
                  disabled={team.TeamMembers?.length < team.min_team_size}
                  className={cn(
                    "btn btn-secondary",
                    team.TeamMembers?.length < team.min_team_size && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {team.attendance ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}