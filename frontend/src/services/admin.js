// src/services/admin.js - VERSION CORRIGÉE
import { apiService } from './api';

export const adminService = {
  // Récupérer tous les utilisateurs
  async getUsers() {
    try {
      const response = await apiService.users.getAllUsers();
      console.log('📡 API Response structure:', response);
      
      // ⭐ CORRECTION: Extraire le tableau de response.data
      if (response && response.data) {
        return response.data;
      } else {
        console.error('❌ Unexpected response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('Admin service - getUsers error:', error);
      throw error;
    }
  },

  // Approuver un utilisateur
  async approveUser(userId) {
    try {
      const response = await apiService.users.approveUser(userId);
      return response.data;
    } catch (error) {
      console.error('Admin service - approveUser error:', error);
      throw error;
    }
  },

  // Activer/désactiver un utilisateur
  async toggleUserStatus(userId) {
    try {
      const response = await apiService.users.toggleUserStatus(userId);
      return response.data;
    } catch (error) {
      console.error('Admin service - toggleUserStatus error:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async deleteUser(userId) {
    try {
      const response = await apiService.users.deleteUser(userId);
      return response.data;
    } catch (error) {
      console.error('Admin service - deleteUser error:', error);
      throw error;
    }
  }
};