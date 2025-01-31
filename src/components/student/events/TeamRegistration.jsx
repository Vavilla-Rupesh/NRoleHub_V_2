import React, { useState, useEffect } from 'react';
import { Search, Users, UserPlus, X, AlertCircle, Check, Clock, Ban } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function TeamRegistration({ 
  isOpen, 
  onClose, 
  eventId, 
  subEventId, 
  minTeamSize, 
  maxTeamSize 
}) {
  const { user } = useAuth();
  const [mode, setMode] = useState('select');
  const [teamName, setTeamName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myTeam, setMyTeam] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myTeamStatus, setMyTeamStatus] = useState({
    hasPendingRequest: false,
    rejectedTeams: [],
    currentTeamId: null
  });

  useEffect(() => {
    checkRegistrationStatus();
    checkExistingTeam();
    checkTeamStatus();
  }, [eventId, subEventId]);

  useEffect(() => {
    if (myTeam?.leader_id === user.id) {
      fetchPendingRequests();
    }
  }, [myTeam]);

  const checkTeamStatus = async () => {
    try {
      const response = await api.get(`/teams/status/${eventId}/${subEventId}`);
      setMyTeamStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch team status:', error);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await api.get('/registrations/my-registrations');
      const registration = response.data.find(
        reg => 
          reg.event_id === parseInt(eventId) && 
          reg.subevent_id === parseInt(subEventId) && 
          reg.payment_status === 'paid'
      );
      setHasPaid(!!registration);
    } catch (error) {
      console.error('Failed to check registration status:', error);
    }
  };

  const checkExistingTeam = async () => {
    try {
      const response = await api.get(`/teams/my-team/${eventId}/${subEventId}`);
      if (response.data) {
        setMyTeam(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch team:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/teams/requests');
      const filteredRequests = response.data.filter(req => 
        req.event_id === parseInt(eventId) && 
        req.subevent_id === parseInt(subEventId)
      );
      setPendingRequests(filteredRequests);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!hasPaid) {
      toast.error('Please register and complete payment first');
      return;
    }

    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      setLoading(true);
      await api.post('/teams/create', {
        name: teamName,
        event_id: parseInt(eventId),
        subevent_id: parseInt(subEventId)
      });
      toast.success('Team created successfully!');
      await checkExistingTeam();
      await checkTeamStatus();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTeams = async () => {
    if (!hasPaid) {
      toast.error('Please register and complete payment first');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/teams/search', {
        params: {
          event_id: parseInt(eventId),
          subevent_id: parseInt(subEventId),
          search:searchTerm
        }
      });
      
      // Filter out teams that have rejected the user and teams that are full
      const filteredResults = response.data.filter(team => 
        !myTeamStatus.rejectedTeams.includes(team.id) &&
        team.TeamMembers.length < maxTeamSize
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      toast.error('Failed to search teams');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (teamId) => {
    if (!hasPaid) {
      toast.error('Please register and complete payment first');
      return;
    }

    try {
      setLoading(true);
      await api.post('/teams/join-request', { 
        team_id: parseInt(teamId)
      });
      toast.success('Join request sent successfully!');
      await checkTeamStatus();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send join request');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (requestId, action) => {
    try {
      setLoading(true);
      
      // Check team size before accepting
      if (action === 'accept' && myTeam?.members?.length >= maxTeamSize) {
        toast.error('Team is already full');
        return;
      }

      await api.put(`/teams/${action}-request/${requestId}`);
      toast.success(`Request ${action}ed successfully`);
      await fetchPendingRequests();
      await checkExistingTeam();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {myTeam ? 'My Team' : 'Team Registration'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {myTeamStatus.hasPendingRequest && !myTeam && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <p className="text-yellow-700 dark:text-yellow-200">
                  You have a pending request with another team. Please wait for their response.
                </p>
              </div>
            </div>
          )}

          {myTeam ? (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{myTeam.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Team Size: {myTeam.members?.length || 1}/{maxTeamSize}
                    </p>
                  </div>
                  {myTeam.leader_id === user.id && (
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      Team Leader
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {myTeam.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <span className="text-sm">{member.username}</span>
                      {member.isLeader && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Leader
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {myTeam.leader_id === user.id && pendingRequests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Pending Join Requests</h3>
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{request.student_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {request.student_email}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRequestResponse(request.id, 'accept')}
                            className="btn btn-success btn-sm"
                            disabled={loading || myTeam.members?.length >= maxTeamSize}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRequestResponse(request.id, 'reject')}
                            className="btn btn-destructive btn-sm"
                            disabled={loading}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {mode === 'select' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setMode('create')}
                    className="btn btn-primary w-full"
                    disabled={myTeamStatus.hasPendingRequest}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Create New Team
                  </button>
                  <button
                    onClick={() => setMode('join')}
                    className="btn btn-secondary w-full"
                    disabled={myTeamStatus.hasPendingRequest}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Existing Team
                  </button>
                </div>
              )}

              {mode === 'create' && (
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Team Name</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex-1"
                    >
                      {loading ? 'Creating...' : 'Create Team'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('select')}
                      className="btn btn-ghost flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {mode === 'join' && (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="input flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search teams"
                    />
                    <button
                      onClick={handleSearchTeams}
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((team) => {
                      const isRejected = myTeamStatus.rejectedTeams.includes(team.id);
                      const isFull = team.TeamMembers?.length >= maxTeamSize;
                      
                      return (
                        <div
                          key={team.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <h3 className="font-medium">{team.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {team.TeamMembers?.length || 1}/{maxTeamSize} members
                            </p>
                          </div>
                          {isRejected ? (
                            <span className="flex items-center text-red-500 text-sm">
                              <Ban className="h-4 w-4 mr-1" />
                              Request Rejected
                            </span>
                          ) : isFull ? (
                            <span className="flex items-center text-yellow-500 text-sm">
                              <Users className="h-4 w-4 mr-1" />
                              Team Full
                            </span>
                          ) : (
                            <button
                              onClick={() => handleJoinRequest(team.id)}
                              disabled={loading}
                              className="btn btn-secondary btn-sm"
                            >
                              {loading ? (
                                <Clock className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Join
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setMode('select')}
                    className="btn btn-ghost w-full"
                  >
                    Back
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}