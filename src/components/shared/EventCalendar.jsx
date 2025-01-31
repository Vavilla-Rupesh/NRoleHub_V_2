import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-calendar/dist/Calendar.css";

function EventCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await api.get("/events");
        setEvents(eventsResponse.data.rows);

        if (user) {
          const registrationsResponse = await api.get(
            "/registrations/my-registrations"
          );
          const paidRegistrations = registrationsResponse.data.filter(
            (reg) => reg.payment_status === "paid"
          );
          setRegistrations(paidRegistrations);
        }
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
        toast.error("Failed to load events");
      }
    };

    fetchData();
  }, [user]);

  // Organize events by date
  const eventsByDate = events.reduce((acc, event) => {
    const startDate = format(new Date(event.start_date), "yyyy-MM-dd");
    const endDate = format(new Date(event.end_date), "yyyy-MM-dd");

    // Add event to all dates between start and end
    for (
      let date = new Date(startDate);
      date <= new Date(endDate);
      date.setDate(date.getDate() + 1)
    ) {
      const formattedDate = format(date, "yyyy-MM-dd");
      if (!acc[formattedDate]) acc[formattedDate] = [];
      acc[formattedDate].push(event);
    }
    return acc;
  }, {});

  // Tile Class Logic
  const tileClassName = ({ date }) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const eventsOnTile = eventsByDate[formattedDate];
    const isRegistered = registrations.some(
      (reg) =>
        eventsOnTile && eventsOnTile.some((event) => event.id === reg.event_id)
    );

    return cn(
      "calendar-tile",
      eventsOnTile && "has-event",
      isRegistered && "is-registered",
      formattedDate === format(new Date(), "yyyy-MM-dd") && "today-highlight"
    );
  };

  // Tile Content Logic
  const tileContent = ({ date }) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const eventsOnDate = eventsByDate[formattedDate];

    if (eventsOnDate && eventsOnDate.length > 0) {
      return (
        <div className="tile-content flex flex-col justify-center items-center">
          <div className="event-indicator p-2 rounded-lg bg-opacity-40 bg-white shadow-xl">
            {eventsOnDate.map((event) => (
              <div
                key={event.id}
                className="event-name text-xs truncate max-w-[100px] text-center"
                title={event.event_name}
              >
                {event.event_name}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 rounded-xl shadow-lg">
      <h2 className="text-3xl font-semibold text-center mb-6 text-white">
        Event Calendar
      </h2>

      <Calendar
        value={selectedDate}
        tileClassName={tileClassName}
        tileContent={tileContent}
        next2Label={<ChevronRight className="text-white text-lg" />}
        prev2Label={<ChevronLeft className="text-white text-lg" />}
        showNeighboringMonth={false}
        className="w-full border-none shadow-md bg-white rounded-lg"
        locale="en-US"
        maxDetail="month"
        minDetail="month"
        onChange={setSelectedDate}
      />

      <div className="mt-6 pt-6 border-t border-gray-300">
        <div className="flex items-center justify-center space-x-8 text-sm text-white"></div>
      </div>
    </div>
  );
}

export default EventCalendar;
