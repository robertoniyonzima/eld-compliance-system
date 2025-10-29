// src/components/dashboard/ActivityFeed.jsx - Real data from API (English)
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import { apiService } from '../../services/api';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Get recent status changes from today's log
      const response = await apiService.eld.getTodayLog();
      const log = response.data;
      
      console.log('Today log data:', log); // Debug log
      
      if (log && log.status_changes && log.status_changes.length > 0) {
        const recentActivities = log.status_changes
          .slice(-5) // Last 5 activities
          .reverse()
          .map((change, index) => {
            const timeAgo = getTimeAgo(new Date(change.start_time));
            const statusInfo = getStatusInfo(change.status);
            
            return {
              id: change.id || index,
              type: change.status,
              message: `Status changed to "${statusInfo.label}"`,
              time: timeAgo,
              icon: statusInfo.icon,
              color: statusInfo.color
            };
          });
        
        setActivities(recentActivities);
      } else {
        console.log('No status changes found in today log');
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'off_duty': { label: 'Off Duty', icon: '🛌', color: 'text-gray-500' },
      'sleeper_berth': { label: 'Sleeper Berth', icon: '😴', color: 'text-blue-500' },
      'driving': { label: 'Driving', icon: '🚗', color: 'text-green-500' },
      'on_duty': { label: 'On Duty', icon: '⚙️', color: 'text-orange-500' }
    };
    return statusMap[status] || { label: status, icon: '📋', color: 'text-slate-500' };
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button 
          onClick={() => window.location.href = '/logs'}
          className="text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          View all
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Loading...
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          No recent activity
        </div>
      ) : (
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
      )}
    </GlassCard>
  );
};

export default ActivityFeed;
