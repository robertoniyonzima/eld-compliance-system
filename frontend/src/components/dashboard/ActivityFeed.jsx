// src/components/dashboard/ActivityFeed.jsx
import GlassCard from '../ui/GlassCard';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: 'status_change',
      message: 'Statut changé en "Conduite"',
      time: 'Il y a 2 minutes',
      icon: '🚗',
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'break',
      message: 'Pause de 30 minutes planifiée',
      time: 'Il y a 15 minutes',
      icon: '☕',
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'alert',
      message: 'Alerte: Fenêtre 14h se termine dans 1h',
      time: 'Il y a 1 heure',
      icon: '⚠️',
      color: 'text-amber-500'
    },
    {
      id: 4,
      type: 'trip',
      message: 'Nouveau trajet planifié vers Chicago',
      time: 'Il y a 2 heures',
      icon: '🗺️',
      color: 'text-purple-500'
    }
  ];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activité Récente
        </h3>
        <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
          Voir tout
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-white/20 dark:hover:bg-dark-600/20 transition-colors group">
            <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center group-hover:scale-110 transition-transform ${activity.color}`}>
              <span className="text-lg">{activity.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ActivityFeed;