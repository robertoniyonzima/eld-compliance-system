// src/components/dashboard/RecentTrips.jsx
import GlassCard from '../ui/GlassCard';

const RecentTrips = () => {
  const trips = [
    {
      id: 1,
      from: 'New York, NY',
      to: 'Chicago, IL',
      distance: '790 miles',
      status: 'En cours',
      progress: 65,
      icon: '🚛'
    },
    {
      id: 2,
      from: 'Chicago, IL',
      to: 'Los Angeles, CA',
      distance: '2,015 miles',
      status: 'Planifié',
      progress: 0,
      icon: '🗺️'
    }
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Trajets Récents
      </h3>
      
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
                  trip.status === 'En cours' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
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
                    {trip.progress}% complété
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 text-primary-500 hover:text-primary-600 font-medium transition-colors">
        + Nouveau trajet
      </button>
    </GlassCard>
  );
};

export default RecentTrips;