// components/dashboard/HOSMeter.jsx
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';

const HOSMeter = () => {
  const compliance = {
    hoursUsed: 45,
    hoursRemaining: 25,
    fourteenHourWindow: 6,
    breakRequired: true
  };

  return (
    <GlassCard className="p-6 hover:scale-105">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Conformité HOS
      </h3>
      
      {/* Jauge Principale */}
      <div className="relative mb-6">
        <div className="w-full h-4 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000"
            style={{ width: `${(compliance.hoursUsed / 70) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>0h</span>
          <span>70h</span>
        </div>
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {compliance.hoursUsed}h
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            utilisées
          </span>
        </div>
      </div>

      {/* Indicateurs Secondaires */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Temps restant:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {compliance.hoursRemaining}h
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Fenêtre 14h:</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {compliance.fourteenHourWindow}h
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Pause requise:</span>
          <span className={`font-semibold ${compliance.breakRequired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {compliance.breakRequired ? 'OUI' : 'NON'}
          </span>
        </div>
      </div>

      {/* Bouton Action */}
      <GradientButton className="w-full mt-4">
        📋 Voir Log Complet
      </GradientButton>
    </GlassCard>
  );
};
export default HOSMeter;