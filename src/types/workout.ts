export interface Workout {
  id: string;
  date: string;
  distance: number; // km
  duration: number; // minuty
  pace: number; // min/km (obliczane)
  type: "easy" | "tempo" | "interval" | "long" | "race";
  notes?: string;
}

export const WORKOUT_TYPES: Record<Workout["type"], string> = {
  easy: "Lekki",
  tempo: "Tempo",
  interval: "Interwały",
  long: "Długi",
  race: "Zawody",
};
