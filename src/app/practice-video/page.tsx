'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Metronome removed as per requirement
import CameraDetector from '@/components/CameraDetector';
import SwingDisplay from '@/components/SwingDisplay';
import { useSwingStore } from '@/store/swingStore';
import { 
  Box, 
  IconButton,
  useTheme,
  Snackbar,
  Alert,
  Fade,
  Paper,
  Typography,
  Stack,
  BottomNavigation,
  BottomNavigationAction,
  Divider,
  AppBar,
  Toolbar,
  Tab,
  Tabs
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Button from '@mui/material/Button';

export default function PracticeVideoPage() {
  const theme = useTheme();
  const router = useRouter();
  const { resetSwing } = useSwingStore();
  const [toastOpen, setToastOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Help information to be displayed in the toast
  const helpInfo = [
    "Record your swing with the camera view",
    "Press the Start button to begin recording",
    "Make your swing while maintaining good form",
    "View your swing analysis in real-time",
    "Reset anytime to record a new swing"
  ];
  
  const handleHelpClick = () => {
    setToastOpen(true);
  };
  
  const handleCloseToast = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  };
  
  const handleStartRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    // Additional camera control logic can be added here
  }, []);

  return (
       <Box
         sx={{
           width: '100vw',
           height: '100vh',
           background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', /* Rich gradient background */
           display: 'flex',
           flexDirection: 'column',
           alignItems: 'center',
           justifyContent: 'center',
           p: 3,
           fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", sans-serif',
           overflow: 'hidden',
           position: 'relative',
           '&::after': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
             pointerEvents: 'none',
             zIndex: 1
           }
         }}
       >
      {/* Help button - top right */}
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        zIndex: 10 
      }}>
        <IconButton 
          onClick={handleHelpClick}
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
          }}
          aria-label="Help"
        >
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      
      {/* Toast/Snackbar for help information */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={10000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity="info" 
          variant="filled"
          sx={{ 
            width: '100%',
            maxWidth: '500px',
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Audio & Video Practice Guide
          </Typography>
          <Stack spacing={0.5}>
            {helpInfo.map((tip, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Typography variant="body2" component="div" sx={{ pl: 0.5 }}>
                  • {tip}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Alert>
      </Snackbar>

      {/* Main content area */}
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 2
      }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          height: '100%',
          gap: 2
        }}>
          {/* Full screen camera view */}
          <Box sx={{ 
            width: '100%',
            flex: 2,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Paper elevation={2} sx={{ 
              overflow: 'hidden',
              bgcolor: 'background.paper',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <AppBar position="static" sx={{ 
                bgcolor: 'primary.main',
                borderTopLeftRadius: 2, 
                borderTopRightRadius: 2
              }}>
                <Toolbar variant="dense">
                  <Typography variant="subtitle1" sx={{ 
                    flexGrow: 1, 
                    fontWeight: 600,
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}>
                    Record Your Swing
                  </Typography>
                  <IconButton color="inherit" onClick={resetSwing} size="small" sx={{ color: '#fff' }}>
                    <RefreshIcon />
                  </IconButton>
                </Toolbar>
              </AppBar>
              <Box sx={{ 
                p: 1, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative'
              }}>
                <CameraDetector />
              </Box>
            </Paper>
          </Box>
          
          {/* Swing Analysis - takes up less space now */}
          <Box sx={{ 
            width: '100%',
            flex: 1,
            display: { xs: 'flex', sm: 'flex' },
            flexDirection: 'column'
          }}>
            <Paper elevation={2} sx={{ 
              overflow: 'hidden',
              bgcolor: 'background.paper',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <AppBar position="static" sx={{ 
                bgcolor: 'primary.main',
                borderTopLeftRadius: 2, 
                borderTopRightRadius: 2
              }}>
                <Toolbar variant="dense">
                  <Typography variant="subtitle1" sx={{ 
                    flexGrow: 1, 
                    fontWeight: 600,
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}>
                    Real-time Analysis
                  </Typography>
                </Toolbar>
              </AppBar>
              <Box sx={{ p: 1, flexGrow: 1, overflow: 'auto' }}>
                <SwingDisplay />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Start button above navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        py: 2,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Button
          variant="contained"
          color={isRecording ? "error" : "primary"}
          size="large"
          onClick={handleStartRecording}
          startIcon={isRecording ? <StopIcon /> : <PlayArrowIcon />}
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 28,
            fontWeight: 'bold'
          }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </Box>
    </Box>
  );
}
