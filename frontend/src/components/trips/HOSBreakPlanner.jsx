// src/components/trips/HOSBreakPlanner.jsx
import GlassCard from '../ui/GlassCard';

const HOSBreakPlanner = () => {
  const breaks = [
    { time: '14:30', duration: '30min', type: 'Pause HOS', location: 'Aire de repos I-90', status: 'Planifiée' },
    { time: '18:45', duration: '1h', type: 'Pause repas', location: 'Restaurant Chicago', status: 'Recommandée' },
    { time: '22:00', duration: '10h', type: 'Repos quotidien', location: 'Hôtel Motel', status: 'Obligatoire' }
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Planification des Pauses HOS
      </h3>
      
      <div className="space-y-4">
        {breaks.map((breakItem, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white/30 dark:bg-dark-700/30 rounded-xl border border-white/20 dark:border-dark-600/30 hover:bg-white/50 dark:hover:bg-dark-600/50 transition-all">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                breakItem.status === 'Planifiée' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                breakItem.status === 'Recommandée' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              }`}>
                <span className="text-lg">
                  {breakItem.type.includes('Pause') ? '☕' : '🛌'}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {breakItem.time} • {breakItem.duration}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {breakItem.type} - {breakItem.location}
                </p>
              </div>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              breakItem.status === 'Planifiée' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
              breakItem.status === 'Recommandée' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
              'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            }`}>
              {breakItem.status}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Statut de conformité</div>
            <div className="text-xl font-semibold">100% Conforme</div>
          </div>
          <div className="text-3xl">✅</div>
        </div>
      </div>
    </GlassCard>
  );
};

export default HOSBreakPlanner;