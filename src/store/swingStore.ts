import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define swing state types
export type SwingState = 'ready' | 'backswing' | 'transition' | 'downswing' | 'complete'
export type SwingQuality = 'good' | 'close' | 'off'

// Define a swing history item interface
export interface SwingHistoryItem {
  id: number
  backswingTime: number
  downswingTime: number
  tempoRatio: number
  timestamp: string
  quality: SwingQuality
}

// Define our store state interface
interface SwingStore {
  // Swing state
  swingState: SwingState
  startTime: number
  transitionTime: number
  backswingTime: number
  downswingTime: number
  tempoRatio: number | null
  swingHistory: SwingHistoryItem[]
  showHistory: boolean
  
  // Camera detection
  cameraEnabled: boolean
  detectionActive: boolean

  // Settings
  selectedCameraDeviceId: string | null
  handedness: 'left' | 'right'
  
  // Actions
  setSwingState: (state: SwingState) => void
  startSwing: () => void
  recordTransition: (transitionType?: 'top' | 'impact') => void
  finishSwing: () => void
  resetSwing: () => void
  setShowHistory: (show: boolean) => void
  setCameraEnabled: (enabled: boolean) => void
  setDetectionActive: (active: boolean) => void
  setSelectedCameraDeviceId: (deviceId: string | null) => void
  setHandedness: (handedness: 'left' | 'right') => void
  
  // Manual time setting (for test or fallback)
  setBackswingTime: (time: number) => void
  setDownswingTime: (time: number) => void
}

// Helper functions
const calculateQuality = (ratio: number): SwingQuality => {
  if (ratio >= 2.7 && ratio <= 3.3) return 'good'
  if ((ratio >= 2.4 && ratio < 2.7) || (ratio > 3.3 && ratio <= 3.6)) return 'close'
  return 'off'
}

// Create the store with persistence
export const useSwingStore = create<SwingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      swingState: 'ready',
      startTime: 0,
      transitionTime: 0,
      backswingTime: 0,
      downswingTime: 0,
      tempoRatio: null,
      swingHistory: [],
      showHistory: false,
      cameraEnabled: false,
      detectionActive: false,
      selectedCameraDeviceId: null,
      handedness: 'right',
      
      // Actions
      setSwingState: (state) => set({ swingState: state }),
      
      startSwing: () => set({ 
        swingState: 'backswing', 
        startTime: Date.now() 
      }),
      
      recordTransition: (transitionType?: 'top' | 'impact') => {
        const now = Date.now()
        const back = (now - get().startTime) / 1000
        set({ 
          swingState: 'downswing',
          backswingTime: back,
          transitionTime: now
        })
      },
      
      finishSwing: () => {
        const { transitionTime, backswingTime, swingHistory } = get()
        const now = Date.now()
        const down = (now - transitionTime) / 1000
        const ratio = Number((backswingTime / down).toFixed(1))
        
        const quality = calculateQuality(ratio)
        
        const newSwing: SwingHistoryItem = {
          id: Date.now(),
          backswingTime,
          downswingTime: down,
          tempoRatio: ratio,
          timestamp: new Date().toLocaleTimeString(),
          quality,
        }
        
        set({ 
          swingState: 'complete',
          downswingTime: down,
          tempoRatio: ratio,
          swingHistory: [newSwing, ...swingHistory].slice(0, 10) // Keep last 10 swings
        })
      },
      
      resetSwing: () => set({
        swingState: 'ready',
        backswingTime: 0,
        downswingTime: 0,
        tempoRatio: null
      }),
      
      setShowHistory: (show) => set({ showHistory: show }),
      
      setCameraEnabled: (enabled) => set({ 
        cameraEnabled: enabled,
        // Auto-reset detection if we disable the camera
        detectionActive: enabled ? get().detectionActive : false  
      }),
      
      setDetectionActive: (active) => set({ detectionActive: active }),
      setSelectedCameraDeviceId: (deviceId) => set({ selectedCameraDeviceId: deviceId }),
      setHandedness: (handedness) => set({ handedness: handedness }),
      
      // Manual time setting (for testing or fallback)
      setBackswingTime: (time) => set({ backswingTime: time }),
      setDownswingTime: (time) => set({ downswingTime: time }),
    }),
    {
      name: 'swing-storage', // localStorage key
    }
  )
)

// Utility functions that use the store data
export const tempoColor = (ratio: number | null) => {
  if (ratio === null) return 'text-gray-400'
  if (ratio >= 2.7 && ratio <= 3.3) return 'text-green-500'
  if ((ratio >= 2.4 && ratio < 2.7) || (ratio > 3.3 && ratio <= 3.6)) return 'text-yellow-500'
  return 'text-red-500'
}

export const badgeColor = (quality: SwingQuality) =>
  quality === 'good' ? 'bg-green-500' : quality === 'close' ? 'bg-yellow-500' : 'bg-red-500'
