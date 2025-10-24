// src/components/eld/HOSCompliance.jsx
import { useEffect, useState } from 'react';
import { useELD } from '../../hooks/useELD';
import GlassCard from '../ui/GlassCard';

const HOSCompliance = () => {
  const { statusHistory, calculateHOSTotals } = useELD();
  const [violations, setViolations] = useState([]);
  const [totals, setTotals] = useState({});

  useEffect(() => {
    const totalsData = calculateHOSTotals();
    setTotals(totalsData);
    checkViolations(totalsData);
  }, [statusHistory]);

  const checkViolations = (totals) => {
    const v = [];

    // Règles principales FMCSA (exemple simplifié)
    if (totals.driving > 11) {
      v.push({
        rule: '11-hour Driving Limit',
        details: `You have driven ${totals.driving.toFixed(1)}h today (max 11h).`,
        severity: 'critical',
      });
    }

    if (totals.on_duty > 14) {
      v.push({
        rule: '14-hour On-Duty Limit',
        details: `Total on-duty time ${totals.on_duty.toFixed(1)}h exceeds 14h.`,
        severity: 'high',
      });
    }

    if (totals.off_duty < 10) {
      v.push({
        rule: '10-hour Off-Duty Requirement',
        details: `Only ${totals.off_duty.toFixed(1)}h off-duty (min 10h required).`,
        severity: 'warning',
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

      {/* Résumé rapide */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {totals.driving?.toFixed(1) || 0}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Driving (max 11h)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-500">
            {totals.on_duty?.toFixed(1) || 0}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">On Duty (max 14h)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {totals.sleeper_berth?.toFixed(1) || 0}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sleeper Berth</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-500">
            {totals.off_duty?.toFixed(1) || 0}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Off Duty (min 10h)</div>
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
