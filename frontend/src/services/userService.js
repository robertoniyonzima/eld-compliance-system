// src/services/userService.js - VERSION CORRIGÉE
import { apiService } from './api';

export const userService = {
  // Récupérer tous les utilisateurs
  async getAllUsers() {
    try {
      const response = await apiService.users.getAllUsers();
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  },

  // Approuver un utilisateur - ✅ CORRIGÉ: utilise POST
  async approveUser(userId) {
    try {
      const response = await apiService.users.approveUser(userId);
      return response.data;
    } catch (error) {
      console.error('Error approving user:', error);
      throw new Error(error.response?.data?.error || 'Failed to approve user');
    }
  },

  // Activer/Désactiver un utilisateur - ✅ CORRIGÉ: utilise toggleUserStatus
  async toggleUserStatus(userId) {
    try {
      const response = await apiService.users.toggleUserStatus(userId);
      return response.data;
    } catch (error) {
      console.error('Error toggling user:', error);
      throw new Error(error.response?.data?.error || 'Failed to toggle user status');
    }
  },

  // Supprimer un utilisateur
  async deleteUser(userId) {
    try {
      const response = await apiService.users.deleteUser(userId);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
  }
};