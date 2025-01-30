import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export function useTeamAttendance(eventId, subEventId) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (eventId && subEventId) {
      fetchTeams();
    }
  }, [eventId, subEventId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      // Get teams with their members
      const teamsResponse = await api.get('/teams/search', {
        params: { event_id: eventId, subevent_id: subEventId }
      });
      console.log(teamsResponse.data);
      // Get attendance records for all teams
      const attendancePromises = teamsResponse.data.map(team => 
        api.get(`/teams/${team.id}/attendance`)
          .catch(() => ({ data: { attendance: false } })) // Default to false if no attendance record
      );

      const attendanceResponses = await Promise.all(attendancePromises);

      // Merge team data with attendance status
      const teamsWithAttendance = teamsResponse.data.map((team, index) => ({
        ...team,
        attendance: attendanceResponses[index].data?.attendance || false
      }));

      setTeams(teamsWithAttendance);
      setError(null);
    } catch (error) {
      setError('Failed to fetch teams');
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const markTeamAttendance = async (teamId, present = false) => {
    try {
      const response = await api.put(`/teams/${teamId}/attendance`, { present });
      
      if (response.data.success) {
        setTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === teamId 
              ? { ...team, attendance: present }
              : team
          )
        );
        toast.success(`Team attendance marked as ${present ? 'present' : 'absent'}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark team attendance';
      toast.error(errorMessage);
    }
  };

  return {
    teams,
    loading,
    error,
    markTeamAttendance,
    refreshTeams: fetchTeams
  };
}
