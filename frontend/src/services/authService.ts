import axios from 'axios';
import { 
  UserProfile, 
  UserCredentials, 
  UserRegistration, 
  AuthTokens,
  UserRole,
  AccountStatus
} from '../types/User';
import { handleApiError } from '../utils/errorHandler';
import { monitoringService } from './monitoringService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth';

export class AuthService {
  // Connexion
  async login(credentials: UserCredentials): Promise<{
    user: UserProfile, 
    tokens: AuthTokens
  }> {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      
      const { user, tokens } = response.data;
      
      // Stocker les tokens et les informations utilisateur
      this.setTokens(tokens);
      this.setUserProfile(user);

      // Tracking de la connexion
      monitoringService.logLoginAttempt({
        timestamp: Date.now(),
        success: true
      });

      return { user, tokens };
    } catch (error) {
      // Tracking des échecs de connexion
      monitoringService.logLoginAttempt({
        timestamp: Date.now(),
        success: false
      });

      throw handleApiError(error);
    }
  }

  // Inscription
  async register(userData: UserRegistration): Promise<{
    user: UserProfile, 
    tokens: AuthTokens
  }> {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      
      const { user, tokens } = response.data;
      
      this.setTokens(tokens);
      this.setUserProfile(user);

      return { user, tokens };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/logout`, {
        refreshToken: this.getRefreshToken()
      });
    } catch (error) {
      console.warn('Erreur lors de la déconnexion', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Rafraîchissement du token
  async refreshTokens(): Promise<AuthTokens> {
    try {
      const response = await axios.post(`${API_URL}/refresh`, {
        refreshToken: this.getRefreshToken()
      });

      const tokens = response.data;
      this.setTokens(tokens);
      return tokens;
    } catch (error) {
      this.clearAuthData();
      throw handleApiError(error);
    }
  }

  // Vérification de l'authentification
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens && !this.isTokenExpired(tokens.accessToken);
  }

  // Récupération du profil utilisateur
  getUserProfile(): UserProfile | null {
    const profileStr = localStorage.getItem('userProfile');
    return profileStr ? JSON.parse(profileStr) : null;
  }

  // Vérification des permissions
  hasRole(requiredRole: UserRole): boolean {
    const profile = this.getUserProfile();
    return profile?.role === requiredRole;
  }

  // Méthodes privées de gestion des tokens
  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('tokenExpiry', tokens.expiresAt.toString());
  }

  private getTokens(): AuthTokens | null {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const expiresAt = localStorage.getItem('tokenExpiry');

    if (accessToken && refreshToken && expiresAt) {
      return {
        accessToken,
        refreshToken,
        expiresAt: parseInt(expiresAt, 10)
      };
    }

    return null;
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setUserProfile(profile: UserProfile): void {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  private isTokenExpired(token: string): boolean {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userProfile');
  }

  // Réinitialisation du mot de passe
  async resetPassword(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/reset-password`, { email });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Changement de mot de passe
  async changePassword(
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      await axios.post(`${API_URL}/change-password`, {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const authService = new AuthService();
