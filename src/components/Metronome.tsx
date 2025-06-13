'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  Button, 
  Paper,
  useTheme,
  TextField,
  IconButton,
  Stack
} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { styled } from '@mui/material/styles';

interface MetronomeProps {
  minBpm?: number;
  maxBpm?: number;
  defaultBpm?: number;
}

const MetronomeArm = styled('div')<{ bpm: number; isPlaying: boolean }>`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 100px;
  background-color: #333;
  border-radius: 3px;
  transform-origin: bottom center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  &::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #009cff, #2671e9);
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0, 156, 255, 0.7), 0 0 20px rgba(0, 156, 255, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.8);
  }
`;

export default function Metronome({ 
  minBpm = 40, 
  maxBpm = 208, 
  defaultBpm = 80 
}: MetronomeProps) {
  const theme = useTheme();
  const [bpm, setBpm] = useState<number>(defaultBpm);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const pendulumRef = useRef<HTMLDivElement>(null);

  // Initialize audio context
  useEffect(() => {
    // Create audio context on client side only
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Function to create and play metronome tick sound
  const playTick = (accentBeat: boolean = false) => {
    if (!audioContextRef.current) return;
    
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Set sound characteristics based on accent
    oscillator.type = 'sine';
    oscillator.frequency.value = accentBeat ? 1000 : 800; // Higher pitch for accent beat
    
    gainNode.gain.value = 0.5;
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);
  };

  // Toggle metronome on/off
  const toggleMetronome = () => {
    if (isPlaying) {
      // Stop metronome
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      // Start metronome
      setIsPlaying(true);
      setCurrentBeat(0);
      
      // Calculate interval in milliseconds from BPM
      const interval = 60000 / bpm;
      
      // First beat immediately
      playTick(true);
      
      // Set up interval for subsequent beats
      let beat = 1;
      timerRef.current = window.setInterval(() => {
        // Accent first beat of each measure (assuming 4/4 time)
        const isAccent = beat % 4 === 0;
        playTick(isAccent);
        setCurrentBeat(beat % 4);
        beat = (beat + 1) % 4 === 0 ? 4 : (beat + 1) % 4;
      }, interval);
    }
  };

  // Update metronome speed when BPM changes
  useEffect(() => {
    if (isPlaying) {
      // Restart metronome with new BPM
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      const interval = 60000 / bpm;
      let beat = currentBeat;
      
      timerRef.current = window.setInterval(() => {
        const isAccent = beat % 4 === 0;
        playTick(isAccent);
        setCurrentBeat(beat % 4);
        beat = (beat + 1) % 4 === 0 ? 4 : (beat + 1) % 4;
      }, interval);
    }
  }, [bpm]);

  // Handle pendulum animation
  useEffect(() => {
    if (pendulumRef.current && isPlaying) {
      // Calculate swing time based on BPM
      const swingTime = 60 / bpm;
      pendulumRef.current.style.animationDuration = `${swingTime}s`;
      pendulumRef.current.classList.add('swinging');
    } else if (pendulumRef.current) {
      pendulumRef.current.classList.remove('swinging');
    }
  }, [isPlaying, bpm]);

  // Handle manual BPM input
  const handleBpmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minBpm && value <= maxBpm) {
      setBpm(value);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 2 
      }}>
        <MusicNoteIcon sx={{ 
          fontSize: 28, 
          color: theme.palette.secondary.main,
          filter: 'drop-shadow(0 0 8px rgba(0, 156, 255, 0.5))'
        }} />
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #ffffff, #a0d7ff)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Metronome
        </Typography>
      </Box>
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'text.secondary', 
          mb: 3,
          opacity: 0.9,
        }}
      >
        Adjust the BPM to match your desired swing tempo
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <MetronomeArm bpm={bpm} isPlaying={isPlaying} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[0, 1, 2, 3].map((beat) => (
            <Box 
              key={beat} 
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: currentBeat === beat && isPlaying
                  ? theme.palette.primary.main
                  : theme.palette.grey[400],
                transform: currentBeat === beat && isPlaying ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.1s ease-in-out'
              }}
            />
          ))}
        </Box>
      </Box>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <IconButton 
          aria-label={isPlaying ? "Stop" : "Play"}
          onClick={toggleMetronome}
          size="large"
          sx={{
            background: isPlaying 
              ? 'linear-gradient(135deg, #ff4949, #ff6b6b)' 
              : 'linear-gradient(135deg, #2671e9, #0a2472)',
            color: '#fff',
            width: 60,
            height: 60,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              background: isPlaying 
                ? 'linear-gradient(135deg, #ff6b6b, #ff4949)' 
                : 'linear-gradient(135deg, #0a2472, #2671e9)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isPlaying ? <StopIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
        </IconButton>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 1.5,
            alignItems: 'center' 
          }}>
            <Typography 
              id="tempo-slider" 
              variant="h6"
              sx={{ 
                fontWeight: 600, 
                color: '#fff',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }}
            >
              BPM: {bpm}
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: theme.palette.secondary.main,
                fontWeight: 600,
                backgroundColor: 'rgba(0, 156, 255, 0.1)',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(0, 156, 255, 0.2)',
              }}
            >
              {bpm < 60 ? 'Largo' : 
               bpm < 76 ? 'Adagio' : 
               bpm < 108 ? 'Andante' : 
               bpm < 120 ? 'Moderato' : 
               bpm < 168 ? 'Allegro' : 'Presto'}
            </Typography>
          </Box>
          <Slider
            value={bpm}
            onChange={(_, newValue) => setBpm(newValue as number)}
            min={minBpm}
            max={maxBpm}
            aria-labelledby="tempo-slider"
            sx={{
              height: 8,
              padding: '10px 0',
              '& .MuiSlider-thumb': {
                width: 22,
                height: 22,
                backgroundColor: '#fff',
                boxShadow: '0 0 0 2px currentColor',
                '&:hover, &.Mui-active': {
                  boxShadow: '0 0 0 3px rgba(255,255,255,0.16)',
                },
              },
            }}
          />
        </Box>
        <TextField
          label="BPM"
          type="number"
          value={bpm}
          onChange={handleBpmInputChange}
          InputProps={{
            inputProps: {
              min: minBpm,
              max: maxBpm,
            },
          }}
          size="small"
          sx={{ 
            width: '120px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2.5,
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.secondary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiInputBase-input': {
              color: '#fff',
              textAlign: 'center',
            }
          }}
        />
      </Stack>
    </Box>
  );
}
