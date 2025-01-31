import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import PaidEventsList from './paid/PaidEventsList';

function MyEvents() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const filteredSubevents = location.state?.filteredSubevents || [];

  // If we have filtered subevents from navigation, use them as initial search term
  useEffect(() => {
    if (filteredSubevents.length > 0) {
      setSearchTerm(filteredSubevents[0]);
    }
  }, [filteredSubevents]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Events</h1>
      </div>

      {/* Pass the search term to PaidEventsList */}
      <PaidEventsList searchTerm={searchTerm} />
    </div>
  );
}

export default MyEvents;
