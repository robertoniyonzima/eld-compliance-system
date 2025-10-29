// src/components/eld/DailyLogStartForm.jsx
import { useState } from 'react';
import { apiService } from '../../services/api';

const DailyLogStartForm = ({ onLogCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    trailerNumber: '',
    fromLocation: '',
    toLocation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vehicleNumber.trim()) {
      setError('Vehicle Number is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await apiService.eld.createDailyLog({
        vehicle_number: formData.vehicleNumber,
        trailer_number: formData.trailerNumber || '',
        from_location: formData.fromLocation || '',
        to_location: formData.toLocation || ''
      });

      alert('✅ Daily log started successfully!');
      onLogCreated(response.data);
    } catch (err) {
      console.error('Error creating daily log:', err);
      setError(err.response?.data?.error || 'Failed to start daily log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          🚛 Start Daily Log
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              🚚 Vehicle Number *
            </label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              required
              placeholder="e.g., TRUCK-001"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Trailer Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              🚛 Trailer Number (Optional)
            </label>
            <input
              type="text"
              name="trailerNumber"
              value={formData.trailerNumber}
              onChange={handleChange}
              placeholder="e.g., TRAILER-123"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* From Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              📍 From Location
            </label>
            <input
              type="text"
              name="fromLocation"
              value={formData.fromLocation}
              onChange={handleChange}
              placeholder="e.g., Kigali, Rwanda"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* To Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              📍 To Location (Destination)
            </label>
            <input
              type="text"
              name="toLocation"
              value={formData.toLocation}
              onChange={handleChange}
              placeholder="e.g., Nairobi, Kenya"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              ℹ️ <strong>Note:</strong> This information will appear on your daily log PDF report.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? 'Starting...' : 'Start Daily Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyLogStartForm;
