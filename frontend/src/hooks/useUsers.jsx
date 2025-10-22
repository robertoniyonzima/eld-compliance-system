// src/hooks/useUsers.jsx - VERSION CORRIGÉE
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approuver un utilisateur
  const approveUser = async (userId) => {
    try {
      await userService.approveUser(userId);
      await loadUsers(); // Recharger la liste
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Activer/Désactiver un utilisateur - ✅ CORRIGÉ: utilise toggleUserStatus
  const toggleUserStatus = async (userId) => {
    try {
      await userService.toggleUserStatus(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    approveUser,
    toggleUserStatus, // ✅ CORRIGÉ
    deleteUser
  };
};