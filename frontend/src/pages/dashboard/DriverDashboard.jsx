// src/pages/dashboard/DriverDashboard.jsx - VERSION QUI FONCTIONNE
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import StatsCards from '../../components/dashboard/StatsCards';
import HOSMeter from '../../components/dashboard/HOSMeter';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import RecentTrips from '../../components/dashboard/RecentTrips';

const DriverDashboard = () => {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activePage="/driver" />
          
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Driver Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Welcome to your driving workspace - All data is live from database
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <StatsCards />
              </div>
              <div className="lg:col-span-1">
                <HOSMeter />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed />
              </div>
              <div className="lg:col-span-1">
                <RecentTrips />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;