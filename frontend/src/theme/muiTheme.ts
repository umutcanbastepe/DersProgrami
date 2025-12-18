import { createTheme } from '@mui/material/styles'

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: 'rgb(170, 180, 240)', // Gradient'teki mora yakın ton
      dark: 'rgb(140, 150, 210)', // Koyu mor
      light: 'rgb(193, 200, 255)', // Açık mor (gradient'teki mor)
      contrastText: 'rgb(255, 255, 255)',
    },
    secondary: {
      main: 'rgb(255, 182, 193)', // Orta ton pembe
      dark: 'rgb(255, 160, 180)', // Koyu pembe
      light: 'rgb(255, 214, 224)', // Açık pembe (gradient'teki pembe)
      contrastText: 'rgb(255, 255, 255)',
    },
    error: {
      main: 'rgb(239, 68, 68)',
    },
    warning: {
      main: 'rgb(255, 193, 7)', // Daha sıcak sarı ton
    },
    success: {
      main: 'rgb(76, 175, 80)',
    },
    background: {
      default: 'rgb(255, 250, 252)', // Çok açık pembe tonlu beyaz
      paper: 'rgb(255, 255, 255)',
    },
    text: {
      primary: 'rgb(55, 48, 80)', // Koyu mor-gri ton
      secondary: 'rgb(120, 110, 150)', // Orta ton mor-gri
    },
    action: {
      active: 'rgba(170, 180, 240, 0.9)', // Primary main ile uyumlu
      hover: 'rgba(193, 200, 255, 0.2)', // Primary light ile uyumlu açık hover
      selected: 'rgba(255, 214, 224, 0.3)', // Secondary light ile uyumlu
      disabled: 'rgba(120, 110, 150, 0.3)', // Text secondary ile uyumlu
    },
    grey: {
      50: 'rgb(255, 250, 252)', // Çok açık pembe tonlu
      100: 'rgb(250, 245, 250)', // Açık pembe-mor tonlu
      200: 'rgb(240, 235, 245)', // Açık mor tonlu
      300: 'rgb(220, 210, 230)', // Orta-açık mor tonlu
      400: 'rgb(180, 170, 200)', // Orta mor tonlu
      500: 'rgb(150, 140, 180)', // Orta-koyu mor tonlu
      600: 'rgb(120, 110, 150)', // Koyu mor tonlu
      700: 'rgb(90, 80, 120)', // Çok koyu mor tonlu
      800: 'rgb(70, 60, 100)', // Daha koyu mor
      900: 'rgb(55, 48, 80)', // En koyu mor (text primary ile aynı)
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '1.875rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.75rem 1.5rem',
          textTransform: 'none',
          '&.MuiButton-text:hover': {
            backgroundColor: 'rgba(193, 200, 255, 0.2)',
            transition: 'background-color 0.2s ease-in-out',
          },
          '&.MuiButton-outlined:hover': {
            backgroundColor: 'rgba(193, 200, 255, 0.2)',
            borderColor: 'rgba(170, 180, 240, 0.6)',
            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(193, 200, 255, 0.2)',
            transition: 'background-color 0.2s ease-in-out',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
        root: {
          '@media print': {
            display: 'none',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(255, 214, 224, 0.9), rgba(193, 200, 255, 0.9))',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgb(226, 232, 240)',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
      },
    },
  },
})
