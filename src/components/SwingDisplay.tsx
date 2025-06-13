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
    <div>
      {/* Tempo ratio */}
      <div className="flex flex-col items-center mb-8 relative">
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-28 h-28 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden">
          <div className="text-center">
            <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">Tempo</p>
            <h1 className={`text-3xl font-bold ${tempoColor(tempoRatio)}`}>
              {tempoRatio ? tempoRatio.toFixed(1) : '-.-'}
            </h1>
          </div>
        </div>
        <div className="pt-14 w-full">
          <p className="text-sm font-medium text-center text-gray-600 dark:text-gray-300 mt-2">Ideal: <span className="text-green-600 dark:text-green-400 font-bold">3:1</span> ratio</p>
        </div>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className={`relative overflow-hidden rounded-xl p-5 text-center ${
            swingState === 'backswing' 
              ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 shadow-lg transform scale-105 border-2 border-blue-200 dark:border-blue-700' 
              : 'bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-md'
          } transition-all duration-300`}
        >
          <div className="mb-1">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
              {backswingTime.toFixed(1)}
            </p>
            <p className="text-xs font-semibold tracking-wider text-blue-500 dark:text-blue-300 uppercase">Backswing</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">(seconds)</p>
          </div>
        </div>
        
        <div
          className={`relative overflow-hidden rounded-xl p-5 text-center ${
            swingState === 'downswing' 
              ? 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 shadow-lg transform scale-105 border-2 border-purple-200 dark:border-purple-700' 
              : 'bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-md'
          } transition-all duration-300`}
        >
          <div className="mb-1">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 tracking-tight">
              {downswingTime.toFixed(1)}
            </p>
            <p className="text-xs font-semibold tracking-wider text-purple-500 dark:text-purple-300 uppercase">Downswing</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">(seconds)</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-8"> 
        <button
          onClick={resetSwing}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold transition-colors duration-200 shadow-sm border border-gray-200 dark:border-gray-600"
        >
          <FaRedo className="text-gray-500 dark:text-gray-300" /> 
          <span>Reset Swing</span>
        </button>
      </div>

      {/* History section */}
      <div className="border-t pt-4 dark:border-gray-700">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 mb-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <FaHistory className="text-blue-500 dark:text-blue-400" /> 
          <span>{showHistory ? 'Hide History' : 'Show Swing History'}</span>
        </button>

        {/* History list */}
        {showHistory && (
          <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg bg-gray-50 dark:bg-gray-700 p-3 shadow-inner">
            {swingHistory.length ? (
              swingHistory.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center py-2 px-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow duration-200"
                >
                  <span className="text-xs text-gray-500 dark:text-gray-400">{s.timestamp}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      <span className="text-blue-600 dark:text-blue-400">{s.backswingTime.toFixed(1)}s</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-purple-600 dark:text-purple-400">{s.downswingTime.toFixed(1)}s</span>
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md text-white text-xs font-bold shadow-sm ${badgeColor(s.quality)}`}
                    >
                      {s.tempoRatio.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400 italic">No swing history yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SwingDisplay