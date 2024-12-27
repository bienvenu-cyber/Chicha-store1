import React, { useState, useEffect, useCallback } from 'react';

// Types d'options d'accessibilité
interface AccessibilityOptions {
  fontSize: number;
  highContrast: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

export const useAccessibility = () => {
  // État initial des options d'accessibilité
  const [options, setOptions] = useState<AccessibilityOptions>({
    fontSize: 16,
    highContrast: false,
    screenReaderMode: false,
    keyboardNavigation: false
  });

  // Application des options d'accessibilité
  useEffect(() => {
    // Ajustement de la taille de police
    document.documentElement.style.fontSize = `${options.fontSize}px`;

    // Mode contraste élevé
    if (options.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Mode lecteur d'écran
    if (options.screenReaderMode) {
      document.body.setAttribute('aria-live', 'polite');
    } else {
      document.body.removeAttribute('aria-live');
    }

    // Navigation au clavier
    if (options.keyboardNavigation) {
      document.body.classList.add('keyboard-navigation');
    } else {
      document.body.classList.remove('keyboard-navigation');
    }
  }, [options]);

  // Méthodes de mise à jour
  const updateFontSize = useCallback((size: number) => {
    setOptions(prev => ({ ...prev, fontSize: size }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setOptions(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleScreenReaderMode = useCallback(() => {
    setOptions(prev => ({ ...prev, screenReaderMode: !prev.screenReaderMode }));
  }, []);

  const toggleKeyboardNavigation = useCallback(() => {
    setOptions(prev => ({ ...prev, keyboardNavigation: !prev.keyboardNavigation }));
  }, []);

  // Raccourcis clavier pour l'accessibilité
  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      // Ctrl + Alt + F : Augmenter la taille de police
      if (event.ctrlKey && event.altKey && event.key === 'f') {
        updateFontSize(Math.min(options.fontSize + 2, 24));
      }
      
      // Ctrl + Alt + C : Activer/désactiver le contraste
      if (event.ctrlKey && event.altKey && event.key === 'c') {
        toggleHighContrast();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [options, updateFontSize, toggleHighContrast]);

  return {
    accessibilityOptions: options,
    updateFontSize,
    toggleHighContrast,
    toggleScreenReaderMode,
    toggleKeyboardNavigation
  };
};

// Composant de paramètres d'accessibilité
export const AccessibilitySettings: React.FC = () => {
  const {
    accessibilityOptions,
    updateFontSize,
    toggleHighContrast,
    toggleScreenReaderMode,
    toggleKeyboardNavigation
  } = useAccessibility();

  return (
    <div role="region" aria-label="Paramètres d'accessibilité">
      <div>
        <label htmlFor="font-size">Taille de police</label>
        <input
          id="font-size"
          type="range"
          min={12}
          max={24}
          value={accessibilityOptions.fontSize}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFontSize(Number(e.target.value))}
          aria-valuemin={12}
          aria-valuemax={24}
          aria-valuenow={accessibilityOptions.fontSize}
        />
      </div>

      <div>
        <input
          type="checkbox"
          id="high-contrast"
          checked={accessibilityOptions.highContrast}
          onChange={toggleHighContrast}
        />
        <label htmlFor="high-contrast">Mode Contraste Élevé</label>
      </div>

      <div>
        <input
          type="checkbox"
          id="screen-reader"
          checked={accessibilityOptions.screenReaderMode}
          onChange={toggleScreenReaderMode}
        />
        <label htmlFor="screen-reader">Mode Lecteur d&apos;Écran</label>
      </div>

      <div>
        <input
          type="checkbox"
          id="keyboard-nav"
          checked={accessibilityOptions.keyboardNavigation}
          onChange={toggleKeyboardNavigation}
        />
        <label htmlFor="keyboard-nav">Navigation Clavier</label>
      </div>
    </div>
  );
};
