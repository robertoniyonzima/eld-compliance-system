// src/components/admin/PlatformAnalytics.jsx
import { useState } from 'react';
import GlassCard from '../ui/GlassCard';

const PlatformAnalytics = ({ compact = false }) => {
  const [timeRange, setTimeRange] = useState('7d');

  const analyticsData = {
    usage: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [65, 78, 82, 79, 85, 45, 60]
    },
    compliance: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [92, 94, 96, 96.2]
    },
    userGrowth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      data: [800, 950, 1100, 1247]
    }
  };

  if (compact) {
    return (
      <GlassCard className="p-6">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Platform Analytics</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Active Users</span>
            <span className="font-semibold text-slate-900 dark:text-white">1,247</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Avg Compliance</span>
            <span className="font-semibold text-green-600 dark:text-green-400">96.2%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Trips Today</span>
            <span className="font-semibold text-slate-900 dark:text-white">89</span>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Platform Analytics
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Detailed platform performance metrics
          </p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Analytics Charts (simulés) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Daily Platform Usage</h4>
          <div className="flex items-end space-x-1 h-32">
            {analyticsData.usage.data.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-500 hover:from-blue-400 hover:to-blue-500"
                  style={{ height: `${value}%` }}
                ></div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {analyticsData.usage.labels[index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Trend */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Compliance Trend</h4>
          <div className="flex items-end space-x-2 h-32">
            {analyticsData.compliance.data.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-green-500 to-emerald-600 rounded-t transition-all duration-500 hover:from-green-400 hover:to-emerald-500"
                  style={{ height: `${value}%` }}
                ></div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {analyticsData.compliance.labels[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">98.3%</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Uptime</div>
        </div>
        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">2.3s</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Avg Response</div>
        </div>
        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">45</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Active Trips</div>
        </div>
        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">12</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Violations</div>
        </div>
      </div>
    </GlassCard>
  );
};

export default PlatformAnalytics;