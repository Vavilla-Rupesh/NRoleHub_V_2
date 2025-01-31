import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

function EventList({ events }) {
  const [showPastEvents, setShowPastEvents] = useState(false);

  const isToday = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (endDate) => {
    const now = new Date();
    return new Date(endDate) < now;
  };

  const upcomingEvents = events.filter((event) => !isPast(event.end_date));
  const pastEvents = events.filter((event) => isPast(event.end_date));

  return (
    <div>
      {/* Upcoming Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingEvents.map((event) => (
          <Link
            key={event.id}
            to={`/admin/events/${event.id}`}
            className={`card hover:scale-105 transition-transform duration-300 ${
              isToday(event.start_date) ? 'today-card' : ''
            }`}
          >
            <div className="flex flex-col h-full relative">
              {/* Today label at the top-right corner */}
              {isToday(event.start_date) && (
                <span className="absolute top-2 right-2 text-sm text-white bg-primary p-1 rounded-full">
                  Today
                </span>
              )}
              
              <h3 className="text-xl font-semibold mb-4">{event.event_name}</h3>

              <div className="space-y-3 text-gray-600 dark:text-gray-400 flex-grow">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{formatDate(event.start_date)}</span>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.venue}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>
                    {formatDate(event.start_date)} - {formatDate(event.end_date)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <span className="text-primary font-medium">View Details →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Show Past Events Button */}
      <div className="mt-6 text-right">
        <button
          onClick={() => setShowPastEvents(!showPastEvents)}
          className="text-primary font-medium hover:underline"
        >
          {showPastEvents ? 'Hide Past Events' : 'Show Past Events'}
        </button>
      </div>

      {/* Past Events (only shown when the button is clicked) */}
      {showPastEvents && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {pastEvents.map((event) => (
            <Link
              key={event.id}
              to={`/admin/events/${event.id}`}
              className="card hover:scale-105 transition-transform duration-300 past-card"
            >
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-4">{event.event_name}</h3>

                <div className="space-y-3 text-gray-600 dark:text-gray-400 flex-grow">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{formatDate(event.start_date)}</span>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{event.venue}</span>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>
                      {formatDate(event.start_date)} - {formatDate(event.end_date)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <span className="text-primary font-medium">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;
