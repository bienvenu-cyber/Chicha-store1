import { createContext, useContext } from 'react';

export interface PersonalizationSettings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  language: 'fr' | 'en' | 'es';
  colorBlindMode: 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

export const defaultPersonalizationSettings: PersonalizationSettings = {
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  language: 'fr',
  colorBlindMode: 'normal'
};

class PersonalizationService {
  private storageKey = 'user_personalization';

  getSettings(): PersonalizationSettings {
    const storedSettings = localStorage.getItem(this.storageKey);
    return storedSettings 
      ? JSON.parse(storedSettings) 
      : { ...defaultPersonalizationSettings };
  }

  updateSettings(updates: Partial<PersonalizationSettings>): PersonalizationSettings {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    
    localStorage.setItem(this.storageKey, JSON.stringify(newSettings));
    this.applySettings(newSettings);

    return newSettings;
  }

  applySettings(settings: PersonalizationSettings) {
    // Thème
    document.body.setAttribute('data-theme', settings.theme);
    
    // Taille de police
    document.documentElement.style.setProperty('--font-size', this.getFontSizeValue(settings.fontSize));
    
    // Contraste
    document.body.classList.toggle('high-contrast', settings.highContrast);
    
    // Mode daltonisme
    document.body.setAttribute('data-color-blind-mode', settings.colorBlindMode);

    // Langue (peut nécessiter un changement de bibliothèque de traduction)
    // i18n.changeLanguage(settings.language);
  }

  private getFontSizeValue(size: PersonalizationSettings['fontSize']): string {
    switch (size) {
    case 'small': return '14px';
    case 'medium': return '16px';
    case 'large': return '18px';
    }
  }

  generateAccessibilityCSS(settings: PersonalizationSettings): string {
    return `
      :root {
        --font-size: ${this.getFontSizeValue(settings.fontSize)};
        --theme-background: ${settings.theme === 'dark' ? '#121212' : '#ffffff'};
        --theme-text: ${settings.theme === 'dark' ? '#ffffff' : '#000000'};
      }

      ${settings.highContrast ? `
        body {
          background-color: #000 !important;
          color: #fff !important;
        }
      ` : ''}

      ${this.getColorBlindCSS(settings.colorBlindMode)}
    `;
  }

  private getColorBlindCSS(mode: PersonalizationSettings['colorBlindMode']): string {
    switch (mode) {
    case 'deuteranopia':
      return `
          /* Filtre pour deutéranopie */
          body {
            filter: url(#deuteranopia);
          }
        `;
    case 'protanopia':
      return `
          /* Filtre pour protanopie */
          body {
            filter: url(#protanopia);
          }
        `;
    case 'tritanopia':
      return `
          /* Filtre pour tritanopie */
          body {
            filter: url(#tritanopia);
          }
        `;
    default:
      return '';
    }
  }
}

export const personalizationService = new PersonalizationService();

// Contexte React pour la personnalisation
export const PersonalizationContext = createContext({
  settings: defaultPersonalizationSettings,
  updateSettings: (updates: Partial<PersonalizationSettings>) => {}
});

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};
