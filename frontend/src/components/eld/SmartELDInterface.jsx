// src/components/eld/SmartELDInterface.jsx
import { useState, useEffect } from 'react';
import { useELD } from '../../hooks/useELD';
import { apiService } from '../../services/api';

const SmartELDInterface = ({ date, currentTrip }) => {
  const {
    currentStatus,
    statusHistory,
    changeStatus,
    calculateHOSTotals,
    currentLog,
    loading,
    error,
    refreshLog
  } = useELD(date);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const statusTypes = [
    { 
      id: 'off_duty', 
      label: 'OFF DUTY', 
      description: 'You are completely off work',
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      icon: '🏠',
      instructions: 'Use for personal time, meals, sleep at home'
    },
    { 
      id: 'sleeper_berth', 
      label: 'SLEEPER BERTH', 
      description: 'Resting in truck sleeper',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      icon: '🛌',
      instructions: 'Use for overnight sleep in truck berth'
    },
    { 
      id: 'driving', 
      label: 'DRIVING', 
      description: 'Operating commercial vehicle',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      icon: '🚛',
      instructions: 'Use when actively driving CMV on highway'
    },
    { 
      id: 'on_duty', 
      label: 'ON DUTY', 
      description: 'Working but not driving',
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      icon: '📋',
      instructions: 'Use for loading, paperwork, fueling, inspections'
    }
  ];

  const totals = calculateHOSTotals();

  // Auto-détection de statut intelligent
  const getSuggestedStatus = () => {
    if (currentTrip && currentTrip.status === 'in_progress') {
      return 'driving';
    }
    
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      return 'sleeper_berth';
    }
    
    return 'off_duty';
  };

  const handleStatusChangeClick = (newStatus) => {
    setSelectedNewStatus(newStatus);
    setShowStatusModal(true);
    
    // Pré-remplir la localisation si disponible
    if (currentTrip && newStatus === 'driving') {
      setLocationInput(currentTrip.current_location?.city || '');
    } else {
      setLocationInput('');
    }
    setNotesInput('');
  };

  const confirmStatusChange = async () => {
    if (!selectedNewStatus || !locationInput.trim()) {
      alert('Please enter your current location');
      return;
    }

    // ✅ Require notes for On Duty status
    if (selectedNewStatus === 'on_duty' && !notesInput.trim()) {
      alert('Please describe what you are doing while on duty (e.g., maintenance, loading, fueling)');
      return;
    }

    try {
      setActionLoading(true);
      
      let notes = notesInput;
      if (!notesInput) {
        const statusInfo = statusTypes.find(s => s.id === selectedNewStatus);
        notes = `Changed to ${statusInfo.label} at ${locationInput}`;
      }

      await changeStatus(selectedNewStatus, locationInput.trim(), notes);
      
      setShowStatusModal(false);
      setSelectedNewStatus(null);
      setLocationInput('');
      setNotesInput('');
      
    } catch (error) {
      alert('Error changing status: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getHOSCompliance = () => {
    const violations = [];
    const warnings = [];
    
    // Vérification des règles HOS
    if (totals.driving > 11) {
      violations.push('11-hour driving limit exceeded');
    }
    
    if (totals.driving + totals.on_duty > 14) {
      violations.push('14-hour duty limit exceeded');
    }
    
    if (totals.driving >= 8 && !statusHistory.find(s => 
        (s.status === 'off_duty' || s.status === 'sleeper_berth') && 
        ((new Date(s.end_time || new Date()) - new Date(s.start_time)) / (1000 * 60)) >= 30
    )) {
      violations.push('30-minute break required after 8 hours driving');
    }
    
    if (totals.off_duty + totals.sleeper_berth < 10) {
      warnings.push('Ensure you get 10 hours off-duty before next shift');
    }
    
    return { violations, warnings };
  };

  const { violations, warnings } = getHOSCompliance();

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading ELD data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center text-red-600 dark:text-red-400">
          <div className="text-xl mb-2">⚠️</div>
          <p>{error}</p>
          <button 
            onClick={refreshLog}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if log is finalized
  const isLogFinalized = currentLog?.is_finalized || false;

  return (
    <div className="space-y-6">
      {/* Current Status Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Current Duty Status
            </h2>
            <div className="flex items-center space-x-4">
              <div className={`text-4xl ${
                statusTypes.find(s => s.id === currentStatus)?.textColor
              }`}>
                {statusTypes.find(s => s.id === currentStatus)?.icon}
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  statusTypes.find(s => s.id === currentStatus)?.textColor
                }`}>
                  {statusTypes.find(s => s.id === currentStatus)?.label}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {statusTypes.find(s => s.id === currentStatus)?.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Since</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {statusHistory.filter(s => !s.end_time).length > 0 
                ? new Date(statusHistory.find(s => !s.end_time).start_time).toLocaleTimeString()
                : 'Not started'
              }
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Log Finalized Warning Banner */}
      {isLogFinalized && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🔒</div>
            <div>
              <h3 className="font-bold text-green-800 dark:text-green-200">
                Log Finalized
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                This log has been finalized. No further status changes are allowed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Status Change Buttons */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Duty Status
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statusTypes.map((status) => (
            <button
              key={status.id}
              onClick={() => handleStatusChangeClick(status.id)}
              disabled={currentStatus === status.id || actionLoading || isLogFinalized}
              className={`p-4 rounded-xl text-center transition-all duration-200 ${
                currentStatus === status.id
                  ? `${status.color} text-white shadow-lg scale-105`
                  : `bg-gray-100 dark:bg-slate-700 ${status.textColor} hover:shadow-md hover:scale-105`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-2">{status.icon}</div>
              <div className="font-semibold text-sm">{status.label}</div>
              <div className="text-xs opacity-80 mt-1">{status.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* HOS Compliance Dashboard */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          HOS Compliance Dashboard
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statusTypes.map((status) => (
            <div key={status.id} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-slate-700">
              <div className={`text-2xl font-bold ${status.textColor}`}>
                {totals[status.id]?.toFixed(1) || '0.0'}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {status.label}
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {violations.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="text-red-500 text-xl mr-3">⚠️</div>
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200">HOS Violations</h4>
                <ul className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {violations.map((violation, index) => (
                    <li key={index}>• {violation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-yellow-500 text-xl mr-3">💡</div>
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">HOS Warnings</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {violations.length === 0 && warnings.length === 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <div className="text-green-500 text-xl mb-2">✅</div>
            <p className="text-green-800 dark:text-green-200 font-semibold">
              Fully HOS Compliant!
            </p>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedNewStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirm Status Change
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">
                  {statusTypes.find(s => s.id === selectedNewStatus)?.icon}
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {statusTypes.find(s => s.id === selectedNewStatus)?.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {statusTypes.find(s => s.id === selectedNewStatus)?.instructions}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📍 Current Location *
                </label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter your current city or location"
                  required
                />
              </div>

              {/* 📝 Show Notes field ONLY for On Duty status */}
              {selectedNewStatus === 'on_duty' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                    📝 What are you doing? (Required for On Duty)
                  </label>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Example: Vehicle maintenance, Loading cargo, Fueling, Pre-trip inspection, Paperwork..."
                    required
                  />
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                    💡 Describe your on-duty activity. This will be saved and visible in the grid.
                  </p>
                </div>
              )}
              
              {/* Optional notes for other statuses */}
              {selectedNewStatus !== 'on_duty' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📝 Notes (Optional)
                  </label>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Any additional information..."
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={!locationInput.trim() || actionLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Changing...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartELDInterface;