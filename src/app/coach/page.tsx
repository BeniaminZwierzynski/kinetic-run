"use client";

import { useEffect, useState } from "react";
import { getWorkouts } from "@/lib/storage";
import {
  CoachMessage,
  CoachSettings,
  generateCoachMessages,
  getCoachMessages,
  getCoachSettings,
  saveCoachSettings,
  sendNotification,
  setupInactivityCheck,
} from "@/lib/coach";

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "teraz";
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h temu`;
  const days = Math.floor(hours / 24);
  return `${days}d temu`;
}

const TYPE_COLORS: Record<CoachMessage["type"], string> = {
  motivation: "bg-accent-green/20",
  warning: "bg-accent-orange/20",
  challenge: "bg-accent-purple/20",
  record: "bg-accent-yellow/20",
  tip: "bg-accent-blue/20",
};

const TYPE_BORDERS: Record<CoachMessage["type"], string> = {
  motivation: "border-l-accent-green",
  warning: "border-l-accent-orange",
  challenge: "border-l-accent-purple",
  record: "border-l-accent-yellow",
  tip: "border-l-accent-blue",
};

export default function CoachPage() {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [settings, setSettings] = useState<CoachSettings>(getCoachSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>("default");

  useEffect(() => {
    const workouts = getWorkouts();

    // Generate new messages if needed
    generateCoachMessages(workouts);
    setMessages(getCoachMessages());

    // Setup inactivity check
    const cleanup = setupInactivityCheck(workouts);

    // Check notification permission
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }

    return cleanup;
  }, []);

  function handleToggle() {
    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    saveCoachSettings(updated);
  }

  function handleDaysChange(days: number) {
    const updated = { ...settings, inactivityDays: days };
    setSettings(updated);
    saveCoachSettings(updated);
  }

  function handleNameChange(name: string) {
    const updated = { ...settings, name };
    setSettings(updated);
    saveCoachSettings(updated);
  }

  async function handleEnableNotifications() {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === "granted") {
        sendNotification(
          "Powiadomienia włączone! 🎉",
          `${settings.name} będzie Ci przypominać o treningach.`
        );
      }
    }
  }

  return (
    <div>
      {/* Header */}
      <section className="mb-8 animate-fade-in-up">
        <p className="font-[family-name:var(--font-label)] text-sm uppercase tracking-[0.3em] text-on-surface-variant mb-2">
          Personal
        </p>
        <h2 className="font-[family-name:var(--font-lexend)] text-5xl font-black tracking-tight text-white leading-none">
          COACH
        </h2>
      </section>

      {/* Coach Avatar & Status */}
      <section className="bg-surface-container-low rounded-2xl p-6 mb-6 relative overflow-hidden animate-fade-in-up">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-3xl">
            🏋️
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-lexend)] text-xl font-bold text-white">
              {settings.name}
            </h3>
            <p className="text-on-surface-variant text-sm">
              {settings.enabled ? "Aktywny - pilnuję Twoich treningów" : "Wyłączony"}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="ml-auto text-on-surface-variant hover:text-white transition-colors"
          >
            ⚙️
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-[40px]" />
      </section>

      {/* Settings Panel */}
      {showSettings && (
        <section className="bg-surface-container rounded-2xl p-6 mb-6 space-y-5">
          <h4 className="font-[family-name:var(--font-lexend)] text-sm font-bold text-white uppercase tracking-widest">
            Ustawienia trenera
          </h4>

          {/* Coach name */}
          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2 font-[family-name:var(--font-label)]">
              Imię trenera
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-surface-container-high text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:bg-surface-bright transition-colors"
            />
          </div>

          {/* Enabled toggle */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-on-surface-variant">Trener aktywny</span>
            <button
              onClick={handleToggle}
              className={`w-14 h-8 rounded-full transition-all duration-300 ${
                settings.enabled ? "bg-white" : "bg-surface-container-highest"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full transition-all duration-300 ${
                  settings.enabled
                    ? "bg-on-primary translate-x-7"
                    : "bg-on-surface-variant translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Inactivity days */}
          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-3 font-[family-name:var(--font-label)]">
              Reaguj po dniach bez biegu
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDaysChange(d)}
                  className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 font-[family-name:var(--font-lexend)] ${
                    settings.inactivityDays === d
                      ? "bg-primary text-on-primary shadow-lg"
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2 font-[family-name:var(--font-label)]">
              Powiadomienia push
            </label>
            {notifPermission === "granted" ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span>✓</span> Włączone
              </div>
            ) : notifPermission === "denied" ? (
              <p className="text-red-400 text-sm">
                Zablokowane - odblokuj w ustawieniach przeglądarki
              </p>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="px-6 py-3 rounded-full bg-surface-container-highest text-white text-sm font-bold hover:bg-surface-bright transition-all font-[family-name:var(--font-lexend)] uppercase tracking-widest"
              >
                Włącz powiadomienia
              </button>
            )}
          </div>
        </section>
      )}

      {/* Messages Feed */}
      <section className="animate-fade-in-up">
        <h4 className="font-[family-name:var(--font-lexend)] text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4 px-1">
          Wiadomości od trenera
        </h4>

        {messages.length === 0 ? (
          <div className="bg-surface-container rounded-2xl p-8 text-center">
            <p className="text-4xl mb-4">🏋️</p>
            <p className="text-on-surface-variant">
              Twój trener jeszcze się rozgrzewa. Dodaj kilka treningów, a zacznie Ci doradzać!
            </p>
          </div>
        ) : (
          <div className="space-y-3 stagger">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${TYPE_COLORS[msg.type]} border-l-4 ${TYPE_BORDERS[msg.type]} rounded-2xl p-5 transition-all animate-fade-in-up`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{msg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="font-[family-name:var(--font-lexend)] text-base font-bold text-white">
                        {msg.title}
                      </h5>
                      <span className="text-[10px] text-on-surface-variant flex-shrink-0 mt-1">
                        {timeAgo(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
                      {msg.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
