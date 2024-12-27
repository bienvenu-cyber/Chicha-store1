import axios, { AxiosError } from 'axios';

export interface ErrorResponse {
  message: string;
  status?: number;
}

export const handleApiError = (error: unknown): ErrorResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      // Le serveur a répondu avec un code d'erreur
      const status = axiosError.response.status;
      const data = axiosError.response.data as { message?: string };
      
      switch (status) {
      case 400:
        return { 
          message: data.message || 'Requête invalide', 
          status 
        };
      case 401:
        return { 
          message: 'Non autorisé. Veuillez vous connecter.', 
          status 
        };
      case 403:
        return { 
          message: 'Accès refusé', 
          status 
        };
      case 404:
        return { 
          message: 'Ressource non trouvée', 
          status 
        };
      case 500:
        return { 
          message: 'Erreur serveur. Réessayez plus tard.', 
          status 
        };
      default:
        return { 
          message: data.message || 'Une erreur est survenue', 
          status 
        };
      }
    } else if (axiosError.request) {
      // La requête a été faite mais pas de réponse
      return { 
        message: 'Pas de réponse du serveur. Vérifiez votre connexion.', 
        status: 0 
      };
    }
  }

  // Erreur générique
  return { 
    message: error instanceof Error ? error.message : 'Erreur inconnue', 
    status: undefined 
  };
};

export const logError = (error: ErrorResponse) => {
  console.error(`[${error.status || 'N/A'}] ${error.message}`);
  // Possibilité d'ajouter une intégration avec un service de logging
};

export const displayUserFriendlyError = (error: ErrorResponse): string => {
  // Transforme les messages techniques en messages compréhensibles
  const friendlyMessages: { [key: number]: string } = {
    401: 'Votre session a expiré. Veuillez vous reconnecter.',
    403: 'Vous n\'avez pas les permissions nécessaires.',
    404: 'La ressource demandée n\'existe pas.',
    500: 'Un problème est survenu. Notre équipe technique a été informée.'
  };

  return friendlyMessages[error.status || 0] || error.message;
};
