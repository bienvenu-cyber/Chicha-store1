import { useState, useEffect } from 'react';
import { 
  UserProfile, 
  fetchUserProfile, 
  updateUserProfile, 
  uploadUserAvatar,
  changeUserPassword
} from '../services/userService';
import { useNotification } from '../contexts/NotificationContext';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await fetchUserProfile();
      setProfile(userProfile);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement du profil';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile) throw new Error('Aucun profil chargé');
      
      const updatedProfile = await updateUserProfile(updates);
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      showNotification('Profil mis à jour avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour';
      showNotification(errorMessage, 'error');
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await changeUserPassword(currentPassword, newPassword);
      showNotification('Mot de passe modifié avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de modification du mot de passe';
      showNotification(errorMessage, 'error');
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const avatarUrl = await uploadUserAvatar(file);
      setProfile(prev => prev ? { ...prev, avatarUrl } : null);
      showNotification('Avatar mis à jour', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de téléchargement';
      showNotification(errorMessage, 'error');
      throw err;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    changePassword,
    uploadAvatar,
    reloadProfile: loadProfile
  };
};
