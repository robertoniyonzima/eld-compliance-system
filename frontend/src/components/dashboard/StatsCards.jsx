// src/components/dashboard/StatsCards.jsx
import GlassCard from '../ui/GlassCard';

const StatsCards = () => {
  const stats = [
    {
      title: 'Heures Utilisées',
      value: '45h',
      max: '70h',
      percentage: 64,
      color: 'from-blue-500 to-cyan-500',
      icon: '⏱️',
      trend: '+2h aujourd\'hui'
    },
    {
      title: 'Kilométrage',
      value: '1,247',
      unit: 'km',
      color: 'from-green-500 to-emerald-500',
      icon: '🛣️',
      trend: '+156km cette semaine'
    },
    {
      title: 'Conformité HOS',
      value: '98%',
      color: 'from-purple-500 to-pink-500',
      icon: '✅',
      trend: 'Excellent'
    },
    {
      title: 'Trajets Actifs',
      value: '3',
      color: 'from-orange-500 to-red-500',
      icon: '🚛',
      trend: '1 en attente'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <GlassCard key={index} className="p-6 hover:scale-105 transition-transform duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                {stat.title}
              </p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
                {stat.unit && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.unit}
                  </span>
                )}
              </div>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <span className="text-white text-lg">{stat.icon}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          {stat.percentage && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progression</span>
                <span>{stat.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-1000`}
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Trend */}
          <p className={`text-xs mt-3 ${
            stat.trend.includes('+') ? 'text-green-600 dark:text-green-400' : 
            stat.trend.includes('Excellent') ? 'text-blue-600 dark:text-blue-400' : 
            'text-gray-600 dark:text-gray-400'
          }`}>
            {stat.trend}
          </p>
        </GlassCard>
      ))}
    </div>
  );
};

export default StatsCards;