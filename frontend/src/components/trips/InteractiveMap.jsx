// src/components/trips/InteractiveMap.jsx - VERSION UTILISANT BACKEND
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const InteractiveMap = ({ tripData, onDistanceCalculated }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [markers, setMarkers] = useState({});
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  // Safe trip data - Support both formats (location and location_details)
  const safeTripData = tripData ? {
    current_location: tripData.current_location_details || tripData.current_location || { address: '', city: '', state: '', zip_code: '' },
    pickup_location: tripData.pickup_location_details || tripData.pickup_location || { address: '', city: '', state: '', zip_code: '' },
    dropoff_location: tripData.dropoff_location_details || tripData.dropoff_location || { address: '', city: '', state: '', zip_code: '' }
  } : {
    current_location: { address: '', city: '', state: '', zip_code: '' },
    pickup_location: { address: '', city: '', state: '', zip_code: '' },
    dropoff_location: { address: '', city: '', state: '', zip_code: '' }
  };

  console.log('🗺️ InteractiveMap received tripData:', tripData);
  console.log('🗺️ Processed safeTripData:', safeTripData);

  // Calculate route when tripData changes
  useEffect(() => {
    console.log('🔄 useEffect triggered with tripData:', tripData);
    
    if (hasValidTripData(safeTripData)) {
      console.log('✅ Valid trip data, calculating route...');
      calculateRoute();
    } else {
      console.log('❌ Invalid trip data, skipping route calculation');
    }
  }, [tripData]);

  const hasValidTripData = (data) => {
    if (!data) return false;
    
    const currentCity = data.current_location?.city;
    const dropoffCity = data.dropoff_location?.city;
    
    return currentCity && dropoffCity && currentCity.trim() !== '' && dropoffCity.trim() !== '';
  };

  const calculateRoute = () => {
    console.log('🚀 Starting route calculation...');
    setLoading(true);
    
    try {
      // ESSAYER D'ABORD d'utiliser les coordonnées du backend si disponibles
      let coordinates;
      
      if (safeTripData.current_location?.latitude && safeTripData.current_location?.longitude) {
        // ✅ Utiliser les coordonnées du BACKEND
        console.log('✅ Using BACKEND coordinates');
        coordinates = {
          current: [
            parseFloat(safeTripData.current_location.latitude),
            parseFloat(safeTripData.current_location.longitude)
          ],
          pickup: [
            parseFloat(safeTripData.pickup_location.latitude),
            parseFloat(safeTripData.pickup_location.longitude)
          ],
          dropoff: [
            parseFloat(safeTripData.dropoff_location.latitude),
            parseFloat(safeTripData.dropoff_location.longitude)
          ]
        };
      } else {
        // ❌ Fallback vers le calcul frontend
        console.log('❌ No backend coordinates, using frontend fallback');
        coordinates = getCoordinatesFromCities(
          safeTripData.current_location,
          safeTripData.pickup_location, 
          safeTripData.dropoff_location
        );
      }

      console.log('📍 Final coordinates:', coordinates);

      setMarkers(coordinates);

      // Use backend distance if available, otherwise calculate
      let totalDistance, totalDuration;
      
      if (tripData?.total_distance && tripData?.estimated_duration_seconds) {
        // Use backend calculated values
        totalDistance = Math.round(tripData.total_distance);
        totalDuration = Math.round((tripData.estimated_duration_seconds / 3600) * 10) / 10;
        console.log('✅ Using BACKEND distance and duration');
      } else {
        // Calculate distances
        const currentToPickup = calculateDistance(coordinates.current, coordinates.pickup);
        const pickupToDropoff = calculateDistance(coordinates.pickup, coordinates.dropoff);
        totalDistance = Math.round(currentToPickup + pickupToDropoff);
        
        // Calculate duration (55 mph average)
        totalDuration = Math.round((totalDistance / 55) * 10) / 10;
        console.log('⚠️ Using FRONTEND calculated distance and duration');
      }

      console.log('📏 Total distance:', totalDistance, 'miles');
      console.log('⏱️ Total duration:', totalDuration, 'hours');

      // Create route
      const routeLine = [coordinates.current, coordinates.pickup, coordinates.dropoff];
      
      setRoute(routeLine);
      setDistance(totalDistance);
      setDuration(totalDuration);
      
      // Center map
      const centerLat = (coordinates.current[0] + coordinates.dropoff[0]) / 2;
      const centerLon = (coordinates.current[1] + coordinates.dropoff[1]) / 2;

      // Notify parent
      if (onDistanceCalculated) {
        onDistanceCalculated({
          distance: totalDistance,
          duration: totalDuration,
          route: routeLine,
          coordinates: coordinates
        });
      }

      // Update map view
      if (mapRef.current) {
        mapRef.current.setView([centerLat, centerLon], 6);
      }

    } catch (error) {
      console.error('❌ Route calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback pour quand le backend ne fournit pas de coordonnées
  const getCoordinatesFromCities = (current, pickup, dropoff) => {
    const CITY_COORDINATES = {
      'chicago': [41.8781, -87.6298],
      'denver': [39.7392, -104.9903],
      'detroit': [42.3314, -83.0458],
      'cleveland': [41.4993, -81.6944],
      'new york': [40.7128, -74.0060],
      'los angeles': [34.0522, -118.2437],
      'miami': [25.7617, -80.1918],
      'seattle': [47.6062, -122.3321],
      'dallas': [32.7767, -96.7970],
      'boston': [42.3601, -71.0589],
      'il': [41.8781, -87.6298],
      'co': [39.7392, -104.9903],
      'mi': [42.7335, -84.5555],
      'oh': [39.9612, -82.9988],
      'ny': [40.7128, -74.0060],
      'ca': [36.1162, -119.6816],
      'fl': [30.4383, -84.2807],
      'wa': [47.0379, -122.9007],
      'tx': [31.0545, -97.5635],
      'ma': [42.2302, -71.5301]
    };

    const getCoord = (location) => {
      if (!location) return [39.8283, -98.5795];
      
      const cityKey = location.city?.toLowerCase() || '';
      const stateKey = location.state?.toLowerCase() || '';
      
      return CITY_COORDINATES[cityKey] || CITY_COORDINATES[stateKey] || [39.8283, -98.5795];
    };

    return {
      current: getCoord(current),
      pickup: getCoord(pickup),
      dropoff: getCoord(dropoff)
    };
  };

  // Haversine formula for distance calculation
  const calculateDistance = (coord1, coord2) => {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance);
  };

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  const getLocationText = (location, type) => {
    if (!location || !location.city) return `${type} Location`;
    return `${location.city}, ${location.state || ''}`;
  };

  const getAddressText = (location) => {
    return location?.address || '';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Route Overview
        </h3>
        {loading ? (
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Calculating route...</span>
          </div>
        ) : distance ? (
          <div className="flex space-x-6 mt-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-slate-600 dark:text-slate-400">Distance:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{distance} miles</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-600 dark:text-slate-400">Time:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{duration} hours</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {hasValidTripData(safeTripData) ? 'Ready to calculate route' : 'Enter trip details to see route'}
          </p>
        )}
      </div>
      
      {/* Map Container */}
      <div className="h-96 relative">
        {mapLoaded ? (
          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            className="h-full w-full"
            ref={mapRef}
            style={{ background: '#f8fafc' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {/* Markers */}
            {markers.current && (
              <Marker 
                position={markers.current} 
                icon={createCustomIcon('blue')}
                // ✅ AJOUTER un décalage pour éviter la superposition
                zIndexOffset={1000}
              >
                <Popup>
                  <div className="text-center min-w-[200px]">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <strong className="text-blue-600">Current Location</strong>
                    </div>
                    <p className="text-sm font-semibold">
                      {getLocationText(safeTripData.current_location, 'Current')}
                    </p>
                    {getAddressText(safeTripData.current_location) && (
                      <p className="text-xs text-slate-600 mt-1">
                        {getAddressText(safeTripData.current_location)}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-blue-500">
                      🚛 Starting Point
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}


            {markers.pickup && (
              <Marker 
                position={markers.pickup} 
                icon={createCustomIcon('orange')}
                // ✅ AJOUTER un décalage
                zIndexOffset={900}
              >
                <Popup>
                  <div className="text-center min-w-[200px]">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <strong className="text-orange-600">Pickup Location</strong>
                    </div>
                    <p className="text-sm font-semibold">
                      {getLocationText(safeTripData.pickup_location, 'Pickup')}
                    </p>
                    {getAddressText(safeTripData.pickup_location) && (
                      <p className="text-xs text-slate-600 mt-1">
                        {getAddressText(safeTripData.pickup_location)}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-orange-500">
                      📦 Load Pickup
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {markers.dropoff && (
              <Marker 
                position={markers.dropoff} 
                icon={createCustomIcon('red')}
                // ✅ AJOUTER un décalage
                zIndexOffset={800}
              >
                <Popup>
                  <div className="text-center min-w-[200px]">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <strong className="text-red-600">Destination</strong>
                    </div>
                    <p className="text-sm font-semibold">
                      {getLocationText(safeTripData.dropoff_location, 'Destination')}
                    </p>
                    {getAddressText(safeTripData.dropoff_location) && (
                      <p className="text-xs text-slate-600 mt-1">
                        {getAddressText(safeTripData.dropoff_location)}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-red-500">
                      🏁 Final Destination
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
                        
            {/* Route Line */}
            {route.length > 0 && (
              <Polyline
                positions={route}
                color="#3b82f6"
                weight={5}
                opacity={0.7}
              />
            )}
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-slate-600 dark:text-slate-400 text-sm">Loading map...</div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">Pickup</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;