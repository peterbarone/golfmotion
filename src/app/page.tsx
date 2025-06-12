'use client'

import TempoTrainer from "../components/TempoTrainer";

export default function Home() {
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
      <TempoTrainer />
    </main>
  );
}
