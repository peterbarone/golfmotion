import { useSwingStore } from './swingStore'
import { act } from '@testing-library/react' // Though Zustand often doesn't need act for simple sets

// Helper to reset store state before each test
const resetStore = () => {
  act(() => {
    useSwingStore.setState(useSwingStore.getInitialState(), true)
  })
}

describe('SwingStore Settings', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should have correct initial settings state', () => {
    const { selectedCameraDeviceId, handedness } = useSwingStore.getState()
    expect(selectedCameraDeviceId).toBeNull()
    expect(handedness).toBe('right')
  })

  describe('setSelectedCameraDeviceId action', () => {
    it('should update selectedCameraDeviceId when a string is provided', () => {
      const testDeviceId = 'camera-device-123'
      act(() => {
        useSwingStore.getState().setSelectedCameraDeviceId(testDeviceId)
      })
      expect(useSwingStore.getState().selectedCameraDeviceId).toBe(testDeviceId)
    })

    it('should update selectedCameraDeviceId to null', () => {
      // First set it to something
      act(() => {
        useSwingStore.getState().setSelectedCameraDeviceId('camera-device-123')
      })
      expect(useSwingStore.getState().selectedCameraDeviceId).toBe('camera-device-123')

      // Then set to null
      act(() => {
        useSwingStore.getState().setSelectedCameraDeviceId(null)
      })
      expect(useSwingStore.getState().selectedCameraDeviceId).toBeNull()
    })
  })

  describe('setHandedness action', () => {
    it('should update handedness to "left"', () => {
      act(() => {
        useSwingStore.getState().setHandedness('left')
      })
      expect(useSwingStore.getState().handedness).toBe('left')
    })

    it('should update handedness to "right"', () => {
      // First set to left
      act(() => {
        useSwingStore.getState().setHandedness('left')
      })
      expect(useSwingStore.getState().handedness).toBe('left')

      // Then set back to right
      act(() => {
        useSwingStore.getState().setHandedness('right')
      })
      expect(useSwingStore.getState().handedness).toBe('right')
    })

    it('should maintain "right" if already "right" and set to "right"', () => {
        expect(useSwingStore.getState().handedness).toBe('right'); // Initial
        act(() => {
          useSwingStore.getState().setHandedness('right');
        });
        expect(useSwingStore.getState().handedness).toBe('right');
      });
  })
})
