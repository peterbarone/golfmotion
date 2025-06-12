'use client'

import { useState } from 'react';
import SwingDisplay from "../components/SwingDisplay";
import CameraDetector from "../components/CameraDetector";
import { Settings } from '../components/Settings'; // Assuming correct path

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main className="max-w-4xl mx-auto p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Golf Swing Tempo Trainer
        </h1>
        <p className="text-gray-600">
          Perfect your golf swing with the ideal 3:1 ratio
        </p>
      </header>

      {/* Settings Toggle Button and Component */}
      <div className="mb-6 text-center">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition ease-in-out duration-150"
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
      </div>

      {showSettings && (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg shadow-md">
          <Settings />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <CameraDetector />
        </div>
        <div>
          <SwingDisplay />
        </div>
      </div>
    </main>
  );
}
