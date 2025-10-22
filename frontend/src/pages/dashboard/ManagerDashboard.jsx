// src/pages/dashboard/ManagerDashboard.jsx
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { StatsCards, HOSMeter, ActivityFeed } from '../../components/dashboard';

const ManagerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activePage="/" />
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tableau de Bord Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Gestion de flotte et conformité HOS
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <StatsCards />
              </div>
              <div className="lg:col-span-1">
                <HOSMeter />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed />
              <div className="bg-white/50 dark:bg-dark-700/50 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Flotte Active
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Interface manager en développement...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;