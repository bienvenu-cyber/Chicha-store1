import { useState, useCallback } from 'react';
import { handleApiError, ErrorResponse } from '../utils/errorHandler';
import { useNotification } from '../contexts/NotificationContext';

type RequestFunction<T> = (...args: any[]) => Promise<T>;

export const useApiRequest = <T>(
  requestFn: RequestFunction<T>, 
  options: { 
    showSuccessNotification?: boolean; 
    successMessage?: string;
    showErrorNotification?: boolean;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const { showNotification } = useNotification();

  const {
    showSuccessNotification = false,
    successMessage = 'Opération réussie',
    showErrorNotification = true
  } = options;

  const makeRequest = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await requestFn(...args);
      setData(result);

      if (showSuccessNotification) {
        showNotification(successMessage, 'success');
      }

      return result;
    } catch (err) {
      const processedError = handleApiError(err);
      setError(processedError);

      if (showErrorNotification) {
        showNotification(processedError.message, 'error');
      }

      throw processedError;
    } finally {
      setLoading(false);
    }
  }, [requestFn, showSuccessNotification, successMessage, showErrorNotification]);

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    makeRequest,
    reset
  };
};
