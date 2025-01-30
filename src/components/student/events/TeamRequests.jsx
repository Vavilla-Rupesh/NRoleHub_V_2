import React, { useState, useEffect } from 'react';
import { UserCheck, UserX } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function TeamRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/teams/requests');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch team requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      await api.put(`/teams/${action}-request/${requestId}`);
      toast.success(`Request ${action}ed successfully`);
      fetchRequests();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Team Join Requests</h3>
      
      {requests.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No pending requests</p>
      ) : (
        <div className="space-y-2">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <p className="font-medium">{request.student_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Wants to join {request.team_name}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRequest(request.id, 'accept')}
                  className="btn btn-success btn-sm"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Accept
                </button>
                <button
                  onClick={() => handleRequest(request.id, 'reject')}
                  className="btn btn-destructive btn-sm"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}