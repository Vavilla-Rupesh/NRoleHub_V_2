import React, { useState, useEffect } from "react";
import { User, Mail, Trophy, Star, Calendar, Award } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../lib/api";
import { cn } from "../../../lib/utils";
import { formatDate } from "../../../lib/utils";

function StudentProfile() {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsByDate, setPointsByDate] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const registrationsResponse = await api.get(
        "/registrations/my-registrations"
      );
      const registrations = registrationsResponse.data.filter(
        (reg) => reg.payment_status === "paid"
      );

      const leaderboardPromises = registrations.map((reg) =>
        api
          .get(`/leaderboard/${reg.event_id}`, {
            params: { subevent_id: reg.subevent_id },
          })
          .catch(() => ({ data: [] }))
      );
      const leaderboardResponses = await Promise.all(leaderboardPromises);

      const winnersMap = new Map();
      leaderboardResponses.forEach((response, index) => {
        const reg = registrations[index];
        const winners = response.data;
        const eventKey = `${reg.event_id}-${reg.subevent_id}`;
        const userRank = winners.find((w) => w.student_id === user.id)?.rank;
        if (userRank) {
          winnersMap.set(eventKey, userRank);
        }
      });

      const enhancedRegistrations = registrations.map((reg) => {
        const eventKey = `${reg.event_id}-${reg.subevent_id}`;
        const rank = winnersMap.get(eventKey);
        return { ...reg, rank };
      });

      const { total, pointsByDate } = calculatePointsByDate(
        enhancedRegistrations
      );
      setTotalPoints(total);
      setPointsByDate(pointsByDate);
      setRegisteredEvents(enhancedRegistrations);

      const eventsResponse = await api.get("/events");
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming = eventsResponse.data.rows
        .filter((event) => new Date(event.start_date) >= now)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, 5);

      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePointsByDate = (registrations) => {
    const eventsByDate = registrations.reduce((acc, reg) => {
      const date = new Date(reg.registration_date).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(reg);
      return acc;
    }, {});

    let totalPoints = 0;
    const pointsByDate = {};

    Object.entries(eventsByDate).forEach(([date, regs]) => {
      const eventPoints = regs.map((reg) => ({
        ...reg,
        points: reg.rank ? 3 : reg.attendance ? 2 : 0,
        type: reg.rank
          ? `${reg.rank}${getRankSuffix(reg.rank)} Place`
          : reg.attendance
          ? "Participation"
          : "Registered",
      }));

      const topEvents = eventPoints
        .sort((a, b) => b.points - a.points)
        .slice(0, 2);

      const datePoints = topEvents.reduce(
        (sum, event) => sum + event.points,
        0
      );
      totalPoints += datePoints;

      pointsByDate[date] = {
        events: topEvents,
        totalPoints: datePoints,
      };
    });

    return { total: totalPoints, pointsByDate };
  };

  const getRankSuffix = (rank) => {
    if (!rank) return "";
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
    <div className="min-h-[80vh] p-6 flex items-center justify-center">
      <div className="glass-card w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - User Info and Points History */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                  <User className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <div className="flex-grow">
                  {" "}
                  {/* Added flex-grow here */}
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {user?.username}
                  </h2>
                  <div className="flex items-center space-x-1 mt-2">
                    <Mail className="h-4 w-3 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {user?.email}
                    </span>{" "}
                    {/* Added truncate */}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
              <div
                className={cn(
                  "p-4 rounded-xl border border-white/20 dark:border-gray-700/20",
                  "bg-gradient-to-br from-primary/10 to-secondary/10",
                  "transform hover:scale-105 transition-all duration-300"
                )}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary animate-pulse" />
                  <span className="font-medium">Events Participated</span>
                </div>
                <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {registeredEvents.length}
                </p>
              </div>

              <div
                className={cn(
                  "p-4 rounded-xl border border-white/20 dark:border-gray-700/20",
                  "bg-gradient-to-br from-yellow-500/10 to-amber-500/10",
                  "transform hover:scale-105 transition-all duration-300"
                )}
              >
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500 animate-pulse" />
                  <span className="font-medium">Events Won</span>
                </div>
                <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                  {registeredEvents.filter((reg) => reg.rank).length}
                </p>
              </div>
            </div>

            {/* Points History */}
            {/* <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Points History</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {Object.entries(pointsByDate).map(([date, { events, totalPoints }]) => (
              <div key={date} className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{formatDate(new Date(date))}</span>
                  <span className="text-sm font-bold text-primary">{totalPoints} points</span>
                </div>
                <div className="space-y-2">
                  {events.map((event, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{event.event_name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={cn("px-2 py-1 rounded-full text-xs", event.rank ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800")}>
                          {event.type}
                        </span>
                        <span className="font-medium">{event.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div> */}
          </div>

          {/* Right side - Points Animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 rounded-full blur-3xl animate-gradient" />
            <div className="relative flex flex-col items-center justify-center h-full p-6 rounded-xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="absolute -top-4 -right-4">
                <Star className="h-8 w-8 text-yellow-500 animate-spin-slow" />
              </div>
              <Award className="h-16 w-16 text-primary mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
                Total Points
              </h3>
              <div className="relative mt-4">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-lg opacity-50" />
                <p className="relative text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
                  {totalPoints}
                </p>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Points are calculated from your top 2 events each day!
                <br />
                <span className="text-xs">
                  Ranked Events: 3 points
                  <br />
                  Participation: 2 points
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
