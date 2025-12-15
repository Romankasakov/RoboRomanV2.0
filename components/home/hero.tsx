"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Shield, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const examples = ["ChatGPT", "Midjourney", "DeepL", "GitHub Copilot", "Perplexity"];

type HomeHeroProps = {
  toolCount: number;
};

export function HomeHero({ toolCount }: HomeHeroProps) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [ghost, setGhost] = useState("");

  const cards = useMemo(
    () => [
      {
        title: "DSGVO-Konform",
        description: "Jedes Tool mit Datenschutz-Bewertung",
        icon: Shield,
      },
      {
        title: "Taeglich Aktuell",
        description: "Neue Tools und Updates jeden Tag",
        icon: Sparkles,
      },
      {
        title: "Im Trend",
        description: "Die beliebtesten Tools der Community",
        icon: TrendingUp,
      },
      {
        title: "Handverlesen",
        description: "Kuratiert fuer den DACH-Markt",
        icon: CheckCircle2,
      },
    ],
    []
  );

  useEffect(() => {
    if (reduceMotion) return;
    if (query) return;

    let exampleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout: number | undefined;

    const tick = () => {
      const current = examples[exampleIndex] ?? "";

      if (!isDeleting) {
        charIndex = Math.min(charIndex + 1, current.length);
        setGhost(current.slice(0, charIndex));
        if (charIndex >= current.length) {
          isDeleting = true;
          timeout = window.setTimeout(tick, 1100);
          return;
        }
      } else {
        charIndex = Math.max(charIndex - 1, 0);
        setGhost(current.slice(0, charIndex));
        if (charIndex <= 0) {
          isDeleting = false;
          exampleIndex = (exampleIndex + 1) % examples.length;
        }
      }

      timeout = window.setTimeout(tick, isDeleting ? 45 : 70);
    };

    timeout = window.setTimeout(tick, 650);
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [query, reduceMotion]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    window.dispatchEvent(new CustomEvent("roboroman:search", { detail: value }));
    document.getElementById("tool-explorer")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden bg-[#050b10] pb-16 pt-10 lg:pb-24 lg:pt-14">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_22%,rgba(16,225,174,0.22)_0,transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_85%_5%,rgba(0,217,255,0.14)_0,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(135deg,#050b10_0%,#050c12_35%,#06141f_100%)] opacity-90" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.65)_100%)]" />

      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <Badge className="mb-8 border border-primary/30 bg-primary/10 px-5 py-2 text-primary shadow-glow">
            Kuratiert fuer Deutsche Innovatoren
          </Badge>

          <h1 className="text-balance text-4xl font-semibold leading-tight text-foreground md:text-6xl">
            Die Beste KI-Tools <span className="text-primary">Sammlung in Deutschland</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
            Entdecke, vergleiche und nutze ueber{" "}
            <span className="font-semibold text-primary">{toolCount}</span> handverlesene KI-Tools. Mit DSGVO-Bewertung
            und Datenschutz-First Ansatz.
          </p>

          <div className="mt-10 grid w-full gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.08 + index * 0.06, duration: reduceMotion ? 0 : 0.3 }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -6, scale: 1.015, transition: { type: "spring", stiffness: 260, damping: 20 } }
                  }
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5 shadow-card backdrop-blur-xl"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,225,174,0.18)_0,transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(0,217,255,0.12)_0,transparent_55%)]" />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">{card.title}</div>
                    <div className="relative rounded-xl border border-white/10 bg-white/5 p-2 shadow-[0_0_0_1px_rgba(16,225,174,0.10)]">
                      <Icon className="h-5 w-5 text-primary/95" aria-hidden />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{card.description}</p>
                </motion.div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-10 w-full max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-[0_0_0_1px_rgba(16,225,174,0.10),0_20px_70px_-30px_rgba(16,225,174,0.65)] backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,225,174,0.12),transparent_50%)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="relative h-16 w-full bg-transparent px-6 text-lg text-foreground placeholder:text-transparent focus:outline-none"
                placeholder="."
                aria-label="Tool suchen"
              />
              {!query ? (
                <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                  Suche nach{" "}
                  <span className="text-foreground">
                    {ghost}
                    {!reduceMotion ? (
                      <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-[2px] rounded-full bg-primary/50 align-middle animate-pulse" />
                    ) : null}
                  </span>
                </div>
              ) : null}
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Beliebt: <span className="text-primary">ChatGPT, Midjourney, GitHub Copilot, DeepL</span>
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
