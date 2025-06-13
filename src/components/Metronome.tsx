'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Stack, Slider, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function MetronomeUI() {
  const MIN_TEMPO = 40;
  const MAX_TEMPO = 208;
  const LOOKAHEAD = 25.0; // How frequently to call scheduling function (in milliseconds)
  const SCHEDULE_AHEAD_TIME = 0.1; // How far ahead to schedule audio (seconds)
  const [tempo, setTempo] = useState(120);
  const [meter, setMeter] = useState('4/4');
  const [dragging, setDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startTempo, setStartTempo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  
  // For debugging
  const [debugMessage, setDebugMessage] = useState('');
  const [accentBeat, setAccentBeat] = useState(1); // First beat is accented
  
  // Initialize refs
  const dialRef = useRef<HTMLDivElement>(null);
  const beatCountRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);

  const angleForTempo = (value: number) => ((value - MIN_TEMPO) / (MAX_TEMPO - MIN_TEMPO)) * 360;

  const handleMeterChange = (e: SelectChangeEvent) => setMeter(e.target.value);
  const handleSliderChange = (event: Event, value: number | number[], activeThumb: number) => {
    const newTempo = Array.isArray(value) ? value[0] : value;
    setTempo(newTempo);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!dialRef.current) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    setStartAngle(angle);
    setStartTempo(tempo);
    setDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !dialRef.current) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    let delta = angle - startAngle;
    // normalize
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const newTempo = Math.round(
      Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, startTempo + (delta / 360) * (MAX_TEMPO - MIN_TEMPO)))
    );
    setTempo(newTempo);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, startAngle, startTempo]);
  
  // Stop metronome when component unmounts
  // Cleanup all audio resources on unmount
  useEffect(() => {
    return () => {
      if (timerIDRef.current) {
        window.clearTimeout(timerIDRef.current);
        timerIDRef.current = null;
      }


      setIsPlaying(false);
    };
  }, []);
  
  // Use a simple approach with immediate sound playing on each beat
  // Persistent AudioContext to avoid browser autoplay policy issues
  const audioContextRef = useRef<AudioContext | null>(null);

  const playClick = useCallback((isAccent: boolean) => {
    try {
      // Create or resume AudioContext
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const context = audioContextRef.current;
      if (context.state === 'suspended') {
        context.resume();
      }

      // Create oscillator
      const osc = context.createOscillator();
      const gain = context.createGain();

      // Configure sound based on accent
      osc.type = isAccent ? 'triangle' : 'sine';
      osc.frequency.value = isAccent ? 880 : 440; // Higher pitch for accent

      // Set volume and envelope
      gain.gain.value = isAccent ? 0.7 : 0.5;
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);

      // Connect and play immediately
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.1);

      // Disconnect and clean up after sound is done
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };

      return true;
    } catch (e) {
      console.error('Error playing click:', e);
      return false;
    }
  }, []);

  // Improved AudioContext management - ensure it's resumed on every relevant interaction
  useEffect(() => {
    const resumeAudioContext = () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'running') {
        audioContextRef.current.resume().then(() => {
          console.log('AudioContext resumed successfully');
        }).catch(err => {
          console.error('Failed to resume AudioContext:', err);
        });
      }
    };
    
    // Add listeners to common user interaction events
    document.addEventListener('click', resumeAudioContext);
    document.addEventListener('touchstart', resumeAudioContext);
    document.addEventListener('keydown', resumeAudioContext);
    
    return () => {
      document.removeEventListener('click', resumeAudioContext);
      document.removeEventListener('touchstart', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
    };
  }, []);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Use a simple interval-based approach for more reliable timing across browsers
  // Improved metronome loop with explicit timer reference management
  const runMetronome = useCallback(() => {
    // Make sure AudioContext is running (may be suspended by browser)
    if (audioContextRef.current && audioContextRef.current.state !== 'running') {
      audioContextRef.current.resume();
    }
    
    const beatsInMeasure = parseInt(meter.split('/')[0]);
    const beatPosition = beatCountRef.current % beatsInMeasure;
    const isFirstBeatInMeasure = beatPosition === 0;
    
    // Play the click sound
    playClick(isFirstBeatInMeasure);
    
    // Update UI
    setCurrentBeat(beatPosition + 1);
    setDebugMessage(`Beat: ${beatPosition + 1}/${beatsInMeasure}, Tempo: ${tempo}`);
    
    // Increment beat counter
    beatCountRef.current++;
    
    // Schedule next beat
    const msPerBeat = 60000 / tempo;
    timerIDRef.current = window.setTimeout(runMetronome, msPerBeat);
  }, [meter, playClick, tempo]);
  
  // Start the metronome with improved safety checks
  const startMetronome = useCallback(() => {
    // Don't start if already playing
    if (isPlaying) return;
    
    // Clean any lingering timers to be safe
    if (timerIDRef.current !== null) {
      window.clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
    
    // Make sure AudioContext is running
    if (audioContextRef.current && audioContextRef.current.state !== 'running') {
      audioContextRef.current.resume();
    }
    
    // Reset beat counter and update UI state
    beatCountRef.current = 0;
    setIsPlaying(true);
    setCurrentBeat(1);
    setDebugMessage('');
    
    // Start the metronome loop immediately
    runMetronome();
    
    console.log('Metronome started, tempo:', tempo);
  }, [isPlaying, runMetronome, tempo]);

  // Stop the metronome with improved safety
  const stopMetronome = useCallback(() => {
    // Always clear timer for safety, even if already stopped
    if (timerIDRef.current !== null) {
      window.clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
    
    // Only update state if actually playing
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentBeat(0);
      setDebugMessage('');
      console.log('Metronome stopped');
    }
  }, [isPlaying]);

  const toggleMetronome = useCallback(() => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }, [isPlaying, startMetronome, stopMetronome]);
  
  // Improved effect for tempo/meter changes - reset timer without full stop/start cycle
  useEffect(() => {
    if (isPlaying) {
      // Clear current timer
      if (timerIDRef.current !== null) {
        window.clearTimeout(timerIDRef.current);
        timerIDRef.current = null;
      }
      
      // Start immediately without changing isPlaying state (avoids UI flicker)
      // Only proceed if still playing
      if (isPlaying) {
        runMetronome();
      }
    }
  }, [tempo, meter, isPlaying, runMetronome]);

  const handleTap = () => {
    // Tap tempo logic could be added here
    console.log('Tap tempo clicked');
  };

  const decreaseTempo = () => setTempo((t) => Math.max(MIN_TEMPO, t - 1));
  const increaseTempo = () => setTempo((t) => Math.min(MAX_TEMPO, t + 1));

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: '#387651', /* Green background */
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}
    >
      {/* Beat Indicator */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%' 
      }}>
        {meter && Array.from({ length: parseInt(meter.split('/')[0]) }).map((_, i) => (
          <Box 
            key={i} 
            sx={{ 
              width: 14, 
              height: 14, 
              borderRadius: '50%', 
              mx: 0.5,
              bgcolor: currentBeat === i + 1 ? '#4a6fa5' : 'rgba(74, 111, 165, 0.3)',
              boxShadow: currentBeat === i + 1 ? '0 0 10px rgba(74, 111, 165, 0.5)' : 'none',
              transition: 'all 0.1s ease-in-out'
            }} 
          />
        ))}
      </Box>
      
      {/* Display Panel */}
      <Box sx={{ 
        bgcolor: 'transparent', 
        borderRadius: 3, 
        p: 2.5, 
        mb: 4, 
        width: '80%', 
        maxWidth: 600
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack>
            <Typography variant="body2" sx={{ color: '#4a6fa5', fontWeight: 500 }}>TEMPO</Typography>
            <Typography variant="h3" sx={{ 
              color: '#333333', 
              fontWeight: 700
            }}>
              {tempo}
            </Typography>
          </Stack>
          <FormControl variant="outlined" sx={{ minWidth: 100 }}>
            <InputLabel sx={{ color: '#4a6fa5' }}>Meter</InputLabel>
            <Select
              value={meter}
              onChange={handleMeterChange}
              label="Meter"
              sx={{ 
                color: '#333333',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.4)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a6fa5' },
                '.MuiSelect-icon': { color: '#4a6fa5' } 
              }}
            >
              <MenuItem value="2/4">2/4</MenuItem>
              <MenuItem value="3/4">3/4</MenuItem>
              <MenuItem value="4/4">4/4</MenuItem>
              <MenuItem value="6/8">6/8</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Box sx={{ mt: 2, height: 8, bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ 
            width: `${(tempo - MIN_TEMPO) / (MAX_TEMPO - MIN_TEMPO) * 100}%`, 
            height: '100%', 
            background: 'linear-gradient(to right, #4a6fa5, #6a8cbe)',
            boxShadow: '0 0 8px rgba(74, 111, 165, 0.4)'
          }} />
        </Box>
      </Box>

      {/* Dial Control */}
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={3} sx={{ mb: 4 }}>
        <IconButton 
          onClick={decreaseTempo} 
          sx={{ 
            color: '#333333', 
            fontSize: 32, 
            bgcolor: 'rgba(0,0,0,0.05)', 
            '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
            width: 56,
            height: 56
          }}
        >
          <RemoveIcon fontSize="inherit" />
        </IconButton>
        <Box
          ref={dialRef}
          onMouseDown={handleMouseDown}
          sx={{ 
            position: 'relative', 
            width: 220, 
            height: 220, 
            background: 'radial-gradient(circle at center, #ffffff, #e9e7e2)',
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'grab',
            boxShadow: '0 6px 15px rgba(0,0,0,0.15), inset 0 1px 3px rgba(255,255,255,0.6)',
            border: '1px solid rgba(0,0,0,0.05)' 
          }}
        >
          <IconButton 
            onClick={toggleMetronome}
            sx={{ 
              color: isPlaying ? '#e74c3c' : '#4a6fa5',
              bgcolor: isPlaying ? 'rgba(231, 76, 60, 0.1)' : 'rgba(74, 111, 165, 0.1)',
              fontSize: 60,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: isPlaying ? 'rgba(231, 76, 60, 0.2)' : 'rgba(74, 111, 165, 0.2)',
              }
            }}
          >
            {isPlaying ? 
              <StopIcon fontSize="inherit" /> : 
              <PlayArrowIcon fontSize="inherit" />}
          </IconButton>
          {/* Beat indicator hand */}
          {isPlaying && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              height: 95,
              width: 2,
              bgcolor: '#e74c3c',
              transformOrigin: 'bottom center',
              transform: `translate(-50%, -100%) rotate(${currentBeat * (360/parseInt(meter.split('/')[0]))}deg)`,
              transition: 'transform 0.1s ease-out',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-3px',
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#e74c3c',
                boxShadow: '0 0 6px rgba(231, 76, 60, 0.7)'
              }
            }} />
          )}
          
          {/* Tick marks */}
          {[...Array(60)].map((_, i) => {
            const angle = (i / 60) * 360;
            return (
              <Box
                key={i}
                sx={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: i % 5 === 0 ? 4 : 2,
                  height: i % 5 === 0 ? 14 : 7,
                  bgcolor: i % 5 === 0 ? '#4a6fa5' : 'rgba(74, 111, 165, 0.3)',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -100px)`,
                  transformOrigin: 'center',
                  boxShadow: i % 5 === 0 ? '0 0 3px rgba(74, 111, 165, 0.4)' : 'none'
                }}
              />
            );
          })}
        </Box>
        <IconButton 
          onClick={increaseTempo} 
          sx={{ 
            color: '#333333', 
            fontSize: 32, 
            bgcolor: 'rgba(0,0,0,0.05)', 
            '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
            width: 56,
            height: 56
          }}
        >
          <AddIcon fontSize="inherit" />
        </IconButton>
      </Stack>

      {/* Tempo Slider */}
      <Box sx={{ width: '80%', maxWidth: 600, mb: 4 }}>
        <Slider
          value={tempo}
          onChange={handleSliderChange}
          min={MIN_TEMPO}
          max={MAX_TEMPO}
          step={1}
          marks={[{ value: MIN_TEMPO, label: `${MIN_TEMPO}` }, { value: 120, label: '120' }, { value: MAX_TEMPO, label: `${MAX_TEMPO}` }]}
          sx={{ 
            color: '#8c9eff', 
            '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.2)' },
            '& .MuiSlider-track': { background: 'linear-gradient(to right, #8c9eff, #4fc3f7)' },
            '& .MuiSlider-thumb': { 
              bgcolor: '#ffffff',
              boxShadow: '0 0 8px rgba(140,158,255,0.8)' 
            },
            '& .MuiSlider-mark': { bgcolor: 'rgba(255,255,255,0.5)' },
            '& .MuiSlider-markLabel': { color: 'rgba(255,255,255,0.7)' }
          }}
        />
      </Box>

      {/* Tap Button */}
      <Button 
        variant="contained" 
        onClick={handleTap} 
        sx={{ 
          background: 'linear-gradient(45deg, #8c9eff 30%, #4fc3f7 90%)',
          boxShadow: '0 3px 10px rgba(140,158,255,0.4)',
          color: '#FFFFFF', 
          fontWeight: 'bold', 
          px: 6, 
          py: 1.5, 
          fontSize: '1rem',
          borderRadius: '30px',
          '&:hover': {
            background: 'linear-gradient(45deg, #7986cb 30%, #29b6f6 90%)',
          }
        }}>
        TAP
      </Button>
      
      {/* Debug information (only visible during development) */}
      {process.env.NODE_ENV === 'development' && (
        <Typography variant="caption" sx={{ mt: 2, color: 'rgba(255,255,255,0.5)' }}>
          {debugMessage}
        </Typography>
      )}
    </Box>
  );
}
