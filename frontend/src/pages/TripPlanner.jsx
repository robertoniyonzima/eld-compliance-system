// src/pages/TripPlanner.jsx - VERSION AVEC VOTRE AUTH
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // ✅ Importer votre hook d'auth
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import TripWizard from '../components/trips/TripWizard';
import InteractiveMap from '../components/trips/InteractiveMap';
import HOSBreakPlanner from '../components/trips/HOSBreakPlanner';
import TripHistory from '../components/trips/TripHistory';

// Import API service
import { apiService } from '../services/api';

const TripPlanner = () => {
  const { user } = useAuth(); // ✅ Utiliser votre hook d'auth
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [tripCreated, setTripCreated] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [allTrips, setAllTrips] = useState([]);

  // ✅ Récupérer l'ID du driver connecté depuis votre auth
  const getCurrentDriverId = () => {
    if (!user) {
      console.error('❌ No user found in auth context');
      return null;
    }
    
    const driverId = `driver_${user.id}`;
    console.log('👤 Current driver ID:', driverId, 'User:', user);
    return driverId;
  };

  const currentDriverId = getCurrentDriverId();

  // Charger les trips au démarrage depuis le backend
  useEffect(() => {
    if (user) {
      loadTripsFromBackend();
    }
  }, [user]);

  const loadTripsFromBackend = async () => {
    try {
      const response = await apiService.trips.getAll();
      const trips = response.data || [];
      console.log('📥 Loaded trips from backend:', trips.length);
      
      // ✅ Sort trips by most recent first (created_at or id descending)
      const sortedTrips = trips.sort((a, b) => {
        const dateA = new Date(a.created_at || a.id);
        const dateB = new Date(b.created_at || b.id);
        return dateB - dateA; // Most recent first
      });
      
      setAllTrips(sortedTrips);
      
      if (sortedTrips.length > 0) {
        const lastTrip = sortedTrips[0]; // Most recent trip
        setTripData(lastTrip);
        setTripCreated(true);
        setSelectedTripId(lastTrip.id);
        setActiveTrip(lastTrip);
        
        const restoredRouteInfo = createRouteInfoFromBackend(lastTrip);
        setRouteInfo(restoredRouteInfo);
      } else {
        console.log('📭 No trips found for this driver');
      }
    } catch (error) {
      console.error('❌ Error loading trips:', error);
      setAllTrips([]);
    }
  };

  const handleTripCreated = (tripResponse) => {
    console.log('✅ Trip created - FULL RESPONSE:', tripResponse);
    
    const trip = tripResponse.data || tripResponse;
    
    setActiveTrip(trip);
    setTripData(trip);
    setTripCreated(true);
    setSelectedTripId(trip.id);
    
    // Reload all trips from backend
    loadTripsFromBackend();

    const backendRouteInfo = createRouteInfoFromBackend(trip);
    if (backendRouteInfo) {
      setRouteInfo(backendRouteInfo);
    }
  };

  const handleTripSelect = (trip) => {
    console.log('🎯 Trip selected:', trip);
    setTripData(trip);
    setSelectedTripId(trip.id);
    setActiveTrip(trip);
    setTripCreated(true);
    
    const restoredRouteInfo = createRouteInfoFromBackend(trip);
    setRouteInfo(restoredRouteInfo);
  };

  const handleTripStatusChange = async (tripId, newStatus) => {
    try {
      console.log(`🔄 Changing trip ${tripId} status to: ${newStatus}`);
      
      // Call appropriate backend endpoint
      if (newStatus === 'in_progress') {
        await apiService.trips.startTrip(tripId);
      } else if (newStatus === 'completed') {
        await apiService.trips.completeTrip(tripId);
      } else {
        // For other status changes, use update endpoint
        await apiService.trips.update(tripId, { status: newStatus });
      }
      
      // Reload trips from backend
      await loadTripsFromBackend();
      
      // Update selected trip if it's the one being changed
      if (selectedTripId === tripId) {
        const response = await apiService.trips.getDetails(tripId);
        const updatedTrip = response.data;
        setTripData(updatedTrip);
        setActiveTrip(updatedTrip);
      }
    } catch (error) {
      console.error('❌ Error updating trip status:', error);
      alert('Failed to update trip status: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleTripDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        // Mark as cancelled instead of deleting
        await handleTripStatusChange(tripId, 'cancelled');
        
        if (selectedTripId === tripId) {
          const remainingTrips = allTrips.filter(t => t.id !== tripId && t.status !== 'cancelled');
          if (remainingTrips.length > 0) {
            handleTripSelect(remainingTrips[0]);
          } else {
            setTripData(null);
            setRouteInfo(null);
            setTripCreated(false);
            setSelectedTripId(null);
            setActiveTrip(null);
          }
        }
      } catch (error) {
        console.error('❌ Error cancelling trip:', error);
      }
    }
  };

  const handleNewTrip = () => {
    setTripData(null);
    setRouteInfo(null);
    setTripCreated(false);
    setSelectedTripId(null);
    setActiveTrip(null);
  };

  const createRouteInfoFromBackend = (trip) => {
    if (!trip) return null;

    let distance, duration, coordinates, route;
    
    distance = parseFloat(trip.total_distance) || 0;
    // Use estimated_duration_seconds if available (from backend serializer)
    duration = trip.estimated_duration_seconds 
      ? (trip.estimated_duration_seconds / 3600) 
      : trip.estimated_duration 
        ? (trip.estimated_duration / 3600) 
        : 0;

    if (trip.route_data) {
      if (trip.route_data.coordinates) {
        coordinates = trip.route_data.coordinates;
      }
      
      if (trip.route_data.geometry && trip.route_data.geometry.coordinates) {
        const geoCoords = trip.route_data.geometry.coordinates;
        route = geoCoords.map(coord => [coord[1], coord[0]]);
      }
    }

    if (!coordinates && trip.current_location_details && trip.dropoff_location_details) {
      coordinates = {
        current: [
          parseFloat(trip.current_location_details.latitude) || 41.8781,
          parseFloat(trip.current_location_details.longitude) || -87.6298
        ],
        pickup: [
          parseFloat(trip.pickup_location_details.latitude) || 41.8781,
          parseFloat(trip.pickup_location_details.longitude) || -87.6298
        ],
        dropoff: [
          parseFloat(trip.dropoff_location_details.latitude) || 39.7392,
          parseFloat(trip.dropoff_location_details.longitude) || -104.9903
        ]
      };
    }

    if (!coordinates) {
      coordinates = {
        current: [41.8781, -87.6298],
        pickup: [41.8781, -87.6298],
        dropoff: [39.7392, -104.9903]
      };
    }

    if (!route && coordinates) {
      route = [coordinates.current, coordinates.pickup, coordinates.dropoff];
    }

    const routeInfo = {
      distance: distance,
      duration: duration,
      coordinates: coordinates,
      route: route,
      source: 'backend'
    };

    return routeInfo;
  };

  const handleDistanceCalculated = (routeData) => {
    console.log('📐 Route calculated in FRONTEND:', routeData);
    if (!routeInfo || routeInfo.distance === 0) {
      setRouteInfo({...routeData, source: 'frontend_fallback'});
    }
  };

  // ✅ Afficher un message si pas d'utilisateur
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            🔐 Authentication Required
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Please log in to access the trip planner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activePage="/trips" />
          
          <div className="flex-1 space-y-6">
            {/* Header avec info driver */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Trip Planner 🗺️
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  {tripCreated 
                    ? `Viewing: ${tripData?.current_location?.city || 'Start'} → ${tripData?.dropoff_location?.city || 'Destination'}`
                    : 'Plan your routes with automatic HOS compliance'
                  }
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Driver: {user.first_name} {user.last_name} • {allTrips.length} trips
                </p>
              </div>
              
              <div className="flex space-x-3">
                {tripCreated && (
                  <>
                    <button
                      onClick={handleNewTrip}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Plan New Trip
                    </button>
                    {tripData?.status === 'planned' && (
                      <button
                        onClick={() => handleTripStatusChange(selectedTripId, 'in_progress')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        Start Trip
                      </button>
                    )}
                    {tripData?.status === 'in_progress' && (
                      <button
                        onClick={() => handleTripStatusChange(selectedTripId, 'completed')}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      >
                        Complete Trip
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Reste du code inchangé */}
            {/* ... */}
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {/* Show TripWizard only when no trip is selected */}
                {!tripCreated && (
                  <TripWizard onTripCreated={handleTripCreated} />
                )}
                
                {/* Show HOS Break Planner when trip is selected */}
                {tripCreated && (
                  <HOSBreakPlanner 
                    tripData={tripData}
                    routeInfo={routeInfo}
                  />
                )}

                {/* Always show Trip History */}
                <TripHistory 
                  trips={allTrips}
                  selectedTripId={selectedTripId}
                  onTripSelect={handleTripSelect}
                  onTripStatusChange={handleTripStatusChange}
                  onTripDelete={handleTripDelete}
                  currentDriverId={currentDriverId}
                />
              </div>
              
              {/* Always show Interactive Map */}
              <div className="xl:col-span-1">
                <InteractiveMap 
                  tripData={tripData}
                  onDistanceCalculated={handleDistanceCalculated}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;