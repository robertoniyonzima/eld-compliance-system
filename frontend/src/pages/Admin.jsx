// src/pages/Admin.jsx - VERSION SPÉCIALISÉE
import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import AdminStatsCards from '../components/admin/AdminStatsCards';
import UserManagement from '../components/admin/UserManagement';
import PlatformAnalytics from '../components/admin/PlatformAnalytics';
import RealTimeMonitoring from '../components/admin/RealTimeMonitoring';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    onlineUsers: 0,
    activeTrips: 0
  });

  // Données simulées - À remplacer par l'API
  useEffect(() => {
    // Simulation de données dynamiques
    const mockStats = {
      totalUsers: 1247,
      pendingApprovals: 23,
      onlineUsers: 89,
      activeTrips: 45
    };
    setStats(mockStats);

    // Simulation de mises à jour en temps réel
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        onlineUsers: Math.floor(Math.random() * 50) + 70,
        activeTrips: Math.floor(Math.random() * 20) + 40
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
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

            {/* Navigation Tabs simplifiée */}
            <div className="flex space-x-1 mb-8 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
              {[
                { id: 'users', label: 'User Management', icon: '👥' },
                { id: 'monitoring', label: 'Real-time Monitoring', icon: '📊' },
                { id: 'analytics', label: 'Platform Analytics', icon: '📈' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            <div className="space-y-6">
              {activeTab === 'users' && <UserManagement />}
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