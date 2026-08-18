import type { Metadata } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { PitchBackground } from "@/components/PitchBackground";

const display = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "TournyPlay — eFootball Mobile 1v1 Rooms",
  description:
    "Create or join eFootball Mobile friendly-match rooms, stake tokens, and compete for the pot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body min-h-screen bg-base text-ink antialiased">
        <PitchBackground />
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
