// src/pages/dashboard/ManagerDashboard.jsx - PROFESSIONAL VERSION
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import DriversManagement from '../../components/manager/DriversManagement';
import DocumentsManagement from '../../components/manager/DocumentsManagement';
import TripsManagement from '../../components/shared/TripsManagement';
import GlassCard from '../../components/ui/GlassCard';
import Icon from '../../components/ui/Icon';
import StatCard from '../../components/ui/StatCard';
import { apiService } from '../../services/api';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    pendingApprovals: 0,
    totalDocuments: 0,
    todayDocuments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Check URL params for tab
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [driversRes, logsRes] = await Promise.all([
        apiService.users.getAllUsers().catch(() => ({ data: [] })),
        apiService.eld.getDailyLogs().catch(() => ({ data: [] }))
      ]);

      const drivers = driversRes.data.filter(u => u.user_type === 'driver');
      const logs = logsRes.data || [];
      const today = new Date().toDateString();

      setStats({
        totalDrivers: drivers.length,
        activeDrivers: drivers.filter(d => d.is_active).length,
        pendingApprovals: drivers.filter(d => !d.is_approved).length,
        totalDocuments: logs.length,
        todayDocuments: logs.filter(l => new Date(l.date).toDateString() === today).length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar activePage="/manager" />
          
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Manager Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage drivers, view documents, and monitor fleet operations
              </p>
            </div>

            {/* Stats Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  iconName="Users" 
                  title="Total Drivers" 
                  value={stats.totalDrivers} 
                  subtitle={`${stats.activeDrivers} active`}
                  color="from-blue-500 to-cyan-500" 
                />
                <StatCard 
                  iconName="Clock" 
                  title="Pending Approvals" 
                  value={stats.pendingApprovals} 
                  subtitle="Awaiting review"
                  color="from-amber-500 to-orange-500" 
                />
                <StatCard 
                  iconName="Truck" 
                  title="Active Trips" 
                  value={stats.activeTrips || 0} 
                  subtitle="In progress"
                  color="from-green-500 to-emerald-500" 
                />
                <StatCard 
                  iconName="FileText" 
                  title="Documents" 
                  value={stats.totalDocuments} 
                  subtitle={`${stats.todayDocuments} today`}
                  color="from-purple-500 to-pink-500" 
                />
              </div>
            )}

            {/* Navigation Tabs - Professional */}
            <div className="flex space-x-1 mb-8 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit shadow-sm">
              {[
                { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' }, 
                { id: 'trips', label: 'Trips', icon: 'Map' },
                { id: 'drivers', label: 'Drivers', icon: 'Users' }, 
                { id: 'documents', label: 'Documents', icon: 'FileText' }
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
              {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setActiveTab('drivers')}
                          className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-left"
                        >
                          <div className="text-3xl mb-2">👥</div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                            Manage Drivers
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Approve new drivers, enable/disable accounts
                          </p>
                        </button>

                        <button
                          onClick={() => setActiveTab('documents')}
                          className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors text-left"
                        >
                          <div className="text-3xl mb-2">📄</div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                            View Documents
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Download ELD logs and daily reports (PDF)
                          </p>
                        </button>
                      </div>
                    </div>

                    {stats.pendingApprovals > 0 && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">
                                {stats.pendingApprovals} driver{stats.pendingApprovals > 1 ? 's' : ''} pending approval
                              </h4>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Review and approve new driver registrations
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('drivers')}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                          >
                            Review Now
                          </button>
                        </div>
                      </div>
                  )}
                </div>
              )}

              {activeTab === 'trips' && <TripsManagement />}
              {activeTab === 'drivers' && <DriversManagement />}
              {activeTab === 'documents' && <DocumentsManagement />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
