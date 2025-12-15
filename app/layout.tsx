import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ParallaxBackground } from "@/components/layout/parallax-background";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "RoboRoman | KI-Tools & Nachrichten aus dem DACH-Raum",
  description:
    "Finde gepruefte KI-Tools mit DSGVO-Check, Tags und Use-Cases. Baue deinen Tool Stack und bleibe mit aktuellen KI-Nachrichten im DACH-Raum auf dem Laufenden.",
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground antialiased", inter.className)}>
        <ParallaxBackground />
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-0 lg:px-6 lg:pb-14 lg:pt-0">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
