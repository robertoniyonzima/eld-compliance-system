// src/components/dashboard/RecentTrips.jsx - Real data from API (English)
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import { apiService } from '../../services/api';

const RecentTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await apiService.trips.getAll();
      const allTrips = response.data || [];
      
      // Get recent trips (last 3)
      const recentTrips = allTrips.slice(0, 3).map(trip => {
        // Extract location details from nested objects
        const pickupCity = trip.pickup_location_details?.city || 'Unknown';
        const pickupState = trip.pickup_location_details?.state || '';
        const dropoffCity = trip.dropoff_location_details?.city || 'Unknown';
        const dropoffState = trip.dropoff_location_details?.state || '';
        
        return {
          id: trip.id,
          from: `${pickupCity}${pickupState ? ', ' + pickupState : ''}`,
          to: `${dropoffCity}${dropoffState ? ', ' + dropoffState : ''}`,
          distance: trip.total_distance ? `${Math.round(trip.total_distance)} miles` : 'Calculating...',
          status: trip.status === 'in_progress' ? 'In Progress' : 
                  trip.status === 'planned' ? 'Planned' : 
                  trip.status === 'completed' ? 'Completed' : 
                  trip.status === 'cancelled' ? 'Cancelled' : 'Unknown',
          progress: trip.status === 'in_progress' ? 50 : trip.status === 'completed' ? 100 : 0,
          icon: trip.status === 'in_progress' ? '🚛' : 
                trip.status === 'completed' ? '✅' : 
                trip.status === 'cancelled' ? '❌' : '🗺️'
        };
      });
      
      setTrips(recentTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Trips
      </h3>
      
      {loading ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Loading...
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          No trips found
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/20 dark:hover:bg-dark-600/20 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-lg">
                {trip.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {trip.from} → {trip.to}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    trip.status === 'In Progress' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : trip.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {trip.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {trip.distance}
                </p>
                {trip.progress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${trip.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {trip.progress}% completed
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={() => window.location.href = '/trips'}
        className="w-full mt-4 py-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
      >
        + New Trip
      </button>
    </GlassCard>
  );
};

export default RecentTrips;
