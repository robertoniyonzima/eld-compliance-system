// src/components/eld/StatusSelector.jsx
import GlassCard from '../ui/GlassCard';

const StatusSelector = ({ currentStatus, onStatusChange }) => {
  const statuses = [
    {
      id: 'off_duty',
      label: 'Hors Service',
      icon: '🏠',
      description: 'Temps personnel libre',
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'sleeper_berth',
      label: 'Couchette',
      icon: '🛌',
      description: 'Période de repos en couchette',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'driving',
      label: 'Conduite',
      icon: '🚗',
      description: 'Conduite active du véhicule',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'on_duty',
      label: 'En Service',
      icon: '📋',
      description: 'Travail mais pas de conduite',
      color: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Changer de Statut
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => onStatusChange(status.id)}
            className={`p-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 ${
              currentStatus === status.id
                ? `bg-gradient-to-br ${status.color} text-white shadow-2xl scale-105`
                : 'bg-white/50 dark:bg-dark-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-dark-600/80'
            }`}
          >
            <div className="text-2xl mb-2">{status.icon}</div>
            <div className="font-semibold mb-1">{status.label}</div>
            <div className="text-xs opacity-80">{status.description}</div>
          </button>
        ))}
      </div>
      
      {/* Current Status Display */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Statut actuel</div>
            <div className="text-xl font-semibold">
              {statuses.find(s => s.id === currentStatus)?.label}
            </div>
          </div>
          <div className="text-3xl">
            {statuses.find(s => s.id === currentStatus)?.icon}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default StatusSelector;