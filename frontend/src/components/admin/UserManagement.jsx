// src/components/admin/UserManagement.jsx - VERSION CORRIGÉE
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import { adminService } from '../../services/admin';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminService.getUsers(); // ⭐ CORRECTION: usersData est directement le tableau
      
      console.log('👥 Users data loaded:', usersData); // Debug
      
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.error('❌ Users data is not an array:', usersData);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Error loading users: ' + (error.response?.data?.error || error.message));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter;
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const approveUser = async (userId) => {
    try {
      await adminService.approveUser(userId);
      await loadUsers(); // Recharger la liste
      alert('User approved successfully!');
    } catch (error) {
      alert('Error approving user: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      await loadUsers(); // Recharger la liste
      alert('User status updated!');
    } catch (error) {
      alert('Error updating user: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        await loadUsers(); // Recharger la liste
        alert('User deleted successfully!');
      } catch (error) {
        alert('Error deleting user: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  // Fonctions d'aide pour les couleurs
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-600 dark:text-purple-400';
      case 'manager': return 'text-blue-600 dark:text-blue-400';
      case 'driver': return 'text-green-600 dark:text-green-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      {/* Header avec filtres et recherche */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            User Management ({users.length})
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Manage platform users and permissions
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Barre de recherche */}
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
          
          {/* Filtres */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              {users.length === 0 ? 'No users found' : 'No users match your filters'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-700/50 transition-all group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg overflow-hidden">
                  {user.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {user.first_name || 'No'} {user.last_name || 'Name'}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {user.email}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-xs font-medium capitalize ${getRoleColor(user.user_type)}`}>
                      {user.user_type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                    {user.company_name && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {user.company_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {user.status === 'pending' && (
                    <button
                      onClick={() => approveUser(user.id)}
                      className="px-3 py-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors bg-green-50 dark:bg-green-900/20 rounded-lg text-sm font-medium"
                      title="Approve User"
                    >
                      Approve
                    </button>
                  )}
                  
                  {user.status === 'active' && (
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className="px-3 py-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm font-medium"
                      title="Suspend User"
                    >
                      Suspend
                    </button>
                  )}
                  
                  {user.status === 'suspended' && (
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className="px-3 py-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors bg-green-50 dark:bg-green-900/20 rounded-lg text-sm font-medium"
                      title="Activate User"
                    >
                      Activate
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-900/20 rounded-lg text-sm font-medium"
                    title="Delete User"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          <button 
            onClick={loadUsers}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default UserManagement;