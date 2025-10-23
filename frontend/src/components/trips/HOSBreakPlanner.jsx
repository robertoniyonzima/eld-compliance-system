// src/components/trips/HOSBreakPlanner.jsx - VERSION DEBUG COMPLÈTE
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';

const HOSBreakPlanner = ({ tripData, routeInfo }) => {
  const [breaks, setBreaks] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState('Waiting for trip data...');

  // ✅ DEBUG COMPLET
  console.log('🔍 HOSBreakPlanner - PROPS RECEIVED:');
  console.log('🔍 tripData:', tripData);
  console.log('🔍 routeInfo:', routeInfo);
  console.log('🔍 tripData exists?', !!tripData);
  console.log('🔍 routeInfo exists?', !!routeInfo);
  console.log('🔍 tripData keys:', tripData ? Object.keys(tripData) : 'No tripData');
  console.log('🔍 routeInfo keys:', routeInfo ? Object.keys(routeInfo) : 'No routeInfo');

  // Calculate REAL HOS breaks based on actual distance and duration
  useEffect(() => {
    console.log('🔄 HOSBreakPlanner useEffect triggered');
    console.log('📦 tripData changed:', tripData);
    console.log('🗺️ routeInfo changed:', routeInfo);
    
    if (tripData && routeInfo) {
      console.log('✅ Both tripData and routeInfo available, calculating HOS breaks...');
      calculateHOSBreaks();
    } else if (tripData) {
      console.log('⚠️ Only tripData available, waiting for routeInfo...');
      setComplianceStatus('Calculating route...');
    } else if (routeInfo) {
      console.log('⚠️ Only routeInfo available, waiting for tripData...');
      setComplianceStatus('Waiting for trip details...');
    } else {
      console.log('❌ No data available yet');
      setComplianceStatus('Plan a trip to see HOS break schedule');
    }
  }, [tripData, routeInfo]);

  // Dans HOSBreakPlanner.jsx - Modifier calculateHOSBreaks
  const calculateHOSBreaks = () => {
    console.log('🚀 calculateHOSBreaks called');
    
    // Use routeInfo if available, otherwise use backend data
    const distance = routeInfo?.distance || tripData?.total_distance || 0;
    
    // ✅ CORRECTION: Gérer proprement la durée
    let duration = 0;
    if (routeInfo?.duration !== undefined && !isNaN(routeInfo.duration)) {
      duration = routeInfo.duration;
    } else if (tripData?.estimated_duration) {
      // Convertir les secondes en heures
      duration = tripData.estimated_duration / 3600;
    } else {
      // Fallback: calculer à partir de la distance (55 mph moyenne)
      duration = distance / 55;
    }
    
    const cycleUsed = parseFloat(tripData?.current_cycle_used) || 0;
    
    console.log('📊 HOS Calculation Input (FIXED):', { 
      distance, 
      duration, 
      cycleUsed,
      routeInfoDuration: routeInfo?.duration,
      tripDataDuration: tripData?.estimated_duration
    });
    
    if (distance > 0 && duration > 0 && !isNaN(duration)) {
      console.log('✅ Valid distance and duration, calculating breaks...');
      calculateRealHOSBreaks(distance, duration, cycleUsed);
    } else {
      console.log('❌ Invalid data - distance:', distance, 'duration:', duration);
      setComplianceStatus('Calculating breaks...');
      setBreaks([]);
      
      // Fallback: essayer avec une durée calculée
      if (distance > 0) {
        const calculatedDuration = distance / 55;
        console.log('🔄 Using calculated duration:', calculatedDuration);
        calculateRealHOSBreaks(distance, calculatedDuration, cycleUsed);
      }
    }
  };

  const calculateRealHOSBreaks = (distance, duration, cycleUsed) => {
    console.log('🎯 calculateRealHOSBreaks called with:', { distance, duration, cycleUsed });
    const calculatedBreaks = [];

    // Calculate driving segments based on real duration
    const drivingSegments = Math.ceil(duration / 4); // Break every 4 hours
    
    console.log(`🛣️ Route Analysis: ${distance} miles, ${duration} hours, ${drivingSegments} segments`);

    // Check if we need mandatory 30-min break
    if (duration >= 8) {
      const breakTime = calculateBreakTime(8);
      calculatedBreaks.push({
        time: breakTime,
        duration: '30 min',
        type: 'HOS Mandatory Break',
        location: calculateBreakLocation(distance, 1, drivingSegments),
        status: 'Mandatory',
        reason: 'FMCSA 30-minute break required after 8 hours of driving'
      });
      console.log(`⏱️ Added mandatory break at ${breakTime} (after 8 hours)`);
    }

    // Add recommended breaks every 4 hours
    for (let i = 1; i <= drivingSegments; i++) {
      const segmentTime = (duration / drivingSegments) * i;
      
      if (i > 1) { // Skip first segment (already handled above if needed)
        const breakTime = calculateBreakTime(segmentTime);
        calculatedBreaks.push({
          time: breakTime,
          duration: '15 min',
          type: 'Recommended Break',
          location: calculateBreakLocation(distance, i, drivingSegments),
          status: 'Recommended', 
          reason: 'Short break for safety and alertness'
        });
        console.log(`☕ Added recommended break at ${breakTime} (segment ${i})`);
      }
    }

    // Add fuel stops based on REAL distance (every 500 miles)
    const fuelStops = Math.floor(distance / 500);
    console.log(`⛽ Fuel stops needed: ${fuelStops}`);
    
    for (let i = 1; i <= fuelStops; i++) {
      const fuelDistance = i * 500;
      const fuelTime = (fuelDistance / distance) * duration;
      
      calculatedBreaks.push({
        time: calculateBreakTime(fuelTime),
        duration: '45 min',
        type: 'Fuel Stop',
        location: `Approx. ${fuelDistance} miles`,
        status: 'Required',
        reason: 'Refueling and vehicle inspection'
      });
      console.log(`⛽ Added fuel stop at ${calculateBreakTime(fuelTime)} (${fuelDistance} miles)`);
    }

    // Add overnight rest if trip duration > 14 hours
    if (duration >= 14) {
      calculatedBreaks.push({
        time: '22:00',
        duration: '10 hours',
        type: 'Overnight Rest',
        location: calculateOvernightLocation(distance),
        status: 'Mandatory',
        reason: '10-hour off-duty period required by FMCSA'
      });
      console.log('🛌 Added overnight rest at 22:00');
    }

    const sortedBreaks = calculatedBreaks.sort((a, b) => a.time.localeCompare(b.time));
    console.log(`✅ Final breaks calculated: ${sortedBreaks.length}`, sortedBreaks);
    
    setBreaks(sortedBreaks);

    // Calculate REAL compliance status
    const totalHoursNeeded = cycleUsed + duration;
    let newComplianceStatus;
    
    if (totalHoursNeeded <= 70 && duration <= 11) {
      newComplianceStatus = 'Fully Compliant';
    } else if (totalHoursNeeded <= 70) {
      newComplianceStatus = 'Compliant with Required Breaks';
    } else {
      newComplianceStatus = 'HOS Violation - Adjust Trip';
    }
    
    setComplianceStatus(newComplianceStatus);
    console.log(`📋 Compliance: ${newComplianceStatus}, Total hours needed: ${totalHoursNeeded}`);
  };

  const calculateBreakTime = (hoursFromStart) => {
    const startHour = 6; // Assume 6:00 AM start
    const totalMinutes = Math.round(hoursFromStart * 60);
    const hours = Math.floor((startHour * 60 + totalMinutes) / 60) % 24;
    const minutes = (startHour * 60 + totalMinutes) % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const calculateBreakLocation = (totalDistance, segment, totalSegments) => {
    const distancePoint = Math.round((segment / totalSegments) * totalDistance);
    return `Approx. ${distancePoint} miles`;
  };

  const calculateOvernightLocation = (totalDistance) => {
    const overnightPoint = Math.round(totalDistance * 0.6); // 60% of route
    return `Approx. ${overnightPoint} miles`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Mandatory': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
      case 'Required': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
      case 'Recommended': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'HOS Mandatory Break': return '⏱️';
      case 'Recommended Break': return '☕';
      case 'Overnight Rest': return '🛌';
      case 'Fuel Stop': return '⛽';
      default: return '📍';
    }
  };

  const getComplianceColor = () => {
    switch (complianceStatus) {
      case 'Fully Compliant': return 'from-green-500 to-emerald-600';
      case 'Compliant with Required Breaks': return 'from-blue-500 to-cyan-600';
      case 'HOS Violation - Adjust Trip': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getComplianceIcon = () => {
    switch (complianceStatus) {
      case 'Fully Compliant': return '✅';
      case 'Compliant with Required Breaks': return '⚠️';
      case 'HOS Violation - Adjust Trip': return '❌';
      default: return '❓';
    }
  };

  console.log('🎨 HOSBreakPlanner rendering with:', { 
    breaksCount: breaks.length, 
    complianceStatus,
    shouldShowBreaks: breaks.length > 0
  });

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        HOS Break Planning
      </h3>
      
      {breaks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-600 dark:text-gray-400">
            {complianceStatus}
          </p>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Debug Info:</p>
            <p>• tripData: {tripData ? '✅' : '❌'}</p>
            <p>• routeInfo: {routeInfo ? '✅' : '❌'}</p>
            {routeInfo && (
              <p>• Distance: {routeInfo.distance} miles, Time: {routeInfo.duration} hours</p>
            )}
            {tripData && (
              <p>• Cycle Used: {tripData.current_cycle_used || 0} hours</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {breaks.map((breakItem, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-white/80 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    breakItem.status === 'Mandatory' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    breakItem.status === 'Required' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                    breakItem.status === 'Recommended' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                    'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  }`}>
                    <span className="text-md">
                      {getStatusIcon(breakItem.type)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {breakItem.time} • {breakItem.duration}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {breakItem.type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {breakItem.location} • {breakItem.reason}
                    </p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(breakItem.status)}`}>
                  {breakItem.status}
                </span>
              </div>
            ))}
          </div>
          
          {/* Compliance Status */}
          <div className={`mt-4 p-3 bg-gradient-to-r ${getComplianceColor()} rounded-lg text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-90">HOS Compliance Status</div>
                <div className="text-lg font-semibold">{complianceStatus}</div>
                {routeInfo && tripData && (
                  <div className="text-xs opacity-90 mt-1">
                    Cycle Used: {tripData.current_cycle_used || 0}h • Route: {routeInfo.distance}mi • Time: {routeInfo.duration}h
                  </div>
                )}
              </div>
              <div className="text-2xl">
                {getComplianceIcon()}
              </div>
            </div>
          </div>

          {/* HOS Rules Summary */}
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 text-sm">
              FMCSA HOS Rules - Strict Compliance Required
            </h4>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              <li>• <strong>30-min break</strong> required after 8 hours driving</li>
              <li>• <strong>11-hour</strong> daily driving limit</li>
              <li>• <strong>14-hour</strong> duty window limit</li>
              <li>• <strong>70-hour/8-day</strong> cycle limit</li>
              <li>• <strong>10-hour</strong> off-duty rest required</li>
            </ul>
          </div>
        </>
      )}
    </GlassCard>
  );
};

export default HOSBreakPlanner;