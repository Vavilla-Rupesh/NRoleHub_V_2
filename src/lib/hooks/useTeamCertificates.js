import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export function useTeamCertificates(teamId) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (teamId) {
      fetchCertificates();
    }
  }, [teamId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teams/${teamId}/certificates`);
      setCertificates(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch team certificates');
      toast.error('Failed to fetch team certificates');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/teams/${teamId}/certificates`);
      
      if (response.data.success) {
        toast.success('Team certificates generated successfully');
        await fetchCertificates();
        return response.data.certificates;
      }
    } catch (error) {
      toast.error('Failed to generate team certificates');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateUrl) => {
    try {
      const response = await api.get(certificateUrl, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'team-certificate.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  return {
    certificates,
    loading,
    error,
    generateCertificates,
    downloadCertificate,
    refreshCertificates: fetchCertificates
  };
}