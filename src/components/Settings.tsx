import React, { useEffect, useState } from 'react';
import { useSwingStore } from '../store/swingStore';
import { 
  Box, 
  Typography, 
  FormControl, 
  FormControlLabel, 
  FormLabel, 
  MenuItem,
  Radio, 
  RadioGroup, 
  Select, 
  useTheme,
  CircularProgress,
  Alert,
  InputLabel
} from '@mui/material';

interface DeviceInfo {
  deviceId: string;
  label: string;
}

export const Settings: React.FC = () => {
  const theme = useTheme();
  const {
    selectedCameraDeviceId,
    handedness,
    setSelectedCameraDeviceId,
    setHandedness,
  } = useSwingStore()

  const [videoDevices, setVideoDevices] = useState<DeviceInfo[]>([])
  const [devicesLoading, setDevicesLoading] = useState<boolean>(true)
  const [devicesError, setDevicesError] = useState<string | null>(null)

  useEffect(() => {
    const getVideoDevices = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setDevicesError("Media device enumeration not supported.")
        setDevicesLoading(false)
        return
      }
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoInputDevices = devices
          .filter((device) => device.kind === 'videoinput')
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${videoDevices.length + 1}`,
          }))
        setVideoDevices(videoInputDevices)
        if (videoInputDevices.length > 0 && !selectedCameraDeviceId) {
          // Auto-select the first camera if none is selected
          // setSelectedCameraDeviceId(videoInputDevices[0].deviceId)
        }
      } catch (err) {
        console.error("Error enumerating video devices:", err)
        setDevicesError("Could not access camera list. Please ensure permissions are granted.")
      } finally {
        setDevicesLoading(false)
      }
    }

    getVideoDevices()
  }, [selectedCameraDeviceId, setSelectedCameraDeviceId]) // Dependency array needs thought

  const handleCameraChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCameraDeviceId(event.target.value || null)
  }

  const handleHandednessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHandedness(event.target.value as 'left' | 'right')
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Camera Selection */}
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth variant="outlined" sx={{ mb: 1 }}>
          <InputLabel id="camera-select-label">Select Camera</InputLabel>
          {devicesLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <CircularProgress size={20} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">Loading cameras...</Typography>
            </Box>
          ) : devicesError ? (
            <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>{devicesError}</Alert>
          ) : videoDevices.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 1, borderRadius: 2 }}>No cameras found.</Alert>
          ) : (
            <Select
              labelId="camera-select-label"
              id="camera-select"
              value={selectedCameraDeviceId || ''}
              onChange={handleCameraChange}
              label="Select Camera"
              sx={{ 
                mt: 1, 
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider
                }
              }}
            >
              <MenuItem value="">-- Select a Camera --</MenuItem>
              {videoDevices.map((device) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </Box>

      {/* Handedness Selection */}
      <Box sx={{ mb: 3 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ 
            color: 'text.primary', 
            fontWeight: 500,
            mb: 1
          }}>
            Handedness
          </FormLabel>
          <RadioGroup
            row
            name="handedness"
            value={handedness}
            onChange={handleHandednessChange}
          >
            <FormControlLabel 
              value="left" 
              control={
                <Radio 
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main
                    }
                  }} 
                />
              } 
              label="Left" 
            />
            <FormControlLabel 
              value="right" 
              control={
                <Radio 
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main
                    }
                  }} 
                />
              } 
              label="Right" 
            />
          </RadioGroup>
        </FormControl>
      </Box>
    </Box>
  )
}
