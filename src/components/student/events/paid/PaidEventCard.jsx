import React, { useState, useEffect } from "react";
import {
  Calendar,
  Award,
  Download,
  CheckCircle,
  Users,
  Trophy,
  X,
} from "lucide-react";
import { formatDate } from "../../../../lib/utils";
import { useWinners } from "../../../../lib/hooks/useWinners";
import WinnersModal from "../../../shared/Modal/WinnersModal";
import toast from "react-hot-toast";
import { useCertificateDownload } from "../../../../lib/hooks/useCertificateDownload";
import api from "../../../../lib/api";

function PaidEventCard({ registration }) {
  const [showWinners, setShowWinners] = useState(false);
  const [teamLeaderboard, setTeamLeaderboard] = useState([]);
  const [individualLeaderboard, setIndividualLeaderboard] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [isTeamEvent, setIsTeamEvent] = useState(false);
  const { downloadCertificate, downloading } = useCertificateDownload();
  const [teamRank, setTeamRank] = useState(null);
  const [individualRank, setIndividualRank] = useState(null);

  useEffect(() => {
    if (registration.subevent_id) {
      checkEventType();
    }
  }, [registration]);

  const checkEventType = async () => {
    try {
      const subeventsResponse = await api.get(
        `/subevents/${registration.event_id}`
      );
      const subevent = subeventsResponse.data.subevents.find(
        (se) => se.id === registration.subevent_id
      );

      setIsTeamEvent(subevent?.is_team_event || false);

      if (subevent?.is_team_event) {
        await checkTeamStatus();
        await fetchTeamLeaderboard();
      } else {
        await fetchIndividualLeaderboard();
      }
    } catch (error) {
      console.error("Failed to check event type:", error);
    }
  };

  const checkTeamStatus = async () => {
    try {
      const response = await api.get(
        `/teams/my-team/${registration.event_id}/${registration.subevent_id}`
      );
      if (response.data) {
        setMyTeam(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch team status:", error);
    }
  };

  const fetchTeamLeaderboard = async () => {
    try {
      const [teamResponse, leaderboardResponse] = await Promise.all([
        api.get(
          `/teams/my-team/${registration.event_id}/${registration.subevent_id}`
        ),
        api.get(
          `/teams/leaderboard/${registration.event_id}/${registration.subevent_id}`
        ),
      ]);

      const myTeamData = teamResponse.data;
      const sortedLeaderboard = leaderboardResponse.data
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
        .slice(0, 3);

      setMyTeam(myTeamData);
      setTeamLeaderboard(sortedLeaderboard);

      if (myTeamData) {
        const myTeamEntry = leaderboardResponse.data.find(
          (entry) => entry.team_id === myTeamData.id
        );
        if (myTeamEntry) {
          const rank =
            leaderboardResponse.data.findIndex(
              (entry) => entry.team_id === myTeamData.id
            ) + 1;
          setTeamRank(rank);
        }
      }
    } catch (error) {
      console.error("Failed to fetch team leaderboard:", error);
    }
  };

  const fetchIndividualLeaderboard = async () => {
    try {
      const response = await api.get(`/leaderboard/${registration.event_id}`, {
        params: { subevent_id: registration.subevent_id },
      });

      const sortedLeaderboard = response.data
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))
        .slice(0, 3);

      setIndividualLeaderboard(sortedLeaderboard);

      const userEntry = response.data.find(
        (entry) => entry.student_id === registration.student_id
      );
      if (userEntry) {
        const rank =
          response.data.findIndex(
            (entry) => entry.student_id === registration.student_id
          ) + 1;
        setIndividualRank(rank);
      }
    } catch (error) {
      console.error("Failed to fetch individual leaderboard:", error);
    }
  };

  const handleDownloadCertificate = async () => {
    if (downloading) return;

    try {
      await downloadCertificate(
        registration.event_id,
        registration.subevent_id
      );
    } catch (error) {
      toast.error("Failed to download certificate");
    }
  };

  const getRankSuffix = (rank) => {
    if (rank >= 11 && rank <= 13) return "th";
    const lastDigit = rank % 10;
    switch (lastDigit) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return (
    <>
      <div className="glass-card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{registration.event_name}</h3>
            {registration.subevent_id && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Sub-event
              </span>
            )}
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Users className="h-4 w-4 text-primary" />
                <span>Registered</span>
              </div>
              {registration.attendance && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Attendance Marked
                </span>
              )}
              {isTeamEvent
                ? teamRank &&
                  teamRank <= 3 && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teamRank === 1
                          ? "bg-yellow-100 text-yellow-800"
                          : teamRank === 2
                          ? "bg-gray-100 text-gray-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      {teamRank}
                      {getRankSuffix(teamRank)} Place Team
                    </span>
                  )
                : individualRank &&
                  individualRank <= 3 && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        individualRank === 1
                          ? "bg-yellow-100 text-yellow-800"
                          : individualRank === 2
                          ? "bg-gray-100 text-gray-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      {individualRank}
                      {getRankSuffix(individualRank)} Place
                    </span>
                  )}
            </div>
            {isTeamEvent && myTeam && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Team: {myTeam.name}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>
              Registered on {formatDate(registration.registration_date)}
            </span>
          </div>
        </div>

        <div className="flex space-x-3 mt-4">
          <button
            onClick={() => setShowWinners(true)}
            className="btn btn-secondary flex-1"
          >
            <Award className="h-4 w-4 mr-2" />
            View Leaderboard
          </button>

          <button
            onClick={handleDownloadCertificate}
            disabled={downloading}
            className="btn btn-primary flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading
              ? "Downloading..."
              : `Download ${
                  isTeamEvent
                    ? teamRank && teamRank <= 3
                      ? "Merit"
                      : "Participation"
                    : individualRank && individualRank <= 3
                    ? "Merit"
                    : "Participation"
                } Certificate`}
          </button>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showWinners && (
        <div className="fixed inset-0 z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm"
              onClick={() => setShowWinners(false)}
            />

            {/* Modal panel */}
            <div className="inline-block w-full max-w-md sm:max-w-full p-4 sm:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl font-bold sm:text-2xl">
                  {isTeamEvent ? "Team Leaderboard" : "Individual Leaderboard"}
                </h2>
                <button
                  onClick={() => setShowWinners(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {isTeamEvent
                  ? teamLeaderboard.map((team) => (
                      <div
                        key={team.team_id}
                        className={`p-4 sm:p-6 rounded-lg ${
                          myTeam && team.team_id === myTeam.id
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-gray-50 dark:bg-gray-700"
                        } transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Trophy
                                className={`h-5 w-5 ${
                                  team.rank === 1
                                    ? "text-yellow-500"
                                    : team.rank === 2
                                    ? "text-gray-400"
                                    : "text-amber-600"
                                }`}
                              />
                              <span className="font-bold">
                                {team.Team.name}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {team.Team.TeamMembers?.length || 0} members
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{team.score} points</div>
                            <span
                              className={`text-sm ${
                                team.rank === 1
                                  ? "text-yellow-600"
                                  : team.rank === 2
                                  ? "text-gray-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {team.rank}
                              {getRankSuffix(team.rank)} Place
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  : individualLeaderboard.map((winner) => (
                      <div
                        key={winner.student_id}
                        className={`p-4 sm:p-6 rounded-lg ${
                          winner.student_id === registration.student_id
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-gray-50 dark:bg-gray-700"
                        } transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Trophy
                                className={`h-5 w-5 ${
                                  winner.rank === 1
                                    ? "text-yellow-500"
                                    : winner.rank === 2
                                    ? "text-gray-400"
                                    : "text-amber-600"
                                }`}
                              />
                              <span className="font-bold">
                                {winner.student_name}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {winner.score} points
                            </div>
                            <span
                              className={`text-sm ${
                                winner.rank === 1
                                  ? "text-yellow-600"
                                  : winner.rank === 2
                                  ? "text-gray-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {winner.rank}
                              {getRankSuffix(winner.rank)} Place
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                {((isTeamEvent && teamLeaderboard.length === 0) ||
                  (!isTeamEvent && individualLeaderboard.length === 0)) && (
                  <div className="text-center py-8 text-gray-500">
                    No rankings available yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PaidEventCard;
