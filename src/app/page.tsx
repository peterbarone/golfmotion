'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CameraDetector from '@/components/CameraDetector';
import SwingDisplay from '@/components/SwingDisplay';
import { Settings } from '@/components/Settings';
import { useSwingStore } from '@/store/swingStore';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Button, 
  AppBar, 
  Toolbar, 
  useTheme,
  IconButton
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
      background: theme.palette.mode === 'light' 
        ? 'linear-gradient(to bottom, #e8f5fe, #d0e8fd)' 
        : 'linear-gradient(to bottom, #1a2027, #121212)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h3" component="h1" align="center" gutterBottom
            sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            TempoPro Golf
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Record your swing to analyze your tempo
          </Typography>
        </Paper>

        {/* Settings Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<SettingsIcon />}
            onClick={() => setShowSettings(!showSettings)}
            sx={{ borderRadius: 28, px: 3 }}
          >
            {showSettings ? 'Hide Settings' : 'Settings'}
          </Button>
        </Box>

        {/* Settings Panel */}
        {showSettings && (
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
            <Settings />
          </Paper>
        )}

        <Grid container spacing={4}>
          {/* Camera View */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <AppBar position="static" color="primary" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <Toolbar variant="dense">
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Record Your Swing
                  </Typography>
                  <IconButton color="inherit" onClick={resetSwing} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Toolbar>
              </AppBar>
              <Box sx={{ p: 2 }}>
                <CameraDetector />
              </Box>
            </Paper>
          </Grid>

          {/* Swing Analysis */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <AppBar position="static" color="primary" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <Toolbar variant="dense">
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Real-time Analysis
                  </Typography>
                </Toolbar>
              </AppBar>
              <Box sx={{ p: 2 }}>
                <SwingDisplay showSettings={false} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
