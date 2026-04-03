import type { Metadata, Viewport } from "next";
import { Lexend, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import AppShell from "@/components/AppShell";

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
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
