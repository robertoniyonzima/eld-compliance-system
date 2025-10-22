// src/components/admin/AdminStatsCards.jsx - VERSION CORRIGÉE
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import { adminService } from '../../services/admin';

const AdminStatsCards = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    suspendedUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const users = await adminService.getUsers(); // ⭐ CORRECTION: users est directement le tableau
      
      console.log('📊 Users data:', users); // Debug: voir la structure des données
      
      // Vérifier que users est bien un tableau
      if (Array.isArray(users)) {
        const statsData = {
          totalUsers: users.length,
          pendingApprovals: users.filter(user => user.status === 'pending').length,
          activeUsers: users.filter(user => user.status === 'active').length,
          suspendedUsers: users.filter(user => user.status === 'suspended').length
        };
        
        setStats(statsData);
      } else {
        console.error('❌ Users data is not an array:', users);
        setStats({
          totalUsers: 0,
          pendingApprovals: 0,
          activeUsers: 0,
          suspendedUsers: 0
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats({
        totalUsers: 0,
        pendingApprovals: 0,
        activeUsers: 0,
        suspendedUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Total Users',
      value: loading ? '...' : stats.totalUsers.toString(),
      change: '+12%',
      trend: 'up',
      color: 'from-blue-500 to-cyan-500',
      icon: '👥',
      description: 'Registered platform users'
    },
    {
      title: 'Pending Approvals',
      value: loading ? '...' : stats.pendingApprovals.toString(),
      change: loading ? '...' : `${stats.pendingApprovals > 0 ? '+' : ''}${stats.pendingApprovals}`,
      trend: loading ? 'neutral' : (stats.pendingApprovals > 0 ? 'up' : 'neutral'),
      color: 'from-amber-500 to-orange-500',
      icon: '⏳',
      description: 'Waiting admin approval'
    },
    {
      title: 'Active Users',
      value: loading ? '...' : stats.activeUsers.toString(),
      change: loading ? '...' : `${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%`,
      trend: 'up',
      color: 'from-green-500 to-emerald-500',
      icon: '✅',
      description: 'Currently active'
    },
    {
      title: 'Suspended',
      value: loading ? '...' : stats.suspendedUsers.toString(),
      change: loading ? '...' : `${stats.suspendedUsers > 0 ? '+' : ''}${stats.suspendedUsers}`,
      trend: loading ? 'neutral' : (stats.suspendedUsers > 0 ? 'down' : 'neutral'),
      color: 'from-red-500 to-pink-500',
      icon: '⏸️',
      description: 'Temporarily disabled'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <GlassCard key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
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
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                  stat.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                  'text-slate-600 dark:text-slate-400'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <span className="text-white text-lg">{stat.icon}</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stat.description}
          </p>
        </GlassCard>
      ))}
    </div>
  );
};

export default AdminStatsCards;