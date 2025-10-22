// src/pages/TripPlanner.jsx - VERSION CORRIGÉE
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import TripWizard from '../components/trips/TripWizard';
import InteractiveMap from '../components/trips/InteractiveMap';
import HOSBreakPlanner from '../components/trips/HOSBreakPlanner';

const TripPlanner = () => {
  const [activeTrip, setActiveTrip] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar /> {/* ← NAVBAR PRÉSENT */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activePage="/trips" /> {/* ← SIDEBAR PRÉSENTE */}
          
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Trip Planner
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Plan your routes with HOS compliance intelligence
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Forms */}
              <div className="xl:col-span-2 space-y-6">
                <TripWizard />
                <HOSBreakPlanner />
              </div>
              
              {/* Right Column - Map */}
              <div className="xl:col-span-1">
                <InteractiveMap trip={activeTrip} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;