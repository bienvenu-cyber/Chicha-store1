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
  InputLabel,
  Slider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Brightness4 as ThemeIcon,
  FontDownload as FontIcon,
  ColorLens as ColorIcon,
  Accessibility as AccessibilityIcon
} from '@mui/icons-material';
import { 
  PersonalizationSettings, 
  personalizationService,
  usePersonalization 
} from '../services/personalizationService';

export const AccessibilitySettings: React.FC = () => {
  const { settings, updateSettings } = usePersonalization();
  const [localSettings, setLocalSettings] = useState<PersonalizationSettings>(settings);

  const handleSettingChange = <K extends keyof PersonalizationSettings>(
    key: K, 
    value: PersonalizationSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <AccessibilityIcon sx={{ mr: 2 }} />
        <Typography variant="h6">
          Paramètres d'Accessibilité
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Thème */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center">
            <ThemeIcon sx={{ mr: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.theme === 'dark'}
                  onChange={(e) => handleSettingChange(
                    'theme', 
                    e.target.checked ? 'dark' : 'light'
                  )}
                  color="primary"
                />
              }
              label="Mode Sombre"
            />
          </Box>
        </Grid>

        {/* Taille de police */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center">
            <FontIcon sx={{ mr: 2 }} />
            <FormControl fullWidth>
              <InputLabel>Taille de Police</InputLabel>
              <Select
                value={localSettings.fontSize}
                label="Taille de Police"
                onChange={(e) => handleSettingChange(
                  'fontSize', 
                  e.target.value as PersonalizationSettings['fontSize']
                )}
              >
                <MenuItem value="small">Petit</MenuItem>
                <MenuItem value="medium">Moyen</MenuItem>
                <MenuItem value="large">Grand</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Contraste */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.highContrast}
                onChange={(e) => handleSettingChange(
                  'highContrast', 
                  e.target.checked
                )}
                color="primary"
              />
            }
            label="Contraste Élevé"
          />
        </Grid>

        {/* Mode Daltonisme */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Mode Daltonisme</InputLabel>
            <Select
              value={localSettings.colorBlindMode}
              label="Mode Daltonisme"
              onChange={(e) => handleSettingChange(
                'colorBlindMode', 
                e.target.value as PersonalizationSettings['colorBlindMode']
              )}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="deuteranopia">Deutéranopie</MenuItem>
              <MenuItem value="protanopia">Protanopie</MenuItem>
              <MenuItem value="tritanopia">Tritanopie</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Langue */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Langue</InputLabel>
            <Select
              value={localSettings.language}
              label="Langue"
              onChange={(e) => handleSettingChange(
                'language', 
                e.target.value as PersonalizationSettings['language']
              )}
            >
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Prévisualisation */}
      <Box mt={3} p={2} bgcolor="background.default" borderRadius={2}>
        <Typography variant="body2">
          Prévisualisation des paramètres
        </Typography>
        <Box 
          sx={{ 
            fontSize: personalizationService.getSettings().fontSize === 'large' ? '1.2rem' : 'inherit',
            color: personalizationService.getSettings().theme === 'dark' ? '#fff' : '#000'
          }}
        >
          Chicha Store - Votre expérience personnalisée
        </Box>
      </Box>
    </Paper>
  );
};
