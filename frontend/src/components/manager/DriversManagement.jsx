// src/components/manager/DriversManagement.jsx
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import { apiService } from '../../services/api';

const DriversManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiService.users.getAllUsers();
      // Filter only drivers
      const driversList = response.data.filter(user => user.user_type === 'driver');
      setDrivers(driversList);
    } catch (error) {
      console.error('Error loading drivers:', error);
      setMessage('❌ Error loading drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    try {
      await apiService.users.approveUser(driverId);
      setMessage('✅ Driver approved successfully');
      loadDrivers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error approving driver:', error);
      setMessage('❌ Error approving driver');
    }
  };

  const handleToggleStatus = async (driverId) => {
    try {
      await apiService.users.toggleUserStatus(driverId);
      setMessage('✅ Driver status updated');
      loadDrivers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling status:', error);
      setMessage('❌ Error updating status');
    }
  };

  const getStatusBadge = (driver) => {
    if (!driver.is_approved) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs font-semibold">Pending</span>;
    }
    if (!driver.is_active) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-semibold">Disabled</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-semibold">Active</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Drivers Management
        </h2>
        <button
          onClick={loadDrivers}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-slate-600 dark:text-slate-400">Loading drivers...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {drivers.map((driver) => (
            <GlassCard key={driver.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Profile Photo */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                    {driver.profile_photo_url ? (
                      <img src={driver.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      driver.first_name?.charAt(0) || driver.email?.charAt(0)?.toUpperCase() || 'D'
                    )}
                  </div>

                  {/* Driver Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {driver.first_name} {driver.last_name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {driver.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      License: {driver.license_number || 'N/A'} ({driver.license_state || 'N/A'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Status Badge */}
                  {getStatusBadge(driver)}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {!driver.is_approved && (
                      <button
                        onClick={() => handleApprove(driver.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                      >
                        ✅ Approve
                      </button>
                    )}
                    
                    {driver.is_approved && (
                      <button
                        onClick={() => handleToggleStatus(driver.id)}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                          driver.is_active
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {driver.is_active ? '🚫 Disable' : '✅ Enable'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}

          {drivers.length === 0 && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No drivers found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriversManagement;
