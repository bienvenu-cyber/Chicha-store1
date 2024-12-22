import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  open: boolean;
  message: string;
  type?: NotificationType;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  open,
  message,
  type = 'info',
  onClose,
  duration = 6000
}) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
    >
      <Alert 
        onClose={onClose} 
        severity={type} 
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
