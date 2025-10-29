import { useState } from 'react';
import { apiService } from '../../services/api';

// Mock components for demo
const GlassCard = ({ children, className }) => (
  <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

const TripWizard = ({ onTripCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tripData, setTripData] = useState({
    current_location: { address: '', city: '', state: '', zip_code: '' },
    pickup_location: { address: '', city: '', state: '', zip_code: '' },
    dropoff_location: { address: '', city: '', state: '', zip_code: '' },
    current_cycle_used: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: 'Current Location', icon: '📍' },
    { number: 2, title: 'Pickup Point', icon: '📦' },
    { number: 3, title: 'Destination', icon: '🏁' },
    { number: 4, title: 'HOS Info', icon: '⏱️' },
    { number: 5, title: 'Review', icon: '✅' }
  ];

  // ✅ FIXED VALIDATION
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!tripData.current_location.address.trim()) newErrors.current_address = 'Address is required';
      if (!tripData.current_location.city.trim()) newErrors.current_city = 'City is required';
      if (!tripData.current_location.state.trim()) newErrors.current_state = 'State is required';
    }
    
    if (step === 2) {
      if (!tripData.pickup_location.address.trim()) newErrors.pickup_address = 'Address is required';
      if (!tripData.pickup_location.city.trim()) newErrors.pickup_city = 'City is required';
      if (!tripData.pickup_location.state.trim()) newErrors.pickup_state = 'State is required';
    }
    
    if (step === 3) {
      if (!tripData.dropoff_location.address.trim()) newErrors.dropoff_address = 'Address is required';
      if (!tripData.dropoff_location.city.trim()) newErrors.dropoff_city = 'City is required';
      if (!tripData.dropoff_location.state.trim()) newErrors.dropoff_state = 'State is required';
    }
    
    if (step === 4) {
      if (tripData.current_cycle_used < 0 || tripData.current_cycle_used > 70) {
        newErrors.current_cycle_used = 'Must be between 0 and 70 hours';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  // ✅ FIXED: Simplified input change handler
  const handleLocationChange = (locationType, field, value) => {
    setTripData(prev => ({
      ...prev,
      [locationType]: {
        ...prev[locationType],
        [field]: value
      }
    }));
  };

  // ✅ FIXED: Separate handler for HOS cycle
  const handleCycleChange = (value) => {
    setTripData(prev => ({
      ...prev,
      current_cycle_used: value
    }));
  };

  const handleCreateTrip = async () => {
    setLoading(true);
    try {
      const formattedData = {
        current_location: tripData.current_location,
        pickup_location: tripData.pickup_location, 
        dropoff_location: tripData.dropoff_location,
        current_cycle_used: parseFloat(tripData.current_cycle_used) || 0
      };

      console.log('🚀 Creating trip with:', formattedData);
      
      // ✅ REAL API CALL to backend
      const response = await apiService.trips.create(formattedData);
      console.log('✅ Trip created successfully:', response.data);
      
      alert('✅ Trip created successfully! Distance: ' + (response.data.total_distance || 'calculating...') + ' miles');
      
      // Pass the backend response to parent
      if (onTripCreated) {
        onTripCreated(response);
      }
      
      // Reset form
      setCurrentStep(1);
      setTripData({
        current_location: { address: '', city: '', state: '', zip_code: '' },
        pickup_location: { address: '', city: '', state: '', zip_code: '' },
        dropoff_location: { address: '', city: '', state: '', zip_code: '' },
        current_cycle_used: 0
      });
      
    } catch (error) {
      console.error('❌ Error creating trip:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`❌ Error creating trip: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              Step 1: Where are you starting from?
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Current Address *
              </label>
              <input
                type="text"
                value={tripData.current_location.address}
                onChange={(e) => handleLocationChange('current_location', 'address', e.target.value)}
                placeholder="e.g., 123 Main Street, Chicago"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {errors.current_address && <p className="text-red-500 text-sm mt-1">{errors.current_address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={tripData.current_location.city}
                  onChange={(e) => handleLocationChange('current_location', 'city', e.target.value)}
                  placeholder="e.g., Chicago"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                {errors.current_city && <p className="text-red-500 text-sm mt-1">{errors.current_city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={tripData.current_location.state}
                  onChange={(e) => handleLocationChange('current_location', 'state', e.target.value)}
                  placeholder="e.g., IL"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                {errors.current_state && <p className="text-red-500 text-sm mt-1">{errors.current_state}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              Step 2: Where are you picking up?
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pickup Address *
              </label>
              <input
                type="text"
                value={tripData.pickup_location.address}
                onChange={(e) => handleLocationChange('pickup_location', 'address', e.target.value)}
                placeholder="e.g., 456 Warehouse Road"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {errors.pickup_address && <p className="text-red-500 text-sm mt-1">{errors.pickup_address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={tripData.pickup_location.city}
                  onChange={(e) => handleLocationChange('pickup_location', 'city', e.target.value)}
                  placeholder="e.g., Chicago"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                {errors.pickup_city && <p className="text-red-500 text-sm mt-1">{errors.pickup_city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={tripData.pickup_location.state}
                  onChange={(e) => handleLocationChange('pickup_location', 'state', e.target.value)}
                  placeholder="e.g., IL"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                {errors.pickup_state && <p className="text-red-500 text-sm mt-1">{errors.pickup_state}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-600 dark:text-green-400">
              Step 3: Where is your destination?
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Destination Address *
              </label>
              <input
                type="text"
                value={tripData.dropoff_location.address}
                onChange={(e) => handleLocationChange('dropoff_location', 'address', e.target.value)}
                placeholder="e.g., 789 Distribution Center, Denver"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {errors.dropoff_address && <p className="text-red-500 text-sm mt-1">{errors.dropoff_address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={tripData.dropoff_location.city}
                  onChange={(e) => handleLocationChange('dropoff_location', 'city', e.target.value)}
                  placeholder="e.g., Denver"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                {errors.dropoff_city && <p className="text-red-500 text-sm mt-1">{errors.dropoff_city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={tripData.dropoff_location.state}
                  onChange={(e) => handleLocationChange('dropoff_location', 'state', e.target.value)}
                  placeholder="e.g., CO"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                {errors.dropoff_state && <p className="text-red-500 text-sm mt-1">{errors.dropoff_state}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-3">
                ⚠️ HOS Compliance Information - REQUIRED
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Current HOS Cycle Used (hours) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="70"
                  step="0.5"
                  value={tripData.current_cycle_used}
                  onChange={(e) => handleCycleChange(e.target.value)}
                  placeholder="Enter current hours used"
                  className="w-full px-4 py-3 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-slate-800 text-red-900 dark:text-red-100"
                />
                {errors.current_cycle_used && <p className="text-red-500 text-sm mt-1">{errors.current_cycle_used}</p>}
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  ⚠️ FMCSA 70-hour/8-day cycle limit. You have <strong>{70 - tripData.current_cycle_used} hours</strong> remaining.
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2 text-sm">
                HOS Rules Summary - Strict Enforcement
              </h4>
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                <li>• 30-minute break mandatory after 8 hours driving</li>
                <li>• Maximum 11 hours driving per day</li>
                <li>• 14-hour duty window cannot be extended</li>
                <li>• 70-hour limit in 8 consecutive days</li>
                <li>• 10 consecutive hours off-duty required daily</li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tracking-wide">
              Step 5: Review Your Trip
            </h4>

            <div className="relative overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/60 shadow-md backdrop-blur-sm">
              <div className="p-6 space-y-5">
                {[
                  { label: "From", data: tripData.current_location },
                  { label: "Pickup", data: tripData.pickup_location },
                  { label: "Destination", data: tripData.dropoff_location },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className={`flex justify-between items-start pb-3 ${
                      index < 2 ? "border-b border-slate-200 dark:border-slate-700" : ""
                    }`}
                  >
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {item.label}:
                    </span>
                    <span className="text-right font-semibold text-slate-900 dark:text-slate-100">
                      {item.data.address}
                      <br />
                      <span className="text-slate-600 dark:text-slate-300">
                        {item.data.city}, {item.data.state}
                      </span>
                    </span>
                  </div>
                ))}

                <div className="flex justify-between items-start pt-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    HOS Cycle Used:
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {tripData.current_cycle_used} hours
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 via-green-50 to-emerald-100 dark:from-green-900/40 dark:via-emerald-900/30 dark:to-emerald-800/30 border border-green-300/40 dark:border-green-800/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="text-green-600 dark:text-green-400 text-3xl">✅</div>
              <div>
                <p className="font-bold text-green-900 dark:text-green-100 text-lg">
                  Ready to Create Trip!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your route will be calculated automatically with HOS compliance planning.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <GlassCard className="p-6 max-w-4xl mx-auto my-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Plan New Trip
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Create your route with automatic HOS compliance
        </p>
      </div>

      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-4 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-10">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2
              ${currentStep >= step.number 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
              }
            `}>
              {currentStep > step.number ? '✓' : step.icon}
            </div>
            <span className={`text-xs font-medium ${
              currentStep >= step.number 
                ? 'text-slate-900 dark:text-white' 
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-6 min-h-[300px]">
        {renderStepContent()}
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            currentStep === 1 || loading
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          ← Back
        </button>
        
        {currentStep === steps.length ? (
          <button
            onClick={handleCreateTrip}
            disabled={loading}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : '✅ Create Trip'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all"
          >
            Continue →
          </button>
        )}
      </div>
    </GlassCard>
  );
};

export default TripWizard;