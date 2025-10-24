// src/pages/TripPlanner.jsx - VERSION AVEC VOTRE AUTH
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // ✅ Importer votre hook d'auth
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import TripWizard from '../components/trips/TripWizard';
import InteractiveMap from '../components/trips/InteractiveMap';
import HOSBreakPlanner from '../components/trips/HOSBreakPlanner';
import TripHistory from '../components/trips/TripHistory';

// Service de stockage local AVEC isolation par driver
const tripStorage = {
  saveTrip: (tripData, driverId) => {
    console.log('💾 Saving trip for driver:', driverId);
    const storageKey = `driver_trips_${driverId}`;
    const trips = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const tripWithMetadata = {
      ...tripData,
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      driver_id: driverId,
      created_by: driverId,
      created_at: new Date().toISOString(),
      status: 'planned',
      updated_at: new Date().toISOString()
    };
    
    trips.unshift(tripWithMetadata);
    localStorage.setItem(storageKey, JSON.stringify(trips));
    
    console.log('✅ Trip saved. Total trips for this driver:', trips.length);
    return tripWithMetadata;
  },

  getTrips: (driverId) => {
    const storageKey = `driver_trips_${driverId}`;
    const trips = JSON.parse(localStorage.getItem(storageKey) || '[]');
    console.log(`📂 Loading trips for driver ${driverId}:`, trips.length, 'trips found');
    return trips;
  },

  updateTripStatus: (tripId, driverId, status) => {
    const storageKey = `driver_trips_${driverId}`;
    const trips = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedTrips = trips.map(trip => 
      trip.id === tripId ? { 
        ...trip, 
        status, 
        updated_at: new Date().toISOString() 
      } : trip
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedTrips));
    return updatedTrips.find(trip => trip.id === tripId);
  },

  deleteTrip: (tripId, driverId) => {
    const storageKey = `driver_trips_${driverId}`;
    const trips = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const filteredTrips = trips.filter(trip => trip.id !== tripId);
    localStorage.setItem(storageKey, JSON.stringify(filteredTrips));
    return filteredTrips;
  },

  // Debug function
  debugStorage: () => {
    const allKeys = Object.keys(localStorage);
    const tripKeys = allKeys.filter(key => key.startsWith('driver_trips_'));
    console.log('🔍 Storage debug - All trip keys:', tripKeys);
    
    tripKeys.forEach(key => {
      const trips = JSON.parse(localStorage.getItem(key) || '[]');
      console.log(`   ${key}: ${trips.length} trips`);
    });
  }
};

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

  // Charger les trips au démarrage - SEULEMENT pour ce driver
  useEffect(() => {
    if (currentDriverId) {
      loadTripsFromStorage();
      tripStorage.debugStorage(); // Debug
    }
  }, [currentDriverId]);

  const loadTripsFromStorage = () => {
    if (!currentDriverId) {
      console.error('❌ Cannot load trips: no driver ID');
      return;
    }

    const savedTrips = tripStorage.getTrips(currentDriverId);
    console.log('📥 Loaded trips for current driver:', savedTrips);
    
    setAllTrips(savedTrips);
    
    if (savedTrips.length > 0) {
      const lastTrip = savedTrips[0];
      setTripData(lastTrip);
      setTripCreated(true);
      setSelectedTripId(lastTrip.id);
      setActiveTrip(lastTrip);
      
      const restoredRouteInfo = createRouteInfoFromBackend(lastTrip);
      setRouteInfo(restoredRouteInfo);
    } else {
      console.log('📭 No trips found for this driver');
    }
  };

  const handleTripCreated = (tripResponse) => {
    if (!currentDriverId) {
      console.error('❌ Cannot create trip: no driver ID');
      return;
    }

    console.log('✅ Trip created in parent - FULL RESPONSE:', tripResponse);
    
    const trip = tripResponse.data || tripResponse;

    // Créer newTripData
    const newTripData = {
      current_location: trip.current_location_details || trip.current_location || { 
        address: '', city: '', state: '', zip_code: '',
        latitude: trip.current_location_details?.latitude,
        longitude: trip.current_location_details?.longitude
      },
      pickup_location: trip.pickup_location_details || trip.pickup_location || { 
        address: '', city: '', state: '', zip_code: '',
        latitude: trip.pickup_location_details?.latitude,
        longitude: trip.pickup_location_details?.longitude
      },
      dropoff_location: trip.dropoff_location_details || trip.dropoff_location || { 
        address: '', city: '', state: '', zip_code: '',
        latitude: trip.dropoff_location_details?.latitude,
        longitude: trip.dropoff_location_details?.longitude
      },
      current_cycle_used: trip.current_cycle_used || 0,
      total_distance: trip.total_distance,
      estimated_duration: trip.estimated_duration,
      route_data: trip.route_data,
    };
    
    // ✅ Sauvegarder AVEC le vrai ID du driver
    const savedTrip = tripStorage.saveTrip(newTripData, currentDriverId);
    
    setActiveTrip(savedTrip);
    setTripData(savedTrip);
    setTripCreated(true);
    setSelectedTripId(savedTrip.id);
    loadTripsFromStorage();

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

  const handleTripStatusChange = (tripId, newStatus) => {
    if (!currentDriverId) {
      console.error('❌ Cannot update trip status: no driver ID');
      return;
    }

    console.log(`🔄 Changing trip ${tripId} status to: ${newStatus}`);
    
    const updatedTrip = tripStorage.updateTripStatus(tripId, currentDriverId, newStatus);
    loadTripsFromStorage();
    
    if (selectedTripId === tripId) {
      setTripData(updatedTrip);
      setActiveTrip(updatedTrip);
    }
  };

  const handleTripDelete = (tripId) => {
    if (!currentDriverId) {
      console.error('❌ Cannot delete trip: no driver ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this trip?')) {
      const remainingTrips = tripStorage.deleteTrip(tripId, currentDriverId);
      setAllTrips(remainingTrips);
      
      if (selectedTripId === tripId) {
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
    duration = trip.estimated_duration ? (trip.estimated_duration / 3600) : 0;

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
                <TripWizard onTripCreated={handleTripCreated} />
                
                {tripCreated && (
                  <HOSBreakPlanner 
                    tripData={tripData}
                    routeInfo={routeInfo}
                  />
                )}

                <TripHistory 
                  trips={allTrips}
                  selectedTripId={selectedTripId}
                  onTripSelect={handleTripSelect}
                  onTripStatusChange={handleTripStatusChange}
                  onTripDelete={handleTripDelete}
                  currentDriverId={currentDriverId}
                />
              </div>
              
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