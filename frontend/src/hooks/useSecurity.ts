import { useState, useEffect } from 'react';
import { monitoringService } from '../services/monitoringService';

interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number;
}

export const useSecurity = (config: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000  // 15 minutes
}) => {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutExpiry, setLockoutExpiry] = useState<number | null>(null);

  useEffect(() => {
    const checkLockoutStatus = () => {
      const storedLockoutExpiry = localStorage.getItem('lockoutExpiry');
      
      if (storedLockoutExpiry) {
        const expiryTime = parseInt(storedLockoutExpiry, 10);
        
        if (Date.now() < expiryTime) {
          setIsLocked(true);
          setLockoutExpiry(expiryTime);
        } else {
          // Déverrouiller après expiration
          localStorage.removeItem('lockoutExpiry');
          setIsLocked(false);
          setLoginAttempts(0);
        }
      }
    };

    checkLockoutStatus();
  }, []);

  const recordLoginAttempt = async (success: boolean) => {
    if (isLocked) return false;

    await monitoringService.logLoginAttempt({
      timestamp: Date.now(),
      success
    });

    if (!success) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= config.maxLoginAttempts) {
        const lockoutTime = Date.now() + config.lockoutDuration;
        
        setIsLocked(true);
        setLockoutExpiry(lockoutTime);
        localStorage.setItem('lockoutExpiry', lockoutTime.toString());

        return false;
      }
    } else {
      // Réinitialiser les tentatives en cas de succès
      setLoginAttempts(0);
    }

    return true;
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutExpiry) return 0;
    return Math.max(0, Math.ceil((lockoutExpiry - Date.now()) / 1000));
  };

  const resetLockout = () => {
    setIsLocked(false);
    setLoginAttempts(0);
    setLockoutExpiry(null);
    localStorage.removeItem('lockoutExpiry');
  };

  return {
    recordLoginAttempt,
    isLocked,
    loginAttempts,
    getRemainingLockoutTime,
    resetLockout
  };
};
