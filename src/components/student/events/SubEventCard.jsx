import React, { useState, useEffect } from 'react';
import { Users, Award, Download, CheckCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRegistration } from '../../../lib/hooks/useRegistration';
import { formatCurrency } from '../../../lib/utils';
import TeamRegistration from './TeamRegistration';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

function SubEventCard({ subevent, eventId, onUpdate }) {
  const { user } = useAuth();
  const { handleRegistration, registering, isRegistered, loading } = useRegistration(eventId, subevent.id);
  const [downloading, setDownloading] = useState(false);
  const [showTeamRegistration, setShowTeamRegistration] = useState(false);
  const [myTeam, setMyTeam] = useState(null);

  useEffect(() => {
    if (subevent.is_team_event && isRegistered) {
      checkTeamStatus();
    }
  }, [isRegistered, eventId, subevent.id]);

  const checkTeamStatus = async () => {
    try {
      const response = await api.get(`/teams/my-team/${eventId}/${subevent.id}`);
      setMyTeam(response.data);
    } catch (error) {
      console.error('Failed to fetch team status:', error);
    }
  };

  const handleRegister = () => {
    handleRegistration(
      {
        student_id: user.id,
        student_name: user.username,
        student_email: user.email,
        event_id: eventId,
        subevent_id: subevent.id,
        event_name: subevent.title,
        fee: subevent.fee,
      },
      onUpdate
    );
  };

  const handleTeamAction = () => {
    if (!isRegistered) {
      toast.error('Please register and complete payment first');
      return;
    }
    setShowTeamRegistration(true);
  };

  const handleDownloadResources = async () => {
    if (downloading) return;

    try {
      setDownloading(true);
      const response = await api.get(`/subevents/${subevent.id}/resources`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${subevent.title}_resources.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Resources downloaded successfully');
    } catch (error) {
      toast.error('Failed to download resources');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card animate-pulse">
        <div className="h-32"></div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{subevent.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{subevent.description}</p>
            {subevent.is_team_event && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <Users className="h-4 w-4 mr-2" />
                Team Event ({subevent.min_team_size}-{subevent.max_team_size} members)
              </div>
            )}
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Users className="h-4 w-4 text-primary" />
                <span>{subevent.participants_count || 0} participants</span>
              </div>
              <div className="flex items-center space-x-1 text-primary font-bold">
                <span>{formatCurrency(subevent.fee)} (Excluding Tax)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          {isRegistered ? (
            <>
              <button
                className="btn btn-success flex-grow-[5]"
                disabled
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Registered
              </button>
              {subevent.is_team_event && (
                <button
                  onClick={handleTeamAction}
                  className="btn btn-primary flex-grow-[5]"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {myTeam ? 'View Team' : 'Join/Create Team'}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="btn btn-primary flex-grow-[5]"
            >
              {registering ? 'Processing...' : 'Register Now'}
            </button>
          )}
          
          {subevent.has_resources && (
            <button
              onClick={handleDownloadResources}
              disabled={downloading}
              className="btn btn-secondary flex-grow"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? 'Downloading...' : 'Guidelines / Information'}
            </button>
          )}
        </div>
      </div>

      {showTeamRegistration && (
        <TeamRegistration
          isOpen={showTeamRegistration}
          onClose={() => setShowTeamRegistration(false)}
          eventId={eventId}
          subEventId={subevent.id}
          minTeamSize={subevent.min_team_size}
          maxTeamSize={subevent.max_team_size}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

export default SubEventCard;