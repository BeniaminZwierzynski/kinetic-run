"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getWorkoutByIdFromDB, updateWorkoutInDB, WorkoutDetail } from "@/lib/storage";
import { WORKOUT_TYPES, RATING_LABELS, RATING_COLORS, Workout } from "@/types/workout";
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
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [modalRating, setModalRating] = useState<Workout["rating"]>(undefined);
  const [modalNotes, setModalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user || !params.id) {
        setLoading(false);
        return;
      }
      const data = await getWorkoutByIdFromDB(params.id as string);
      setWorkout(data);
      // Show rating modal if no rating yet
      if (data && !data.rating) {
        setModalNotes(data.notes || "");
        setShowRatingModal(true);
      }
      setLoading(false);
    }
    load();
  }, [user, params.id]);

  async function handleSaveRating() {
    if (!workout) return;
    setSaving(true);
    await updateWorkoutInDB(workout.id, {
      rating: modalRating || undefined,
      notes: modalNotes || undefined,
    });
    setWorkout({ ...workout, rating: modalRating, notes: modalNotes || undefined });
    setShowRatingModal(false);
    setSaving(false);
  }

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

      {/* Rating */}
      {workout.rating && (
        <section className="mb-8 animate-fade-in-up">
          <span className="font-[family-name:var(--font-label)] text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block mb-2">
            Trudnosc
          </span>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-white text-sm font-bold ${RATING_COLORS[workout.rating]}`}>
              {RATING_LABELS[workout.rating]}
            </span>
            <button
              onClick={() => {
                setModalRating(workout.rating);
                setModalNotes(workout.notes || "");
                setShowRatingModal(true);
              }}
              className="text-on-surface-variant text-xs hover:text-white transition-colors"
            >
              Zmien
            </button>
          </div>
        </section>
      )}

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

      {/* Edit button when no rating */}
      {!workout.rating && !showRatingModal && (
        <section className="mb-8">
          <button
            onClick={() => {
              setModalNotes(workout.notes || "");
              setShowRatingModal(true);
            }}
            className="w-full py-4 bg-surface-container-high rounded-2xl text-on-surface-variant text-sm font-bold hover:bg-surface-bright transition-all font-[family-name:var(--font-lexend)] uppercase tracking-widest"
          >
            + Dodaj ocene i notatke
          </button>
        </section>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-surface-container rounded-t-3xl p-6 pb-10 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-[family-name:var(--font-lexend)] text-lg font-bold text-white uppercase tracking-wider">
                Ocen trening
              </h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-on-surface-variant hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Rating buttons */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-3 font-[family-name:var(--font-label)]">
                Jak ciezki byl trening?
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(RATING_LABELS) as [NonNullable<Workout["rating"]>, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setModalRating(key)}
                      className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 font-[family-name:var(--font-lexend)] ${
                        modalRating === key
                          ? `${RATING_COLORS[key]} text-white shadow-lg scale-105`
                          : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Notes textarea */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2 font-[family-name:var(--font-label)]">
                Notatka (opcjonalnie)
              </label>
              <textarea
                rows={3}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Jak sie czules? Pogoda? Nawierzchnia?"
                className="w-full bg-surface-container-high text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:bg-surface-bright transition-colors placeholder:text-on-surface-variant/50 resize-none"
              />
            </div>

            <button
              onClick={handleSaveRating}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-b from-accent-green to-accent-green-dim text-white font-[family-name:var(--font-lexend)] font-black text-base tracking-widest rounded-full uppercase active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              {saving ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
