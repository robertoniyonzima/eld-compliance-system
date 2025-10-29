// src/pages/Settings.jsx - Profile with Photo Upload (English)
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!profilePhoto) {
      setMessage('❌ Please select a photo first');
      return;
    }
    
    try {
      setUploading(true);
      setMessage('');
      
      const formData = new FormData();
      formData.append('profile_photo', profilePhoto);
      
      const response = await apiService.auth.uploadPhoto(formData);
      setMessage('✅ Profile photo updated successfully!');
      
      // Refresh user data to get new photo URL
      await refreshUser();
      
      // Reset form
      setProfilePhoto(null);
      setPhotoPreview(null);
      setUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Error uploading photo: ' + (error.response?.data?.error || error.message));
      setUploading(false);
    }
  };

  const getUserRole = () => {
    switch(user?.user_type) {
      case 'driver': return '🚛 Driver';
      case 'manager': return '👔 Manager';
      case 'admin': return '👨‍💼 Admin';
      default: return 'User';
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar activePage="/settings" />
          
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Settings & Profile
            </h1>
            
            {/* Profile Photo Upload */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Profile Photo
              </h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.includes('✅') 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Current/Preview Photo */}
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <label className="block mb-2">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-blue-900/20 dark:file:text-blue-400"
                    />
                  </label>
                  <button
                    onClick={handleUploadPhoto}
                    disabled={!profilePhoto || uploading}
                    className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : '📤 Upload Photo'}
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* User Information (Read-only from Database) */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                User Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Username
                  </label>
                  <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium">
                    {user?.username || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Email
                  </label>
                  <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium">
                    {user?.email || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    User Type
                  </label>
                  <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium">
                    {getUserRole()}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    User ID
                  </label>
                  <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium">
                    #{user?.id || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ User information is managed by your administrator. Contact support if you need to update your details.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
