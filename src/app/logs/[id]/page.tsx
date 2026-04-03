"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getWorkoutByIdFromDB, WorkoutDetail } from "@/lib/storage";
import { WORKOUT_TYPES } from "@/types/workout";
import dynamic from "next/dynamic";

// Lazy load map (Leaflet needs window)
const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

function formatPace(pace: number): string {
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user || !params.id) {
        setLoading(false);
        return;
      }
      const data = await getWorkoutByIdFromDB(params.id as string);
      setWorkout(data);
      setLoading(false);
    }
    load();
  }, [user, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-on-surface-variant font-[family-name:var(--font-lexend)] uppercase tracking-widest text-sm">
          Loading...
        </p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-on-surface-variant">Nie znaleziono treningu</p>
        <button
          onClick={() => router.push("/logs")}
          className="text-white text-sm hover:underline"
        >
          ← Wróć do logów
        </button>
      </div>
    );
  }

  const calories = Math.round(workout.distance * 65);
  const hasGps = workout.gpsPoints && workout.gpsPoints.length >= 2;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push("/logs")}
        className="text-on-surface-variant text-sm mb-6 hover:text-white transition-colors"
      >
        ← Wróć
      </button>

      {/* Header */}
      <section className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="font-[family-name:var(--font-lexend)] text-3xl font-black tracking-tight text-white uppercase">
            {WORKOUT_TYPES[workout.type]} Run
          </h2>
        </div>
        <p className="text-on-surface-variant font-[family-name:var(--font-label)] text-sm">
          {new Date(workout.date).toLocaleDateString("pl-PL", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </section>

      {/* Map */}
      <section className="mb-8 animate-fade-in-up">
        <RouteMap points={hasGps ? workout.gpsPoints! : []} />
      </section>

      {/* Main metrics */}
      <section className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up">
        <div className="bg-surface-container-low rounded-2xl p-5 flex flex-col items-center justify-center h-32">
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
            Dystans
          </span>
          <span className="font-[family-name:var(--font-lexend)] text-2xl font-black text-accent-green">
            {workout.distance}
          </span>
          <span className="font-[family-name:var(--font-label)] text-[10px] text-on-surface-variant">
            KM
          </span>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-5 flex flex-col items-center justify-center h-32">
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
            Tempo
          </span>
          <span className="font-[family-name:var(--font-lexend)] text-2xl font-black text-accent-orange">
            {formatPace(workout.pace)}
          </span>
          <span className="font-[family-name:var(--font-label)] text-[10px] text-on-surface-variant">
            /KM
          </span>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-5 flex flex-col items-center justify-center h-32">
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
            Czas
          </span>
          <span className="font-[family-name:var(--font-lexend)] text-2xl font-black text-accent-blue">
            {formatDuration(workout.duration)}
          </span>
        </div>
      </section>

      {/* Secondary metrics */}
      <section className="grid grid-cols-2 gap-4 mb-8 animate-fade-in-up">
        <div className="bg-surface-container rounded-2xl p-5">
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block mb-2">
            Kalorie
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="font-[family-name:var(--font-lexend)] text-xl font-bold text-accent-orange">
              {calories}
            </span>
            <span className="font-[family-name:var(--font-label)] text-[10px] text-on-surface-variant">
              KCAL
            </span>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-5">
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block mb-2">
            Typ
          </span>
          <span className="font-[family-name:var(--font-lexend)] text-xl font-bold text-white uppercase">
            {WORKOUT_TYPES[workout.type]}
          </span>
        </div>
      </section>

      {/* Notes */}
      {workout.notes && (
        <section className="mb-8">
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block mb-2">
            Notatki
          </span>
          <div className="bg-surface-container-low rounded-2xl p-5">
            <p className="text-on-surface text-sm leading-relaxed">{workout.notes}</p>
          </div>
        </section>
      )}
    </div>
  );
}
