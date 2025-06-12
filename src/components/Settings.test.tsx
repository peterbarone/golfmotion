import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Settings } from './Settings'
import { useSwingStore } from '../store/swingStore'

// Mock the store
jest.mock('../store/swingStore')

const mockUseSwingStore = useSwingStore as jest.MockedFunction<typeof useSwingStore>

// Mock navigator.mediaDevices.enumerateDevices
const mockEnumerateDevices = jest.fn()
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    enumerateDevices: mockEnumerateDevices,
  },
  configurable: true,
})

const mockVideoDevices: MediaDeviceInfo[] = [
  { deviceId: 'cam1', label: 'Camera 1', kind: 'videoinput', toJSON: () => ({}) },
  { deviceId: 'cam2', label: 'Camera 2', kind: 'videoinput', toJSON: () => ({}) },
  { deviceId: 'audio1', label: 'Microphone 1', kind: 'audioinput', toJSON: () => ({}) },
]

describe('Settings Component', () => {
  let mockSetSelectedCameraDeviceId: jest.Mock
  let mockSetHandedness: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetSelectedCameraDeviceId = jest.fn()
    mockSetHandedness = jest.fn()

    // Default mock store state
    mockUseSwingStore.mockReturnValue({
      selectedCameraDeviceId: null,
      handedness: 'right',
      setSelectedCameraDeviceId: mockSetSelectedCameraDeviceId,
      setHandedness: mockSetHandedness,
      // Add other store properties if Settings component uses them, even if not directly tested here
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
      setSwingState: jest.fn(),
      startSwing: jest.fn(),
      recordTransition: jest.fn(),
      finishSwing: jest.fn(),
      resetSwing: jest.fn(),
      setShowHistory: jest.fn(),
      setCameraEnabled: jest.fn(),
      setDetectionActive: jest.fn(),
      setBackswingTime: jest.fn(),
      setDownswingTime: jest.fn(),
    })

    mockEnumerateDevices.mockResolvedValue([]) // Default to no devices
  })

  it('renders without crashing', async () => {
    render(<Settings />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Select Camera')).toBeInTheDocument()
    expect(screen.getByText('Handedness')).toBeInTheDocument()
    // Check for radio buttons by role and name (or label)
    expect(screen.getByRole('radio', { name: 'Left' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Right' })).toBeInTheDocument()
  })

  describe('Camera Selection', () => {
    it('shows "Loading cameras..." initially', () => {
      mockEnumerateDevices.mockImplementation(() => new Promise(() => {})) // Simulate loading forever
      render(<Settings />)
      expect(screen.getByText('Loading cameras...')).toBeInTheDocument()
    })

    it('shows "No cameras found." if enumerateDevices returns empty or no video devices', async () => {
      mockEnumerateDevices.mockResolvedValueOnce(
        mockVideoDevices.filter(dev => dev.kind !== 'videoinput')
      );
      render(<Settings />)
      await waitFor(() => {
        expect(screen.getByText('No cameras found.')).toBeInTheDocument()
      })
    })

    it('populates camera dropdown and reflects store selection', async () => {
      mockEnumerateDevices.mockResolvedValue(mockVideoDevices)
      mockUseSwingStore.mockReturnValueOnce({
        ...mockUseSwingStore(), // current mock values
        selectedCameraDeviceId: 'cam2',
        handedness: 'right',
        setSelectedCameraDeviceId: mockSetSelectedCameraDeviceId,
        setHandedness: mockSetHandedness,
      })

      render(<Settings />)

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Camera 1' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Camera 2' })).toBeInTheDocument()
      })

      const selectElement = screen.getByLabelText('Select Camera') as HTMLSelectElement
      expect(selectElement.value).toBe('cam2')
    })

    it('calls setSelectedCameraDeviceId when a camera is selected', async () => {
      mockEnumerateDevices.mockResolvedValue(mockVideoDevices)
      render(<Settings />)

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Camera 1' })).toBeInTheDocument()
      })

      const selectElement = screen.getByLabelText('Select Camera')
      fireEvent.change(selectElement, { target: { value: 'cam1' } })

      expect(mockSetSelectedCameraDeviceId).toHaveBeenCalledWith('cam1')
    })

     it('calls setSelectedCameraDeviceId with null when "-- Select a Camera --" is chosen', async () => {
      mockEnumerateDevices.mockResolvedValue(mockVideoDevices)
      mockUseSwingStore.mockReturnValueOnce({
        ...mockUseSwingStore(),
        selectedCameraDeviceId: 'cam1', // Pre-select a camera
        handedness: 'right',
        setSelectedCameraDeviceId: mockSetSelectedCameraDeviceId,
        setHandedness: mockSetHandedness,
      });
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Camera 1' })).toBeInTheDocument();
      });

      const selectElement = screen.getByLabelText('Select Camera');
      fireEvent.change(selectElement, { target: { value: '' } }); // Select the default empty option

      expect(mockSetSelectedCameraDeviceId).toHaveBeenCalledWith(null);
    });
  })

  describe('Handedness Selection', () => {
    it('reflects store handedness selection ("right" default)', () => {
      render(<Settings />) // Default mock has 'right'
      const rightRadio = screen.getByRole('radio', { name: 'Right' }) as HTMLInputElement
      expect(rightRadio.checked).toBe(true)
      const leftRadio = screen.getByRole('radio', { name: 'Left' }) as HTMLInputElement
      expect(leftRadio.checked).toBe(false)
    })

    it('reflects store handedness selection ("left")', () => {
      mockUseSwingStore.mockReturnValueOnce({
         ...mockUseSwingStore(),
        selectedCameraDeviceId: null,
        handedness: 'left', // Set to left
        setSelectedCameraDeviceId: mockSetSelectedCameraDeviceId,
        setHandedness: mockSetHandedness,
      })
      render(<Settings />)
      const leftRadio = screen.getByRole('radio', { name: 'Left' }) as HTMLInputElement
      expect(leftRadio.checked).toBe(true)
      const rightRadio = screen.getByRole('radio', { name: 'Right' }) as HTMLInputElement
      expect(rightRadio.checked).toBe(false)
    })

    it('calls setHandedness when "Left" is selected', () => {
      render(<Settings />)
      const leftRadio = screen.getByRole('radio', { name: 'Left' })
      fireEvent.click(leftRadio)
      expect(mockSetHandedness).toHaveBeenCalledWith('left')
    })

    it('calls setHandedness when "Right" is selected (after "Left" was selected)', () => {
      mockUseSwingStore.mockReturnValueOnce({
        ...mockUseSwingStore(),
        handedness: 'left', // Start with left
        setSelectedCameraDeviceId: mockSetSelectedCameraDeviceId,
        setHandedness: mockSetHandedness,
      })
      render(<Settings />)
      const rightRadio = screen.getByRole('radio', { name: 'Right' })
      fireEvent.click(rightRadio)
      expect(mockSetHandedness).toHaveBeenCalledWith('right')
    })
  })

  it('handles error during device enumeration', async () => {
    mockEnumerateDevices.mockRejectedValueOnce(new Error("Device enumeration failed"));
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText("Could not access camera list. Please ensure permissions are granted.")).toBeInTheDocument();
    });
  });
})
