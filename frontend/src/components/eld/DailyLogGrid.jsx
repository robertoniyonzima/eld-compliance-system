// src/components/eld/DailyLogGrid.jsx
import GlassCard from "../ui/GlassCard";
import GradientButton from "../ui/GradientButton";
import { useState } from 'react';

const DailyLogGrid = ({ date }) => {
  const [dutyStatus, setDutyStatus] = useState('off_duty');
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const statusTypes = [
    { id: 'off_duty', label: '1. OFF DUTY', color: 'bg-gray-200 dark:bg-gray-600', activeColor: 'bg-gray-400' },
    { id: 'sleeper_berth', label: '2. SLEEPER BERTH', color: 'bg-blue-200 dark:bg-blue-600', activeColor: 'bg-blue-500' },
    { id: 'driving', label: '3. DRIVING', color: 'bg-green-200 dark:bg-green-600', activeColor: 'bg-green-500' },
    { id: 'on_duty', label: '4. ON DUTY', color: 'bg-amber-200 dark:bg-amber-600', activeColor: 'bg-amber-500' }
  ];

  return (
    <GlassCard className="p-6">
      {/* Status Controls */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white/30 dark:bg-dark-700/30 rounded-xl">
        {statusTypes.map((status) => (
          <button
            key={status.id}
            onClick={() => setDutyStatus(status.id)}
            className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              dutyStatus === status.id
                ? `${status.activeColor} text-white shadow-lg scale-105`
                : `${status.color} text-gray-700 dark:text-gray-300 hover:scale-105`
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* 24-Hour Grid */}
      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-2xl overflow-hidden">
        {/* Header Hours */}
        <div className="grid grid-cols-25 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
          <div className="p-3 border-r border-gray-300 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">
            Statut
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
            <div className="p-4 border-r border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-dark-700/50">
              {status.label}
            </div>
            {hours.map((hour) => (
              <div
                key={hour}
                className={`p-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0 cursor-pointer transition-all duration-300 hover:opacity-80 ${
                  dutyStatus === status.id && hour >= 6 && hour <= 18
                    ? status.activeColor
                    : status.color
                }`}
                onClick={() => console.log(`Set ${status.id} at hour ${hour}`)}
              >
                {/* Writing lines */}
                <div className="space-y-1">
                  <div className="h-0.5 bg-gray-400 dark:bg-gray-500 opacity-30"></div>
                  <div className="h-0.5 bg-gray-400 dark:bg-gray-500 opacity-30"></div>
                  <div className="h-0.5 bg-gray-400 dark:bg-gray-500 opacity-30"></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </div>
        <div className="flex space-x-3">
          <GradientButton variant="warning">
            ⚠️ Signaler un problème
          </GradientButton>
          <GradientButton>
            ✅ Certifier le log
          </GradientButton>
        </div>
      </div>
    </GlassCard>
  );
};

export default DailyLogGrid;