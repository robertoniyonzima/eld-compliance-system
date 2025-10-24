// src/pages/ELDLogs.jsx - VERSION INTELLIGENTE
import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import SmartELDInterface from '../components/eld/SmartELDInterface';
import LogStartWizard from '../components/eld/LogStartWizard';
import StatusHistory from '../components/eld/StatusHistory';
import { apiService } from '../services/api';

const ELDLogs = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentLog, setCurrentLog] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [selectedDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Charger les logs du jour
      const logsResponse = await apiService.eld.getDailyLogs();
      const todayStr = selectedDate.toISOString().split('T')[0];
      const todayLog = logsResponse.data.find(log => 
        new Date(log.date).toISOString().split('T')[0] === todayStr
      );
      setCurrentLog(todayLog || null);

      // Charger le trip actif
      const tripsResponse = await apiService.trips.getAll();
      const activeTrip = tripsResponse.data.find(trip => 
        trip.status === 'in_progress' || trip.status === 'planned'
      );
      setCurrentTrip(activeTrip || null);

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogCreated = (logData) => {
    setCurrentLog(logData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading ELD system...</p>
        </div>
      </div>
    );
  }

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
                  Electronic Logging Device
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  FMCSA Compliant Hours of Service Tracking
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

            {/* Contenu Principal */}
            {!currentLog ? (
              <LogStartWizard 
                onLogCreated={handleLogCreated}
                currentTrip={currentTrip}
              />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <SmartELDInterface 
                    date={selectedDate}
                    currentTrip={currentTrip}
                  />
                </div>
                
                <div className="xl:col-span-1 space-y-6">
                  <StatusHistory date={selectedDate} />
                  
                  {/* Quick Actions Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors">
                        📋 Certify Today's Log
                      </button>
                      <button className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
                        📥 Export PDF Report
                      </button>
                      <button 
                        onClick={loadInitialData}
                        className="w-full p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                      >
                        🔄 Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ELDLogs;