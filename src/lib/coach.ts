import { Workout } from "@/types/workout";

export interface CoachMessage {
  id: string;
  type: "motivation" | "warning" | "challenge" | "record" | "tip";
  title: string;
  body: string;
  icon: string;
  timestamp: number;
}

export interface CoachSettings {
  inactivityDays: number; // po ilu dniach bez biegu reaguje
  enabled: boolean;
  name: string; // imie trenera
}

const SETTINGS_KEY = "kinetic-coach-settings";
const MESSAGES_KEY = "kinetic-coach-messages";

export function getCoachSettings(): CoachSettings {
  if (typeof window === "undefined")
    return { inactivityDays: 3, enabled: true, name: "Coach K" };
  const data = localStorage.getItem(SETTINGS_KEY);
  return data
    ? JSON.parse(data)
    : { inactivityDays: 3, enabled: true, name: "Coach K" };
}

export function saveCoachSettings(settings: CoachSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getCoachMessages(): CoachMessage[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MESSAGES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCoachMessages(messages: CoachMessage[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

function addMessage(msg: Omit<CoachMessage, "id" | "timestamp">): CoachMessage {
  const messages = getCoachMessages();
  const full: CoachMessage = {
    ...msg,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    timestamp: Date.now(),
  };
  // Keep last 20 messages
  const updated = [full, ...messages].slice(0, 20);
  saveCoachMessages(updated);
  return full;
}

// ---- Message generators ----

const INACTIVITY_MESSAGES = [
  {
    title: "Hej, gdzie się podziałeś?",
    body: "Minęło {days} dni od Twojego ostatniego biegu. Nawet 15 minut lekkiego joggingu zrobi różnicę!",
  },
  {
    title: "Buty się kurżą...",
    body: "{days} dni przerwy. Pamiętaj - regularność > intensywność. Wyjdź choćby na spacer.",
  },
  {
    title: "Twoje nogi tęsknią za asfaltem",
    body: "Już {days} dni bez biegu. Nie musisz biegać szybko - po prostu wyjdź i ruszaj się.",
  },
  {
    title: "Coach K się martwi 😤",
    body: "{days} dni bez aktywności. Wiem, że masz to w sobie. Krótki bieg dziś?",
  },
  {
    title: "Przerwa trwa za długo",
    body: "Minęło {days} dni. Z każdym dniem powrót jest trudniejszy. Dziś jest dobry dzień żeby to zmienić.",
  },
];

const MOTIVATION_MESSAGES = [
  {
    title: "Świetna robota! 💪",
    body: "Masz już {totalKm} km w nogach. Każdy kilometr to inwestycja w siebie.",
  },
  {
    title: "Regularność to klucz",
    body: "{weekRuns} treningów w tym tygodniu. Trzymaj to tempo!",
  },
  {
    title: "Budujesz nawyk",
    body: "{streak} treningów z rzędu w różne dni. Tak się wygrywa z własnymi słabościami.",
  },
];

const RECORD_MESSAGES = [
  {
    title: "🏆 Nowy rekord dystansu!",
    body: "Właśnie przebiegłeś {distance} km - Twój najdłuższy bieg! Poprzedni rekord: {oldRecord} km.",
  },
  {
    title: "⚡ Nowy rekord tempa!",
    body: "Tempo {pace}/km - Twoje najlepsze! Poprzedni rekord: {oldPace}/km.",
  },
];

const CHALLENGE_MESSAGES = [
  {
    title: "Wyzwanie: Przebij 5 km",
    body: "Twój najdłuższy bieg to {longest} km. Spróbuj jutro przebić 5 km! Wierzę w Ciebie.",
  },
  {
    title: "Wyzwanie: 3 biegi w tygodniu",
    body: "W tym tygodniu masz {weekRuns} biegów. Cel: 3 biegi. Dasz radę?",
  },
  {
    title: "Wyzwanie: Szybszy kilometr",
    body: "Twoje średnie tempo to {avgPace}/km. Spróbuj następnym razem zejść poniżej!",
  },
];

const TIPS = [
  {
    title: "💡 Tip: Rozgrzewka",
    body: "Zacznij każdy bieg od 5 min szybkiego marszu. Twoje stawy Ci podziękują.",
  },
  {
    title: "💡 Tip: Oddech",
    body: "Oddychaj nosem i ustami. Rytm: 3 kroki wdech, 2 kroki wydech.",
  },
  {
    title: "💡 Tip: Nawodnienie",
    body: "Pij wodę przed biegiem, nie w trakcie. 500ml na 30min przed startem.",
  },
  {
    title: "💡 Tip: Regeneracja",
    body: "Po biegu 10 min stretchingu. Skupienie na łydkach, udach i biodrach.",
  },
  {
    title: "💡 Tip: Tempo rozmowy",
    body: "Jeśli nie możesz rozmawiać podczas biegu - biegniesz za szybko. Zwolnij!",
  },
];

function formatPace(pace: number): string {
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate coach messages based on workout data.
 * Call this on app load / after a workout.
 */
export function generateCoachMessages(workouts: Workout[]): CoachMessage[] {
  const settings = getCoachSettings();
  if (!settings.enabled) return getCoachMessages();

  const existing = getCoachMessages();
  const lastMsgTime = existing.length > 0 ? existing[0].timestamp : 0;
  const hoursSinceLastMsg = (Date.now() - lastMsgTime) / (1000 * 60 * 60);

  // Don't spam - max 1 message per 4 hours
  if (hoursSinceLastMsg < 4) return existing;

  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Days since last run
  const lastRunDate = sorted.length > 0 ? sorted[0].date : null;
  const daysSinceLastRun = lastRunDate
    ? Math.floor(
        (now.getTime() - new Date(lastRunDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 999;

  // Week runs
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekRuns = workouts.filter((w) => w.date >= weekStartStr).length;

  // Streak (consecutive unique days)
  const uniqueDays = [...new Set(sorted.map((w) => w.date))];
  let streak = 0;
  const checkDate = new Date(todayStr);
  for (const d of uniqueDays) {
    const diff = Math.floor(
      (checkDate.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff <= streak + 1) {
      streak++;
    } else break;
  }

  // Stats
  const totalKm = workouts.reduce((s, w) => s + w.distance, 0).toFixed(1);
  const longest = workouts.length > 0 ? Math.max(...workouts.map((w) => w.distance)) : 0;
  const avgPace =
    workouts.length > 0
      ? workouts.reduce((s, w) => s + w.pace, 0) / workouts.length
      : 0;

  // ---- Decision: what type of message to generate ----

  // 1. Inactivity warning
  if (daysSinceLastRun >= settings.inactivityDays) {
    const tmpl = pick(INACTIVITY_MESSAGES);
    addMessage({
      type: "warning",
      title: tmpl.title,
      body: tmpl.body.replace("{days}", String(daysSinceLastRun)),
      icon: "⚠️",
    });
    return getCoachMessages();
  }

  // 2. Random: motivation, challenge, or tip
  const roll = Math.random();

  if (roll < 0.35 && workouts.length >= 2) {
    // Motivation
    const tmpl = pick(MOTIVATION_MESSAGES);
    addMessage({
      type: "motivation",
      title: tmpl.title,
      body: tmpl.body
        .replace("{totalKm}", totalKm)
        .replace("{weekRuns}", String(weekRuns))
        .replace("{streak}", String(streak)),
      icon: "💪",
    });
  } else if (roll < 0.65 && workouts.length >= 3) {
    // Challenge
    const tmpl = pick(CHALLENGE_MESSAGES);
    addMessage({
      type: "challenge",
      title: tmpl.title,
      body: tmpl.body
        .replace("{longest}", longest.toFixed(1))
        .replace("{weekRuns}", String(weekRuns))
        .replace("{avgPace}", formatPace(avgPace)),
      icon: "🎯",
    });
  } else {
    // Tip
    const tmpl = pick(TIPS);
    addMessage({
      type: "tip",
      title: tmpl.title,
      body: tmpl.body,
      icon: "💡",
    });
  }

  return getCoachMessages();
}

/**
 * Check for new records after a workout and generate record messages.
 */
export function checkRecords(
  newWorkout: Workout,
  previousWorkouts: Workout[]
): void {
  if (previousWorkouts.length === 0) return;

  const prevMaxDist = Math.max(...previousWorkouts.map((w) => w.distance));
  const prevBestPace = Math.min(...previousWorkouts.map((w) => w.pace));

  if (newWorkout.distance > prevMaxDist) {
    const tmpl = RECORD_MESSAGES[0];
    addMessage({
      type: "record",
      title: tmpl.title,
      body: tmpl.body
        .replace("{distance}", newWorkout.distance.toFixed(2))
        .replace("{oldRecord}", prevMaxDist.toFixed(2)),
      icon: "🏆",
    });
  }

  if (newWorkout.pace < prevBestPace && newWorkout.distance >= 1) {
    const tmpl = RECORD_MESSAGES[1];
    addMessage({
      type: "record",
      title: tmpl.title,
      body: tmpl.body
        .replace("{pace}", formatPace(newWorkout.pace))
        .replace("{oldPace}", formatPace(prevBestPace)),
      icon: "⚡",
    });
  }
}

/**
 * Request browser notification permission and send a notification.
 */
export async function sendNotification(
  title: string,
  body: string
): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "kinetic-coach",
    });
  }
}

/**
 * Setup periodic inactivity check (runs every hour when app is open).
 */
export function setupInactivityCheck(workouts: Workout[]): () => void {
  const check = () => {
    const settings = getCoachSettings();
    if (!settings.enabled) return;

    const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
    const lastRunDate = sorted.length > 0 ? sorted[0].date : null;

    if (!lastRunDate) return;

    const daysSince = Math.floor(
      (Date.now() - new Date(lastRunDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince >= settings.inactivityDays) {
      const tmpl = pick(INACTIVITY_MESSAGES);
      sendNotification(
        tmpl.title,
        tmpl.body.replace("{days}", String(daysSince))
      );
    }
  };

  // Check immediately, then every hour
  check();
  const interval = setInterval(check, 60 * 60 * 1000);
  return () => clearInterval(interval);
}
