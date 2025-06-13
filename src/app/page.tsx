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
      background: '#ffffff',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      py: 6,
      position: 'relative'
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          p: 4, 
          mb: 5, 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: '700px',
          mx: 'auto'
        }}>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                {/* Golf swing icon - using golfsil.png */}
                <Box 
                  component="img"
                  src="/golfsil.png"
                  alt="Golf Swing"
                  sx={{ width: '60px', height: '60px' }}
                />
              </Box>
              <Typography variant="h3" component="h1" gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: '#333333',
                  mb: 1
                }}
              >
                Golf Motion
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 5, maxWidth: '500px', mx: 'auto' }}>
                Master your swing tempo
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Action Buttons */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          {/* Practice with Audio Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => router.push('/practice-audio')}
              sx={{ 
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                minWidth: '280px',
                fontWeight: 'bold'
              }}
            >
              Practice with Audio
            </Button>
          </Box>
          
          {/* Practice with Audio & Video Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => router.push('/practice-video')}
              sx={{ 
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                minWidth: '280px',
                fontWeight: 'bold'
              }}
            >
              Practice with Video
            </Button>
          </Box>
        </Stack>
        
        {/* Settings Button - smaller, less prominent */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, mt: -1 }}>
          <Button 
            variant="text" 
            startIcon={<SettingsIcon />}
            onClick={() => router.push('/settings')}
            color="inherit"
            size="small"
            sx={{ opacity: 0.7 }}
          >
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
