// src/pages/ELDLogs.jsx - COMPLETE WITH VEHICLE REQUIREMENT & TIME GRID
import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import SmartELDInterface from '../components/eld/SmartELDInterface';
import LogStartWizard from '../components/eld/LogStartWizard';
import StatusHistory from '../components/eld/StatusHistory';
import ELDTimeGrid from '../components/eld/ELDTimeGrid';
import FinalizeLogModal from '../components/eld/FinalizeLogModal';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useELD } from '../hooks/useELD';

const ELDLogs = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTrip, setCurrentTrip] = useState(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const { user } = useAuth();
  
  // Use useELD hook for all ELD data - single source of truth
  const { 
    statusHistory, 
    currentLog, 
    loading: eldLoading, 
    refreshLog 
  } = useELD(selectedDate);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [selectedDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load active trip
      const tripsResponse = await apiService.trips.getAll();
      const activeTrip = tripsResponse.data.find(trip => 
        trip.status === 'in_progress' || trip.status === 'planned'
      );
      setCurrentTrip(activeTrip || null);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogCreated = async (logData) => {
    // Refresh the log data from useELD
    await refreshLog();
  };

  const handleExportPDF = async () => {
    try {
      if (!currentLog) {
        alert('No log available to export');
        return;
      }

      const response = await apiService.eld.generatePDF(currentLog.id);
      
      // Create and download the PDF blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eld-log-${selectedDate.toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF: ' + error.message);
    }
  };

  const handleLogFinalized = async (finalizedLog) => {
    // Refresh the log data from useELD
    await refreshLog();
    setShowFinalizeModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading ELD system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Main Content */}
            {!currentLog ? (
              /* REQUIRE VEHICLE INFO FIRST */
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">ℹ️</div>
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                      Vehicle Information Required
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You must provide truck/vehicle information before starting your daily log
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {!currentLog ? (
              <LogStartWizard 
                onLogCreated={handleLogCreated}
                currentTrip={currentTrip}
              />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    <SmartELDInterface 
                      date={selectedDate}
                      currentTrip={currentTrip}
                    />
                    
                    {/* 24-Hour Time Grid */}
                    <ELDTimeGrid 
                      statusHistory={statusHistory}
                      date={selectedDate}
                      isFinalized={currentLog?.is_finalized || false}
                    />
                  </div>
                  
                  <div className="xl:col-span-1 space-y-6">
                    <StatusHistory date={selectedDate} />
                    
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        {/* Finalize Log Button - Only show if not finalized */}
                        {currentLog && !currentLog.is_finalized && (
                          <button 
                            onClick={() => setShowFinalizeModal(true)}
                            className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold"
                          >
                            ✅ Finalize Daily Log
                          </button>
                        )}
                        
                        {/* Show finalized status */}
                        {currentLog && currentLog.is_finalized && (
                          <div className="w-full p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg text-center">
                            <p className="text-green-800 dark:text-green-300 font-semibold">
                              ✅ Log Finalized
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {new Date(currentLog.finalized_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                        
                        <button 
                          onClick={handleExportPDF}
                          disabled={!currentLog}
                          className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          📥 Export PDF Report
                        </button>
                        <button 
                          onClick={async () => {
                            await refreshLog();
                            await loadInitialData();
                          }}
                          className="w-full p-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                          🔄 Refresh Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Finalize Log Modal */}
      {showFinalizeModal && currentLog && (
        <FinalizeLogModal
          log={currentLog}
          onClose={() => setShowFinalizeModal(false)}
          onFinalized={handleLogFinalized}
        />
      )}
    </div>
  );
};

export default ELDLogs;