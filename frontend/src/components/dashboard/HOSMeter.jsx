// components/dashboard/HOSMeter.jsx - Real data from API (English)
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import { apiService } from '../../services/api';

const HOSMeter = () => {
  const [compliance, setCompliance] = useState({
    hoursUsed: 0,
    hoursRemaining: 70,
    fourteenHourWindow: 0,
    breakRequired: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompliance();
  }, []);

  const loadCompliance = async () => {
    try {
      setLoading(true);
      const response = await apiService.eld.getDriverStats();
      const data = response.data;
      
      setCompliance({
        hoursUsed: data.hours_used || 0,
        hoursRemaining: data.max_hours - data.hours_used || 70,
        fourteenHourWindow: data.today_hours || 0,
        breakRequired: data.today_hours >= 8
      });
    } catch (error) {
      console.error('Error loading HOS compliance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 hover:scale-105 transition-transform">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        HOS Compliance
      </h3>
      
      {loading ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Loading...
        </div>
      ) : (
        <>
          {/* Main Gauge */}
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
                used
              </span>
            </div>
          </div>

          {/* Secondary Indicators */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Remaining time:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {compliance.hoursRemaining}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">14h window:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {compliance.fourteenHourWindow}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Break required:</span>
              <span className={`font-semibold ${compliance.breakRequired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {compliance.breakRequired ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <GradientButton className="w-full mt-4" onClick={() => window.location.href = '/logs'}>
            📋 View Full Log
          </GradientButton>
        </>
      )}
    </GlassCard>
  );
};

export default HOSMeter;
