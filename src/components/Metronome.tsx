'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Stack, Slider, Chip, Divider, Tooltip, ButtonGroup } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';

// Define golf-specific tempo types and ratios
type TempoPreset = {
  name: string;
  tempo: number;
  ratio: string;
  description: string;
};

type SwingPhase = 'backswing' | 'downswing' | 'none';

export default function MetronomeUI() {
  const MIN_TEMPO = 40;
  const MAX_TEMPO = 208;
  const LOOKAHEAD = 25.0; // How frequently to call scheduling function (in milliseconds)
  const SCHEDULE_AHEAD_TIME = 0.1; // How far ahead to schedule audio (seconds)
  
  // Golf-specific tempo presets
  const TEMPO_PRESETS: TempoPreset[] = [
    { name: "Tour Pro", tempo: 92, ratio: "3:1", description: "Professional tempo with 3:1 backswing to downswing ratio" },
    { name: "Smooth Swing", tempo: 76, ratio: "2:1", description: "Balanced tempo with 2:1 ratio for smoother transition" },
    { name: "Power Swing", tempo: 108, ratio: "4:1", description: "Power-focused with longer backswing for more energy" },
    { name: "Beginner", tempo: 60, ratio: "1:1", description: "Even timing for beginners to develop consistency" }
  ];
  
  const [tempo, setTempo] = useState(92); // Default to Tour Pro tempo
  const [meter, setMeter] = useState('4/4');
  const [dragging, setDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startTempo, setStartTempo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [swingPhase, setSwingPhase] = useState<SwingPhase>('none');
  const [activePreset, setActivePreset] = useState<string>("Tour Pro");
  const [tempoRatio, setTempoRatio] = useState<string>("3:1");
  
  // For debugging
  const [debugMessage, setDebugMessage] = useState('');
  const [accentBeat, setAccentBeat] = useState(1); // First beat is accented
  
  // Initialize refs
  const dialRef = useRef<HTMLDivElement>(null);
  const beatCountRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);

  const angleForTempo = (value: number) => ((value - MIN_TEMPO) / (MAX_TEMPO - MIN_TEMPO)) * 360;

  const handleMeterChange = (e: React.ChangeEvent<HTMLInputElement>) => setMeter(e.target.value);
  
  const handlePresetChange = (preset: TempoPreset) => {
    setTempo(preset.tempo);
    setActivePreset(preset.name);
    setTempoRatio(preset.ratio);
  };
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

  // Enhanced playClick function for golf swing phases
  const playClick = useCallback((phase: 'backswing' | 'downswing' | 'accent' | 'normal') => {
    try {
      // Create or resume AudioContext
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const context = audioContextRef.current;
      
      // Create oscillator and gain nodes
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      // Configure sound based on swing phase
      switch (phase) {
        case 'backswing':
          // Lower tone for backswing
          osc.frequency.value = 600;
          gain.gain.value = 0.4;
          break;
        case 'downswing':
          // Higher tone for downswing (impact)
          osc.frequency.value = 1200;
          gain.gain.value = 0.6;
          break;
        case 'accent':
          // For count accents
          osc.frequency.value = 1000;
          gain.gain.value = 0.5;
          break;
        default:
          // Normal click
          osc.frequency.value = 800;
          gain.gain.value = 0.3;
      }
      
      // Connect and play the sound
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

  // Golf-specific metronome logic with backswing/downswing phases
  const runMetronome = useCallback(() => {
    // Make sure AudioContext is running (may be suspended by browser)
    if (audioContextRef.current && audioContextRef.current.state !== 'running') {
      audioContextRef.current.resume();
    }
    
    // Parse the tempo ratio (e.g., "3:1" => [3,1])
    const [backswingCount, downswingCount] = tempoRatio.split(':').map(Number);
    const totalCycleBeats = backswingCount + downswingCount;
    
    // Calculate which phase we're in
    const cyclePosition = beatCountRef.current % totalCycleBeats;
    const isBackswing = cyclePosition < backswingCount;
    const currentPhase = isBackswing ? 'backswing' : 'downswing';
    const isPhaseStart = cyclePosition === 0 || cyclePosition === backswingCount;
    
    // Play the appropriate sound based on swing phase
    playClick(isPhaseStart ? currentPhase : 'normal');
    
    // Update UI to show the current swing phase
    setSwingPhase(currentPhase);
    setCurrentBeat(cyclePosition + 1);
    setDebugMessage(`Phase: ${currentPhase}, Beat: ${cyclePosition + 1}/${totalCycleBeats}, Tempo: ${tempo}`);
    
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
      {/* Swing Phase Indicator */}
      <Box sx={{ 
        position: 'absolute', 
        top: { xs: 8, sm: 30 }, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%',
        px: { xs: 0.9, sm: 2 },
        zIndex: 10
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          justifyContent: 'center',
          gap: { xs: 0.5, sm: 1.5, md: 2 },
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 0.5, sm: 1.5 },
          borderRadius: { xs: 2, sm: 5 },
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '95%',
          transform: { xs: 'scale(0.85)', sm: 'scale(1)' }
        }}>

          <Chip 
            icon={<SportsGolfIcon sx={{ 
              transform: swingPhase === 'backswing' ? 'rotate(-45deg)' : 'none',
              fontSize: { xs: '1.0rem', sm: '1.5rem' } 
            }} />}
            label="BACK" 
            sx={{ 
              bgcolor: swingPhase === 'backswing' ? '#ffffff' : 'rgba(255,255,255,0.1)', 
              color: swingPhase === 'backswing' ? '#1b4332' : '#ffffff',
              fontWeight: swingPhase === 'backswing' ? 700 : 400,
              transition: 'all 0.3s ease',
              boxShadow: swingPhase === 'backswing' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
              py: { xs: 0.75, sm: 1.5, md: 2.5 },
              height: 'auto',
              width: '130px',
              border: swingPhase === 'backswing' ? 'none' : '1px solid rgba(255,255,255,0.2)',
              '& .MuiChip-label': {
                px: { xs: 1.75, sm: 2.5 },
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
              }
            }} 
          />
          <Typography variant="h5" sx={{ 
            color: '#ffffff', 
            fontWeight: 300,
            mx: { xs: 0.1, sm: 0.5 },
            opacity: 0.8,
            letterSpacing: '0.05em',
            fontSize: { xs: '3rem', sm: '3rem' }
          }}>
            :
          </Typography>
          <Chip 
            icon={<SportsGolfIcon sx={{ 
              transform: swingPhase === 'downswing' ? 'rotate(45deg)' : 'none',
              fontSize: { xs: '1.0rem', sm: '1.5rem' } 
            }} />}
            label="DOWN" 
            sx={{ 
              bgcolor: swingPhase === 'downswing' ? '#ffffff' : 'rgba(255,255,255,0.1)', 
              color: swingPhase === 'downswing' ? '#1b4332' : '#ffffff',
              fontWeight: swingPhase === 'downswing' ? 700 : 400,
              transition: 'all 0.3s ease',
              boxShadow: swingPhase === 'downswing' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
              py: { xs: 0.75, sm: 1.5, md: 2.5 },
              height: 'auto',
              width: '130px',
              border: swingPhase === 'downswing' ? 'none' : '1px solid rgba(255,255,255,0.2)',
              '& .MuiChip-label': {
                px: { xs: 0.75, sm: 1.5 },
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
              }
            }} 
          />
          <Typography variant="h5" sx={{ 
            color: '#ffffff', 
            fontWeight: 300,
            mx: { xs: 0.1, sm: 0.5 },
            opacity: 0.8,
            letterSpacing: '0.05em',
            fontSize: { xs: '0.8rem', sm: '1.25rem' }
          }}>
            :
          </Typography>
        </Box>
      </Box>
      
      {/* Display Panel */}
      <Box sx={{ 
        borderRadius: { xs: 2, sm: 4 }, 
        p: { xs: 1.5, sm: 3, md: 4 }, 
        mt: { xs: 1.5, sm: 3, md: 4 },
        mb: { xs: 1.5, sm: 3, md: 4 }, 
        width: { xs: '95%', sm: '85%' }, 
        maxWidth: 650,
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        transform: { xs: 'scale(0.95)', sm: 'scale(1)' }
      }}>
        <Stack spacing={2.5}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: { xs: 0.5, sm: 1 } }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontWeight: 500, 
                fontSize: '0.9rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: '-15px',
                  right: '-15px',
                  bottom: '-4px',
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              SWING TEMPO
            </Typography>
          </Box>
          
          <Stack alignItems="center" spacing={2}>
            {/* Large Tempo Number */}
            <Box sx={{ 
              position: 'relative', 
              textAlign: 'center',
              transform: isPlaying ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  color: '#ffffff', 
                  fontSize: { xs: '4.5rem', sm: '6rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                  lineHeight: 1
                }}
              >
                {tempo}
              </Typography>
              
              {/* Tempo ratio chip removed as requested */}
            </Box>
          
            {/* Tempo Ratio Explanation */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontWeight: 300,
                textAlign: 'center',
                maxWidth: '90%',
                fontStyle: 'italic',
                fontSize: { xs: '0.7rem', sm: '0.875rem' }
              }}
            >
              {tempoRatio === '3:1' ? '3 count backswing : 1 count downswing (Tour Pro)' : 
               tempoRatio === '2:1' ? '2 count backswing : 1 count downswing (Smooth Swing)' : 
               tempoRatio === '4:1' ? '4 count backswing : 1 count downswing (Power Swing)' : 
               '1 count backswing : 1 count downswing (Beginner)'}
            </Typography>
          </Stack>
          
          {/* Tempo Progress Bar with Tick Marks */}
          <Box sx={{ mt: 2, position: 'relative', height: 30, pt: 2 }}>
            {/* Tick Marks */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 15, display: 'flex' }}>
              {[MIN_TEMPO, 80, 120, 160, MAX_TEMPO].map((tick, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    position: 'absolute',
                    left: `${(tick - MIN_TEMPO) / (MAX_TEMPO - MIN_TEMPO) * 100}%`,
                    transform: 'translateX(-50%)',
                    height: '12px',
                    width: '1px',
                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                  }}
                />
              ))}
            </Box>
            
            {/* Progress Bar */}
            <Box sx={{ 
              height: 10, 
              bgcolor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 2, 
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)'
            }}>
              <Box sx={{ 
                width: `${(tempo - MIN_TEMPO) / (MAX_TEMPO - MIN_TEMPO) * 100}%`, 
                height: '100%', 
                background: 'linear-gradient(to right, #4ade80, #22d3ee)',
                boxShadow: '0 0 10px rgba(74, 222, 128, 0.6), inset 0 0 5px rgba(255, 255, 255, 0.5)'
              }} />
            </Box>
          </Box>
        </Stack>
      </Box>
      
      {/* Preset Buttons */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: { xs: 0.5, sm: 1.5, md: 2 },
        mb: { xs: 1, sm: 2, md: 3 },
        mt: { xs: 0.5, sm: 1.5, md: 2 },
        px: { xs: 0.5, sm: 1.5, md: 2 },
        '& > *': { 
          flex: '1 1 auto',
          minWidth: { xs: '45%', sm: 'auto' },
          maxWidth: { xs: '45%', sm: 'none' }
        }
      }}>
        {TEMPO_PRESETS.map((preset) => {
          // Custom icons for different presets
          const getPresetIcon = () => {
            switch(preset.name) {
              case "Tour Pro": 
                return <SportsGolfIcon sx={{ 
                  fontSize: { xs: '1rem', sm: '1.4rem' }, 
                  transform: 'rotate(-15deg)',
                  color: '#ffffff'
                }} />;
              case "Smooth Swing": 
                return <SportsGolfIcon sx={{ 
                  fontSize: { xs: '1rem', sm: '1.4rem' }, 
                  transform: 'rotate(15deg)',
                  color: '#ffffff'
                }} />;
              case "Power Swing": 
                return <SportsGolfIcon sx={{ 
                  fontSize: { xs: '1rem', sm: '1.4rem' }, 
                  transform: 'rotate(45deg)',
                  color: '#ffffff'
                }} />;
              case "Beginner":
                return <GolfCourseIcon sx={{ 
                  fontSize: '1.4rem',
                  transform: 'scale(0.85)',
                  color: '#ffffff'
                }} />;
              default:
                return <GolfCourseIcon sx={{ color: '#ffffff' }} />;
            }
          };
          
          // Background color for active buttons (subtle versions of original colors)
          const getActiveBackgroundColor = () => {
            switch(preset.name) {
              case "Tour Pro": return 'rgba(16, 185, 129, 0.3)'; // Emerald
              case "Smooth Swing": return 'rgba(59, 130, 246, 0.3)'; // Blue
              case "Power Swing": return 'rgba(245, 158, 11, 0.3)'; // Amber
              case "Beginner": return 'rgba(20, 184, 166, 0.3)'; // Teal
              default: return 'rgba(255, 255, 255, 0.2)';
            }
          };
          
          const activeBackgroundColor = getActiveBackgroundColor();
          const isActive = activePreset === preset.name;
          
          return (
            <Button 
              key={preset.name}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => handlePresetChange(preset)}
              startIcon={getPresetIcon()}
              sx={{ 
                minWidth: 0,
                maxWidth: 160,
                py: 1.2,
                px: { xs: 1, sm: 2 },
                height: { xs: 50, sm: 64 },
                color: '#ffffff',
                bgcolor: isActive ? activeBackgroundColor : 'transparent',
                borderColor: '#ffffff',
                borderWidth: 1,
                borderRadius: 8,
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 4px 12px rgba(255,255,255,0.2)' : 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isActive ? activeBackgroundColor : 'rgba(255,255,255,0.1)',
                  borderColor: '#ffffff',
                  boxShadow: '0 6px 16px rgba(255,255,255,0.2)'
                }
              }}
            >
              <Stack spacing={0.3} alignItems="center">
                <Typography variant="subtitle2" sx={{ 
                  fontWeight: isActive ? 700 : 600,
                  textAlign: 'center',
                  color: '#ffffff'
                }}>
                  {preset.name}
                </Typography>
                <Typography variant="caption" sx={{ 
                  opacity: 0.9, 
                  fontWeight: 400,
                  textAlign: 'center',
                  color: '#ffffff'
                }}>
                  {preset.ratio} Ratio
                </Typography>
              </Stack>
            </Button>
          );
        })}
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.15)', my: 2 }} />
      </Box>

      {/* Dial Control */}
      <Box sx={{ mb: { xs: 3, sm: 4, md: 5 }, mt: { xs: 1, sm: 1.5, md: 2 }, position: 'relative' }}>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Decrement Button with enhanced styling */}
          <IconButton 
            onClick={decreaseTempo} 
            sx={{ 
              color: '#ffffff', 
              bgcolor: 'rgba(255,255,255,0.12)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255,255,255,0.2)',
              p: { xs: 0.75, sm: 1.5 },
              transition: 'all 0.2s ease',
              width: { xs: 40, sm: 52, md: 60 },
              height: { xs: 40, sm: 52, md: 60 },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
          >
            <RemoveIcon fontSize="large" />
          </IconButton>
          
          {/* Enhanced Dial */}
          <Box
            ref={dialRef}
            onMouseDown={handleMouseDown}
            sx={{
              width: { xs: 150, sm: 220, md: 240 },
              height: { xs: 150, sm: 220, md: 240 },
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: '2px solid rgba(255,255,255,0.15)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing'
              },
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 2px 15px rgba(255,255,255,0.1)'
            }}
          >
            {/* Dial outer glow effect */}
            <Box sx={{
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              padding: 2,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              pointerEvents: 'none',
              opacity: 0.6
            }} />
            
            {/* Tick marks for the dial */}
            {[...Array(12)].map((_, i) => (
              <Box 
                key={i} 
                sx={{
                  position: 'absolute',
                  width: 2,
                  height: i % 3 === 0 ? 12 : 8,
                  backgroundColor: i % 3 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                  transform: `rotate(${i * 30}deg) translateY(-108px)`,
                  transformOrigin: 'bottom center'
                }}
              />
            ))}
            
            {/* Golf swing timing marks - specifically for 3:1 timing */}
            <Box sx={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}>
              <Typography 
                sx={{ 
                  position: 'absolute', 
                  top: 20, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                1
              </Typography>
              <Typography 
                sx={{ 
                  position: 'absolute', 
                  right: 20, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                2
              </Typography>
              <Typography 
                sx={{ 
                  position: 'absolute', 
                  bottom: 20, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                3
              </Typography>
              {/* "GO" label removed */}
            </Box>
            
            {/* Green indicator line and base dot removed */}
            
            {/* Play/Stop Button with enhanced styling */}
            <IconButton
              onClick={toggleMetronome}
              sx={{
                bgcolor: isPlaying ? '#4ade80' : '#ffffff',
                '&:hover': {
                  bgcolor: isPlaying ? '#22c55e' : '#f5f5f5',
                  transform: 'scale(1.05)',
                  boxShadow: isPlaying
                    ? '0 0 20px rgba(74, 222, 128, 0.6), 0 8px 16px rgba(0,0,0,0.3)'
                    : '0 8px 16px rgba(0,0,0,0.3)'
                },
                boxShadow: isPlaying
                  ? '0 0 20px rgba(74, 222, 128, 0.4), 0 6px 12px rgba(0,0,0,0.25)'
                  : '0 6px 12px rgba(0,0,0,0.25)',
                p: 3,
                transition: 'all 0.3s ease'
              }}
            >
              {isPlaying ? 
                <StopIcon sx={{ fontSize: 34, color: '#ffffff' }} /> : 
                <PlayArrowIcon sx={{ fontSize: 34, color: '#1b4332' }} />
              }
            </IconButton>
          </Box>
          
          {/* Increment Button with enhanced styling */}
          <IconButton 
            onClick={increaseTempo} 
            sx={{ 
              color: '#ffffff', 
              bgcolor: 'rgba(255,255,255,0.12)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255,255,255,0.2)',
              p: { xs: 0.75, sm: 1.5 },
              transition: 'all 0.2s ease',
              width: { xs: 40, sm: 52, md: 60 },
              height: { xs: 40, sm: 52, md: 60 },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
          >
            <AddIcon fontSize="large" />
          </IconButton>
        </Stack>
      </Box>

      {/* Tempo slider removed as requested */}

      {/* Tap Button */}
      <Button 
        variant="contained" 
        onClick={handleTap} 
        sx={{ 
          background: 'linear-gradient(45deg, #8c9eff 30%, #4fc3f7 90%)',
          boxShadow: '0 3px 10px rgba(140,158,255,0.4)',
          color: '#FFFFFF', 
          fontWeight: 'bold', 
          px: { xs: 4, sm: 6 }, 
          py: { xs: 1, sm: 1.5 }, 
          fontSize: { xs: '0.85rem', sm: '1rem' },
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
