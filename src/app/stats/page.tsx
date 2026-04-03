"use client";

import { useState } from "react";
import { useWorkouts } from "@/lib/use-workouts";
import { Workout } from "@/types/workout";

function formatPace(pace: number): string {
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
}

export default function Stats() {
  const { workouts: raw } = useWorkouts();
  const workouts = [...raw].sort((a, b) => a.date.localeCompare(b.date));

  const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
  const totalTime = workouts.reduce((sum, w) => sum + w.duration, 0);
  const avgPace = workouts.length > 0 ? workouts.reduce((sum, w) => sum + w.pace, 0) / workouts.length : 0;
  const totalCalories = Math.round(totalDistance * 65);

  // Last 7 runs for pace trend
  const recentRuns = workouts.slice(-7);

  return (
    <div>
      {/* Header */}
      <section className="mb-12 animate-fade-in-up">
        <p className="font-[family-name:var(--font-label)] text-sm uppercase tracking-[0.3em] text-on-surface-variant mb-2">
          Analytics
        </p>
        <h2 className="font-[family-name:var(--font-lexend)] text-5xl font-black tracking-tight text-accent-purple leading-none">
          STATS
        </h2>
      </section>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-12 animate-fade-in-up stagger">
        <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between h-36">
          <span className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            Total Runs
          </span>
          <span className="font-[family-name:var(--font-lexend)] text-4xl font-black text-accent-blue">
            {workouts.length}
          </span>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between h-36">
          <span className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            Total Distance
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-[family-name:var(--font-lexend)] text-4xl font-black text-accent-green">
              {totalDistance.toFixed(1)}
            </span>
            <span className="text-on-surface-variant text-sm">KM</span>
          </div>
        </div>
        <div className="bg-surface-container p-6 rounded-2xl flex flex-col justify-between h-36">
          <span className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            Avg Pace
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-[family-name:var(--font-lexend)] text-4xl font-black text-accent-orange">
              {avgPace > 0 ? formatPace(avgPace) : "- -"}
            </span>
            <span className="text-on-surface-variant text-sm">/KM</span>
          </div>
        </div>
        <div className="bg-surface-container p-6 rounded-2xl flex flex-col justify-between h-36">
          <span className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            Total Time
          </span>
          <div>
            <span className="font-[family-name:var(--font-lexend)] text-4xl font-black text-accent-blue">
              {Math.floor(totalTime / 60)}
            </span>
            <span className="text-on-surface-variant text-sm ml-1">hrs</span>
          </div>
        </div>
        <div className="col-span-2 bg-surface-container-high p-6 rounded-2xl flex flex-col justify-between h-36">
          <span className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            Total Calories Burned
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-[family-name:var(--font-lexend)] text-5xl font-black text-accent-orange">
              {totalCalories.toLocaleString()}
            </span>
            <span className="text-on-surface-variant text-sm">KCAL</span>
          </div>
        </div>
      </div>

      {/* Pace Trend */}
      {recentRuns.length > 1 && (
        <section className="mb-12 animate-fade-in-up">
          <h3 className="font-[family-name:var(--font-lexend)] font-bold text-lg text-white uppercase tracking-wider mb-6 px-2">
            Pace Trend
          </h3>
          <div className="bg-surface-container-low rounded-2xl p-6">
            <div className="flex items-end justify-between h-40 gap-3">
              {recentRuns.map((w, i) => {
                const maxPace = Math.max(...recentRuns.map((r) => r.pace));
                const minPace = Math.min(...recentRuns.map((r) => r.pace));
                const range = maxPace - minPace || 1;
                // Invert: lower pace = taller bar (faster)
                const height = ((maxPace - w.pace) / range) * 70 + 30;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[9px] text-on-surface-variant font-bold">
                      {formatPace(w.pace)}
                    </span>
                    <div
                      className="w-full bg-accent-green rounded-t-full transition-all"
                      style={{ height: `${height}%`, opacity: 0.4 + (i / recentRuns.length) * 0.6 }}
                    />
                    <span className="text-[9px] text-zinc-500">
                      {new Date(w.date).toLocaleDateString("pl-PL", { day: "numeric", month: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
