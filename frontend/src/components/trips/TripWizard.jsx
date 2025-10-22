// src/components/trips/TripWizard.jsx
import { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';

const TripWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    { number: 1, title: 'Current Location', icon: '📍' },
    { number: 2, title: 'Pickup Point', icon: '📦' },
    { number: 3, title: 'Destination', icon: '🏁' },
    { number: 4, title: 'Review', icon: '✅' }
  ];

  return (
    <GlassCard variant="elevated" className="p-8">
      {/* Progress Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Plan New Trip
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Create optimized routes with HOS compliance
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-700 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500
              ${currentStep >= step.number 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }
            `}>
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
              currentStep >= step.number 
                ? 'text-slate-900 dark:text-white' 
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <div className="animate-slide-in">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Current Location
            </label>
            <input
              type="text"
              placeholder="Enter your current address..."
              className="w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t border-slate-200 dark:border-slate-700">
          <GradientButton
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </GradientButton>
          
          <GradientButton
            onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
          >
            {currentStep === 4 ? 'Create Trip' : 'Continue'}
          </GradientButton>
        </div>
      </div>
    </GlassCard>
  );
};

export default TripWizard;