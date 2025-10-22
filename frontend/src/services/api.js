// src/services/api.js - VERSION CORRIGÉE
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth - UNIQUEMENT les endpoints d'authentification
  auth: {
    login: (credentials) => api.post('/auth/login/', credentials),
    register: (userData) => api.post('/auth/register/', userData),
    refreshToken: (refresh) => api.post('/token/refresh/', { refresh }), // ✅ Corrigé
  },

  // Users - TOUS les endpoints de gestion utilisateur
  users: {
    getAllUsers: () => api.get('/auth/users/'),
    approveUser: (userId) => api.post(`/auth/users/${userId}/approve/`, {}), // ✅ POST avec body vide
    toggleUserStatus: (userId) => api.post(`/auth/users/${userId}/toggle-status/`, {}), // ✅ POST
    deleteUser: (userId) => api.delete(`/auth/users/${userId}/delete/`),
  },

  // Les autres services restent inchangés
  eld: {
    getDailyLogs: () => api.get('/eld/daily-logs/'),
    getTodayLog: () => api.get('/eld/daily-logs/today/'),
    createStatusChange: (data) => api.post('/eld/duty-status-changes/', data),
    certifyLog: (logId, signature) => api.post(`/eld/daily-logs/${logId}/certify/`, { signature }),
    generatePDF: (logId) => api.get(`/eld/daily-logs/${logId}/pdf/`, { responseType: 'blob' }),
  },

  trips: {
    create: (tripData) => api.post('/trips/trips/', tripData),
    getAll: () => api.get('/trips/trips/'),
    getDetails: (tripId) => api.get(`/trips/trips/${tripId}/`),
    getSummary: (tripId) => api.get(`/trips/trips/${tripId}/summary/`),
    getELDLogs: (tripId) => api.get(`/trips/trips/${tripId}/eld_logs/`),
    startTrip: (tripId) => api.post(`/trips/trips/${tripId}/start/`),
    completeTrip: (tripId) => api.post(`/trips/trips/${tripId}/complete/`),
  },

  hos: {
    getCompliance: () => api.get('/hos/compliance/'),
    getViolations: () => api.get('/hos/compliance/violations/'),
  }
};

export default api;