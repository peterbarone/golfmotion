"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Container, Paper, Stack } from '@mui/material';
import ThemeWrapper from '@/components/ThemeWrapper';

export default function FindMyTempoPage() {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [calculatedTempo, setCalculatedTempo] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('Tap the button to find your natural swing tempo');
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset tap data if user stops tapping for more than 2 seconds
  const resetAfterInactivity = () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    tapTimeoutRef.current = setTimeout(() => {
      if (tapTimes.length > 0) {
        setMessage('Tap timing reset due to inactivity');
        setTapTimes([]);
      }
    }, 2000);
  };
  
  const handleTap = () => {
    const now = Date.now();
    setTapTimes(prevTimes => {
      const newTimes = [...prevTimes, now];
      
      // Only keep the last 8 taps for accuracy
      const recentTaps = newTimes.slice(-8);
      
      // Calculate tempo once we have at least 3 taps
      if (recentTaps.length >= 3) {
        const intervals: number[] = [];
        for (let i = 1; i < recentTaps.length; i++) {
          intervals.push(recentTaps[i] - recentTaps[i-1]);
        }
        
        // Calculate average interval in milliseconds
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        
        // Convert to BPM: 60000ms / avgInterval
        const tempo = Math.round(60000 / avgInterval);
        setCalculatedTempo(tempo);
        
        setMessage(`Your tempo is approximately ${tempo} BPM`);
      } else {
        const moreNeeded = 3 - recentTaps.length;
        setMessage(moreNeeded > 0 ? `Tap ${moreNeeded} more times...` : 'Keep tapping to refine your tempo');
      }
      
      resetAfterInactivity();
      return recentTaps;
    });
  };
  
  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <ThemeWrapper>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2, 
            background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E"), linear-gradient(180deg, #004d40 0%, #002b24 100%)',
            backgroundSize: '200px 200px, cover',
            color: '#fff'
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Find My Tempo
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Tap the button at a consistent rate to match your natural swing tempo
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 4 
          }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleTap} 
              sx={{ 
                background: 'linear-gradient(45deg, #8c9eff 30%, #4fc3f7 90%)',
                boxShadow: '0 3px 10px rgba(140,158,255,0.4)',
                color: '#FFFFFF', 
                fontWeight: 'bold', 
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                px: { xs: 6, sm: 8 }, 
                py: { xs: 2, sm: 3 }, 
                borderRadius: '30px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7986cb 30%, #29b6f6 90%)',
                },
                minWidth: 200
              }}
            >
              TAP
            </Button>
            
            {calculatedTempo && (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h5" align="center">
                    {calculatedTempo} BPM
                  </Typography>
                  
                  <Typography variant="body2" align="center">
                    {calculatedTempo < 70 ? 'Smooth, controlled tempo' : 
                     calculatedTempo < 100 ? 'Balanced, tour pro-like tempo' : 
                     'Fast, athletic tempo'}
                  </Typography>
                </Stack>
              </Paper>
            )}
            
            <Typography 
              variant="subtitle1" 
              align="center" 
              sx={{ fontStyle: 'italic', opacity: 0.9 }}
            >
              {message}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ThemeWrapper>
  );
}
