// src/components/admin/RealTimeMonitoring.jsx
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';

const RealTimeMonitoring = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  // Simulation de données en temps réel
  useEffect(() => {
    const mockOnlineUsers = [
      { id: 1, name: 'John Driver', role: 'driver', lastActive: '2 min ago', status: 'driving' },
      { id: 2, name: 'Sarah Manager', role: 'manager', lastActive: '5 min ago', status: 'online' },
      { id: 3, name: 'Mike Trucker', role: 'driver', lastActive: '1 min ago', status: 'on_duty' },
      { id: 4, name: 'Robert Hauler', role: 'driver', lastActive: '30 sec ago', status: 'driving' },
    ];

    const mockActiveTrips = [
      { id: 1, driver: 'John Driver', from: 'NYC', to: 'Chicago', progress: 65, status: 'on_time' },
      { id: 2, driver: 'Mike Trucker', from: 'Chicago', to: 'LA', progress: 25, status: 'delayed' },
    ];

    const mockAlerts = [
      { id: 1, type: 'hos_violation', message: 'HOS violation detected for driver Mike', time: '5 min ago', severity: 'high' },
      { id: 2, type: 'system', message: 'Backup completed successfully', time: '1 hour ago', severity: 'low' },
    ];

    setOnlineUsers(mockOnlineUsers);
    setActiveTrips(mockActiveTrips);
    setSystemAlerts(mockAlerts);

    // Simulation de mises à jour en temps réel
    const interval = setInterval(() => {
      setOnlineUsers(prev => 
        prev.map(user => ({
          ...user,
          lastActive: 'just now'
        }))
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'driving': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'on_duty': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'online': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Utilisateurs en ligne */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Online Users ({onlineUsers.length})
          </h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {onlineUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm">
                  {user.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {user.lastActive}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Alertes système */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            System Alerts
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Real-time
          </span>
        </div>
        
        <div className="space-y-3">
          {systemAlerts.map(alert => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getAlertColor(alert.severity)}`}>
                {alert.severity === 'high' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-900 dark:text-white">
                  {alert.message}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {alert.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Trajets actifs */}
      <GlassCard className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Active Trips ({activeTrips.length})
        </h3>
        
        <div className="space-y-4">
          {activeTrips.map(trip => (
            <div key={trip.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                  🚛
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {trip.driver}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {trip.from} → {trip.to}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {trip.progress}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Progress
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  trip.status === 'on_time' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                }`}>
                  {trip.status === 'on_time' ? 'On Time' : 'Delayed'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default RealTimeMonitoring;