'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CameraDetector from '@/components/CameraDetector';
import SwingDisplay from '@/components/SwingDisplay';
import Metronome from '@/components/Metronome';
import { Settings } from '@/components/Settings';
import { useSwingStore } from '@/store/swingStore';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  AppBar, 
  Toolbar, 
  useTheme,
  IconButton,
  Stack
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const { tempoRatio, resetSwing } = useSwingStore();

  useEffect(() => {
    // Only navigate if we have a valid tempo ratio
    if (tempoRatio && tempoRatio > 0) {
      const timer = setTimeout(() => {
        router.push(`/results?ratio=${tempoRatio.toFixed(1)}`);
      }, 1500); // 1.5 second delay to see the detection
      
      return () => clearTimeout(timer);
    }
  }, [tempoRatio, router]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a2472, #2671e9)',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      py: 6,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(0, 156, 255, 0.2) 0%, transparent 40%), radial-gradient(circle at 70% 30%, rgba(38, 113, 233, 0.2) 0%, transparent 40%)',
        pointerEvents: 'none',
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          mb: 5, 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at top right, rgba(0, 156, 255, 0.1), transparent 70%)',
            zIndex: 0,
          },
        }}>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h3" component="h1" gutterBottom
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #ffffff, #a0d7ff)', 
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              TempoPro Golf
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3, maxWidth: '500px', mx: 'auto' }}>
              Your future swing can be bright! Record and analyze your tempo to improve performance
            </Typography>
          </Box>
        </Paper>

        {/* Settings Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button 
            variant="contained" 
            startIcon={<SettingsIcon />}
            onClick={() => setShowSettings(!showSettings)}
            sx={{ 
              px: 4,
              py: 1.5,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                borderRadius: 'inherit',
                zIndex: -1,
              }
            }}
          >
            {showSettings ? 'Hide Settings' : 'Settings'}
          </Button>
        </Box>

        {/* Settings Panel */}
        {showSettings && (
          <Paper elevation={3} sx={{ 
            p: 4, 
            mb: 5, 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(38, 113, 233, 0.2) 0%, transparent 70%)',
              zIndex: 0,
            },
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 600, 
                color: '#fff',
                mb: 3
              }}>
                Settings
              </Typography>
              <Settings />
            </Box>
          </Paper>
        )}

        {/* Metronome Component */}
        <Paper elevation={3} sx={{ 
          p: 4, 
          mb: 5, 
          background: 'rgba(255, 255, 255, 0.05)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 156, 255, 0.15) 0%, transparent 70%)',
            zIndex: 0,
          },
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Metronome />
          </Box>
        </Paper>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ width: '100%' }}>
          {/* Camera View */}
          <Box sx={{ width: '100%', flex: 1 }}>
            <Paper elevation={3} sx={{ 
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.05)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            }}>
              <AppBar position="static" sx={{ 
                background: 'linear-gradient(90deg, #0a2472, #2671e9)',
                borderTopLeftRadius: theme.shape.borderRadius, 
                borderTopRightRadius: theme.shape.borderRadius
              }}>
                <Toolbar variant="dense">
                  <Typography variant="subtitle1" sx={{ 
                    flexGrow: 1, 
                    fontWeight: 600,
                    color: '#ffffff' 
                  }}>
                    Record Your Swing
                  </Typography>
                  <IconButton color="inherit" onClick={resetSwing} size="small" sx={{ color: '#fff' }}>
                    <RefreshIcon />
                  </IconButton>
                </Toolbar>
              </AppBar>
              <Box sx={{ p: 2 }}>
                <CameraDetector />
              </Box>
            </Paper>
          </Box>

          {/* Swing Analysis */}
          <Box sx={{ width: '100%', flex: 1 }}>
            <Paper elevation={3} sx={{ 
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.05)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            }}>
              <AppBar position="static" sx={{ 
                background: 'linear-gradient(90deg, #0a2472, #2671e9)',
                borderTopLeftRadius: theme.shape.borderRadius, 
                borderTopRightRadius: theme.shape.borderRadius
              }}>
                <Toolbar variant="dense">
                  <Typography variant="subtitle1" sx={{ 
                    flexGrow: 1, 
                    fontWeight: 600,
                    color: '#ffffff' 
                  }}>
                    Real-time Analysis
                  </Typography>
                </Toolbar>
              </AppBar>
              <Box sx={{ p: 2 }}>
                <SwingDisplay />
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
