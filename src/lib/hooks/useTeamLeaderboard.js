import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export function useTeamLeaderboard(eventId, subEventId) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [eligibleTeams, setEligibleTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (eventId && subEventId) {
      fetchLeaderboard();
    }
  }, [eventId, subEventId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // First get all teams for this event/subevent
      const teamsResponse = await api.get('/teams/search', {
        params: { event_id: eventId, subevent_id: subEventId }
      });

      // Get attendance records for all teams
      const attendancePromises = teamsResponse.data.map(team => 
        api.get(`/teams/${team.id}/attendance`)
          .catch(() => ({ data: { attendance: false } }))
      );

      const attendanceResponses = await Promise.all(attendancePromises);

      // Filter teams that have attendance marked as present
      const teamsWithAttendance = teamsResponse.data.filter((team, index) => 
        attendanceResponses[index].data?.attendance === true
      );

      setEligibleTeams(teamsWithAttendance);

      if (teamsWithAttendance.length > 0) {
        // Get leaderboard entries for eligible teams
        const leaderboardResponse = await api.get(`/teams/leaderboard/${eventId}/${subEventId}`);
        
        // Sort by rank and get top 3
        const leaderboardData = leaderboardResponse.data
          .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity))
          .slice(0, 3)
          .map((entry, index) => ({
            ...entry,
            rank: entry.rank || index + 1,
            Team: teamsWithAttendance.find(team => team.id === entry.team_id)
          }))
          .filter(entry => entry.Team); // Only include entries that have matching teams

        setLeaderboard(leaderboardData);
      } else {
        setLeaderboard([]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Failed to fetch team leaderboard:', error);
      setError('Failed to fetch team leaderboard');
      toast.error('Failed to fetch team leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamScore = async (teamId, score) => {
    try {
      await api.post('/teams/leaderboard', {
        teamId,
        eventId,
        subEventId,
        score
      });
      await fetchLeaderboard();
      toast.success('Team score updated successfully');
    } catch (error) {
      toast.error('Failed to update team score');
      throw error;
    }
  };

  const editWinners = async (winners) => {
    try {
      setLoading(true);
      await api.put('/teams/leaderboard/winners', {
        eventId,
        subEventId,
        winners
      });
      await fetchLeaderboard();
      toast.success('Team winners updated and individual scores synced successfully');
    } catch (error) {
      toast.error('Failed to update winners');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    leaderboard,
    eligibleTeams,
    loading,
    error,
    updateTeamScore,
    editWinners,
    refreshLeaderboard: fetchLeaderboard
  };
}