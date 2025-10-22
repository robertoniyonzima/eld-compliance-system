// src/pages/ELDLogs.jsx - VERSION CORRIGÉE
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import DailyLogGrid from '../components/eld/DailyLogGrid';

const ELDLogs = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar /> {/* ← NAVBAR PRÉSENT */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activePage="/logs" /> {/* ← SIDEBAR PRÉSENTE */}
          
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  ELD Daily Logs
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Manage your FMCSA compliance in real-time
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-4 py-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <GradientButton>
                  📥 Export PDF
                </GradientButton>
              </div>
            </div>

            {/* Log Grid */}
            <DailyLogGrid date={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ELDLogs;