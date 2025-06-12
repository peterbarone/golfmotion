'use client'

import React, { useRef, useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import { Pose } from '@mediapipe/pose'
import { useSwingStore } from '../store/swingStore'
import { useToast } from './ui/Toast'

// Pose landmarks of interest for golf swing detection
const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
}

// Configurables
const DETECTION_CONFIDENCE = 0.7
const BACKSWING_THRESHOLD = 0.7  // How far back wrist needs to move (ratio)
const DOWNSWING_THRESHOLD = 0.6  // How far down wrist needs to move (ratio)
const FPS = 30

const CameraDetector: React.FC = () => {
  // References
  const webcamRef = useRef<Webcam>(null)
  const poseRef = useRef<Pose | null>(null)
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
        
        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          }
        })
        
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: DETECTION_CONFIDENCE,
          minTrackingConfidence: DETECTION_CONFIDENCE
        })
        
        pose.onResults(onPoseResults)
        
        poseRef.current = pose
        setIsLoading(false)
        toast('Pose detection ready', { type: 'success' })
      } catch (err) {
        console.error('Failed to initialize Pose:', err)
        setErrorMessage('Failed to load pose detection. Please try again.')
        setCameraEnabled(false)
        setIsLoading(false)
      }
    }
    
    loadPose()
    
    return () => {
      if (poseRef.current) {
        poseRef.current.close()
        poseRef.current = null
      }
    }
  }, [cameraEnabled, setCameraEnabled, toast])
  
  // Request animation frame loop for pose detection
  useEffect(() => {
    let lastFrameTime = 0
    const frameDuration = 1000 / FPS
    
    const detectPose = async (timestamp: number) => {
      if (!detectionActive || !poseRef.current || !webcamRef.current) {
        requestRef.current = requestAnimationFrame(detectPose)
        return
      }
      
      // Throttle FPS
      if (timestamp - lastFrameTime < frameDuration) {
        requestRef.current = requestAnimationFrame(detectPose)
        return
      }
      
      lastFrameTime = timestamp
      
      const webcam = webcamRef.current.video
      if (webcam && webcam.readyState === 4) {
        try {
          await poseRef.current.send({ image: webcam })
        } catch (err) {
          console.error('Error in pose detection:', err)
        }
      }
      
      requestRef.current = requestAnimationFrame(detectPose)
    }
    
    if (cameraEnabled) {
      requestRef.current = requestAnimationFrame(detectPose)
    }
    
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [cameraEnabled, detectionActive])
  
  // Handler for pose detection results
  const onPoseResults = (results: any) => {
    if (!results.poseLandmarks || !detectionActive) return
    
    const landmarks = results.poseLandmarks
    
    // Using right wrist for tracking (right-handed golfer)
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST]
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
    
    // Check if landmarks have sufficiently high confidence
    if (rightWrist.visibility < DETECTION_CONFIDENCE || 
        rightShoulder.visibility < DETECTION_CONFIDENCE) {
      return
    }
    
    // Get position relative to the shoulder
    const wristPos = {
      x: rightWrist.x - rightShoulder.x, 
      y: rightWrist.y - rightShoulder.y
    }
    
    // Handle different swing states
    switch (swingState) {
      case 'ready':
        // Save initial position as reference
        startPositionRef.current = wristPos
        startSwing()
        toast('Backswing detected', { type: 'info', duration: 1000 })
        break
        
      case 'backswing':
        // Track maximum backswing position (wrist moving back and up)
        if (maxBackswingRef.current) {
          if (wristPos.x < maxBackswingRef.current.x) {
            maxBackswingRef.current = wristPos
          }
          
          // Check if forward motion is detected after backswing
          const backswingMovement = Math.abs(maxBackswingRef.current.x - startPositionRef.current!.x)
          const forwardMovement = wristPos.x - maxBackswingRef.current.x
          
          if (backswingMovement > BACKSWING_THRESHOLD && forwardMovement > 0.1) {
            recordTransition()
            toast('Transition detected', { type: 'info', duration: 1000 })
          }
        } else {
          maxBackswingRef.current = wristPos
        }
        break
        
      case 'downswing':
        // Check if downswing is complete
        if (startPositionRef.current) {
          // Check if wrist has moved down past starting position
          const downswingComplete = wristPos.y > (startPositionRef.current.y + DOWNSWING_THRESHOLD)
          
          if (downswingComplete) {
            finishSwing()
            
            // Reset tracking references
            startPositionRef.current = null
            maxBackswingRef.current = null
          }
        }
        break
        
      default:
        break
    }
  }
  
  const handleToggleDetection = () => {
    if (!cameraEnabled) {
      setCameraEnabled(true)
    }
    setDetectionActive(!detectionActive)
    
    // Reset tracking when toggling detection
    startPositionRef.current = null
    maxBackswingRef.current = null
    
    if (!detectionActive) {
      toast('Auto detection enabled', { type: 'info' })
    } else {
      toast('Auto detection disabled', { type: 'info' })
    }
  }
  
  // Request camera permission
  useEffect(() => {
    if (!cameraEnabled) return
    
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        setHasPermission(true)
        stream.getTracks().forEach(track => track.stop())
      } catch (err) {
        console.error('Camera permission denied:', err)
        setHasPermission(false)
        setErrorMessage('Camera permission denied. Please allow access to your camera.')
        setCameraEnabled(false)
      }
    }
    
    checkPermission()
  }, [cameraEnabled, setCameraEnabled])
  
  if (!cameraEnabled) {
    return (
      <div className="text-center p-4">
        <button 
          onClick={() => setCameraEnabled(true)}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            <path fillRule="evenodd" d="M14 5h1a2 2 0 012 2v6a2 2 0 01-2 2h-1V5z" clipRule="evenodd" />
          </svg>
          Enable Swing Detection Camera
        </button>
      </div>
    )
  }
  
  if (hasPermission === false) {
    return (
      <div className="text-center p-4 bg-red-50 text-red-600 rounded-md">
        <p>Camera access denied. Please allow camera access in your browser settings and reload the page.</p>
        <button 
          onClick={() => setCameraEnabled(false)}
          className="mt-2 py-1 px-3 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Dismiss
        </button>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <svg className="inline-block animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-gray-600">Loading pose detection...</p>
      </div>
    )
  }
  
  if (errorMessage) {
    return (
      <div className="text-center p-4 bg-red-50 text-red-600 rounded-md">
        <p>{errorMessage}</p>
        <button 
          onClick={() => setCameraEnabled(false)}
          className="mt-2 py-1 px-3 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Dismiss
        </button>
      </div>
    )
  }
  
  return (
    <div className="mt-4 mb-4">
      <div className={`relative overflow-hidden rounded-md ${detectionActive ? 'border-2 border-green-500' : 'border border-gray-300'}`}>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          videoConstraints={{
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 360 }
          }}
          className="w-full"
        />
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${detectionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        </div>
      </div>
      
      <div className="flex justify-between mt-2">
        <button
          onClick={handleToggleDetection}
          className={`py-2 px-4 rounded-md flex items-center gap-2 ${
            detectionActive 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          {detectionActive ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop Detection
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Detection
            </>
          )}
        </button>
        
        <button
          onClick={() => setCameraEnabled(false)}
          className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Hide Camera
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <p className="mb-1">Position yourself so your full upper body is visible.</p>
        <p>Make your backswing and downswing at normal speed.</p>
      </div>
    </div>
  )
}

export default CameraDetector
