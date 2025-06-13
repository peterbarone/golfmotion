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

// Primary colors from the image (green palette)
const primaryGreen = '#3D8361';
const lightGreen = '#4FA076';
const accentGreen = '#2D6A4F';

// Create a theme instance
const createAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: primaryGreen,
      light: lightGreen,
    },
    secondary: {
      main: accentGreen,
    },
    background: {
      default: mode === 'dark' ? '#1C1C1C' : '#FFFFFF',
      paper: mode === 'dark' ? '#282828' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#FFFFFF' : '#333333',
      secondary: mode === 'dark' ? '#CCCCCC' : '#666666',
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
    borderRadius: 24,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'dark' 
            ? '0 8px 24px rgba(0,0,0,0.3)' 
            : '0 8px 24px rgba(61,131,97,0.1)',
          borderRadius: 24,
          border: mode === 'dark' 
            ? '1px solid rgba(255,255,255,0.08)' 
            : '1px solid rgba(61,131,97,0.08)',
        },
        elevation1: {
          backdropFilter: 'blur(8px)',
          backgroundColor: mode === 'dark' 
            ? 'rgba(40,40,40,0.8)' 
            : 'rgba(255,255,255,0.95)',
        },
        elevation3: {
          backdropFilter: 'blur(8px)',
          backgroundColor: mode === 'dark' 
            ? 'rgba(40,40,40,0.8)' 
            : 'rgba(255,255,255,0.95)',
        }
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          fontWeight: 600,
          textTransform: 'none',
          padding: '12px 24px',
        },
        contained: {
          boxShadow: '0 4px 16px rgba(61,131,97,0.2)',
          background: primaryGreen,
          '&:hover': {
            background: lightGreen,
            boxShadow: '0 6px 20px rgba(61,131,97,0.3)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: primaryGreen,
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
            background: `linear-gradient(90deg, ${accentGreen}, ${primaryGreen})`,
            border: 'none',
          },
          '& .MuiSlider-thumb': {
            boxShadow: `0 0 0 2px ${primaryGreen}`,
            '&:hover, &.Mui-active': {
              boxShadow: `0 0 0 3px ${lightGreen}`,
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
