"use client";

import { useEffect, useState } from "react";
import { getWorkouts, deleteWorkout } from "@/lib/storage";
import { Workout, WORKOUT_TYPES } from "@/types/workout";

function formatPace(pace: number): string {
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
}

export default function Logs() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  function loadWorkouts() {
    const data = getWorkouts().sort((a, b) => b.date.localeCompare(a.date));
    setWorkouts(data);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this run?")) {
      deleteWorkout(id);
      loadWorkouts();
    }
  }

  const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
  const avgPace = workouts.length > 0 ? workouts.reduce((sum, w) => sum + w.pace, 0) / workouts.length : 0;

  return (
    <div>
      {/* Header */}
      <section className="mb-12">
        <p className="font-[family-name:var(--font-label)] text-sm uppercase tracking-[0.3em] text-on-surface-variant mb-2">
          Performance Archive
        </p>
        <h2 className="font-[family-name:var(--font-lexend)] text-5xl font-black tracking-tight text-white leading-none">
          LOGS
        </h2>
      </section>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between h-32">
          <span className="font-[family-name:var(--font-label)] text-xs uppercase tracking-widest text-on-surface-variant">
            Total Distance
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-[family-name:var(--font-lexend)] text-3xl font-bold text-white">
              {totalDistance.toFixed(1)}
            </span>
            <span className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant">KM</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between h-32">
          <span className="font-[family-name:var(--font-label)] text-xs uppercase tracking-widest text-on-surface-variant">
            Avg Pace
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-[family-name:var(--font-lexend)] text-3xl font-bold text-white">
              {avgPace > 0 ? formatPace(avgPace) : "- -"}
            </span>
            <span className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant">/KM</span>
          </div>
        </div>
      </div>

      {/* History List */}
      {workouts.length === 0 ? (
        <div className="bg-surface-container rounded-2xl p-8 text-center">
          <p className="text-on-surface-variant">No runs logged yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((w) => (
            <div
              key={w.id}
              className="group bg-surface-container p-4 rounded-2xl cursor-pointer hover:bg-surface-container-high transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-[family-name:var(--font-lexend)] text-lg font-bold text-white uppercase tracking-tight">
                    {WORKOUT_TYPES[w.type]} Run
                  </h3>
                  <p className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant">
                    {new Date(w.date).toLocaleDateString("pl-PL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="text-on-surface-variant/50 hover:text-error text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Distance
                  </p>
                  <p className="font-[family-name:var(--font-lexend)] text-lg font-bold text-white">
                    {w.distance} <span className="text-xs font-normal">KM</span>
                  </p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Pace
                  </p>
                  <p className="font-[family-name:var(--font-lexend)] text-lg font-bold text-white">
                    {formatPace(w.pace)}
                  </p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Time
                  </p>
                  <p className="font-[family-name:var(--font-lexend)] text-lg font-bold text-white">
                    {w.duration} min
                  </p>
                </div>
              </div>
              {w.notes && (
                <p className="text-sm text-on-surface-variant/70 mt-3">{w.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
