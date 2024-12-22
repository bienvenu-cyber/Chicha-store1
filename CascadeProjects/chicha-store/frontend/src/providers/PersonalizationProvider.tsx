import React, { useState, useEffect, ReactNode } from 'react';
import { 
  PersonalizationContext, 
  PersonalizationSettings, 
  personalizationService,
  defaultPersonalizationSettings
} from '../services/personalizationService';

interface PersonalizationProviderProps {
  children: ReactNode;
}

export const PersonalizationProvider: React.FC<PersonalizationProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<PersonalizationSettings>(
    personalizationService.getSettings()
  );

  useEffect(() => {
    // Appliquer les paramètres initiaux
    personalizationService.applySettings(settings);

    // Créer un style dynamique pour l'accessibilité
    const styleElement = document.createElement('style');
    styleElement.id = 'accessibility-styles';
    styleElement.textContent = personalizationService.generateAccessibilityCSS(settings);
    document.head.appendChild(styleElement);

    return () => {
      // Nettoyer le style lors du démontage
      const existingStyle = document.getElementById('accessibility-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [settings]);

  const updateSettings = (updates: Partial<PersonalizationSettings>) => {
    const newSettings = personalizationService.updateSettings(updates);
    setSettings(newSettings);
  };

  return (
    <PersonalizationContext.Provider value={{ settings, updateSettings }}>
      {children}
      
      {/* SVG Filters pour le mode daltonisme */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="deuteranopia">
            <feColorMatrix 
              type="matrix" 
              values="0.625 0.375 0 0 0, 0.7 0.3 0 0 0, 0 0.3 0.7 0 0, 0 0 0 1 0"
            />
          </filter>
          <filter id="protanopia">
            <feColorMatrix 
              type="matrix" 
              values="0.567 0.433 0 0 0, 0.558 0.442 0 0 0, 0 0.242 0.758 0 0, 0 0 0 1 0"
            />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix 
              type="matrix" 
              values="0.95 0.05 0 0 0, 0 0.433 0.567 0 0, 0 0.475 0.525 0 0, 0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
    </PersonalizationContext.Provider>
  );
};
