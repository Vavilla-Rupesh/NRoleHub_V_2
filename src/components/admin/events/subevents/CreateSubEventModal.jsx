import React, { useState } from 'react';
import { Users } from 'lucide-react';
import Modal from '../../../shared/Modal';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';

export default function CreateSubEventModal({ isOpen, onClose, eventId, onSubEventCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fee: 0,
    event_id: eventId,
    is_team_event: false,
    min_team_size: 2,
    max_team_size: 4
  });
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate team size
    if (formData.is_team_event) {
      if (formData.min_team_size > formData.max_team_size) {
        toast.error('Minimum team size cannot be greater than maximum team size');
        return;
      }
      if (formData.min_team_size < 2) {
        toast.error('Minimum team size must be at least 2');
        return;
      }
      if (formData.max_team_size > 10) {
        toast.error('Maximum team size cannot exceed 10');
        return;
      }
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append resources if any
      resources.forEach(file => {
        formDataToSend.append('resources', file);
      });

      const response = await api.post('/subevents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Sub-event created successfully');
      onSubEventCreated?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create sub-event');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setResources(prev => [...prev, ...files]);
  };

  const removeResource = (index) => {
    setResources(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Sub-event">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Title</label>
          <input
            type="text"
            className="input w-full text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-lg"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Description</label>
          <textarea
            className="input w-full text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-lg"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Registration Fee (₹)</label>
          <input
            type="number"
            className="input w-full text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-lg"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="is_team_event" className="text-sm font-medium text-gray-800 dark:text-gray-100">
              This is a team event
            </label>
            <input
              type="checkbox"
              id="is_team_event"
              checked={formData.is_team_event}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                is_team_event: e.target.checked
              }))}
              className="toggle toggle-primary"
            />
          </div>

          {formData.is_team_event && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Min Team Size</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={formData.min_team_size}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    min_team_size: parseInt(e.target.value)
                  }))}
                  className="input w-full text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Max Team Size</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={formData.max_team_size}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    max_team_size: parseInt(e.target.value)
                  }))}
                  className="input w-full text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-lg"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-100">Resources (Optional)</label>
          <div className="mt-2">
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="hidden"
              id="resources"
            />
            <label
              htmlFor="resources"
              className="btn btn-secondary w-full flex items-center justify-center rounded-lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Upload Resources
            </label>
          </div>

          {resources.length > 0 && (
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-xl scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-700">
              {resources.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-sm truncate text-gray-900 dark:text-gray-100">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeResource(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary rounded-lg"
          >
            {loading ? 'Creating...' : 'Create Sub-event'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
