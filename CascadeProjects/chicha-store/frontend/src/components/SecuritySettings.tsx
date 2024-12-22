import React, { useState } from 'react';
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

  const validatePasswords = () => {
    let isValid = true;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Mot de passe actuel requis';
      isValid = false;
    }

    if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handlePasswordChange = async () => {
    if (validatePasswords()) {
      try {
        await changePassword(
          passwordData.currentPassword, 
          passwordData.newPassword
        );
        
        // Réinitialisation du formulaire
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        onClose?.();
      } catch (error) {
        // Les erreurs sont déjà gérées par le hook useUserProfile
      }
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
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
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type={showPasswords.current ? 'text' : 'password'}
            label="Mot de passe actuel"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({
              ...prev, 
              currentPassword: e.target.value
            }))}
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
            type={showPasswords.new ? 'text' : 'password'}
            label="Nouveau mot de passe"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({
              ...prev, 
              newPassword: e.target.value
            }))}
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
            type={showPasswords.confirm ? 'text' : 'password'}
            label="Confirmer le nouveau mot de passe"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({
              ...prev, 
              confirmPassword: e.target.value
            }))}
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
          <Box display="flex" justifyContent="flex-end">
            <Button 
              variant="contained" 
              color="primary"
              onClick={handlePasswordChange}
            >
              Changer le mot de passe
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
