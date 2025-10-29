import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ui/ThemeToggle';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom'; 

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate(); 

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {  
    navigate('/settings');
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Theme Toggle */}
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-400 hidden sm:block">
          {currentTheme === 'dark' ? 'Dark' : 'Light'}
        </span>
      </div>

      {/* User Menu */}
      <div className="relative group">
        <button className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
            {user?.profile_photo_url ? (
              <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-bold">
                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="text-left hidden lg:block">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 capitalize">
              {user?.user_type}
            </div>
          </div>
          <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
          <div className="p-2">
            {/* User Info */}
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {user?.email}
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="space-y-1 mt-1">
              {/* ✅ Bouton Settings modifié */}
              <button 
                onClick={handleSettings}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </button>

              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default UserMenu;
