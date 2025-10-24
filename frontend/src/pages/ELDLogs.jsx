// src/pages/ELDLogs.jsx - VERSION SIMPLIFIÉE
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import ELDGrid from '../components/eld/ELDGrid';
import StatusHistory from '../components/eld/StatusHistory';
import HOSCompliance from '../components/eld/HOSCompliance';

const ELDLogs = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activePage="/logs" />
          
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  ELD Daily Logs
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  FMCSA Compliance Tracking
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <ELDGrid date={selectedDate} />
                <HOSCompliance />
              </div>
              
              <div className="xl:col-span-1 space-y-6">
                <StatusHistory date={selectedDate} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ELDLogs;