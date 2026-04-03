"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import BottomNav from "./BottomNav";
import AuthGuard from "./AuthGuard";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  return (
    <>
      {/* TopAppBar */}
      {!isAuthPage && (
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#131313]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="text-white text-lg">🏃</span>
            </div>
            <h1 className="text-xl font-black tracking-[0.2em] text-white font-[family-name:var(--font-lexend)] uppercase">
              KINETIC
            </h1>
          </div>
        </header>
      )}

      <main className={isAuthPage ? "px-6 max-w-2xl mx-auto animate-fade-in" : "pt-24 pb-8 px-6 max-w-2xl mx-auto animate-fade-in"}>
        <AuthGuard>{children}</AuthGuard>
      </main>

      {user && !isAuthPage && <BottomNav />}
    </>
  );
}
