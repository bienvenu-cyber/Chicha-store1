import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  preferences?: {
    newsletter: boolean;
    darkMode: boolean;
  };
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: UserProfile['address'];
  preferences?: UserProfile['preferences'];
}

const API_URL = 'http://localhost:5000/api/users';

export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUserProfile = async (
  payload: UpdateProfilePayload
): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/profile`, payload, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const uploadUserAvatar = async (file: File): Promise<string> => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post(`${API_URL}/avatar`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}` 
      }
    });
    return response.data.avatarUrl;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const changeUserPassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/change-password`, 
      { currentPassword, newPassword },
      {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      }
    );
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchUserOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
