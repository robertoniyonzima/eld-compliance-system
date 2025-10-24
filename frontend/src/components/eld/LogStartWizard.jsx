// src/components/eld/LogStartWizard.jsx
import { useState } from 'react';
import { apiService } from '../../services/api';

const LogStartWizard = ({ onLogCreated, currentTrip }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    trailer_number: '',
    total_miles_driving_today: 0,
    total_mileage_today: 0,
    shipping_documents: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  // Pré-remplir avec les données du trip si disponible
  if (currentTrip && step === 1) {
    if (!formData.vehicle_number && currentTrip.vehicle_number) {
      setFormData(prev => ({
        ...prev,
        vehicle_number: currentTrip.vehicle_number,
        shipping_documents: `Trip #${currentTrip.id} - ${currentTrip.pickup_location?.city} to ${currentTrip.dropoff_location?.city}`
      }));
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartLog = async () => {
    try {
      setLoading(true);
      
      // Créer le log quotidien
      const logData = {
        date: new Date().toISOString().split('T')[0],
        ...formData
      };

      const response = await apiService.eld.createDailyLog(logData);
      
      // Créer le premier statut (Off Duty par défaut)
      await apiService.eld.createStatusChange({
        status: 'off_duty',
        location: 'Starting location',
        notes: 'Daily log started',
        start_time: new Date().toISOString()
      });

      onLogCreated(response.data);
    } catch (error) {
      console.error('Error starting log:', error);
      alert('Error starting daily log: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Vehicle Information",
      icon: "🚛",
      description: "Enter your vehicle details"
    },
    {
      number: 2,
      title: "Trip Details", 
      icon: "📋",
      description: "Confirm trip information"
    },
    {
      number: 3,
      title: "Ready to Start",
      icon: "✅",
      description: "Begin your daily log"
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Start Daily ELD Log
      </h2>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((stepItem, index) => (
          <div key={stepItem.number} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              step === stepItem.number 
                ? 'bg-blue-500 text-white' 
                : step > stepItem.number
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
            }`}>
              {step > stepItem.number ? '✓' : stepItem.icon}
            </div>
            <div className="text-xs mt-2 text-center text-gray-600 dark:text-gray-400">
              {stepItem.title}
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vehicle Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Truck/Tractor Number *
                </label>
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="e.g., TRK-1234"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trailer Number
                </label>
                <input
                  type="text"
                  value={formData.trailer_number}
                  onChange={(e) => handleInputChange('trailer_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="e.g., TRL-5678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Starting Odometer
                </label>
                <input
                  type="number"
                  value={formData.total_mileage_today}
                  onChange={(e) => handleInputChange('total_mileage_today', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Current mileage"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Today's Miles (Est.)
                </label>
                <input
                  type="number"
                  value={formData.total_miles_driving_today}
                  onChange={(e) => handleInputChange('total_miles_driving_today', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Estimated miles today"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trip & Shipping Information
            </h3>
            
            {currentTrip && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Active Trip Detected
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {currentTrip.pickup_location?.city} → {currentTrip.dropoff_location?.city}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Distance: {currentTrip.total_distance} miles • Status: {currentTrip.status}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shipping Documents / Bill of Lading
              </label>
              <textarea
                value={formData.shipping_documents}
                onChange={(e) => handleInputChange('shipping_documents', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="Enter shipping document numbers, load description, or trip details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="Any special notes, trailer conditions, or important information..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Ready to Start Your Day!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your daily ELD log is configured and ready. Click "Start Logging" to begin tracking your duty status changes.
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Today's Setup Summary
              </h4>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <p>• Vehicle: {formData.vehicle_number}</p>
                {formData.trailer_number && <p>• Trailer: {formData.trailer_number}</p>}
                {currentTrip && <p>• Active Trip: {currentTrip.pickup_location?.city} to {currentTrip.dropoff_location?.city}</p>}
                <p>• Starting Odometer: {formData.total_mileage_today} miles</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleStartLog}
            disabled={loading || !formData.vehicle_number}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting...' : 'Start Logging'}
          </button>
        )}
      </div>
    </div>
  );
};

export default LogStartWizard;