// src/components/admin/RecentActivity.jsx
import GlassCard from '../ui/GlassCard';

const RecentActivity = ({ compact = false }) => {
  const activities = [
    {
      id: 1,
      user: 'John Driver',
      action: 'started_trip',
      description: 'Started trip from NYC to Chicago',
      time: '2 minutes ago',
      icon: '🚛',
      type: 'trip'
    },
    {
      id: 2,
      user: 'Sarah Manager',
      action: 'user_approved',
      description: 'Approved new driver registration',
      time: '15 minutes ago',
      icon: '✅',
      type: 'user'
    },
    {
      id: 3,
      user: 'System',
      action: 'hos_violation',
      description: 'HOS violation detected for driver Mike',
      time: '1 hour ago',
      icon: '⚠️',
      type: 'alert'
    },
    {
      id: 4,
      user: 'Robert Veteran',
      action: 'trip_completed',
      description: 'Completed trip to Los Angeles',
      time: '2 hours ago',
      icon: '🏁',
      type: 'trip'
    }
  ];

  if (compact) {
    return (
      <GlassCard className="p-6">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {activities.slice(0, 3).map(activity => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                activity.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                activity.type === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 dark:text-white truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Real-time platform activities and events
          </p>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              activity.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
              activity.type === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {activity.description}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activity.user}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default RecentActivity;