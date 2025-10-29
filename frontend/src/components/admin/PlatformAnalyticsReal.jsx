// src/components/admin/PlatformAnalyticsReal.jsx - REAL DATA VERSION
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import { apiService } from '../../services/api';
import { adminService } from '../../services/admin';

const PlatformAnalyticsReal = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalManagers: 0,
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalDistance: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load users
      const usersData = await adminService.getUsers();
      const drivers = usersData.filter(u => u.user_type === 'driver');
      const managers = usersData.filter(u => u.user_type === 'manager');
      
      // Load trips
      const tripsData = await apiService.trips.getAll();
      const trips = tripsData.data || [];
      const activeTrips = trips.filter(t => t.status === 'in_progress');
      const completedTrips = trips.filter(t => t.status === 'completed');
      
      // Calculate total distance
      const totalDistance = trips.reduce((sum, trip) => {
        return sum + (trip.total_distance || 0);
      }, 0);
      
      // Recent activity (last 10 trips)
      const recentActivity = trips
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(trip => ({
          id: trip.id,
          driver: trip.driver_name || 'Unknown',
          action: `Trip from ${trip.pickup_location_details?.city || 'Unknown'} to ${trip.dropoff_location_details?.city || 'Unknown'}`,
          time: getTimeAgo(trip.created_at),
          status: trip.status
        }));
      
      setAnalytics({
        totalUsers: usersData.length,
        totalDrivers: drivers.length,
        totalManagers: managers.length,
        totalTrips: trips.length,
        activeTrips: activeTrips.length,
        completedTrips: completedTrips.length,
        totalDistance: Math.round(totalDistance),
        recentActivity
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return badges[status] || badges.planned;
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalUsers}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {analytics.totalDrivers} drivers, {analytics.totalManagers} managers
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Trips</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalTrips}</p>
            </div>
            <div className="text-4xl">🗺️</div>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {analytics.activeTrips} active, {analytics.completedTrips} completed
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Distance</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalDistance.toLocaleString()}</p>
            </div>
            <div className="text-4xl">📏</div>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            miles traveled
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Trips</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.activeTrips}</p>
            </div>
            <div className="text-4xl">🚛</div>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            in progress now
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {analytics.recentActivity.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400 py-8">
              No recent activity
            </p>
          ) : (
            analytics.recentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {activity.driver}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {activity.action}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {activity.time}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(activity.status)}`}>
                  {activity.status.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default PlatformAnalyticsReal;
