// src/pages/Admin.jsx - PROFESSIONAL VERSION
import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import AdminStatsCards from '../components/admin/AdminStatsCards';
import UserManagement from '../components/admin/UserManagement';
import PlatformAnalytics from '../components/admin/PlatformAnalyticsReal';
import RealTimeMonitoring from '../components/admin/RealTimeMonitoring';
import TripsManagement from '../components/shared/TripsManagement';
import DocumentsManagement from '../components/manager/DocumentsManagement';
import Icon from '../components/ui/Icon';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    onlineUsers: 0,
    activeTrips: 0
  });

  // Load real stats from API
  useEffect(() => {
    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const { adminService } = await import('../services/admin');
      const { apiService } = await import('../services/api');
      
      // Load users
      const usersData = await adminService.getUsers();
      const pendingUsers = usersData.filter(u => !u.is_approved && u.user_type === 'driver');
      const recentlyActive = usersData.filter(u => {
        if (!u.last_login) return false;
        const lastLogin = new Date(u.last_login);
        const now = new Date();
        const diffMinutes = (now - lastLogin) / 60000;
        return diffMinutes < 30; // Active in last 30 minutes
      });
      
      // Load trips
      const tripsData = await apiService.trips.getAll();
      const activeTrips = tripsData.data.filter(t => t.status === 'in_progress');
      
      setStats({
        totalUsers: usersData.length,
        pendingApprovals: pendingUsers.length,
        onlineUsers: recentlyActive.length,
        activeTrips: activeTrips.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activePage="/admin" />
          
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Administration Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                User management and platform monitoring
              </p>
            </div>

            {/* Stats en temps réel */}
            <AdminStatsCards stats={stats} />

            {/* Navigation Tabs - Professional */}
            <div className="flex space-x-1 mb-8 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit shadow-sm">
              {[
                { id: 'users', label: 'User Management', icon: 'Users' },
                { id: 'trips', label: 'Trips Management', icon: 'Map' },
                { id: 'documents', label: 'Documents', icon: 'FileText' },
                { id: 'monitoring', label: 'Real-time Monitoring', icon: 'Activity' },
                { id: 'analytics', label: 'Platform Analytics', icon: 'TrendingUp' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon name={tab.icon} size={18} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            <div className="space-y-6">
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'trips' && <TripsManagement />}
              {activeTab === 'documents' && <DocumentsManagement />}
              {activeTab === 'monitoring' && <RealTimeMonitoring />}
              {activeTab === 'analytics' && <PlatformAnalytics />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;