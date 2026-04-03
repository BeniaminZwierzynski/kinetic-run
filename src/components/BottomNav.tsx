"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "RUN", icon: "▶" },
  { href: "/coach", label: "COACH", icon: "🏋️" },
  { href: "/logs", label: "LOGS", icon: "📋" },
  { href: "/profil", label: "USER", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[#131313]/90 backdrop-blur-2xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] safe-area-bottom">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              isActive
                ? "bg-accent-green text-on-primary rounded-full px-6 py-2 scale-110 shadow-xl"
                : "text-zinc-500 hover:text-zinc-300 px-4 py-2"
            }`}
          >
            <span className="text-base mb-0.5">{item.icon}</span>
            <span className="font-[family-name:var(--font-lexend)] text-[10px] font-bold tracking-widest uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
