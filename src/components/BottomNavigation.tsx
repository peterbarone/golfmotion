'use client';

import React from 'react';
import { Box, BottomNavigation as MUIBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home as HomeIcon, Mic as MicIcon, Videocam as VideocamIcon, Settings as SettingsIcon, Timer as TimerIcon } from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine which navigation item should be active
  const getCurrentValue = () => {
    if (pathname === '/') return 0;
    if (pathname.startsWith('/practice-audio')) return 1;
    if (pathname.startsWith('/practice-video')) return 2;
    if (pathname.startsWith('/find-my-tempo')) return 3;
    if (pathname.startsWith('/settings')) return 4;
    return 0;
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        router.push('/');
        break;
      case 1:
        router.push('/practice-audio');
        break;
      case 2: 
        router.push('/practice-video');
        break;
      case 3:
        router.push('/find-my-tempo');
        break;
      case 4:
        router.push('/settings');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <Box sx={{ width: '100%', backgroundColor: '#387651', position: 'fixed', bottom: 0, zIndex: 1000 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          backgroundColor: '#387651', // Translucent white background
          backdropFilter: 'blur(5px)', // Adds blur effect for better contrast
        }}
      >
        <MUIBottomNavigation
          value={getCurrentValue()}
          onChange={handleChange}
          showLabels
          sx={{
            backgroundColor: '#387651',
            '& .MuiBottomNavigationAction-root': {
              color: '#ffffff',
              textShadow: '0 0 5px rgba(255, 255, 255, 0.4)',
              '& .MuiSvgIcon-root': {
                filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.6))',
                transition: 'all 0.2s ease-in-out',
              },
              '&:hover': {
                '& .MuiSvgIcon-root': {
                  filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))',
                  transform: 'scale(1.05)',
                },
              },
              '&.Mui-selected': {
                color: '#ffffff',
                textShadow: '0 0 8px rgba(255, 255, 255, 0.7)',
                '& .MuiSvgIcon-root': {
                  filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.9))',
                },
              },
            },
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Audio" icon={<MicIcon />} />
          <BottomNavigationAction label="Video" icon={<VideocamIcon />} />
          <BottomNavigationAction label="Tempo" icon={<TimerIcon />} />
          <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
        </MUIBottomNavigation>
      </Paper>
    </Box>
  );
}
