// src/components/layout/Navbar.jsx - VERSION FINALE
import UserMenu from './UserMenu';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user } = useAuth();

  const getNavLinks = () => {
    if (user?.user_type === 'manager') {
      return [
        { href: '/manager', label: 'Dashboard' },
        { href: '/manager?tab=trips', label: 'Trips' },
        { href: '/manager?tab=drivers', label: 'Drivers' },
        { href: '/manager?tab=documents', label: 'Documents' },
      ];
    }
    
    if (user?.user_type === 'admin') {
      return [
        { href: '/admin', label: 'Admin Panel' },
      ];
    }

    // Driver
    return [
      { href: '/driver', label: 'Dashboard' },
      { href: '/logs', label: 'ELD Logs' },
      { href: '/trips', label: 'Trip Planner' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">ELD</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                ELD System
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                FMCSA Compliance
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* User Menu avec Theme Toggle */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;