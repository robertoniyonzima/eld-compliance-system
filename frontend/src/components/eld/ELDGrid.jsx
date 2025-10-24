// src/components/eld/ELDGrid.jsx - VERSION CORRIGÉE
import { useState, useEffect } from 'react';
import { useELD } from '../../hooks/useELD';
import { apiService } from '../../services/api';

const ELDGrid = ({ date }) => {
  const { 
    currentStatus, 
    statusHistory, 
    changeStatus, 
    calculateHOSTotals,
    currentLog,
    loading,
    error
  } = useELD(date);
  
  const [selectedHour, setSelectedHour] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const statusTypes = [
    { 
      id: 'off_duty', 
      label: '1. OFF DUTY', 
      color: 'bg-gray-200 dark:bg-gray-600', 
      activeColor: 'bg-gray-500 text-white',
      description: 'Hors service - temps personnel'
    },
    { 
      id: 'sleeper_berth', 
      label: '2. SLEEPER BERTH', 
      color: 'bg-blue-200 dark:bg-blue-600', 
      activeColor: 'bg-blue-500 text-white',
      description: 'Repos en couchette'
    },
    { 
      id: 'driving', 
      label: '3. DRIVING', 
      color: 'bg-green-200 dark:bg-green-600', 
      activeColor: 'bg-green-500 text-white',
      description: 'Conduite active'
    },
    { 
      id: 'on_duty', 
      label: '4. ON DUTY', 
      color: 'bg-amber-200 dark:bg-amber-600', 
      activeColor: 'bg-amber-500 text-white',
      description: 'En service (non conduite)'
    }
  ];

  const totals = calculateHOSTotals();

  // Déterminer les heures actives pour chaque statut
  const getHourStatus = (hour) => {
    const hourStart = new Date(date);
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date(date);
    hourEnd.setHours(hour, 59, 59, 999);

    for (const change of statusHistory) {
      const changeStart = new Date(change.start_time);
      const changeEnd = change.end_time ? new Date(change.end_time) : new Date();
      
      if (changeStart <= hourEnd && changeEnd >= hourStart) {
        return change.status;
      }
    }
    
    return null;
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      
      // Demander la localisation
      const location = prompt('Enter your current location:');
      if (!location) {
        setActionLoading(false);
        return;
      }

      await changeStatus(newStatus, location, `Changed to ${newStatus} at ${location}`);
      alert(`Status changed to ${statusTypes.find(s => s.id === newStatus)?.label}`);
    } catch (error) {
      alert('Error changing status: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!currentLog) {
        alert('No log available to export');
        return;
      }

      const response = await apiService.eld.generatePDF(currentLog.id);
      
      // Créer et télécharger le blob PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eld-log-${date.toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF: ' + error.message);
    }
  };

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
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      {/* Header avec infos véhicule et statut */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            ELD Daily Log - {date.toLocaleDateString()}
          </h2>
          {currentLog && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Vehicle: {currentLog.vehicle_number} • Trailer: {currentLog.trailer_number || 'N/A'}
            </p>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Status</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            statusTypes.find(s => s.id === currentStatus)?.activeColor
          }`}>
            {statusTypes.find(s => s.id === currentStatus)?.label}
          </div>
        </div>
      </div>

      {/* Status Controls */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statusTypes.map((status) => (
          <button
            key={status.id}
            onClick={() => handleStatusChange(status.id)}
            disabled={currentStatus === status.id || actionLoading}
            className={`p-4 rounded-xl text-left transition-all duration-300 ${
              currentStatus === status.id
                ? `${status.activeColor} shadow-lg scale-105`
                : `${status.color} text-gray-700 dark:text-gray-300 hover:scale-105 hover:shadow-md`
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="font-semibold mb-1">{status.label.split('. ')[1]}</div>
            <div className="text-xs opacity-80">{status.description}</div>
          </button>
        ))}
      </div>

      {/* 24-Hour Grid */}
      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-2xl overflow-hidden mb-6">
        {/* Header Hours */}
        <div className="grid grid-cols-25 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
          <div className="p-3 border-r border-gray-300 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">
            Status
          </div>
          {hours.map((hour) => (
            <div key={hour} className="p-3 text-center border-r border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 last:border-r-0">
              {hour === 0 ? 'MID' : hour === 12 ? 'NOON' : hour}
            </div>
          ))}
        </div>

        {/* Status Rows */}
        {statusTypes.map((status) => (
          <div key={status.id} className="grid grid-cols-25 border-b border-gray-300 dark:border-gray-600 last:border-b-0">
            <div className="p-4 border-r border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-slate-700/50">
              {status.label}
            </div>
            {hours.map((hour) => {
              const hourStatus = getHourStatus(hour);
              const isActive = hourStatus === status.id;
              
              return (
                <div
                  key={hour}
                  className={`p-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0 cursor-pointer transition-all duration-200 ${
                    isActive ? status.activeColor : status.color
                  } ${isEditing ? 'hover:opacity-80' : ''}`}
                  onClick={() => setSelectedHour(hour)}
                  title={isActive ? `${status.label} - Hour ${hour}` : ''}
                >
                  {isActive && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* HOS Totals */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white mb-6">
        <h3 className="font-semibold mb-3">HOS Totals Today</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statusTypes.map((status) => (
            <div key={status.id} className="text-center">
              <div className="text-2xl font-bold">{totals[status.id]?.toFixed(1) || '0.0'}</div>
              <div className="text-sm opacity-90">{status.label.split('. ')[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last update: {new Date().toLocaleTimeString()}
          {statusHistory.length > 0 && (
            <span> • {statusHistory.length} status changes</span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl transition-all ${
              isEditing 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isEditing ? '✏️ Editing...' : '✏️ Edit Log'}
          </button>
          
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            disabled={!currentLog}
          >
            📥 Export PDF
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs">
          <strong>Debug Info:</strong>
          <div>Current Log: {currentLog ? `ID ${currentLog.id}` : 'None'}</div>
          <div>Status History: {statusHistory.length} entries</div>
          <div>Current Status: {currentStatus}</div>
        </div>
      )}
    </div>
  );
};

export default ELDGrid;