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
           background: 'black', /* Dark background for full-screen camera view */
           display: 'flex',
           overflow: 'hidden',
           position: 'relative'
         }}
       >
      {/* Full screen camera view */}
      <Box sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <CameraDetector />
      </Box>
      
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
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } 
          }}
        >
          <HelpOutlineIcon />
        </IconButton>
      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={10000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert
          severity="info"
          sx={{ 
            width: '100%', 
            maxWidth: 500,
            boxShadow: 3
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            How to Use Practice Video
          </Typography>
          <Stack spacing={1}>
            {helpInfo.map((tip, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" component="div" sx={{ pl: 0.5 }}>
                  • {tip}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Alert>
      </Snackbar>

      {/* Tempo section - black overlay with 45% opacity on the right */}
      <Box sx={{ 
        position: 'absolute',
        top: 0,
        right: 0,
        width: { xs: '40%', md: '30%' },
        maxWidth: '360px',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.2)',
        padding: 2,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 5
      }}>
        <Typography variant="h6" sx={{ 
          color: 'white',
          fontWeight: 600,
          mb: 2,
          textAlign: 'center'
        }}>
          Real-time Analysis
        </Typography>
        
        <Box sx={{ flexGrow: 1, overflow: 'auto', color: 'white' }}>
          <SwingDisplay />
        </Box>
        
        <IconButton 
          onClick={resetSwing} 
          size="small" 
          sx={{ 
            alignSelf: 'flex-end', 
            mt: 1, 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Start/Stop button at bottom center */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
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
            fontWeight: 'bold',
            minWidth: '200px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          {isRecording ? "Stop" : "Start"}
        </Button>
      </Box>
    </Box>
  );
}
