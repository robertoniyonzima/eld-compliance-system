// src/components/layout/Navbar.jsx - VERSION FINALE
import UserMenu from './UserMenu';

const Navbar = () => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
              <span className="text-white font-bold text-sm">ELD</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                ELD System
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                FMCSA Compliance
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/driver" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium">
              Dashboard
            </a>
            <a href="/logs" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium">
              ELD Logs
            </a>
            <a href="/trips" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium">
              Trip Planner
            </a>
          </nav>

          {/* User Menu avec Theme Toggle */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;