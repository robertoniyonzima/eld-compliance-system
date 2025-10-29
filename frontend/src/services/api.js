// src/services/api.js - VERSION CORRIGÉE
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Token is expired if current time is past expiration
    return currentTime >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Consider invalid token as expired
  }
};

// Helper function to logout and redirect
const handleLogout = () => {
  console.log('🔐 Token expired - Logging out automatically');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  
  // Redirect to login page
  window.location.href = '/login';
};

// Intercepteur pour ajouter le token et vérifier l'expiration
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Check if token exists and is not expired
    if (token) {
      if (isTokenExpired(token)) {
        console.warn('⚠️ Token expired before request');
        handleLogout();
        return Promise.reject(new Error('Token expired'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If we get 401 Unauthorized, logout automatically
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - Token invalid or expired');
      handleLogout();
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth - UNIQUEMENT les endpoints d'authentification
  auth: {
    login: (credentials) => api.post('/auth/login/', credentials),
    register: (userData) => api.post('/auth/register/', userData),
    getCurrentUser: () => api.get('/auth/me/'),
    uploadPhoto: (formData) => api.post('/auth/upload-photo/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    refreshToken: (refresh) => api.post('/token/refresh/', { refresh }), // ✅ Corrigé
  },

  // Users - TOUS les endpoints de gestion utilisateur
  users: {
    getAll: () => api.get('/auth/users/'),
    getAllUsers: () => api.get('/auth/users/'),
    update: (userId, data) => api.patch(`/auth/users/${userId}/`, data),
    approveUser: (userId) => api.post(`/auth/users/${userId}/approve/`, {}),
    toggleUserStatus: (userId) => api.post(`/auth/users/${userId}/toggle-status/`, {}),
    deleteUser: (userId) => api.delete(`/auth/users/${userId}/delete/`),
  },

  // Les autres services restent inchangés
  eld: {
    getDailyLogs: () => api.get('/eld/daily-logs/'),
    getTodayLog: () => api.get('/eld/daily-logs/today/'),
    createDailyLog: (data) => api.post('/eld/daily-logs/', data),
    createStatusChange: (data) => api.post('/eld/duty-status-changes/', data),
    certifyLog: (logId, signature) => api.post(`/eld/daily-logs/${logId}/certify/`, { signature }),
    finalizeLog: (logId, data) => api.post(`/eld/daily-logs/${logId}/finalize/`, data),
    calculateMiles: (fromLocation, toLocation) => api.post('/eld/daily-logs/calculate_miles/', { 
      from_location: fromLocation, 
      to_location: toLocation 
    }),
    getDriverStats: () => api.get('/eld/daily-logs/driver_stats/'),
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
    update: (tripId, data) => api.patch(`/trips/trips/${tripId}/`, data),
    delete: (tripId) => api.delete(`/trips/trips/${tripId}/`),
  },

  hos: {
    getCompliance: () => api.get('/hos/compliance/'),
    getViolations: () => api.get('/hos/compliance/violations/'),
  }
};

export default api;