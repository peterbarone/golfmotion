'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Metronome from '@/components/Metronome';
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
  BottomNavigationAction
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';

export default function PracticeAudioPage() {
  const theme = useTheme();
  const router = useRouter();
  const [toastOpen, setToastOpen] = useState(false);
  
  // Help information to be displayed in the toast
  const helpInfo = [
    "Set your desired tempo with the dial or slider",
    "Click play to start the metronome",
    "First click: Start your backswing",
    "Second click: Begin your downswing",
    "Pros maintain a 3:1 tempo ratio",
    "Practice regularly for consistent improvement"
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

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1a1a1a',
      display: 'flex',
      flexDirection: 'column'
    }}>
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
            Metronome Instructions
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

      {/* Full screen metronome */}
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <Metronome />
      </Box>

      {/* Bottom navigation */}
      <BottomNavigation
        showLabels
        sx={{ 
          width: '100%',
          boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <BottomNavigationAction 
          label="Home" 
          icon={<HomeIcon />} 
          onClick={() => router.push('/')} 
        />
        <BottomNavigationAction 
          label="Settings" 
          icon={<SettingsIcon />} 
          onClick={() => router.push('/settings')} 
        />
      </BottomNavigation>
    </Box>
  );
}
