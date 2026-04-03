import type { Metadata, Viewport } from "next";
import { Lexend, Manrope } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "KINETIC - Running Tracker",
  description: "Track your runs and evolve as a runner",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KINETIC",
  },
};

export const viewport: Viewport = {
  themeColor: "#131313",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${lexend.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-surface text-on-surface pb-28">
        {/* TopAppBar */}
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

        <main className="pt-24 pb-8 px-6 max-w-2xl mx-auto">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
