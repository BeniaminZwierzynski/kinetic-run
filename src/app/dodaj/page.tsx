"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkouts } from "@/lib/use-workouts";
import { Workout, WORKOUT_TYPES } from "@/types/workout";

export default function AddWorkout() {
  const router = useRouter();
  const { addWorkout } = useWorkouts();
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [distance, setDistance] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [type, setType] = useState<Workout["type"]>("easy");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const dist = parseFloat(distance);
    const totalMinutes =
      (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0) + (parseInt(seconds) || 0) / 60;

    if (!dist || !totalMinutes) return;

    const pace = totalMinutes / dist;

    await addWorkout({
      date,
      distance: dist,
      duration: Math.round(totalMinutes),
      pace: Math.round(pace * 100) / 100,
      type,
      notes: notes || undefined,
    });

    router.push("/");
  }

  const inputClasses =
    "w-full bg-surface-container-high text-white rounded-full px-5 py-4 text-base focus:outline-none focus:bg-surface-bright transition-colors duration-300 font-[family-name:var(--font-body)] placeholder:text-on-surface-variant/50";

  return (
    <div>
      <section className="mb-10">
        <p className="font-[family-name:var(--font-label)] text-sm uppercase tracking-[0.3em] text-on-surface-variant mb-2">
          New Entry
        </p>
        <h2 className="font-[family-name:var(--font-lexend)] text-4xl font-black tracking-tight text-white leading-none">
          LOG RUN
        </h2>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2 font-[family-name:var(--font-label)]">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Distance */}
        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2 font-[family-name:var(--font-label)]">
            Distance (km)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 5.5"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className={inputClasses}
            required
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2 font-[family-name:var(--font-label)]">
            Duration
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1">
              <input
                type="number"
                min="0"
                max="23"
                placeholder="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={inputClasses + " text-center"}
              />
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">HRS</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className={inputClasses + " text-center"}
                required
              />
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">MIN</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className={inputClasses + " text-center"}
              />
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">SEC</span>
            </div>
          </div>
        </div>

        {/* Workout Type */}
        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2 font-[family-name:var(--font-label)]">
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(WORKOUT_TYPES) as [Workout["type"], string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 font-[family-name:var(--font-lexend)] ${
                    type === key
                      ? "bg-primary text-on-primary shadow-xl scale-105"
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2 font-[family-name:var(--font-label)]">
            Notes (optional)
          </label>
          <textarea
            rows={3}
            placeholder="How did it feel? Weather? Surface?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-surface-container-high text-white rounded-2xl px-5 py-4 text-base focus:outline-none focus:bg-surface-bright transition-colors duration-300 font-[family-name:var(--font-body)] placeholder:text-on-surface-variant/50 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-5 bg-gradient-to-b from-primary to-primary-container text-on-primary font-[family-name:var(--font-lexend)] font-black text-xl tracking-widest rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-300 uppercase"
        >
          Save Run
        </button>
      </form>
    </div>
  );
}
