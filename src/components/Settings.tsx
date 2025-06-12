import React, { useEffect, useState } from 'react'
import { useSwingStore } from '../store/swingStore'

interface DeviceInfo {
  deviceId: string
  label: string
}

export const Settings: React.FC = () => {
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

  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCameraDeviceId(event.target.value || null)
  }

  const handleHandednessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHandedness(event.target.value as 'left' | 'right')
  }

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-teal-400">Settings</h2>

      {/* Camera Selection */}
      <div className="mb-6">
        <label htmlFor="camera-select" className="block text-sm font-medium text-gray-300 mb-1">
          Select Camera
        </label>
        {devicesLoading && <p className="text-sm text-gray-400">Loading cameras...</p>}
        {devicesError && <p className="text-sm text-red-400">{devicesError}</p>}
        {!devicesLoading && !devicesError && videoDevices.length === 0 && (
          <p className="text-sm text-yellow-400">No cameras found.</p>
        )}
        {!devicesLoading && !devicesError && videoDevices.length > 0 && (
          <select
            id="camera-select"
            value={selectedCameraDeviceId || ''}
            onChange={handleCameraChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
          >
            <option value="">-- Select a Camera --</option>
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Handedness Selection */}
      <div className="mb-4">
        <span className="block text-sm font-medium text-gray-300 mb-2">Handedness</span>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="handedness"
              value="left"
              checked={handedness === 'left'}
              onChange={handleHandednessChange}
              className="form-radio h-4 w-4 text-teal-500 bg-gray-700 border-gray-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-200">Left</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="handedness"
              value="right"
              checked={handedness === 'right'}
              onChange={handleHandednessChange}
              className="form-radio h-4 w-4 text-teal-500 bg-gray-700 border-gray-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-200">Right</span>
          </label>
        </div>
      </div>
    </div>
  )
}
