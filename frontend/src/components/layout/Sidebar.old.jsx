// src/components/layout/Sidebar.jsx - MISE À JOUR POUR ADMIN
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ activePage }) => {
  const { user } = useAuth();
  
  // Menu différent selon le rôle
  const getMenuItems = () => {
    // Menu spécial pour admin
    if (user?.user_type === 'admin') {
      return [
        { icon: '👥', label: 'User Management', href: '/admin', roles: ['admin'] },
        { icon: '📊', label: 'Platform Analytics', href: '/admin?tab=analytics', roles: ['admin'] },
        { icon: '⚙️', label: 'System Settings', href: '/settings', roles: ['admin'] },
      ];
    }

    // Menu pour manager
    if (user?.user_type === 'manager') {
      return [
        { icon: '📊', label: 'Dashboard', href: '/manager', roles: ['manager'] },
        { icon: '🗺️', label: 'Trips', href: '/manager?tab=trips', roles: ['manager'] },
        { icon: '👥', label: 'Drivers', href: '/manager?tab=drivers', roles: ['manager'] },
        { icon: '📄', label: 'Documents', href: '/manager?tab=documents', roles: ['manager'] },
        { icon: '⚙️', label: 'Settings', href: '/settings', roles: ['manager'] },
      ];
    }

    // Menu normal pour drivers
    return [
      { icon: '📊', label: 'Dashboard', href: '/driver', roles: ['driver'] },
      { icon: '📝', label: 'ELD Logs', href: '/logs', roles: ['driver'] },
      { icon: '🗺️', label: 'Trip Planner', href: '/trips', roles: ['driver'] },
      { icon: '⚙️', label: 'Settings', href: '/settings', roles: ['driver'] },
    ];
  };

  const menuItems = getMenuItems();
  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.user_type)
  );

  return (
    <aside className="w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 h-fit sticky top-24 border border-slate-200 dark:border-slate-700 shadow-lg">
      <nav className="space-y-2">
        {filteredItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activePage === item.href
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
      
      {/* Status pour admin */}
      {user?.user_type === 'admin' && (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Admin Mode Active
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;