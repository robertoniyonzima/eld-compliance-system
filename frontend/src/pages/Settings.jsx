// src/pages/Settings.jsx - VERSION CORRIGÉE
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';

const Settings = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar /> {/* ← NAVBAR PRÉSENT */}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activePage="/settings" /> {/* ← SIDEBAR PRÉSENTE */}
          
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Settings
            </h1>
            
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Preferences
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Enable dark interface
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;