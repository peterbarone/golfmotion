'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Inter } from 'next/font/google'
import { ToastProvider } from './ui/Toast'
import { PaletteMode } from '@mui/material'

const inter = Inter({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Primary colors from the image (deep blue gradient)
const primaryBlue = '#0a2472';
const lightBlue = '#2671e9';
const accentBlue = '#009cff';

// Create a theme instance
const createAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: primaryBlue,
      light: lightBlue,
    },
    secondary: {
      main: accentBlue,
    },
    background: {
      default: mode === 'dark' ? '#0a1929' : '#f0f7ff',
      paper: mode === 'dark' ? '#162231' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#0a2472',
      secondary: mode === 'dark' ? '#a0b4c8' : '#4a6288',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'dark' 
            ? '0 8px 24px rgba(0,0,0,0.4)' 
            : '0 8px 24px rgba(25,118,210,0.1)',
          borderRadius: 16,
          border: mode === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(25,118,210,0.08)',
        },
        elevation1: {
          backdropFilter: 'blur(12px)',
          backgroundColor: mode === 'dark' 
            ? 'rgba(22,34,49,0.8)' 
            : 'rgba(255,255,255,0.9)',
        },
        elevation3: {
          backdropFilter: 'blur(12px)',
          backgroundColor: mode === 'dark' 
            ? 'rgba(22,34,49,0.8)' 
            : 'rgba(255,255,255,0.9)',
        }
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          textTransform: 'none',
          padding: '10px 20px',
        },
        contained: {
          boxShadow: '0 4px 16px rgba(25,118,210,0.3)',
          background: `linear-gradient(135deg, ${lightBlue}, ${primaryBlue})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${accentBlue}, ${lightBlue})`,
            boxShadow: '0 6px 20px rgba(25,118,210,0.4)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(90deg, ${primaryBlue}, ${lightBlue})`,
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          height: 8,
          '& .MuiSlider-track': {
            background: `linear-gradient(90deg, ${accentBlue}, ${lightBlue})`,
            border: 'none',
          },
          '& .MuiSlider-thumb': {
            boxShadow: `0 0 0 2px ${primaryBlue}`,
            '&:hover, &.Mui-active': {
              boxShadow: `0 0 0 3px ${lightBlue}`,
            },
          },
        },
      },
    },
  },
});

const theme = createAppTheme('light');

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  )
}
