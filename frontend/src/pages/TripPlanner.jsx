// src/pages/TripPlanner.jsx - VERSION COMPLÈTEMENT CORRIGÉE
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import TripWizard from '../components/trips/TripWizard';
import InteractiveMap from '../components/trips/InteractiveMap';
import HOSBreakPlanner from '../components/trips/HOSBreakPlanner';

const TripPlanner = () => {
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [tripCreated, setTripCreated] = useState(false);

  const handleTripCreated = (tripResponse) => {
    console.log('✅ Trip created in parent - FULL RESPONSE:', tripResponse);
    
    // Le trip est dans tripResponse.data, pas directement dans tripResponse
    const trip = tripResponse.data || tripResponse;
    console.log('📦 Trip data structure:', trip);
    
    // DEBUG: Vérifier la structure complète de la réponse
    console.log('🔍 Response keys:', Object.keys(tripResponse));
    console.log('🔍 Data keys:', Object.keys(trip));
    console.log('🔍 Route data exists?', !!trip.route_data);
    console.log('🔍 Route data:', trip.route_data);
    console.log('🔍 Total distance:', trip.total_distance);
    console.log('🔍 Estimated duration:', trip.estimated_duration);

    // EXTRAIRE les données de localisation
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
      route_data: trip.route_data
    };
    
    console.log('📝 Setting trip data:', newTripData);
    
    setActiveTrip(trip);
    setTripData(newTripData);
    setTripCreated(true);

    // CRÉER routeInfo à partir des données du backend
    const backendRouteInfo = createRouteInfoFromBackend(trip);
    if (backendRouteInfo) {
      setRouteInfo(backendRouteInfo);
      console.log('🗺️ Route info from BACKEND:', backendRouteInfo);
    } else {
      console.log('❌ No route info could be created from backend data');
    }
  };

  const createRouteInfoFromBackend = (trip) => {
    if (!trip) return null;

    console.log('🔄 Creating route info from backend data...');
    
    // Essayer différentes structures de données
    let distance, duration, coordinates, route;
    
    // 1. Données directes du trip
    distance = parseFloat(trip.total_distance) || 0;
    duration = trip.estimated_duration ? (trip.estimated_duration / 3600) : 0; // convertir secondes en heures
    
    console.log('📏 Basic trip data:', { distance, duration });

    // 2. Coordonnées depuis route_data
    if (trip.route_data) {
      console.log('📍 Route data available:', trip.route_data);
      
      if (trip.route_data.coordinates) {
        coordinates = trip.route_data.coordinates;
        console.log('📍 Coordinates from route_data:', coordinates);
      }
      
      if (trip.route_data.geometry && trip.route_data.geometry.coordinates) {
        // Convertir les coordonnées GeoJSON [lng, lat] en [lat, lng] pour Leaflet
        const geoCoords = trip.route_data.geometry.coordinates;
        route = geoCoords.map(coord => [coord[1], coord[0]]); // [lng, lat] -> [lat, lng]
        console.log('🔄 Route from geometry:', route);
      }
    }

    // 3. Fallback: créer des coordonnées basiques depuis les locations
    if (!coordinates && trip.current_location_details && trip.dropoff_location_details) {
      console.log('🔄 Creating fallback coordinates from location details');
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

    // 4. Fallback ultime: utiliser des coordonnées par défaut
    if (!coordinates) {
      console.log('🔄 Using default coordinates');
      coordinates = {
        current: [41.8781, -87.6298], // Chicago
        pickup: [41.8781, -87.6298],  // Chicago
        dropoff: [39.7392, -104.9903] // Denver
      };
    }

    // Créer la route si pas déjà fait
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

    console.log('✅ Final route info:', routeInfo);
    return routeInfo;
  };

  const handleDistanceCalculated = (routeData) => {
    console.log('📐 Route calculated in FRONTEND:', routeData);
    // Utiliser le calcul frontend seulement si le backend n'a pas fourni de données
    if (!routeInfo || routeInfo.distance === 0) {
      setRouteInfo({...routeData, source: 'frontend_fallback'});
    }
  };

  const handleNewTrip = () => {
    setTripData(null);
    setRouteInfo(null);
    setTripCreated(false);
    setActiveTrip(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activePage="/trips" />
          
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Trip Planner
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  {tripCreated ? 'Trip planned successfully! 🎉' : 'Plan your routes with automatic HOS compliance'}
                </p>
              </div>
              
              {tripCreated && (
                <button
                  onClick={handleNewTrip}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Plan New Trip
                </button>
              )}
            </div>

            {/* Debug Info */}
            {tripCreated && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Trip Information
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Source: {routeInfo?.source || 'Unknown'} | 
                      Distance: {routeInfo?.distance || 0} miles |
                      Duration: {routeInfo?.duration || 0} hours
                    </p>
                    {tripData && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Route: {tripData.current_location?.city || 'Unknown'} → {tripData.pickup_location?.city || 'Unknown'} → {tripData.dropoff_location?.city || 'Unknown'}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      console.log('🔍 DEBUG Trip Data:', tripData);
                      console.log('🔍 DEBUG Route Info:', routeInfo);
                      console.log('🔍 DEBUG Active Trip:', activeTrip);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Show Logs
                  </button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {tripCreated && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="text-green-600 dark:text-green-400 text-2xl mr-3">✅</div>
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Trip Created Successfully!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Route from {tripData?.current_location?.city || 'start'} to {tripData?.dropoff_location?.city || 'destination'} has been planned.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Forms */}
              <div className="xl:col-span-2 space-y-6">
                <TripWizard onTripCreated={handleTripCreated} />
                
                {/* Afficher HOSBreakPlanner seulement quand on a des données */}
                {tripCreated && (
                  <HOSBreakPlanner 
                    tripData={tripData}
                    routeInfo={routeInfo}
                  />
                )}
              </div>
              
              {/* Right Column - Map */}
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