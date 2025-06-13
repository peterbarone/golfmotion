'use client'

import { useRef, useEffect, useState } from 'react'
import Webcam from 'react-webcam'

// Extend Window interface to include the MediaPipe object
declare global {
  interface Window {
    Pose?: any;
  }
}

// Define types for pose landmarks since we can't import from @mediapipe/pose
interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResults {
  poseLandmarks?: NormalizedLandmark[];
}

import { useSwingStore } from '../store/swingStore'
import { useToast } from './ui/Toast'
import { 
  Box, 
  Button, 
  CircularProgress, 
  Typography, 
  Paper,
  Alert,
  Stack,
  Chip,
  useTheme
} from '@mui/material'
import { 
  PlayArrow, 
  Stop, 
  Videocam, 
  VideocamOff, 
  FiberManualRecord
} from '@mui/icons-material'

// Pose landmarks of interest for golf swing detection
const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const

// Configurables
const DETECTION_CONFIDENCE = 0.7
const BACKSWING_THRESHOLD = 0.7  // How far back wrist needs to move (ratio)
const DOWNSWING_THRESHOLD = 0.6  // How far down wrist needs to move (ratio)
const FPS = 30

const CameraDetector = () => {
  const theme = useTheme()
  // References
  const webcamRef = useRef<Webcam>(null)
  const poseRef = useRef<any>(null)  // Use any for MediaPipe Pose instance
  const requestRef = useRef<number>(0)
  
  // Local state
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Store state & actions
  const {
    swingState,
    cameraEnabled,
    detectionActive,
    selectedCameraDeviceId,
    handedness,
    startSwing,
    recordTransition,
    finishSwing,
    setCameraEnabled,
    setDetectionActive,
  } = useSwingStore()
  
  const toast = useToast()
  
  // Position tracking
  const startPositionRef = useRef<{ x: number, y: number } | null>(null)
  const maxBackswingRef = useRef<{ x: number, y: number } | null>(null)
  
  // Initialize MediaPipe Pose
  useEffect(() => {
    if (!cameraEnabled || poseRef.current) return
    
    const loadPose = async () => {
      try {
        setIsLoading(true)
        console.log('Loading MediaPipe Pose...')
        
        // Access Pose from window object
        const waitForPose = (): Promise<any> => {
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('MediaPipe Pose script loading timed out'))
            }, 10000) // 10 seconds timeout
            
            const checkForPose = () => {
              // Check for pose at global level
              if (window.Pose) {
                clearTimeout(timeout)
                resolve(window.Pose)
                return
              }
              
              setTimeout(checkForPose, 100)
            }
            
            checkForPose()
          })
        }
        
        // Wait for and get the Pose constructor
        const PoseConstructor = await waitForPose()
        console.log('Found MediaPipe Pose constructor:', PoseConstructor)
        
        // Create the pose instance
        const pose = new PoseConstructor({
          locateFile: (file: string) => {
            console.log(`Loading MediaPipe file: ${file}`)
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          }
        })
        
        console.log('Setting Pose options...')
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: DETECTION_CONFIDENCE,
          minTrackingConfidence: DETECTION_CONFIDENCE
        })
        
        console.log('Setting onResults handler...')
        pose.onResults(onPoseResults)
        
        poseRef.current = pose
        setIsLoading(false)
        console.log('MediaPipe Pose initialized successfully')
        toast('Pose detection ready', { type: 'success' })
      } catch (err) {
        console.error('Failed to initialize Pose:', err)
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setErrorMessage(`Error initializing pose detection: ${errorMsg}`)
        setCameraEnabled(false) // turn off camera on error
        toast('Failed to initialize pose detection', { type: 'error' })
      }
    }
    
    // Add a small delay before loading Pose to ensure webcam is initialized
    const timer = setTimeout(() => {
      console.log('Starting Pose loading sequence...')
      loadPose()
    }, 1000)
    
    return () => {
      clearTimeout(timer)
      if (poseRef.current) {
        console.log('Cleaning up Pose instance')
        poseRef.current.close()
      }
    }
  }, [cameraEnabled, setCameraEnabled, toast])
  
  // Request animation frame loop for pose detection
  useEffect(() => {
    let lastFrameTime = 0
    const frameDuration = 1000 / FPS
    let errorCount = 0
    const MAX_ERRORS = 5
    
    const detectPose = (timestamp: number) => {
      if (!poseRef.current || !webcamRef.current || !detectionActive) {
        requestRef.current = requestAnimationFrame(detectPose)
        return
      }
      
      const elapsed = timestamp - lastFrameTime
      
      // Throttle to target FPS
      if (elapsed < frameDuration) {
        requestRef.current = requestAnimationFrame(detectPose)
        return
      }
      
      lastFrameTime = timestamp
      
      try {
        const webcam = webcamRef.current.video
        if (webcam && webcam.readyState === 4) {
          poseRef.current.send({
            image: webcam
          })
        }
      } catch (err) {
        console.error('Error in pose detection:', err)
        errorCount++
        
        if (errorCount > MAX_ERRORS) {
          console.error('Too many errors, stopping detection')
          setDetectionActive(false)
          toast('Pose detection stopped due to errors', { type: 'error' })
        }
      }
      
      requestRef.current = requestAnimationFrame(detectPose)
    }
    
    if (cameraEnabled && !isLoading) {
      console.log('Starting pose detection animation frame loop')
      requestRef.current = requestAnimationFrame(detectPose)
    }
    
    return () => {
      console.log('Cleaning up pose detection loop')
      cancelAnimationFrame(requestRef.current)
    }
  }, [cameraEnabled, detectionActive, isLoading, setDetectionActive, toast])
  
  // Handler for pose detection results
  const onPoseResults = (results?: any) => {
    if (!results || !results.poseLandmarks || !detectionActive) {
      return
    }
    
    // Get landmarks based on handedness
    const isRightHanded = handedness === 'right'
    const wristLandmark = isRightHanded 
      ? results.poseLandmarks[LANDMARKS.RIGHT_WRIST]
      : results.poseLandmarks[LANDMARKS.LEFT_WRIST]
    
    const shoulderLandmark = isRightHanded
      ? results.poseLandmarks[LANDMARKS.RIGHT_SHOULDER]
      : results.poseLandmarks[LANDMARKS.LEFT_SHOULDER]
    
    // Check if we have sufficient data
    if (!wristLandmark || !shoulderLandmark || 
        (wristLandmark.visibility !== undefined && wristLandmark.visibility < 0.5) || 
        (shoulderLandmark.visibility !== undefined && shoulderLandmark.visibility < 0.5)) {
      return
    }
    
    const wristPos = { x: wristLandmark.x, y: wristLandmark.y }
    
    switch (swingState) {
      case 'ready':
        // Start tracking from the current position
        startPositionRef.current = wristPos
        startSwing()
        break
        
      case 'backswing':
        // Track for backswing detection (wrist moving horizontally away from body)
        if (!startPositionRef.current) {
          startPositionRef.current = wristPos
          break
        }
        
        // Check if wrist has moved enough horizontally in correct direction based on handedness
        const backswingMovement = isRightHanded 
          ? startPositionRef.current.x - wristPos.x // Right-handed: wrist moving left
          : wristPos.x - startPositionRef.current.x // Left-handed: wrist moving right
        
        if (backswingMovement > BACKSWING_THRESHOLD) {
          maxBackswingRef.current = wristPos
          recordTransition('top')
        }
        break
        
      case 'downswing':
        // Track for downswing detection (wrist moving back down)
        if (!maxBackswingRef.current) {
          maxBackswingRef.current = wristPos
          break
        }
        
        // Check if wrist has moved down enough
        const downswingMovement = wristPos.y - maxBackswingRef.current.y
        
        if (downswingMovement > DOWNSWING_THRESHOLD) {
          // Complete swing and calculate tempo ratio
          recordTransition('impact')
          finishSwing()
          
          // Reset references for next swing
          startPositionRef.current = null
          maxBackswingRef.current = null
        }
        break
    }
  }
  
  const handleToggleDetection = () => {
    if (detectionActive) {
      setDetectionActive(false)
      toast('Detection paused', { type: 'info' })
    } else {
      setDetectionActive(true)
      // Reset swing state when starting detection
      startPositionRef.current = null
      maxBackswingRef.current = null
      toast('Detection started', { type: 'success' })
    }
  }
  
  // Request camera permission
  useEffect(() => {
    if (!cameraEnabled) return
    
    console.log('Checking camera permissions...')
    
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        
        setHasPermission(true)
        // Stop the test stream immediately
        stream.getTracks().forEach(track => track.stop())
      } catch (err) {
        console.error('Camera permission error:', err)
        setHasPermission(false)
        setCameraEnabled(false)
        toast('Camera access denied', { type: 'error' })
      }
    }
    
    checkPermission()
  }, [cameraEnabled, setCameraEnabled, selectedCameraDeviceId, toast])
  
  const renderDisabledView = () => {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          my: 4, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              mx: 'auto',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover'
            }}
          >
            <Videocam sx={{ fontSize: 32, color: 'text.secondary' }} />
          </Box>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            gutterBottom
          >
            Enable camera to detect your golf swing
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Videocam />}
          onClick={() => setCameraEnabled(true)}
          sx={{ px: 3, py: 1 }}
        >
          Enable Swing Detection Camera
        </Button>
      </Paper>
    )
  }
  
  if (!cameraEnabled) {
    return renderDisabledView();
  }
  
  if (hasPermission === false) {
    return (
      <Alert 
        severity="error" 
        sx={{ borderRadius: 3, my: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small"
            onClick={() => setCameraEnabled(false)}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Dismiss
          </Button>
        }
      >
        Camera access denied. Please allow camera access in your browser settings and reload the page.
      </Alert>
    )
  }
  
  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress size={40} thickness={4} color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
          Loading pose detection...
        </Typography>
      </Box>
    );
  }
  
  if (errorMessage) {
    return (
      <Alert 
        severity="error" 
        sx={{ borderRadius: 3, my: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small"
            onClick={() => setCameraEnabled(false)}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Dismiss
          </Button>
        }
      >
        {errorMessage}
      </Alert>
    )
  }
  
  return (
    <Box sx={{ my: 3, position: 'relative' }}>
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 6,
          overflow: 'hidden',
          border: detectionActive ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(61,131,97,0.1)',
          position: 'relative',
          boxShadow: detectionActive ? `0 8px 16px rgba(61,131,97,0.2)` : 'none'
        }}
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          videoConstraints={{
            ...(selectedCameraDeviceId ? { deviceId: { exact: selectedCameraDeviceId } } : { facingMode: 'user' }),
            width: { ideal: 640 },
            height: { ideal: 360 }
          }}
          style={{ width: '100%', display: 'block' }}
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            zIndex: 1
          }}
        >
          <Chip
            size="small"
            color={detectionActive ? "primary" : "default"}
            label={detectionActive ? "Active" : "Inactive"}
            icon={<FiberManualRecord sx={{ 
              fontSize: 12,
              animation: detectionActive ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.4 },
                '100%': { opacity: 1 },
              }
            }} />}
            sx={{ 
              fontWeight: 500,
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        </Box>
      </Paper>
      
      <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'space-between' }}>
        <Button
          variant={detectionActive ? "outlined" : "contained"}
          color={detectionActive ? "error" : "primary"}
          onClick={handleToggleDetection}
          startIcon={detectionActive ? <Stop /> : <PlayArrow />}
          size="large"
          sx={{
            borderRadius: 100,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: detectionActive ? 'none' : '0 6px 16px rgba(61,131,97,0.2)'
          }}
        >
          {detectionActive ? 'Stop' : 'Start Recording'}
        </Button>
        
        <Button
          variant="text"
          color="inherit"
          startIcon={<VideocamOff />}
          onClick={() => setCameraEnabled(false)}
          size="medium"
          sx={{
            fontWeight: 500,
            textTransform: 'none',
            opacity: 0.7
          }}
        >
          Hide Camera
        </Button>
      </Stack>
      
      <Paper 
        variant="outlined"
        sx={{ 
          mt: 2, 
          p: 3, 
          borderRadius: 4,
          bgcolor: theme.palette.mode === 'light' ? 'rgba(61,131,97,0.05)' : 'rgba(61,131,97,0.1)',
          border: `1px solid rgba(61,131,97,0.1)`
        }}
      >
        <Typography variant="body2" color="text.secondary" component="div">
          <Box component="p" sx={{ mb: 0.5, fontWeight: 500 }}>
            Position yourself so your full upper body is visible.
          </Box>
          <Box component="p" sx={{ m: 0 }}>
            Start the backswing on the first beep, and start the downswing on the second beep.
          </Box>
        </Typography>
      </Paper>
    </Box>
  )
}

export default CameraDetector