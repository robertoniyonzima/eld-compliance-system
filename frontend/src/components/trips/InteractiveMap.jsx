// src/components/trips/InteractiveMap.jsx - AVEC LEAFLET
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import GlassCard from '../ui/GlassCard';

// Correction des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractiveMap = ({ trip }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  const positions = {
    current: [40.7128, -74.0060], // New York
    pickup: [41.8781, -87.6298],  // Chicago
    dropoff: [34.0522, -118.2437] // Los Angeles
  };

  const route = [
    [40.7128, -74.0060],
    [41.8781, -87.6298], 
    [34.0522, -118.2437]
  ];

  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Route Overview
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Real-time trip visualization
        </p>
      </div>
      
      <div className="h-96 relative">
        {mapLoaded ? (
          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            className="h-full w-full rounded-b-2xl"
            style={{ background: '#f1f5f9' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            <Marker position={positions.current}>
              <Popup>
                <div className="text-center">
                  <strong>Current Position</strong>
                  <p className="text-sm">New York, NY</p>
                </div>
              </Popup>
            </Marker>
            
            <Marker position={positions.pickup}>
              <Popup>
                <div className="text-center">
                  <strong>Pickup Location</strong>
                  <p className="text-sm">Chicago, IL</p>
                </div>
              </Popup>
            </Marker>
            
            <Marker position={positions.dropoff}>
              <Popup>
                <div className="text-center">
                  <strong>Destination</strong>
                  <p className="text-sm">Los Angeles, CA</p>
                </div>
              </Popup>
            </Marker>
            
            <Polyline
              positions={route}
              color="#3b82f6"
              weight={4}
              opacity={0.7}
            />
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-b-2xl">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-slate-600 dark:text-slate-400 text-sm">Loading map...</div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default InteractiveMap;