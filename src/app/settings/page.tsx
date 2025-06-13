'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Switch, 
  FormControlLabel, 
  Slider, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

export default function SettingsPage() {
  // Theme settings
  const [darkMode, setDarkMode] = useState(true);
  
  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(70);
  
  // Swing detection settings
  const [sensitivity, setSensitivity] = useState(5);
  const [detectionMode, setDetectionMode] = useState('automatic');
  
  // Tempo settings
  const [defaultTempo, setDefaultTempo] = useState(120);
  const [defaultMeter, setDefaultMeter] = useState('4/4');

  const handleDarkModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
    // Implementation for theme change would go here
  };

  const handleSoundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSoundEnabled(event.target.checked);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  const handleSensitivityChange = (event: Event, newValue: number | number[]) => {
    setSensitivity(newValue as number);
  };

  const handleDetectionModeChange = (event: SelectChangeEvent) => {
    setDetectionMode(event.target.value);
  };

  const handleDefaultTempoChange = (event: Event, newValue: number | number[]) => {
    setDefaultTempo(newValue as number);
  };

  const handleDefaultMeterChange = (event: SelectChangeEvent) => {
    setDefaultMeter(event.target.value);
  };

  const handleReset = () => {
    // Reset all settings to defaults
    setDarkMode(true);
    setSoundEnabled(true);
    setVolume(70);
    setSensitivity(5);
    setDetectionMode('automatic');
    setDefaultTempo(120);
    setDefaultMeter('4/4');
  };

  // We would typically save these settings to localStorage or a database
  const saveSettings = () => {
    // Implementation for saving settings
    console.log('Settings saved', {
      darkMode, soundEnabled, volume, sensitivity, 
      detectionMode, defaultTempo, defaultMeter
    });
    // In a real app, we would save to localStorage or a backend
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch checked={darkMode} onChange={handleDarkModeChange} />
              }
              label="Dark Mode"
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sound
            </Typography>
            <FormControlLabel
              control={
                <Switch checked={soundEnabled} onChange={handleSoundChange} />
              }
              label="Enable Sound"
            />
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography id="volume-slider" gutterBottom>
                Volume
              </Typography>
              <Slider
                disabled={!soundEnabled}
                value={volume}
                onChange={handleVolumeChange}
                aria-labelledby="volume-slider"
                valueLabelDisplay="auto"
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Swing Detection
            </Typography>
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography id="sensitivity-slider" gutterBottom>
                Detection Sensitivity
              </Typography>
              <Slider
                value={sensitivity}
                onChange={handleSensitivityChange}
                aria-labelledby="sensitivity-slider"
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel id="detection-mode-label">Detection Mode</InputLabel>
              <Select
                labelId="detection-mode-label"
                id="detection-mode"
                value={detectionMode}
                label="Detection Mode"
                onChange={handleDetectionModeChange}
              >
                <MenuItem value="automatic">Automatic</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="assisted">Assisted</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Metronome Defaults
            </Typography>
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography id="default-tempo-slider" gutterBottom>
                Default Tempo (BPM)
              </Typography>
              <Slider
                value={defaultTempo}
                onChange={handleDefaultTempoChange}
                aria-labelledby="default-tempo-slider"
                min={30}
                max={240}
                valueLabelDisplay="auto"
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel id="default-meter-label">Default Meter</InputLabel>
              <Select
                labelId="default-meter-label"
                id="default-meter"
                value={defaultMeter}
                label="Default Meter"
                onChange={handleDefaultMeterChange}
              >
                <MenuItem value="2/4">2/4</MenuItem>
                <MenuItem value="3/4">3/4</MenuItem>
                <MenuItem value="4/4">4/4</MenuItem>
                <MenuItem value="6/8">6/8</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={saveSettings}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
