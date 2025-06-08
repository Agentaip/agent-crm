import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4', // טורקיז ניאון
    },
    secondary: {
      main: '#ff4081', // ורוד ניאון
    },
    background: {
      default: '#0d1117', // כהה יותר
      paper: '#161b22',   // רקע לקלפים
    },
    text: {
      primary: '#ffffff',
      secondary: '#8b949e',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Rubik", "sans-serif"',
    h4: {
      fontWeight: 700,
      letterSpacing: '1px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0d1117',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderRight: '1px solid #333',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#00bcd4',
            color: '#000',
            '&:hover': {
              backgroundColor: '#00acc1',
            },
          },
          '&:hover': {
            backgroundColor: '#222',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(135deg, #00bcd4 30%, #ff4081 90%)',
          color: '#fff',
          boxShadow: '0 0 10px rgba(0,188,212,0.4)',
          borderRadius: 8,
          transition: '0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #00acc1 30%, #f50057 90%)',
            boxShadow: '0 0 20px rgba(255,64,129,0.6)',
          },
        },
      },
    },
  },
});

export default theme;
