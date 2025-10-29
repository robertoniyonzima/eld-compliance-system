// src/components/shared/TripsManagement.jsx - TRIPS MANAGEMENT FOR ADMIN & MANAGER
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import InteractiveMap from '../trips/InteractiveMap';
import { apiService } from '../../services/api';

const TripsManagement = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, planned, in_progress, completed

  useEffect(() => {
    loadTrips();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadTrips();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await apiService.trips.getAll();
      console.log('📦 Trips loaded:', response.data);
      
      // ✅ Sort trips by most recent first (created_at or id descending)
      const sortedTrips = (response.data || []).sort((a, b) => {
        // Try to sort by created_at first
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        // Fallback to id if created_at not available
        return (b.id || 0) - (a.id || 0);
      });
      
      console.log('✅ Trips sorted (most recent first):', sortedTrips.length);
      setTrips(sortedTrips);
    } catch (error) {
      console.error('❌ Error loading trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
  };

  const getFilteredTrips = () => {
    if (filter === 'all') return trips;
    return trips.filter(trip => trip.status === filter);
  };

  const getStatusBadge = (status) => {
    const badges = {
      planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return badges[status] || badges.planned;
  };

  const getStatusIcon = (status) => {
    const icons = {
      planned: '🗺️',
      in_progress: '🚛',
      completed: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📍';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTrips = getFilteredTrips();

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Trips Management
          </h2>
          <button
            onClick={loadTrips}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>{loading ? '🔄' : '🔃'}</span>
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {trips.length} trip{trips.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex space-x-2">
          {['all', 'planned', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-slate-600 dark:text-slate-400">Loading trips...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTrips.map((trip) => (
            <GlassCard key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="text-3xl">
                      {getStatusIcon(trip.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {trip.pickup_location_details?.city || 'Unknown'}, {trip.pickup_location_details?.state || ''}
                        {' → '}
                        {trip.dropoff_location_details?.city || 'Unknown'}, {trip.dropoff_location_details?.state || ''}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Driver: {trip.driver_name || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Distance</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {trip.total_distance ? `${Math.round(trip.total_distance)} miles` : 'Calculating...'}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Duration</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {trip.estimated_duration_seconds 
                          ? `${(trip.estimated_duration_seconds / 3600).toFixed(1)}h`
                          : 'Calculating...'}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(trip.status)}`}>
                        {trip.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Created</p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {formatDate(trip.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewTrip(trip)}
                  className="ml-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                >
                  <span>🗺️</span>
                  <span>View Map</span>
                </button>
              </div>
            </GlassCard>
          ))}

          {filteredTrips.length === 0 && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No trips found for this filter
            </div>
          )}
        </div>
      )}

      {/* Trip Details Modal with Map */}
      {showModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Trip Details
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedTrip.pickup_location_details?.city}, {selectedTrip.pickup_location_details?.state}
                    {' → '}
                    {selectedTrip.dropoff_location_details?.city}, {selectedTrip.dropoff_location_details?.state}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Trip Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">Driver</p>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">
                    {selectedTrip.driver_name || 'Unknown'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Distance</p>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">
                    {selectedTrip.total_distance ? `${Math.round(selectedTrip.total_distance)} mi` : 'N/A'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-medium">Duration</p>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">
                    {selectedTrip.estimated_duration_seconds 
                      ? `${(selectedTrip.estimated_duration_seconds / 3600).toFixed(1)}h`
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700">
                  <p className="text-xs text-orange-600 dark:text-orange-400 mb-1 font-medium">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(selectedTrip.status)}`}>
                    {selectedTrip.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">📍 Current Location</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedTrip.current_location_details?.city || 'Unknown'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedTrip.current_location_details?.state || ''}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">🏁 Pickup</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedTrip.pickup_location_details?.city || 'Unknown'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedTrip.pickup_location_details?.state || ''}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">🎯 Dropoff</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedTrip.dropoff_location_details?.city || 'Unknown'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedTrip.dropoff_location_details?.state || ''}
                  </p>
                </div>
              </div>

              {/* Interactive Map */}
              <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                <InteractiveMap tripData={selectedTrip} />
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Created:</strong> {formatDate(selectedTrip.created_at)}
                  {selectedTrip.updated_at && (
                    <span className="ml-4">
                      <strong>Updated:</strong> {formatDate(selectedTrip.updated_at)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsManagement;
