// src/components/eld/ELDTimeGrid.jsx - FMCSA COMPLIANT 24-HOUR GRID WITH REAL-TIME TOTALS
import { useState, useEffect } from 'react';

const ELDTimeGrid = ({ statusHistory, date, isFinalized }) => {
  const [gridData, setGridData] = useState([]);
  const [totals, setTotals] = useState({
    off_duty: 0,
    sleeper_berth: 0,
    driving: 0,
    on_duty: 0,
    work_hours: 0
  });
  const [isZoomed, setIsZoomed] = useState(false);

  // Generate 24-hour grid with 00:00 format instead of 12:00 AM
  const hours = [
    { label: '00', value: 0, display: '00:00' },
    ...Array.from({ length: 11 }, (_, i) => ({ 
      label: String(i + 1).padStart(2, '0'), 
      value: i + 1, 
      display: `${String(i + 1).padStart(2, '0')}:00` 
    })),
    { label: '12', value: 12, display: '12:00' },
    ...Array.from({ length: 11 }, (_, i) => ({ 
      label: String(i + 13).padStart(2, '0'), 
      value: i + 13, 
      display: `${String(i + 13).padStart(2, '0')}:00` 
    })),
    { label: '24', value: 24, display: '24:00' }
  ];

  const statusTypes = [
    { id: 'off_duty', label: '1- Off Duty', color: '#9CA3AF', row: 0 },
    { id: 'sleeper_berth', label: '2- Sleeper Berth', color: '#3B82F6', row: 1 },
    { id: 'driving', label: '3- Driving', color: '#10B981', row: 2 },
    { id: 'on_duty', label: '4- On Duty', color: '#F59E0B', row: 3 }
  ];

  useEffect(() => {
    generateGridData();
    calculateTotals();
    
    // ✅ LIVE COUNTING - Update every 5 seconds ONLY if log is NOT finalized
    let interval;
    if (!isFinalized) {
      interval = setInterval(() => {
        calculateTotals();
      }, 5000); // Update every 5 seconds for live counting
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [statusHistory, date, isFinalized]);

  const generateGridData = () => {
    // Create grid data for each 15-minute increment - now with metadata
    const grid = Array(4).fill(null).map(() => Array(96).fill(null).map(() => ({ color: null, notes: null, location: null })));
    
    if (!statusHistory || statusHistory.length === 0) {
      setGridData(grid);
      return;
    }

    // Fill grid based on status history
    statusHistory.forEach(change => {
      const startTime = new Date(change.start_time);
      const endTime = change.end_time ? new Date(change.end_time) : new Date();
      
      const startMinute = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinute = endTime.getHours() * 60 + endTime.getMinutes();
      
      const startBlock = Math.floor(startMinute / 15);
      const endBlock = Math.floor(endMinute / 15);
      
      const rowIndex = statusTypes.findIndex(s => s.id === change.status);
      if (rowIndex === -1) return;
      
      for (let i = startBlock; i <= endBlock && i < 96; i++) {
        grid[rowIndex][i] = {
          color: statusTypes[rowIndex].color,
          notes: change.notes || null,
          location: change.location || null,
          status: change.status
        };
      }
    });

    setGridData(grid);
  };

  const calculateTotals = () => {
    const newTotals = {
      off_duty: 0,
      sleeper_berth: 0,
      driving: 0,
      on_duty: 0,
      work_hours: 0
    };

    if (!statusHistory || statusHistory.length === 0) {
      setTotals(newTotals);
      return;
    }

    statusHistory.forEach(change => {
      const start = new Date(change.start_time);
      const end = change.end_time ? new Date(change.end_time) : new Date();
      
      // Calculate duration in hours
      const durationHours = (end - start) / (1000 * 60 * 60);
      
      if (newTotals[change.status] !== undefined) {
        newTotals[change.status] += durationHours;
      }
    });

    // Calculate work hours (driving + on_duty)
    newTotals.work_hours = newTotals.driving + newTotals.on_duty;

    setTotals(newTotals);
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 transition-all duration-300 ${isZoomed ? 'scale-105' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          24-Hour Activity Graph {isZoomed && '(Zoomed 2x)'}
        </h3>
        <button
          onClick={toggleZoom}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl"
          title={isZoomed ? "Click to zoom out" : "Click to zoom in for better visibility"}
        >
          {isZoomed ? '🔍 Zoom Out' : '🔍 Zoom In '}
        </button>
      </div>
      
      {/* Hour Labels */}
      <div className={`flex border-b-2 border-slate-300 dark:border-slate-600 pb-2 mb-2 ${isZoomed ? 'overflow-x-auto' : ''}`}>
        <div className="flex-shrink-0" style={{ width: '192px' }}></div>
        <div className={`flex-1 flex justify-between font-mono ${isZoomed ? 'text-base' : 'text-xs'}`}>
          {hours.map((hour, idx) => (
            <div 
              key={idx} 
              className="text-center text-slate-700 dark:text-slate-300 font-bold"
              style={{ width: `${100 / 25}%` }}
              title={hour.display}
            >
              {hour.label}
            </div>
          ))}
        </div>
      </div>

      {/* Status Rows - Add horizontal scroll when zoomed */}
      <div className={`space-y-1 ${isZoomed ? 'overflow-x-auto' : ''}`}>
        {statusTypes.map((status, rowIdx) => (
          <div key={status.id} className="flex items-start">
            {/* Status Label - Fixed width to align all grids */}
            <div className="flex-shrink-0" style={{ width: '192px', height: isZoomed ? '240px' : '60px' }}>
              <div className="h-full flex items-center pr-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status.label}</span>
              </div>
            </div>
            
            {/* Grid Blocks - EXTRA LARGE for better visibility + ZOOM */}
            <div className={`flex-1 flex border border-slate-300 dark:border-slate-600 ${isZoomed ? 'min-w-[2000px]' : ''}`} style={{ height: isZoomed ? '240px' : '60px' }}>
              {Array.from({ length: 96 }).map((_, blockIdx) => {
                const blockData = gridData[rowIdx]?.[blockIdx];
                const fillColor = blockData?.color;
                const hourMark = blockIdx % 4 === 0;
                const hasNotes = blockData?.status === 'on_duty' && blockData?.notes;
                
                // Calculate hour for this block
                const blockHour = Math.floor(blockIdx / 4);
                const blockMinute = (blockIdx % 4) * 15;
                const timeLabel = `${blockHour}:${blockMinute.toString().padStart(2, '0')}`;
                const showTimeLabel = isZoomed && hourMark; // Show time label only on hour marks when zoomed
                
                return (
                  <div
                    key={blockIdx}
                    className="relative group flex flex-col"
                    style={{
                      width: `${100 / 96}%`,
                      backgroundColor: fillColor || 'transparent',
                      borderRight: hourMark ? '1px solid #cbd5e1' : '1px solid #e5e7eb20'
                    }}
                    title={`${timeLabel} - ${status.label}`}
                  >
                    {/* Colored block - takes remaining space */}
                    <div className="flex-1 relative">
                      {fillColor && (
                        <div className="absolute inset-0 hover:opacity-80 transition-opacity"></div>
                      )}
                      
                      {/* 📝 Show note icon for On Duty with notes - AT BOTTOM of colored area */}
                      {hasNotes && (
                        <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center">
                          <div className="relative group/note">
                            <div className={`bg-white dark:bg-slate-800 rounded-t-md px-1 flex items-center justify-center shadow-sm cursor-help border border-amber-300 dark:border-amber-600 ${isZoomed ? 'text-sm py-1' : 'text-[10px]'}`}>
                              📝
                            </div>
                            {/* Tooltip on hover - appears ABOVE the icon */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/note:block w-64 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg p-3 shadow-xl z-50">
                              <div className="font-semibold mb-1">📍 {blockData.location}</div>
                              <div className="text-slate-300 dark:text-slate-200">{blockData.notes}</div>
                              {/* Arrow pointing down to icon */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Time label at bottom when zoomed */}
                    {showTimeLabel && (
                      <div className="text-[10px] text-center text-slate-600 dark:text-slate-400 font-mono py-0.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-600">
                        {timeLabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* REAL-TIME TOTALS SECTION */}
      <div className="mt-6 pt-6 border-t-2 border-slate-300 dark:border-slate-600">
        <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4">
          📊 Daily Totals (Real-Time)
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Off Duty */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9CA3AF' }}></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Off Duty</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatDuration(totals.off_duty)}
            </p>
          </div>

          {/* Sleeper Berth */}
          <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-600">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Sleeper Berth</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-white">
              {formatDuration(totals.sleeper_berth)}
            </p>
          </div>

          {/* Driving */}
          <div className="bg-green-50 dark:bg-green-900/50 rounded-lg p-4 border-2 border-green-300 dark:border-green-600">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Driving</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-white">
              {formatDuration(totals.driving)}
            </p>
          </div>

          {/* On Duty */}
          <div className="bg-amber-50 dark:bg-amber-900/50 rounded-lg p-4 border-2 border-amber-300 dark:border-amber-600">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">On Duty</span>
            </div>
            <p className="text-2xl font-bold text-amber-900 dark:text-white">
              {formatDuration(totals.on_duty)}
            </p>
          </div>

          {/* Work Hours (Driving + On Duty) */}
          <div className="bg-purple-50 dark:bg-purple-900/50 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-600">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">⚡</span>
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Work Hours</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-white">
              {formatDuration(totals.work_hours)}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Driving + On Duty
            </p>
          </div>
        </div>

        {/* HOS Compliance Warning */}
        {totals.driving > 11 && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-300 font-semibold">
              ⚠️ WARNING: Driving time exceeds 11-hour limit!
            </p>
          </div>
        )}
        {totals.work_hours > 14 && (
          <div className="mt-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-300 font-semibold">
              ⚠️ WARNING: Work hours exceed 14-hour limit!
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4 justify-center text-xs">
          {statusTypes.map(status => (
            <div key={status.id} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: status.color }}
              ></div>
              <span className="text-slate-700 dark:text-slate-300">{status.label}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-2">
          Each block represents 15 minutes • Grid shows: Midnight, 1-11 AM, Noon, 1-11 PM, Midnight
        </p>
        {!isFinalized && (
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              Live Counting - Updates every 5 seconds (No refresh needed)
            </p>
          </div>
        )}
        {isFinalized && (
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              ✅ Log Finalized - Totals are locked
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ELDTimeGrid;
