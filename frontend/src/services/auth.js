// src/services/auth.js - VERSION CORRIGÉE
import { apiService } from './api';

export const authService = {
  async login(email, password) {
    try {
      console.log('🔐 Attempting login with:', { email });
      
      const response = await apiService.auth.login({ 
        email: email.trim(), 
        password: password 
      });
      
      console.log('✅ Login response received');
      
      const { access, refresh, user } = response.data;
      
      // Stocker les tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // 🔥 STOCKER LES INFOS UTILISATEUR COMPLÈTES
      const userData = {
        id: user.id,
        email: user.email,
        first_name: user.first_name || 'Driver',
        last_name: user.last_name || '',
        user_type: user.user_type || 'driver',
        profile_photo_url: user.profile_photo_url || null
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      return { 
        user: userData,
        tokens: { access, refresh } 
      };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        'Email ou mot de passe incorrect'
      );
    }
  },


async register(userData) {
  try {
    // Transformer les données du frontend vers le format backend
    const backendData = {
      email: userData.email,
      username: userData.email.split('@')[0], // Générer un username depuis l'email
      password: userData.password,
      password_confirm: userData.passwordConfirm,
      user_type: userData.userType,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone_number: userData.phoneNumber
    };

    // Ajouter les champs spécifiques aux drivers
    if (userData.userType === 'driver') {
      backendData.license_number = userData.licenseNumber;
      backendData.license_state = userData.licenseState;
      backendData.home_terminal_address = "123 Main St, Los Angeles, CA 90001"; // TEMPORAIRE - à remplacer par un champ dans le formulaire
    }

    console.log('📤 Données envoyées à l\'API:', backendData);
    
    const response = await apiService.auth.register(backendData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data);
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.detail || 
      'Erreur d\'inscription'
    );
  }
},

async getCurrentUser() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('🔐 No token found');
      return null;
    }

    // 1. D'abord vérifier si le token est valide
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        console.log('🔐 Token expired');
        this.logout();
        return null;
      }
      
      console.log('✅ Token is valid, payload:', payload);
      
    } catch (decodeError) {
      console.error('❌ Token decode error:', decodeError);
      this.logout();
      return null;
    }

    // 2. Ensuite, essayer de récupérer depuis l'API
    try {
      // ⭐ ESSAYER D'ABORD L'API SI ELLE EXISTE
      const response = await apiService.auth.getCurrentUser();
      console.log('✅ API user data:', response.data);
      
      // Mettre à jour le localStorage avec les données fraîches
      if (response.data) {
        localStorage.setItem('user_data', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (apiError) {
      console.log('🔄 API user fetch failed, using stored data...');
      
      // 3. Fallback: utiliser les données stockées
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('✅ Using stored user data:', userData);
        return userData;
      }
      
      // 4. Dernier recours: décoder le token
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.user_id || 0,
        email: payload.email || 'user@example.com',
        first_name: payload.first_name || 'User',
        last_name: payload.last_name || '',
        user_type: payload.user_type || 'driver'
      };
    }
    
  } catch (error) {
    console.error('❌ Critical error in getCurrentUser:', error);
    return null;
  }
},

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  },

  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  }
};