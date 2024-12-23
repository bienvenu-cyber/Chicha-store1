import { extendTheme } from '@chakra-ui/react';

const responsiveTheme = extendTheme({
  // Configuration des breakpoints
  breakpoints: {
    base: '0em',      // 0px
    sm: '30em',       // ~480px
    md: '48em',       // ~768px
    lg: '62em',       // ~992px
    xl: '80em',       // ~1280px
    '2xl': '96em'     // ~1536px
  },

  // Styles globaux
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800'
      },
      // Styles responsifs pour différents éléments
      '*': {
        boxSizing: 'border-box'
      }
    }
  },

  // Composants personnalisés
  components: {
    // Configuration responsive pour les composants
    Container: {
      baseStyle: {
        maxWidth: {
          base: '100%',
          sm: '480px',
          md: '768px',
          lg: '992px',
          xl: '1280px'
        },
        px: { base: 4, md: 8 }
      }
    },
    
    // Boutons
    Button: {
      baseStyle: {
        _hover: {
          transform: 'scale(1.05)'
        },
        transition: 'all 0.2s'
      },
      sizes: {
        responsive: {
          base: 'sm',
          md: 'md',
          lg: 'lg'
        }
      }
    },

    // Texte
    Text: {
      baseStyle: {
        fontSize: {
          base: 'sm',
          md: 'md'
        }
      }
    },

    // Titres
    Heading: {
      baseStyle: {
        fontSize: {
          base: '2xl',
          md: '3xl',
          lg: '4xl'
        }
      }
    }
  },

  // Utilitaires pour le responsive
  utilities: {
    hideBelow: (breakpoint: string) => ({
      display: { base: 'none', [breakpoint]: 'block' }
    }),
    showBelow: (breakpoint: string) => ({
      display: { base: 'block', [breakpoint]: 'none' }
    })
  }
});

export default responsiveTheme;
