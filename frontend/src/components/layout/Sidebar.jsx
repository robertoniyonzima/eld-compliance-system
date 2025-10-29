// src/components/layout/Sidebar.jsx - PROFESSIONAL VERSION
import { useAuth } from '../../hooks/useAuth';
import Icon from '../ui/Icon';

const Sidebar = ({ activePage }) => {
  const { user } = useAuth();
  
  // Menu différent selon le rôle
  const getMenuItems = () => {
    // Menu spécial pour admin
    if (user?.user_type === 'admin') {
      return [
        { icon: 'Users', label: 'User Management', href: '/admin', roles: ['admin'] },
        { icon: 'TrendingUp', label: 'Platform Analytics', href: '/admin?tab=analytics', roles: ['admin'] },
        { icon: 'Settings', label: 'System Settings', href: '/settings', roles: ['admin'] },
      ];
    }

    // Menu pour manager
    if (user?.user_type === 'manager') {
      return [
        { icon: 'LayoutDashboard', label: 'Dashboard', href: '/manager', roles: ['manager'] },
        { icon: 'Map', label: 'Trips', href: '/manager?tab=trips', roles: ['manager'] },
        { icon: 'Users', label: 'Drivers', href: '/manager?tab=drivers', roles: ['manager'] },
        { icon: 'FileText', label: 'Documents', href: '/manager?tab=documents', roles: ['manager'] },
        { icon: 'Settings', label: 'Settings', href: '/settings', roles: ['manager'] },
      ];
    }

    // Menu normal pour drivers
    return [
      { icon: 'LayoutDashboard', label: 'Dashboard', href: '/driver', roles: ['driver'] },
      { icon: 'FileText', label: 'ELD Logs', href: '/logs', roles: ['driver'] },
      { icon: 'Map', label: 'Trip Planner', href: '/trips', roles: ['driver'] },
      { icon: 'Settings', label: 'Settings', href: '/settings', roles: ['driver'] },
    ];
  };

  const menuItems = getMenuItems();
  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.user_type)
  );

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 rounded-2xl p-4 h-fit sticky top-24 border border-slate-200 dark:border-slate-700 shadow-sm">
      <nav className="space-y-1">
        {filteredItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activePage === item.href
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <Icon 
              name={item.icon} 
              size={20}
              className={activePage === item.href ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}
            />
            <span className="font-medium text-sm">{item.label}</span>
          </a>
        ))}
      </nav>
      
      {/* Status pour admin */}
      {user?.user_type === 'admin' && (
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Admin Mode
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
