export interface Workout {
  id: string;
  date: string;
  distance: number; // km
  duration: number; // minuty
  pace: number; // min/km (obliczane)
  type: "easy" | "tempo" | "interval" | "long" | "race";
  notes?: string;
  rating?: "very_easy" | "easy" | "medium" | "hard" | "ultra_hard";
}

export const WORKOUT_TYPES: Record<Workout["type"], string> = {
  easy: "Lekki",
  tempo: "Tempo",
  interval: "Interwały",
  long: "Długi",
  race: "Zawody",
};

export const RATING_LABELS: Record<NonNullable<Workout["rating"]>, string> = {
  very_easy: "Bardzo latwy",
  easy: "Latwy",
  medium: "Sredni",
  hard: "Ciezki",
  ultra_hard: "Ultra ciezki",
};

export const RATING_COLORS: Record<NonNullable<Workout["rating"]>, string> = {
  very_easy: "bg-accent-green",
  easy: "bg-accent-blue",
  medium: "bg-accent-orange",
  hard: "bg-red-500",
  ultra_hard: "bg-red-700",
};
