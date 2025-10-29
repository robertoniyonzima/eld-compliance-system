// src/components/dashboard/StatsCards.jsx
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import { apiService } from '../../services/api';

const StatsCards = () => {
  const [stats, setStats] = useState([
    {
      title: 'Hours Used',
      value: '--',
      max: '70h',
      percentage: 0,
      color: 'from-blue-500 to-cyan-500',
      icon: '⏱️',
      trend: 'Loading...'
    },
    {
      title: 'Mileage',
      value: '--',
      unit: 'miles',
      color: 'from-green-500 to-emerald-500',
      icon: '🛣️',
      trend: 'Loading...'
    },
    {
      title: 'HOS Compliance',
      value: '--',
      color: 'from-purple-500 to-pink-500',
      icon: '✅',
      trend: 'Loading...'
    },
    {
      title: 'Active Trips',
      value: '--',
      color: 'from-orange-500 to-red-500',
      icon: '🚛',
      trend: 'Loading...'
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.eld.getDriverStats();
      const data = response.data;

      setStats([
        {
          title: 'Hours Used',
          value: `${data.hours_used}h`,
          max: `${data.max_hours}h`,
          percentage: data.percentage_used,
          color: 'from-blue-500 to-cyan-500',
          icon: '⏱️',
          trend: `+${data.today_hours}h today`
        },
        {
          title: 'Mileage',
          value: data.total_miles.toLocaleString(),
          unit: 'miles',
          color: 'from-green-500 to-emerald-500',
          icon: '🛣️',
          trend: 'This week'
        },
        {
          title: 'HOS Compliance',
          value: `${data.compliance_percentage}%`,
          color: 'from-purple-500 to-pink-500',
          icon: '✅',
          trend: data.compliance_percentage >= 95 ? 'Excellent' : 'Needs improvement'
        },
        {
          title: 'Active Trips',
          value: data.active_trips.toString(),
          color: 'from-orange-500 to-red-500',
          icon: '🚛',
          trend: data.active_trips > 0 ? 'In progress' : 'No active trips'
        }
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <GlassCard key={index} className="p-6 hover:scale-105 transition-transform duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                {stat.title}
              </p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </h3>
                {stat.unit && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
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
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Progress</span>
                <span>{stat.percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
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
            'text-slate-600 dark:text-slate-400'
          }`}>
            {stat.trend}
          </p>
        </GlassCard>
      ))}
    </div>
  );
};

export default StatsCards;