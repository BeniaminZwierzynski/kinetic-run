"use client";

import { useEffect, useState } from "react";
import { useWorkouts } from "@/lib/use-workouts";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getGearFromDB, saveGearToDB, deleteGearFromDB, GearItem } from "@/lib/storage";
import { Workout } from "@/types/workout";

function formatPace(pace: number): string {
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split("T")[0];
}

export default function Profile() {
  const { workouts } = useWorkouts();
  const { user, signOut } = useAuth();
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [gear, setGear] = useState<GearItem[]>([]);
  const [showGearForm, setShowGearForm] = useState(false);
  const [gearType, setGearType] = useState<"watch" | "shoes">("shoes");
  const [gearBrand, setGearBrand] = useState("");
  const [gearModel, setGearModel] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("height, weight").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setHeight(data.height);
          setWeight(data.weight);
        }
      });
    getGearFromDB(user.id).then(setGear);
  }, [user]);

  async function handleAddGear() {
    if (!user || !gearBrand.trim() || !gearModel.trim()) return;
    const saved = await saveGearToDB(user.id, {
      type: gearType,
      brand: gearBrand.trim(),
      model: gearModel.trim(),
      active: true,
    });
    if (saved) {
      setGear((prev) => [saved, ...prev]);
      setGearBrand("");
      setGearModel("");
      setShowGearForm(false);
    }
  }

  async function handleDeleteGear(id: string) {
    await deleteGearFromDB(id);
    setGear((prev) => prev.filter((g) => g.id !== id));
  }

  async function saveProfile() {
    if (!user) return;
    await supabase.from("profiles").update({ height, weight }).eq("id", user.id);
    setEditMode(false);
  }

  const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
  const weekStart = getWeekStart();
  const weekWorkouts = workouts.filter((w) => w.date >= weekStart);
  const weekDistance = weekWorkouts.reduce((sum, w) => sum + w.distance, 0);

  // Personal records
  const bestPace = workouts.length > 0 ? Math.min(...workouts.map((w) => w.pace)) : 0;
  const longestRun = workouts.length > 0 ? Math.max(...workouts.map((w) => w.distance)) : 0;
  const longestDuration = workouts.length > 0 ? Math.max(...workouts.map((w) => w.duration)) : 0;

  // Weekly bar chart data
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const weekData = daysOfWeek.map((_, i) => {
    const dayDate = new Date();
    const currentDay = dayDate.getDay();
    const diff = i - (currentDay === 0 ? 6 : currentDay - 1);
    const targetDate = new Date(dayDate);
    targetDate.setDate(dayDate.getDate() + diff);
    const dateStr = targetDate.toISOString().split("T")[0];
    return weekWorkouts
      .filter((w) => w.date === dateStr)
      .reduce((sum, w) => sum + w.distance, 0);
  });
  const maxDay = Math.max(...weekData, 1);

  return (
    <div>
      {/* Hero */}
      <section className="mb-10 text-left animate-fade-in-up">
        <h2 className="font-[family-name:var(--font-lexend)] font-extrabold text-4xl tracking-tight text-white mb-1">
          {user?.user_metadata?.display_name || "Runner"}
        </h2>
        <p className="text-on-surface-variant font-medium tracking-wide uppercase text-xs">
          {workouts.length} runs logged
        </p>
      </section>

      {/* Body Stats */}
      <section className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-[family-name:var(--font-lexend)] font-bold text-lg text-white uppercase tracking-wider">
            Body Stats
          </h3>
          <button
            onClick={() => {
              if (editMode) {
                saveProfile();
              } else {
                setEditMode(true);
              }
            }}
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors font-[family-name:var(--font-lexend)]"
          >
            {editMode ? "Zapisz" : "Edytuj"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low rounded-2xl p-5">
            <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-3">
              Wzrost
            </p>
            {editMode || height === null ? (
              <input
                type="number"
                value={height ?? ""}
                onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)}
                placeholder="cm"
                className="w-full bg-surface-container-high text-white rounded-full px-4 py-3 text-center focus:outline-none focus:bg-surface-bright font-[family-name:var(--font-lexend)]"
              />
            ) : (
              <p className="font-[family-name:var(--font-lexend)] text-3xl font-black text-accent-purple">
                {height} <span className="text-sm font-light">cm</span>
              </p>
            )}
          </div>
          <div className="bg-surface-container-low rounded-2xl p-5">
            <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-3">
              Waga
            </p>
            {editMode || weight === null ? (
              <input
                type="number"
                step="0.1"
                value={weight ?? ""}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)}
                placeholder="kg"
                className="w-full bg-surface-container-high text-white rounded-full px-4 py-3 text-center focus:outline-none focus:bg-surface-bright font-[family-name:var(--font-lexend)]"
              />
            ) : (
              <p className="font-[family-name:var(--font-lexend)] text-3xl font-black text-accent-purple">
                {weight} <span className="text-sm font-light">kg</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Gear */}
      <section className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-[family-name:var(--font-lexend)] font-bold text-lg text-white uppercase tracking-wider">
            Sprzet
          </h3>
          <button
            onClick={() => setShowGearForm(!showGearForm)}
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors font-[family-name:var(--font-lexend)]"
          >
            {showGearForm ? "Anuluj" : "+ Dodaj"}
          </button>
        </div>

        {/* Add gear form */}
        {showGearForm && (
          <div className="bg-surface-container rounded-2xl p-5 mb-4 space-y-4">
            <div className="flex gap-2">
              {(["shoes", "watch"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setGearType(t)}
                  className={`flex-1 py-3 rounded-full text-sm font-bold transition-all font-[family-name:var(--font-lexend)] uppercase tracking-widest ${
                    gearType === t
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {t === "shoes" ? "Buty" : "Zegarek"}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Marka (np. Nike, Garmin)"
              value={gearBrand}
              onChange={(e) => setGearBrand(e.target.value)}
              className="w-full bg-surface-container-high text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:bg-surface-bright transition-colors placeholder:text-on-surface-variant/50"
            />
            <input
              type="text"
              placeholder="Model (np. Pegasus 41, Forerunner 265)"
              value={gearModel}
              onChange={(e) => setGearModel(e.target.value)}
              className="w-full bg-surface-container-high text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:bg-surface-bright transition-colors placeholder:text-on-surface-variant/50"
            />
            <button
              onClick={handleAddGear}
              className="w-full py-3 bg-accent-green text-white rounded-full font-[family-name:var(--font-lexend)] font-bold text-sm uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              Zapisz
            </button>
          </div>
        )}

        {/* Gear list */}
        {gear.length === 0 && !showGearForm ? (
          <div className="bg-surface-container-low rounded-2xl p-6 text-center">
            <p className="text-on-surface-variant text-sm">
              Brak sprzetu. Dodaj swoje buty lub zegarek.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gear.map((g) => (
              <div
                key={g.id}
                className="bg-surface-container-low rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-2xl">
                  {g.type === "shoes" ? "👟" : "⌚"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[family-name:var(--font-lexend)] text-sm font-bold text-white">
                    {g.brand} {g.model}
                  </p>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest">
                    {g.type === "shoes" ? "Buty" : "Zegarek"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteGear(g.id)}
                  className="text-on-surface-variant hover:text-red-400 text-xs transition-colors"
                >
                  Usun
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Weekly Activity */}
      <section className="mb-8 animate-fade-in-up">
        <div className="bg-surface-container-low rounded-2xl p-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-on-surface-variant text-[10px] font-bold tracking-[0.2em] uppercase mb-1 font-[family-name:var(--font-label)]">
                Weekly Volume
              </p>
              <h3 className="font-[family-name:var(--font-lexend)] text-3xl font-bold text-white">
                {weekDistance.toFixed(1)}{" "}
                <span className="text-lg font-normal text-on-surface-variant uppercase">km</span>
              </h3>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-32 gap-2">
            {daysOfWeek.map((day, i) => {
              const height = weekData[i] > 0 ? (weekData[i] / maxDay) * 100 : 4;
              const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-full transition-all ${
                      isToday ? "bg-primary" : "bg-surface-container-high"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      isToday ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Personal Records */}
      <section className="mb-12 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="font-[family-name:var(--font-lexend)] font-bold text-lg text-accent-yellow uppercase tracking-wider">
            Personal Records
          </h3>
          <span className="text-zinc-600">🏆</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col justify-between h-36 border border-outline-variant/10">
            <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
              Best Pace
            </p>
            <div>
              <p className="font-[family-name:var(--font-lexend)] text-3xl font-black text-accent-yellow">
                {bestPace > 0 ? formatPace(bestPace) : "- -"}
              </p>
              <p className="text-[10px] font-medium text-zinc-400 mt-1">/KM</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col justify-between h-36 border border-outline-variant/10">
            <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
              Longest Run
            </p>
            <div>
              <p className="font-[family-name:var(--font-lexend)] text-3xl font-black text-accent-yellow">
                {longestRun > 0 ? longestRun.toFixed(1) : "- -"}
                {longestRun > 0 && <span className="text-sm font-light">km</span>}
              </p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col justify-between h-36 border border-outline-variant/10">
            <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
              Longest Duration
            </p>
            <div>
              <p className="font-[family-name:var(--font-lexend)] text-3xl font-black text-accent-yellow">
                {longestDuration > 0 ? `${longestDuration}` : "- -"}
                {longestDuration > 0 && <span className="text-sm font-light"> min</span>}
              </p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col justify-between h-36 border border-outline-variant/10">
            <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
              Total Distance
            </p>
            <div>
              <p className="font-[family-name:var(--font-lexend)] text-3xl font-black text-accent-yellow">
                {totalDistance.toFixed(1)}
                <span className="text-sm font-light">km</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Insight */}
      {workouts.length >= 3 && (
        <section className="mb-12 bg-surface-container p-8 rounded-2xl relative overflow-hidden animate-fade-in-up">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-accent-purple">⚡</span>
              <h4 className="font-[family-name:var(--font-lexend)] font-bold text-white uppercase text-sm tracking-widest">
                Performance Insight
              </h4>
            </div>
            <p className="text-on-surface text-lg font-light leading-relaxed">
              You&apos;ve logged{" "}
              <span className="font-bold text-white">{totalDistance.toFixed(1)} km</span> across{" "}
              <span className="font-bold text-white">{workouts.length} runs</span>. Keep pushing.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-[60px]" />
        </section>
      )}

      {/* Sign out */}
      <section className="mb-12 text-center">
        <button
          onClick={signOut}
          className="px-8 py-3 rounded-full bg-surface-container-highest text-on-surface-variant text-sm font-bold hover:bg-surface-bright transition-all font-[family-name:var(--font-lexend)] uppercase tracking-widest"
        >
          Wyloguj
        </button>
      </section>
    </div>
  );
}
