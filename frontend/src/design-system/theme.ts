import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#f5e6d3',
    100: '#e6c8a7',
    200: '#d6aa7b',
    300: '#c68c50',
    400: '#b76e24',
    500: '#a75000', // Couleur principale
    600: '#964600',
    700: '#853c00',
    800: '#743200',
    900: '#632800'
  },
  background: {
    light: '#f9f5f0',
    dark: '#2c2c2c'
  },
  text: {
    light: '#333333',
    dark: '#f0f0f0'
  }
};

const typography = {
  fonts: {
    heading: '\'Montserrat\', sans-serif',
    body: '\'Open Sans\', sans-serif'
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  }
};

const shadows = {
  subtle: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 6px rgba(0, 0, 0, 0.15)',
  strong: '0 6px 12px rgba(0, 0, 0, 0.2)'
};

const borderRadius = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem'
};

const theme = extendTheme({
  colors,
  ...typography,
  shadows,
  borderRadius,
  
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md'
      },
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600'
          }
        },
        secondary: {
          bg: 'brand.100',
          color: 'brand.700',
          _hover: {
            bg: 'brand.200'
          }
        }
      }
    },
    
    Card: {
      baseStyle: {
        container: {
          boxShadow: 'subtle',
          borderRadius: 'lg'
        }
      }
    },
    
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md'
        }
      }
    }
  },

  styles: {
    global: {
      body: {
        bg: 'background.light',
        color: 'text.light'
      }
    }
  }
});

export default theme;
