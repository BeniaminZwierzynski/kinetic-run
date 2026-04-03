import { Workout } from "@/types/workout";
import { supabase } from "./supabase";

// ---- Supabase storage (when logged in) ----

export async function getWorkoutsFromDB(userId: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching workouts:", error);
    return [];
  }

  return (data || []).map((w) => ({
    id: w.id,
    date: w.date,
    distance: Number(w.distance),
    duration: w.duration,
    pace: Number(w.pace),
    type: w.type as Workout["type"],
    notes: w.notes || undefined,
  }));
}

export async function saveWorkoutToDB(
  userId: string,
  workout: Omit<Workout, "id">,
  gpsPoints?: Array<{ lat: number; lng: number; timestamp: number }>
): Promise<Workout | null> {
  const { data, error } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      date: workout.date,
      distance: workout.distance,
      duration: workout.duration,
      pace: workout.pace,
      type: workout.type,
      notes: workout.notes || null,
      gps_points: gpsPoints || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving workout:", error);
    return null;
  }

  return {
    id: data.id,
    date: data.date,
    distance: Number(data.distance),
    duration: data.duration,
    pace: Number(data.pace),
    type: data.type as Workout["type"],
    notes: data.notes || undefined,
  };
}

export async function deleteWorkoutFromDB(id: string): Promise<void> {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) console.error("Error deleting workout:", error);
}

// ---- localStorage fallback (when not logged in) ----

const STORAGE_KEY = "jasiek-workouts";

export function getWorkouts(): Workout[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWorkout(workout: Workout): void {
  const workouts = getWorkouts();
  workouts.push(workout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function deleteWorkout(id: string): void {
  const workouts = getWorkouts().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ---- Migration: localStorage → Supabase ----

export async function migrateLocalToSupabase(userId: string): Promise<number> {
  const local = getWorkouts();
  if (local.length === 0) return 0;

  let migrated = 0;
  for (const w of local) {
    const result = await saveWorkoutToDB(userId, w);
    if (result) migrated++;
  }

  if (migrated === local.length) {
    localStorage.removeItem(STORAGE_KEY);
  }

  return migrated;
}
