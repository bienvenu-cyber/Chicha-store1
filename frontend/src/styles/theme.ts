import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B',     // Rouge chaud
      light: '#FF8F8F',
      dark: '#C54B4B'
    },
    secondary: {
      main: '#4ECDC4',     // Turquoise
      light: '#7BDFD5',
      dark: '#37A69A'
    },
    background: {
      default: '#F7F7F7',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    },
    error: {
      main: '#FF4136'
    }
  },
  typography: {
    fontFamily: [
      'Montserrat', 
      'Roboto', 
      'Arial', 
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#333333'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 20px'
        },
        containedPrimary: {
          backgroundColor: '#FF6B6B',
          '&:hover': {
            backgroundColor: '#C54B4B'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.02)'
          }
        }
      }
    }
  }
});

export default theme;
