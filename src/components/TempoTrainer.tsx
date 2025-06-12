'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { FaPlay, FaRedo, FaHistory } from 'react-icons/fa'

// One recorded swing entry
interface SwingHistoryItem {
  id: number
  backswingTime: number
  downswingTime: number
  tempoRatio: number
  timestamp: string
  quality: 'good' | 'close' | 'off'
}

const TempoTrainer = () => {
  // Swing state machine
  const [swingState, setSwingState] = useState<'ready' | 'backswing' | 'transition' | 'downswing' | 'complete'>('ready')
  // Timestamps
  const [startTime, setStartTime] = useState(0)
  const [transitionTime, setTransitionTime] = useState(0)
  // Calculated times
  const [backswingTime, setBackswingTime] = useState(0)
  const [downswingTime, setDownswingTime] = useState(0)
  // Ratio & history
  const [tempoRatio, setTempoRatio] = useState<number | null>(null)
  const [swingHistory, setSwingHistory] = useState<SwingHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const toast = useToast()

  /* -------------------- persistence -------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('swingHistory')
      if (raw) setSwingHistory(JSON.parse(raw))
    } catch (err) {
      console.error('Failed to parse swing history', err)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('swingHistory', JSON.stringify(swingHistory))
    } catch {
      /* empty */
    }
  }, [swingHistory])

  /* -------------------- helpers -------------------- */
  const tempoColor = (ratio: number | null) => {
    if (ratio === null) return 'text-gray-400'
    if (ratio >= 2.7 && ratio <= 3.3) return 'text-green-500'
    if ((ratio >= 2.4 && ratio < 2.7) || (ratio > 3.3 && ratio <= 3.6)) return 'text-yellow-500'
    return 'text-red-500'
  }

  const badgeColor = (q: SwingHistoryItem['quality']) =>
    q === 'good' ? 'bg-green-500' : q === 'close' ? 'bg-yellow-500' : 'bg-red-500'

  /* -------------------- handlers -------------------- */
  const startSwing = () => {
    setSwingState('backswing')
    setStartTime(Date.now())
    toast('Backswing started', { type: 'info', duration: 1000 })
  }

  const recordTransition = () => {
    const now = Date.now()
    const back = (now - startTime) / 1000
    setBackswingTime(back)
    setTransitionTime(now)
    setSwingState('downswing')
    toast('Transition recorded', { type: 'info', duration: 1000 })
  }

  const finishSwing = () => {
    const now = Date.now()
    const down = (now - transitionTime) / 1000
    setDownswingTime(down)
    setSwingState('complete')

    const ratio = Number((backswingTime / down).toFixed(1))
    setTempoRatio(ratio)

    let quality: SwingHistoryItem['quality'] = 'off'
    if (ratio >= 2.7 && ratio <= 3.3) quality = 'good'
    else if ((ratio >= 2.4 && ratio < 2.7) || (ratio > 3.3 && ratio <= 3.6)) quality = 'close'

    const newSwing: SwingHistoryItem = {
      id: Date.now(),
      backswingTime,
      downswingTime: down,
      tempoRatio: ratio,
      timestamp: new Date().toLocaleTimeString(),
      quality,
    }
    setSwingHistory([newSwing, ...swingHistory].slice(0, 10))

    toast(`Tempo ratio: ${ratio.toFixed(1)}`, {
      type: quality === 'good' ? 'success' : quality === 'close' ? 'warning' : 'error',
      duration: 3000,
    })
  }

  const resetSwing = () => {
    setSwingState('ready')
    setBackswingTime(0)
    setDownswingTime(0)
    setTempoRatio(null)
  }

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
            swingState === 'backswing' ? 'bg-green-50 dark:bg-green-900' : ''
          }`}
        >
          <p className="text-3xl font-bold">{backswingTime.toFixed(1)}</p>
          <p className="text-xs text-gray-500">BACKSWING (SEC)</p>
        </div>
        <div
          className={`border rounded-md p-4 text-center ${
            swingState === 'downswing' ? 'bg-green-50 dark:bg-green-900' : ''
          }`}
        >
          <p className="text-3xl font-bold">{downswingTime.toFixed(1)}</p>
          <p className="text-xs text-gray-500">DOWNSWING (SEC)</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={startSwing}
          disabled={swingState !== 'ready'}
          className="flex items-center justify-center gap-2 py-2 rounded-md bg-green-600 text-white disabled:bg-green-200"
        >
          <FaPlay /> START
        </button>
        <button
          onClick={recordTransition}
          disabled={swingState !== 'backswing'}
          className="py-2 rounded-md bg-blue-600 text-white disabled:bg-blue-200"
        >
          TOP
        </button>
        <button
          onClick={finishSwing}
          disabled={swingState !== 'downswing'}
          className="col-span-2 py-2 rounded-md bg-blue-600 text-white disabled:bg-blue-200"
        >
          FINISH
        </button>
        <button
          onClick={resetSwing}
          className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-md border"
        >
          <FaRedo /> RESET
        </button>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
        <p className="font-semibold mb-2">How to use:</p>
        <ul className="list-decimal pl-5 space-y-1">
          <li>Press START as you begin your backswing</li>
          <li>Press TOP at the transition point</li>
          <li>Press FINISH when your swing is complete</li>
          <li>Check your tempo ratio (ideal is 3:1)</li>
        </ul>
      </div>

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
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

export default TempoTrainer