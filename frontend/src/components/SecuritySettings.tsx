import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { useUserProfile } from '../hooks/useUserProfile';

interface SecuritySettingsProps {
  onClose?: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onClose }) => {
  const { changePassword } = useUserProfile();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    return errors;
  };

  const handlePasswordChange = (prop: keyof typeof passwordData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPasswordData(prev => ({
      ...prev,
      [prop]: value
    }));

    // Validate new password
    if (prop === 'newPassword') {
      const passwordValidationErrors = validatePassword(value);
      setPasswordErrors(prev => ({
        ...prev,
        newPassword: passwordValidationErrors.join(', ')
      }));
    }

    // Validate password confirmation
    if (prop === 'confirmPassword' || prop === 'newPassword') {
      const passwordsMatch = value === passwordData.newPassword;
      setPasswordErrors(prev => ({
        ...prev,
        confirmPassword: passwordsMatch ? '' : 'Les mots de passe ne correspondent pas'
      }));
    }
  };

  useEffect(() => {
    // Form validation
    const newPasswordErrors = validatePassword(passwordData.newPassword);
    const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;
    const hasCurrentPassword = !!passwordData.currentPassword;

    setIsFormValid(
      newPasswordErrors.length === 0 && 
      passwordsMatch && 
      hasCurrentPassword
    );
  }, [passwordData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isFormValid) {
      try {
        await changePassword(passwordData.currentPassword, passwordData.newPassword);
        // Réinitialiser le formulaire ou afficher un message de succès
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        onClose?.();
      } catch (error) {
        // Gérer les erreurs de changement de mot de passe
        console.error('Erreur lors du changement de mot de passe', error);
      }
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Paramètres de Sécurité
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mot de passe actuel"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={handlePasswordChange('newPassword')}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              disabled={!isFormValid}
            >
              Enregistrer
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SecuritySettings;
