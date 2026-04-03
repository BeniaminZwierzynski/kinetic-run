"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
      }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Konto stworzone! Sprawdz email aby potwierdzic.");
      }
    }

    setLoading(false);
  }

  const inputClasses =
    "w-full bg-surface-container-high text-white rounded-full px-5 py-4 text-base focus:outline-none focus:bg-surface-bright transition-colors duration-300 font-[family-name:var(--font-body)] placeholder:text-on-surface-variant/50";

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh]">
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1 className="font-[family-name:var(--font-lexend)] font-black text-4xl text-white tracking-[0.2em] uppercase mb-2">
          KINETIC
        </h1>
        <p className="text-on-surface-variant text-sm">
          {isLogin ? "Zaloguj sie i biegaj" : "Stworz konto i zacznij biegac"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Imie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
          required
        />

        <input
          type="password"
          placeholder="Haslo (min. 6 znakow)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
          required
          minLength={6}
        />

        {error && (
          <p className="text-error text-sm text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-400 text-sm text-center">{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-b from-primary to-primary-container text-on-primary font-[family-name:var(--font-lexend)] font-black text-lg tracking-widest rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-300 uppercase disabled:opacity-50"
        >
          {loading ? "..." : isLogin ? "Zaloguj" : "Stworz konto"}
        </button>
      </form>

      <button
        onClick={() => {
          setIsLogin(!isLogin);
          setError("");
          setSuccess("");
        }}
        className="mt-6 text-on-surface-variant text-sm hover:text-white transition-colors"
      >
        {isLogin ? "Nie masz konta? Zarejestruj sie" : "Masz konto? Zaloguj sie"}
      </button>
    </div>
  );
}
