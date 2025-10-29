// src/components/trips/TripHistory.jsx - VERSION CORRIGÉE
import GlassCard from '../ui/GlassCard';

const TripHistory = ({ 
  trips, 
  selectedTripId, 
  onTripSelect, 
  onTripStatusChange, 
  onTripDelete,
  currentDriverId // ✅ Nouveau prop pour vérifier le propriétaire
}) => {
  const getStatusColor = (status) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      planned: '📋',
      in_progress: '🚛',
      completed: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📁';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ CORRECTION: Calcul FIABLE de la durée
  const getDurationHours = (trip) => {
    console.log('🕒 Trip duration data:', {
      estimated_duration_seconds: trip.estimated_duration_seconds,
      estimated_duration: trip.estimated_duration,
      total_distance: trip.total_distance
    });
    
    // 1. Try estimated_duration_seconds from backend
    if (trip.estimated_duration_seconds && !isNaN(trip.estimated_duration_seconds)) {
      const hours = trip.estimated_duration_seconds / 3600;
      return hours.toFixed(1);
    }
    
    // 2. Try estimated_duration (might be in seconds already)
    if (trip.estimated_duration && !isNaN(trip.estimated_duration)) {
      const hours = trip.estimated_duration / 3600;
      return hours.toFixed(1);
    }
    
    // 3. Fallback: calculate from distance
    if (trip.total_distance && !isNaN(trip.total_distance)) {
      const hours = trip.total_distance / 55; // 55 mph average
      return hours.toFixed(1);
    }
    
    // 4. Final fallback
    return '0';
  };

  // ✅ CORRECTION: Distance cohérente
  const getDistance = (trip) => {
    if (trip.total_distance && !isNaN(trip.total_distance)) {
      return Math.round(trip.total_distance);
    }
    return 0;
  };

  // ✅ NOUVEAU: Vérifier si le trip appartient au driver actuel
  const isTripOwner = (trip) => {
    return trip.driver_id === currentDriverId || trip.created_by === currentDriverId;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          My Trip History 📋
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {trips.length} trip{trips.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {trips.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🗺️</div>
          <p>No trips planned yet</p>
          <p className="text-sm mt-1">Create your first trip to see it here!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {trips.map((trip) => {
            const isOwner = isTripOwner(trip);
            const duration = getDurationHours(trip);
            const distance = getDistance(trip);
            
            console.log(`📊 Trip ${trip.id}:`, { distance, duration, isOwner });
            
            return (
              <div
                key={trip.id}
                onClick={() => onTripSelect(trip)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedTripId === trip.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50'
                } ${!isOwner ? 'opacity-70' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">
                      {getStatusIcon(trip.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {trip.current_location_details?.city || trip.current_location?.city || 'Unknown'} → {trip.dropoff_location_details?.city || trip.dropoff_location?.city || 'Unknown'}
                        {!isOwner && <span className="text-xs text-gray-500 ml-2">(Other Driver)</span>}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(trip.created_at)}
                        {trip.driver_name && <span> • {trip.driver_name}</span>}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                    {trip.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {/* ✅ DONNÉES COHÉRENTES */}
                  <span>Distance: <strong>{distance} miles</strong></span>
                  <span>Duration: <strong>{duration}h</strong></span>
                  <span>HOS: <strong>{trip.current_cycle_used || 0}h used</strong></span>
                </div>
                
                {/* Action buttons - ✅ SEULEMENT pour le propriétaire */}
                {isOwner ? (
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {trip.status === 'planned' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTripStatusChange(trip.id, 'in_progress');
                            }}
                            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            Start
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTripStatusChange(trip.id, 'cancelled');
                            }}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {trip.status === 'in_progress' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onTripStatusChange(trip.id, 'completed');
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onTripDelete(trip.id);
                      }}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 text-center py-1">
                    👤 Trip created by another driver
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};

export default TripHistory;