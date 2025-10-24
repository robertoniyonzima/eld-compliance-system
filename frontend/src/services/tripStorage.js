// src/services/tripStorage.js
export const tripStorage = {
  // Sauvegarder dans localStorage + backend
  saveTrip: async (tripData) => {
    // 1. Local storage pour performance
    const trips = JSON.parse(localStorage.getItem('driver_trips') || '[]');
    trips.push({
      ...tripData,
      id: Date.now(),
      created_at: new Date().toISOString(),
      status: 'planned' // planned, in_progress, completed, cancelled
    });
    localStorage.setItem('driver_trips', JSON.stringify(trips));
    
    // 2. Synchroniser avec backend (optionnel)
    await apiService.trips.saveToHistory(tripData);
  },

  // Charger l'historique
  getTrips: () => {
    return JSON.parse(localStorage.getItem('driver_trips') || '[]');
  },

  // Mettre à jour statut
  updateTripStatus: (tripId, status) => {
    const trips = tripStorage.getTrips();
    const updatedTrips = trips.map(trip => 
      trip.id === tripId ? { ...trip, status, updated_at: new Date().toISOString() } : trip
    );
    localStorage.setItem('driver_trips', JSON.stringify(updatedTrips));
  }
};