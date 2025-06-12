'use client'

import React from 'react' // Removed useEffect, useState for now
import { FaRedo, FaHistory } from 'react-icons/fa' // Removed FaPlay
import { useSwingStore, tempoColor, badgeColor, SwingHistoryItem } from '../store/swingStore' // Import store and types

const SwingDisplay = () => {
  const {
    swingState,
    backswingTime,
    downswingTime,
    tempoRatio,
    swingHistory,
    showHistory,
    resetSwing, // Action from store
    setShowHistory, // Action from store
  } = useSwingStore()

  // Removed local state: swingState, startTime, transitionTime, backswingTime, downswingTime, tempoRatio, swingHistory, localShowHistory
  // Removed toast = useToast()
  // Removed useEffect for localStorage
  // Removed local helper functions (tempoColor, badgeColor) - now imported
  // Removed local handlers: startSwing, recordTransition, finishSwing, localResetSwing

  /* -------------------- render -------------------- */
  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Tempo ratio */}
      <div className="flex flex-col items-center mb-6">
        <p className="text-sm text-gray-500 mb-1">TEMPO RATIO</p>
        <h1 className={`text-5xl font-bold ${tempoColor(tempoRatio)} mb-1`}>
          {tempoRatio ? tempoRatio.toFixed(1) : '-.-'}
        </h1>
        <p className="text-sm text-gray-600">Ideal: 3:1 ratio</p>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className={`border rounded-md p-4 text-center ${
            swingState === 'backswing' ? 'bg-green-50 dark:bg-green-900' : '' // Uses swingState from store
          }`}
        >
          <p className="text-3xl font-bold">{backswingTime.toFixed(1)}</p>
          <p className="text-xs text-gray-500">BACKSWING (SEC)</p>
        </div>
        <div
          className={`border rounded-md p-4 text-center ${
            swingState === 'downswing' ? 'bg-green-50 dark:bg-green-900' : '' // Uses swingState from store
          }`}
        >
          <p className="text-3xl font-bold">{downswingTime.toFixed(1)}</p>
          <p className="text-xs text-gray-500">DOWNSWING (SEC)</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-3 mb-6"> {/* Updated grid to single column for Reset button */}
        {/* Removed START, TOP, FINISH buttons and their handlers */}
        <button
          onClick={resetSwing} // Uses resetSwing from store
          className="col-span-1 flex items-center justify-center gap-2 py-2 rounded-md border" // Adjusted col-span
        >
          <FaRedo /> RESET
        </button>
      </div>

      {/* Instructions Removed */}

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)} // Uses setShowHistory and showHistory from store
        className="flex items-center gap-2 mb-3 text-sm text-blue-600 hover:underline"
      >
        <FaHistory /> {showHistory ? 'Hide History' : 'Show Swing History'}
      </button>

      {/* History list */}
      {showHistory && (
        <div className="space-y-3 max-h-64 overflow-y-auto text-sm">
          {swingHistory.length ? (
            swingHistory.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center border p-2 rounded-md"
              >
                <span>{s.timestamp}</span>
                <span>
                  {s.backswingTime.toFixed(1)}s / {s.downswingTime.toFixed(1)}s
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-white text-xs ${badgeColor(s.quality)}`}
                >
                  {s.tempoRatio.toFixed(1)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No swing history yet</p>
          )}
        </div>
      )}
    </div>
  )
}

export default SwingDisplay