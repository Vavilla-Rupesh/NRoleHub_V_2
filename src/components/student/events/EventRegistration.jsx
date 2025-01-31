import React, { useState, useEffect } from "react";
import { Search, Calendar, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../lib/api";
import EventCard from "./EventCard";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { cn } from "../../../lib/utils";
import toast from "react-hot-toast";

function EventRegistration() {
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      const allEvents = response.data.rows || [];
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Split and sort events
      const upcoming = allEvents
        .filter((event) => new Date(event.end_date) >= now)
        .sort((a, b) => {
          const isAToday = isToday(a.start_date);
          const isBToday = isToday(b.start_date);
          if (isAToday && !isBToday) return -1;
          if (!isAToday && isBToday) return 1;
          return new Date(a.start_date) - new Date(b.start_date);
        });

      const past = allEvents
        .filter((event) => new Date(event.end_date) < now)
        .sort((a, b) => new Date(b.end_date) - new Date(a.end_date));

      setEvents({ upcoming, past });
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const isToday = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  const filteredEvents = {
    upcoming: events.upcoming.filter((event) =>
      event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    past: events.past.filter((event) =>
      event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search events..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Available/Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span>Available & Upcoming Events</span>
        </h2>

        {filteredEvents.upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.upcoming.map((event) => (
              <Link
                key={event.id}
                to={`/student/events/${event.id}`}
                className={cn(
                  "transform transition-all duration-300 hover:scale-105",
                  isToday(event.start_date) && "today-card"
                )}
              >
                <div className="relative">
                  {isToday(event.start_date) && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                      Today
                    </div>
                  )}
                  <EventCard event={event} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-300">
              No upcoming events available
            </p>
          </div>
        )}
      </div>

      {/* Past Events */}
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowPast(!showPast)}
            className="text-primary font-medium underline"
          >
            {showPast ? "Hide Past Events" : "Show Past Events"}
          </button>
        </div>

        {showPast && (
          <>
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">Past Events</span>
            </h2>

            {filteredEvents.past.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.past.map((event) => (
                  <div
                    key={event.id}
                    className="relative opacity-75 cursor-not-allowed p-4 backdrop-blur-md rounded-2xl"
                  >
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center p-6">
                      <div className="text-white text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">Event Ended</p>
                      </div>
                    </div>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-300">
                  No past events
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EventRegistration;
