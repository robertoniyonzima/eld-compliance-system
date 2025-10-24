// src/components/eld/StatusHistory.jsx
import { useELD } from '../../hooks/useELD';
import GlassCard from '../ui/GlassCard';

const StatusHistory = ({ date }) => {
  const { statusHistory } = useELD();

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      off_duty: 'bg-gray-100 text-gray-800',
      sleeper_berth: 'bg-blue-100 text-blue-800',
      driving: 'bg-green-100 text-green-800',
      on_duty: 'bg-amber-100 text-amber-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Status History
      </h3>
      
      {statusHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">⏱️</div>
          <p>No status changes today</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {statusHistory.map((change, index) => (
            <div key={change.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(change.status)}`}>
                  {change.status.replace('_', ' ')}
                </span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatTime(change.start_time)}
                  {change.end_time && ` - ${formatTime(change.end_time)}`}
                </div>
              </div>
              {!change.end_time && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default StatusHistory;