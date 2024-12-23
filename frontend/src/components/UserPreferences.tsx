import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Switch, 
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useUserProfile } from '../hooks/useUserProfile';

export const UserPreferences: React.FC = () => {
  const { profile, updateProfile } = useUserProfile();
  const [preferences, setPreferences] = useState({
    newsletter: profile?.preferences?.newsletter || false,
    darkMode: profile?.preferences?.darkMode || false,
    language: profile?.preferences?.language || 'fr'
  });

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);

    updateProfile({ 
      preferences: updatedPreferences 
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Mes Préférences
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.newsletter}
                onChange={(e) => handlePreferenceChange(
                  'newsletter', 
                  e.target.checked
                )}
                color="primary"
              />
            }
            label="Abonnement Newsletter"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.darkMode}
                onChange={(e) => handlePreferenceChange(
                  'darkMode', 
                  e.target.checked
                )}
                color="primary"
              />
            }
            label="Mode Sombre"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Langue</InputLabel>
            <Select
              value={preferences.language}
              label="Langue"
              onChange={(e) => handlePreferenceChange(
                'language', 
                e.target.value as string
              )}
            >
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};
