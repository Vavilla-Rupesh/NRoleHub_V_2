import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Award } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/api";
import { formatDate } from "../../lib/utils";
import LoadingSpinner from "../shared/LoadingSpinner";
import toast from "react-hot-toast";

function StudentHome() {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
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

      const available = eventsResponse.data.rows
        .filter(
          (event) =>
            new Date(event.start_date) <= now &&
            new Date(event.end_date) >= now
        )
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, 5);

      setUpcomingEvents(upcoming);
      setAvailableEvents(available);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load dashboard data");
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="glass-card bg-gradient-to-r from-primary/10 to-primary-dark/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              You have registered for {registeredEvents.length} events
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-primary/20 px-4 py-2 rounded-lg">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-medium">{totalPoints} points</span>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Available Events</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {availableEvents.map((event) => (
            <Link
              key={event.id}
              to={`/student/events/${event.id}`}
              className="block py-4 px-6 bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-lg border-2 border-transparent border-animation hover:scale-105 hover:border-blue-400 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {event.event_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(event.start_date)} -{" "}
                    {formatDate(event.end_date)}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {availableEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No available events at the moment
            </div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Upcoming Events</h2>
          <Link
            to="/student/events"
            className="text-primary hover:text-primary/80"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {upcomingEvents.map((event) => (
            <Link
              key={event.id}
              to={`/student/events/${event.id}`}
              className="block py-4 px-6 bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-lg border-2 border-transparent border-animation hover:scale-105 hover:border-blue-400 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {event.event_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(event.start_date)}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {upcomingEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No upcoming events at the moment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
