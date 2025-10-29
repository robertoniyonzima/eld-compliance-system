// src/components/eld/FinalizeLogModal.jsx
import { useState } from 'react';
import { apiService } from '../../services/api';

const FinalizeLogModal = ({ log, onClose, onFinalized }) => {
  // From Location (start of day)
  const [fromAddress, setFromAddress] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [fromState, setFromState] = useState('');
  
  // To Location (end of day)
  const [toAddress, setToAddress] = useState('');
  const [toCity, setToCity] = useState('');
  const [toState, setToState] = useState('');
  
  const [milesDriven, setMilesDriven] = useState(log?.total_miles_driving_today || '');
  const [calculatingMiles, setCalculatingMiles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate miles automatically using backend API (same as Trip Planner)
  const calculateMiles = async () => {
    const fromLocation = `${fromAddress}, ${fromCity}, ${fromState}`.trim();
    const toLocation = `${toAddress}, ${toCity}, ${toState}`.trim();
    
    if (!fromCity || !fromState || !toCity || !toState) {
      setError('Please fill in at least City and State for both locations');
      return;
    }

    try {
      setCalculatingMiles(true);
      setError('');
      
      // Use backend API for geocoding (same system as Trip Planner)
      const response = await apiService.eld.calculateMiles(fromLocation, toLocation);
      
      if (response.data && response.data.miles) {
        setMilesDriven(response.data.miles);
        setError('');
        console.log('✅ Miles calculated:', response.data.miles);
      } else {
        setError('Could not calculate distance. Please enter miles manually.');
      }
    } catch (err) {
      console.error('Error calculating miles:', err);
      const errorMsg = err.response?.data?.error || 'Failed to calculate miles. Please enter manually.';
      setError(errorMsg);
    } finally {
      setCalculatingMiles(false);
    }
  };

  const handleFinalize = async () => {
    const fromLocation = `${fromAddress}, ${fromCity}, ${fromState}`.trim();
    const toLocation = `${toAddress}, ${toCity}, ${toState}`.trim();
    
    if (!fromCity || !fromState) {
      setError('Please enter From location (at least City and State)');
      return;
    }
    
    if (!toCity || !toState) {
      setError('Please enter To location (at least City and State)');
      return;
    }

    if (!milesDriven || milesDriven <= 0) {
      setError('Please calculate or enter miles driven (must be greater than 0)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await apiService.eld.finalizeLog(log.id, {
        from_location: fromLocation,
        to_location: toLocation,
        total_miles_driving_today: parseInt(milesDriven)
      });

      alert('✅ Daily log finalized successfully!');
      onFinalized(response.data.log);
      onClose();
    } catch (err) {
      console.error('Error finalizing log:', err);
      setError(err.response?.data?.error || 'Failed to finalize log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Finalize Daily Log
        </h2>

        <div className="space-y-4">
          {/* FROM LOCATION (Start of Day) */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
              📍 From Location (Start of Day)
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="Street Address (optional)"
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="City *"
                  required
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  value={fromState}
                  onChange={(e) => setFromState(e.target.value)}
                  placeholder="State *"
                  required
                  maxLength="2"
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm uppercase"
                />
              </div>
            </div>
          </div>

          {/* TO LOCATION (End of Day) */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 dark:text-green-200 mb-3">
              📍 To Location (End of Day)
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="Street Address (optional)"
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900 dark:text-white text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="City *"
                  required
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  value={toState}
                  onChange={(e) => setToState(e.target.value)}
                  placeholder="State *"
                  required
                  maxLength="2"
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900 dark:text-white text-sm uppercase"
                />
              </div>
            </div>
          </div>

          {/* Calculate Miles Button */}
          <button
            onClick={calculateMiles}
            disabled={calculatingMiles || !fromCity || !fromState || !toCity || !toState}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
          >
            {calculatingMiles ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <span>🧮</span>
                <span>Calculate Miles Automatically</span>
              </>
            )}
          </button>

          {/* Miles Driven */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              🚗 Miles Driven Today
            </label>
            <input
              type="number"
              value={milesDriven}
              onChange={(e) => setMilesDriven(e.target.value)}
              placeholder="Click 'Calculate Miles' or enter manually"
              min="0"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold">
              ⚠️ Warning
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Once finalized, you cannot edit this log. You will not be able to start a new log for this date.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalize}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? 'Finalizing...' : 'Finalize Log'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalizeLogModal;
