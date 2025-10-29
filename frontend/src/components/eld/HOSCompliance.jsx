// src/components/eld/HOSCompliance.jsx - FIXED WITH LIVE UPDATES
import { useEffect, useState } from 'react';
import { useELD } from '../../hooks/useELD';
import GlassCard from '../ui/GlassCard';

const HOSCompliance = ({ date = new Date() }) => {
  const { statusHistory, calculateHOSTotals } = useELD(date);
  const [violations, setViolations] = useState([]);
  const [totals, setTotals] = useState({
    driving: 0,
    on_duty: 0,
    sleeper_berth: 0,
    off_duty: 0,
    work_hours: 0
  });

  useEffect(() => {
    const totalsData = calculateHOSTotals();
    setTotals(totalsData);
    checkViolations(totalsData);
    
    // ✅ LIVE UPDATES - Refresh every 5 seconds
    const interval = setInterval(() => {
      const freshTotals = calculateHOSTotals();
      setTotals(freshTotals);
      checkViolations(freshTotals);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [statusHistory]);

  const checkViolations = (totals) => {
    const v = [];

    // ✅ FMCSA Rules - Corrected
    // 1. 11-hour Driving Limit
    if (totals.driving > 11) {
      v.push({
        rule: '⚠️ 11-Hour Driving Limit Exceeded',
        details: `You have driven ${totals.driving.toFixed(1)}h today (max 11h). Stop driving immediately!`,
        severity: 'critical',
      });
    } else if (totals.driving > 10) {
      v.push({
        rule: '⚡ Approaching 11-Hour Driving Limit',
        details: `You have driven ${totals.driving.toFixed(1)}h today. Only ${(11 - totals.driving).toFixed(1)}h remaining.`,
        severity: 'warning',
      });
    }

    // 2. 14-hour Work Limit (Driving + On Duty)
    const workHours = totals.driving + totals.on_duty;
    if (workHours > 14) {
      v.push({
        rule: '⚠️ 14-Hour Work Limit Exceeded',
        details: `Total work hours ${workHours.toFixed(1)}h exceeds 14h limit. You must take 10 consecutive hours off-duty.`,
        severity: 'critical',
      });
    } else if (workHours > 13) {
      v.push({
        rule: '⚡ Approaching 14-Hour Work Limit',
        details: `Total work hours ${workHours.toFixed(1)}h. Only ${(14 - workHours).toFixed(1)}h remaining.`,
        severity: 'warning',
      });
    }

    // 3. 10-hour Off-Duty Requirement
    if (totals.off_duty < 10 && (totals.driving > 0 || totals.on_duty > 0)) {
      v.push({
        rule: '🚨 10-Hour Off-Duty Requirement',
        details: `Only ${totals.off_duty.toFixed(1)}h off-duty. You need ${(10 - totals.off_duty).toFixed(1)}h more before starting work.`,
        severity: 'high',
      });
    }

    setViolations(v);
  };

  const getSeverityColor = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-800/40 dark:text-red-300';
      case 'high':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-800/40 dark:text-amber-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800/40 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-800/40 dark:text-green-300';
    }
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        HOS Compliance Overview
      </h3>

      {/* ✅ Live HOS Summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live Updates</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-300 dark:border-green-700">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {totals.driving?.toFixed(1) || 0}h
          </div>
          <div className="text-xs text-green-700 dark:text-green-300 mt-1 font-medium">🚛 Driving</div>
          <div className="text-xs text-green-600 dark:text-green-500 mt-1">Max: 11h</div>
          <div className="mt-2 bg-green-200 dark:bg-green-800 rounded-full h-2">
            <div 
              className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((totals.driving / 11) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-2 border-amber-300 dark:border-amber-700">
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {totals.on_duty?.toFixed(1) || 0}h
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300 mt-1 font-medium">📋 On Duty</div>
          <div className="text-xs text-amber-600 dark:text-amber-500 mt-1">Not Driving</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-700">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {(totals.driving + totals.on_duty)?.toFixed(1) || 0}h
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300 mt-1 font-medium">⚡ Work Hours</div>
          <div className="text-xs text-purple-600 dark:text-purple-500 mt-1">Max: 14h</div>
          <div className="mt-2 bg-purple-200 dark:bg-purple-800 rounded-full h-2">
            <div 
              className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(((totals.driving + totals.on_duty) / 14) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totals.sleeper_berth?.toFixed(1) || 0}h
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 font-medium">🛌 Sleeper Berth</div>
          <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">Rest Time</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-700">
          <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
            {totals.off_duty?.toFixed(1) || 0}h
          </div>
          <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 font-medium">🏠 Off Duty</div>
          <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">Min: 10h</div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gray-500 dark:bg-gray-400 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((totals.off_duty / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Violations */}
      {violations.length === 0 ? (
        <div className="text-center py-10 text-green-600 dark:text-green-400">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-lg font-semibold">Fully compliant today!</p>
          <p className="text-sm opacity-80">No HOS violations detected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {violations.map((v, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border border-white/10 ${getSeverityColor(v.severity)}`}
            >
              <div className="font-semibold">{v.rule}</div>
              <div className="text-sm mt-1 opacity-90">{v.details}</div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default HOSCompliance;
