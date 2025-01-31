import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, Tag, Download} from 'lucide-react';
import api from '../../../lib/api';
import SubEventList from './SubEventList';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { formatDate } from '../../../lib/utils';
import toast from 'react-hot-toast';

function EventImage({ event }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      {/* Right side - Event Image */}
      {event?.event_image && (
        <div className="glass-card h-full p-0 overflow-hidden bg-transparent">
          <img
            src={event.event_image}
            alt={event.event_name}
            className="w-full h-full object-contain transform transition-transform duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setIsPopupOpen(true)} // Open popup on click
          />
        </div>
      )}

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-transparent p-4 rounded-lg relative max-w-4xl w-auto max-h-[80vh] overflow-auto">
            {/* Image */}
            <img
              src={event.event_image}
              alt={event.event_name}
              className="w-full h-auto rounded-lg"
            />
            
            {/* Close and Download buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {/* Download Button */}
              <a
                href={event.event_image}
                download={event.event_name} // Image will be downloaded with event name
                className="bg-blue-500 text-white p-3 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105 hover:bg-blue-600 hover:shadow-lg"
              >
                <Download className="h-6 w-6" />
              </a>
              
              {/* Close Button */}
              <button
                className="text-white bg-red-500 rounded-full p-3 flex items-center justify-center transition-transform duration-300 hover:scale-105 hover:bg-red-600 hover:shadow-lg"
                onClick={() => setIsPopupOpen(false)} // Close popup
              >
                X
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [subevents, setSubevents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const [eventResponse, subeventsResponse] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/subevents/${id}`)
      ]);
      setEvent(eventResponse.data);
      setSubevents(subeventsResponse.data.subevents || []);
    } catch (error) {
      toast.error('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 h-[500px]">
        {/* Event Image */}
        <EventImage event={event} />

        {/* Event Details */}
        <div className="glass-card h-full overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{event?.event_name}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary mt-2">
                <Tag className="h-4 w-4 mr-2" />
                {event?.nature_of_activity}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-sm bg-secondary/10 text-secondary">
              IQAC: {event?.iqac_reference}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <p className="text-gray-600 dark:text-gray-300">{event?.description}</p>

            <div className="grid gap-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Starts: {formatDate(event?.start_date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Clock className="h-5 w-5 text-primary" />
                <span>Ends: {formatDate(event?.end_date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{event?.venue}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
              <p className="text-gray-600 dark:text-gray-300">{event?.eligibility_criteria}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sub Events</h2>
        <SubEventList subevents={subevents} eventId={id} onUpdate={fetchEventDetails} />
      </div>
    </div>
  );
}

export default EventDetails;
