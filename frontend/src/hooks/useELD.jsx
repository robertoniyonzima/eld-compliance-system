// src/hooks/useELD.js
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { getLocalISOString } from '../utils/timezone';

export const useELD = (date = new Date()) => {
  const [currentStatus, setCurrentStatus] = useState('off_duty');
  const [statusHistory, setStatusHistory] = useState([]);
  const [currentLog, setCurrentLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger le log du jour
  useEffect(() => {
    loadDailyLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date.toISOString().split('T')[0]]); // Only re-run when date changes

  const loadDailyLog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Essayer de récupérer le log d'aujourd'hui
      const todayStr = date.toISOString().split('T')[0];
      const response = await apiService.eld.getDailyLogs();
      
      // Trouver le log pour la date sélectionnée
      const logForDate = response.data.find(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0];
        return logDate === todayStr;
      });
      
      if (logForDate) {
        setCurrentLog(logForDate);
        // ✅ Sort status history by most recent first
        const sortedHistory = (logForDate.status_changes || []).sort((a, b) => 
          new Date(b.start_time) - new Date(a.start_time)
        );
        setStatusHistory(sortedHistory);
        
        // Déterminer le statut actuel (le dernier sans end_time)
        const activeStatus = sortedHistory.find(change => !change.end_time);
        if (activeStatus) {
          setCurrentStatus(activeStatus.status);
        } else {
          setCurrentStatus('off_duty');
        }
      } else {
        // Pas de log pour aujourd'hui, on initialise avec un état vide
        setCurrentLog(null);
        setStatusHistory([]);
        setCurrentStatus('off_duty');
      }
    } catch (err) {
      console.error('Error loading daily log:', err);
      setError('Failed to load daily log');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (newStatus, location, notes = '') => {
    try {
      setError(null);
      
      // Créer un changement de statut
      // ✅ CRITICAL: Use local time, NOT UTC
      const statusChangeData = {
        status: newStatus,
        location: location,
        notes: notes,
        start_time: getLocalISOString() // Use local time without timezone conversion
      };

      const response = await apiService.eld.createStatusChange(statusChangeData);
      
      // Mettre à jour l'historique local
      setStatusHistory(prev => [...prev, response.data]);
      setCurrentStatus(newStatus);
      
      // Recharger le log pour avoir les données fraîches
      await loadDailyLog();
      
      return response.data;
    } catch (err) {
      console.error('Error changing status:', err);
      setError('Failed to change status');
      throw err;
    }
  };

  const endCurrentStatus = async () => {
    try {
      // Trouver le statut actuel (sans end_time)
      const activeStatus = statusHistory.find(change => !change.end_time);
      if (activeStatus) {
        // Pour simplifier, on crée un nouveau statut "off_duty"
        await changeStatus('off_duty', 'Auto-ended previous status', 'Previous status ended automatically');
      }
    } catch (err) {
      console.error('Error ending current status:', err);
      throw err;
    }
  };

  const calculateHOSTotals = () => {
    const totals = {
      off_duty: 0,
      sleeper_berth: 0,
      driving: 0,
      on_duty: 0
    };

    statusHistory.forEach(change => {
      if (change.end_time) {
        const start = new Date(change.start_time);
        const end = new Date(change.end_time);
        const duration = (end - start) / (1000 * 60 * 60); // heures
        
        if (totals[change.status] !== undefined) {
          totals[change.status] += duration;
        }
      } else {
        // Pour le statut actuel, calculer jusqu'à maintenant
        const start = new Date(change.start_time);
        const now = new Date();
        const duration = (now - start) / (1000 * 60 * 60);
        
        if (totals[change.status] !== undefined) {
          totals[change.status] += duration;
        }
      }
    });

    return totals;
  };

  const certifyLog = async (signature) => {
    try {
      if (!currentLog) {
        throw new Error('No log to certify');
      }
      
      const response = await apiService.eld.certifyLog(currentLog.id, signature);
      await loadDailyLog(); // Recharger pour voir la certification
      return response.data;
    } catch (err) {
      console.error('Error certifying log:', err);
      throw err;
    }
  };

  const exportPDF = async () => {
    try {
      if (!currentLog) {
        throw new Error('No log to export');
      }
      
      const response = await apiService.eld.generatePDF(currentLog.id);
      return response.data;
    } catch (err) {
      console.error('Error exporting PDF:', err);
      throw err;
    }
  };

  return {
    // État
    currentStatus,
    statusHistory,
    currentLog,
    loading,
    error,
    
    // Actions
    changeStatus,
    endCurrentStatus,
    calculateHOSTotals,
    certifyLog,
    exportPDF,
    refreshLog: loadDailyLog,
    
    // Informations dérivées
    vehicleInfo: currentLog ? {
      vehicle_number: currentLog.vehicle_number,
      trailer_number: currentLog.trailer_number
    } : null,
    
    // Métadonnées
    totals: calculateHOSTotals(),
    hasActiveStatus: statusHistory.some(change => !change.end_time)
  };
};