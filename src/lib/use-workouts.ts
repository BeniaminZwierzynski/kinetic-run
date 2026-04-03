"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./auth-context";
import { Workout } from "@/types/workout";
import {
  getWorkouts as getLocal,
  getWorkoutsFromDB,
  saveWorkout as saveLocal,
  saveWorkoutToDB,
  deleteWorkout as deleteLocal,
  deleteWorkoutFromDB,
  generateId,
  migrateLocalToSupabase,
} from "./storage";

export function useWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (user) {
      const data = await getWorkoutsFromDB(user.id);
      setWorkouts(data);
    } else {
      setWorkouts(getLocal());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Migrate localStorage data when user first logs in
  useEffect(() => {
    if (user) {
      const local = getLocal();
      if (local.length > 0) {
        migrateLocalToSupabase(user.id).then((count) => {
          if (count > 0) load();
        });
      }
    }
  }, [user, load]);

  async function addWorkout(
    workout: Omit<Workout, "id">,
    gpsPoints?: Array<{ lat: number; lng: number; timestamp: number }>
  ): Promise<Workout | null> {
    if (user) {
      const saved = await saveWorkoutToDB(user.id, workout, gpsPoints);
      if (saved) {
        setWorkouts((prev) => [saved, ...prev]);
        return saved;
      }
      return null;
    } else {
      const full: Workout = { ...workout, id: generateId() };
      saveLocal(full);
      setWorkouts((prev) => [full, ...prev]);
      return full;
    }
  }

  async function removeWorkout(id: string) {
    if (user) {
      await deleteWorkoutFromDB(id);
    } else {
      deleteLocal(id);
    }
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  return { workouts, loading, addWorkout, removeWorkout, reload: load };
}
