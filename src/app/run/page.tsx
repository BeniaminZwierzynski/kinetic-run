"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GeoPoint, totalDistance, currentPace, averagePace, lapPace } from "@/lib/geo";
import { saveWorkout, generateId, getWorkouts } from "@/lib/storage";
import { Workout } from "@/types/workout";
import { checkRecords } from "@/lib/coach";

type RunState = "ready" | "running" | "paused";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatPace(pace: number): string {
  if (pace <= 0 || pace > 30) return "- -";
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
}

export default function ActiveRun() {
  const router = useRouter();

  const [state, setState] = useState<RunState>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [gpsStatus, setGpsStatus] = useState<"waiting" | "active" | "error">("waiting");

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointsRef = useRef<GeoPoint[]>([]);
  const pausedTimeRef = useRef(0);

  const dist = totalDistance(points);
  const curPace = currentPace(points, 8);
  const avgPc = averagePace(points);
  const lapPc = lapPace(points);
  const calories = Math.round(dist * 65);

  // Keep pointsRef in sync
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsStatus("active");
        const point: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
        };

        // Filter out inaccurate readings (> 25m accuracy)
        if (pos.coords.accuracy > 25) return;

        // Filter out GPS jumps (> 100m in one reading)
        const prev = pointsRef.current;
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          const R = 6371000; // meters
          const dLat = ((point.lat - last.lat) * Math.PI) / 180;
          const dLng = ((point.lng - last.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((last.lat * Math.PI) / 180) *
              Math.cos((point.lat * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          const jumpDist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          if (jumpDist > 100) return;
        }

        setPoints((prev) => [...prev, point]);
      },
      (err) => {
        console.error("GPS error:", err);
        setGpsStatus("error");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      }
    );
    watchIdRef.current = id;
  }, []);

  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGps();
      stopTimer();
    };
  }, [stopGps, stopTimer]);

  function handleStart() {
    setState("running");
    startGps();
    startTimer();
  }

  function handlePause() {
    setState("paused");
    pausedTimeRef.current = elapsed;
    stopGps();
    stopTimer();
  }

  function handleResume() {
    setState("running");
    startGps();
    startTimer();
  }

  function handleFinish() {
    stopGps();
    stopTimer();

    if (dist >= 0.1) {
      const totalMin = elapsed / 60;
      const pace = totalMin / dist;

      const previousWorkouts = getWorkouts();

      const workout: Workout = {
        id: generateId(),
        date: new Date().toISOString().split("T")[0],
        distance: Math.round(dist * 100) / 100,
        duration: Math.round(totalMin),
        pace: Math.round(pace * 100) / 100,
        type: "easy",
        notes: `GPS tracked - ${points.length} points`,
      };
      saveWorkout(workout);

      // Check for new records
      checkRecords(workout, previousWorkouts);
    }

    router.push("/");
  }

  // ---- READY STATE ----
  if (state === "ready") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
        <div className="text-center">
          <h2 className="font-[family-name:var(--font-lexend)] font-extrabold text-4xl text-white tracking-tighter mb-2">
            READY?
          </h2>
          <p className="text-on-surface-variant text-sm">
            {gpsStatus === "waiting" && "Tap START to begin tracking"}
            {gpsStatus === "error" && "GPS unavailable - check permissions"}
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-48 h-48 rounded-full bg-gradient-to-b from-primary to-primary-container text-on-primary font-[family-name:var(--font-lexend)] font-black text-3xl tracking-widest shadow-[0_20px_60px_rgba(255,255,255,0.2)] active:scale-95 transition-all duration-300 flex items-center justify-center"
        >
          START
        </button>

        <button
          onClick={() => router.push("/")}
          className="text-on-surface-variant text-sm hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  // ---- ACTIVE / PAUSED STATE ----
  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* GPS indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className={`w-2 h-2 rounded-full ${
            gpsStatus === "active"
              ? "bg-green-500 animate-pulse"
              : gpsStatus === "error"
              ? "bg-red-500"
              : "bg-yellow-500 animate-pulse"
          }`}
        />
        <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase font-[family-name:var(--font-label)]">
          {gpsStatus === "active" ? "GPS Active" : gpsStatus === "error" ? "GPS Error" : "Waiting..."}
          {state === "paused" && " - PAUSED"}
        </span>
      </div>

      {/* Main Timer */}
      <section className="mb-8">
        <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-[0.4em] text-on-surface-variant uppercase mb-2 block">
          Czas treningu
        </span>
        <h1 className="font-[family-name:var(--font-lexend)] text-[5.5rem] font-extrabold text-white leading-none tracking-tighter">
          {formatTime(elapsed)}
        </h1>
      </section>

      {/* Distance */}
      <section className="mb-8">
        <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-[0.4em] text-on-surface-variant uppercase mb-2 block">
          Dystans
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-lexend)] text-5xl font-bold text-white">
            {dist.toFixed(2)}
          </span>
          <span className="font-[family-name:var(--font-label)] text-sm font-bold text-on-surface-variant">
            KM
          </span>
        </div>
      </section>

      {/* Current Pace - Large */}
      <section className="bg-surface-container-low rounded-2xl p-6 mb-6">
        <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-[0.4em] text-on-surface-variant uppercase mb-2 block">
          Aktualne tempo
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-lexend)] text-7xl font-extrabold text-white tracking-tighter">
            {formatPace(curPace)}
          </span>
          <span className="font-[family-name:var(--font-label)] text-sm font-bold text-on-surface-variant">
            /KM
          </span>
        </div>

        {/* Avg + Lap pace */}
        <div className="flex gap-8 mt-4 pt-4">
          <div>
            <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block mb-1">
              Srednie (calosc)
            </span>
            <span className="font-[family-name:var(--font-lexend)] text-xl font-bold text-white">
              {formatPace(avgPc)}
            </span>
          </div>
          <div>
            <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block mb-1">
              Srednie (okr.)
            </span>
            <span className="font-[family-name:var(--font-lexend)] text-xl font-bold text-white">
              {formatPace(lapPc)}
            </span>
          </div>
        </div>
      </section>

      {/* HR + Calories row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-container rounded-2xl p-4 text-center">
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block mb-2">
            Kalorie
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-on-surface-variant">🔥</span>
            <span className="font-[family-name:var(--font-lexend)] text-xl font-bold text-white">
              {calories}
            </span>
            <span className="font-[family-name:var(--font-label)] text-[10px] text-on-surface-variant">
              KCAL
            </span>
          </div>
        </div>
        <div className="bg-surface-container rounded-2xl p-4 text-center">
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block mb-2">
            Punkty GPS
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-on-surface-variant">📍</span>
            <span className="font-[family-name:var(--font-lexend)] text-xl font-bold text-white">
              {points.length}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-auto">
        <button
          onClick={handleFinish}
          className="flex-1 py-5 bg-red-900/80 hover:bg-red-800 text-white rounded-full font-[family-name:var(--font-lexend)] font-black text-base tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300"
        >
          <span>◻</span> Zakoncz
        </button>

        {state === "running" ? (
          <button
            onClick={handlePause}
            className="flex-1 py-5 bg-surface-container-highest hover:bg-surface-bright text-white rounded-full font-[family-name:var(--font-lexend)] font-black text-base tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300"
          >
            <span>⏸</span> Pauza
          </button>
        ) : (
          <button
            onClick={handleResume}
            className="flex-1 py-5 bg-gradient-to-b from-primary to-primary-container text-on-primary rounded-full font-[family-name:var(--font-lexend)] font-black text-base tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300"
          >
            <span>▶</span> Wznow
          </button>
        )}
      </div>
    </div>
  );
}
