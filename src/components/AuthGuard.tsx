"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/auth") {
      router.push("/auth");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-high animate-pulse mx-auto mb-4" />
          <p className="text-on-surface-variant text-sm font-[family-name:var(--font-lexend)] uppercase tracking-widest">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/auth") {
    return null;
  }

  return <>{children}</>;
}
