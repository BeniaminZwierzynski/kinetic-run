"use client";

import { useEffect, useState } from "react";
import { Workout } from "@/types/workout";
import { useWorkouts } from "@/lib/use-workouts";
import { CoachMessage, generateCoachMessages, setupInactivityCheck } from "@/lib/coach";
import CoachChat from "@/components/CoachChat";
import Link from "next/link";

function formatPace(pace: number): string {
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m} min`;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split("T")[0];
}

export default function Dashboard() {
  const { workouts } = useWorkouts();
  const [latestCoachMsg, setLatestCoachMsg] = useState<CoachMessage | null>(null);

  useEffect(() => {
    if (workouts.length === 0) return;
    const msgs = generateCoachMessages(workouts);
    if (msgs.length > 0) setLatestCoachMsg(msgs[0]);
    const cleanup = setupInactivityCheck(workouts);
    return cleanup;
  }, [workouts]);

  const weekStart = getWeekStart();
  const weekWorkouts = workouts.filter((w) => w.date >= weekStart);
  const weekDistance = weekWorkouts.reduce((sum, w) => sum + w.distance, 0);
  const weekCalories = weekWorkouts.reduce((sum, w) => sum + Math.round(w.distance * 65), 0);
  const weekTime = weekWorkouts.reduce((sum, w) => sum + w.duration, 0);

  const lastWorkout = [...workouts].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div>
      {/* Hero Section */}
      <section className="mb-12 animate-fade-in-up">
        <h2 className="font-[family-name:var(--font-lexend)] font-extrabold text-5xl text-white tracking-tighter leading-none mb-4">
          READY TO<br />
          <span className="text-accent-green">EVOLVE?</span>
        </h2>
        <p className="font-[family-name:var(--font-body)] text-on-surface-variant max-w-xs ml-1">
          Today is a perfect day for a run. Let&apos;s go.
        </p>
      </section>

      {/* Start Run CTA */}
      <section className="mb-6 animate-fade-in-up">
        <Link
          href="/run"
          className="w-full py-8 bg-gradient-to-b from-accent-green to-accent-green-dim text-white font-[family-name:var(--font-lexend)] font-black text-2xl tracking-widest rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-4"
        >
          START RUNNING
          <span className="text-3xl">▶</span>
        </Link>
      </section>
      <section className="mb-12 text-center">
        <Link
          href="/dodaj"
          className="text-accent-blue text-sm font-[family-name:var(--font-label)] hover:text-white transition-colors uppercase tracking-widest"
        >
          or log manually →
        </Link>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 gap-4 mb-12 stagger animate-fade-in-up">
        <div className="col-span-2 bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between h-48 border-l-4 border-accent-green">
          <span className="text-on-surface-variant text-xs font-bold tracking-[0.2em] uppercase font-[family-name:var(--font-label)]">
            Weekly Distance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-lexend)] font-black text-6xl text-white tracking-tighter">
              {weekDistance.toFixed(1)}
            </span>
            <span className="font-[family-name:var(--font-lexend)] font-bold text-lg text-on-surface-variant">
              KM
            </span>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 flex flex-col justify-between h-48">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
            <span className="text-accent-orange">🔥</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-xs font-bold tracking-[0.2em] uppercase block mb-1 font-[family-name:var(--font-label)]">
              Calories
            </span>
            <span className="font-[family-name:var(--font-lexend)] font-bold text-3xl text-accent-orange">
              {weekCalories.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-high rounded-2xl p-6 flex flex-col justify-between h-48">
          <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
            <span className="text-white">⏱</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-xs font-bold tracking-[0.2em] uppercase block mb-1 font-[family-name:var(--font-label)]">
              Total Time
            </span>
            <span className="font-[family-name:var(--font-lexend)] font-bold text-3xl text-accent-blue">
              {formatDuration(weekTime)}
            </span>
          </div>
        </div>
      </section>

      {/* Coach Banner */}
      {latestCoachMsg && (
        <Link href="/coach" className="block mb-8 animate-fade-in">
          <div className="bg-surface-container rounded-2xl p-5 flex items-start gap-3 hover:bg-surface-container-high transition-all duration-300">
            <span className="text-2xl flex-shrink-0">{latestCoachMsg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-[family-name:var(--font-lexend)] text-sm font-bold text-white">
                {latestCoachMsg.title}
              </p>
              <p className="text-on-surface-variant text-xs mt-1 line-clamp-2">
                {latestCoachMsg.body}
              </p>
            </div>
            <span className="text-on-surface-variant text-xs flex-shrink-0">→</span>
          </div>
        </Link>
      )}

      {/* Coach Chat Widget */}
      <CoachChat workouts={workouts} />

      {/* Last Run Preview */}
      <section className="mb-8 animate-fade-in-up">
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-[family-name:var(--font-lexend)] font-extrabold text-2xl text-white tracking-tight uppercase">
            Last Run
          </h3>
          {lastWorkout && (
            <span className="text-on-surface-variant font-[family-name:var(--font-label)] text-sm font-bold uppercase tracking-widest">
              {new Date(lastWorkout.date).toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>

        {lastWorkout ? (
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-8 border-t-2 border-accent-green">
            <div className="flex flex-wrap items-center gap-8">
              <div>
                <span className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 font-[family-name:var(--font-label)]">
                  Pace
                </span>
                <span className="font-[family-name:var(--font-lexend)] font-black text-3xl text-white">
                  {formatPace(lastWorkout.pace)}
                </span>
              </div>
              <div className="w-px h-10 bg-outline-variant/30" />
              <div>
                <span className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 font-[family-name:var(--font-label)]">
                  Distance
                </span>
                <span className="font-[family-name:var(--font-lexend)] font-black text-3xl text-white">
                  {lastWorkout.distance} km
                </span>
              </div>
              <div className="w-px h-10 bg-outline-variant/30" />
              <div>
                <span className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 font-[family-name:var(--font-label)]">
                  Duration
                </span>
                <span className="font-[family-name:var(--font-lexend)] font-black text-3xl text-white">
                  {lastWorkout.duration >= 60
                    ? `${Math.floor(lastWorkout.duration / 60)}h ${lastWorkout.duration % 60}m`
                    : `${lastWorkout.duration} min`}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl p-8 text-center">
            <p className="text-on-surface-variant mb-4">No runs yet. Time to hit the road.</p>
            <Link
              href="/dodaj"
              className="inline-block bg-primary text-on-primary font-[family-name:var(--font-lexend)] font-bold text-sm px-8 py-3 rounded-full uppercase tracking-widest"
            >
              Log First Run
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
