"use client";

import { useMemo } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

type ParallaxBackgroundProps = {
  className?: string;
};

type Node = { id: string; x: number; y: number; size: number; delay: number; duration: number };
type Edge = { id: string; from: Node; to: Node; delay: number; duration: number };

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createNodes(count: number): Node[] {
  const rand = mulberry32(1337);
  return Array.from({ length: count }).map((_, idx) => {
    const r1 = rand();
    const r2 = rand();
    const r3 = rand();
    const r4 = rand();
    const r5 = rand();
    return {
      id: `node-${idx}`,
      x: 6 + r1 * 88,
      y: 6 + r2 * 88,
      size: 1.6 + r3 * 2.8,
      delay: r4 * 4,
      duration: 6 + r5 * 6,
    };
  });
}

function createEdges(nodes: Node[]) {
  const rand = mulberry32(4242);
  const edges: Edge[] = [];
  const count = Math.max(18, Math.floor(nodes.length * 1.2));

  for (let i = 0; i < count; i += 1) {
    const from = nodes[Math.floor(rand() * nodes.length)]!;
    const to = nodes[Math.floor(rand() * nodes.length)]!;
    if (from.id === to.id) continue;
    edges.push({
      id: `edge-${i}`,
      from,
      to,
      delay: rand() * 4,
      duration: 4.5 + rand() * 5.5,
    });
  }

  return edges;
}

export function ParallaxBackground({ className }: ParallaxBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const ySlow = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -120]);
  const yFast = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -220]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.9, 0.82]);

  const nodes = useMemo(() => createNodes(40), []);
  const edges = useMemo(() => createEdges(nodes), [nodes]);

  return (
    <motion.div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
      style={{ opacity }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(16,225,174,0.10)_0,transparent_40%),radial-gradient(circle_at_80%_10%,rgba(0,217,255,0.08)_0,transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#050b10_0%,#060a0f_35%,#07141f_100%)] opacity-80" />

      <motion.div
        className="absolute -left-40 -top-56 h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-3xl"
        style={{ y: yFast }}
      />
      <motion.div
        className="absolute -right-48 -top-64 h-[640px] w-[640px] rounded-full bg-cyan-400/10 blur-3xl"
        style={{ y: ySlow }}
      />
      <motion.div
        className="absolute -bottom-72 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-300/8 blur-3xl"
        style={{ y: yFast }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rr-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(16,225,174,0.10)" />
            <stop offset="55%" stopColor="rgba(0,217,255,0.18)" />
            <stop offset="100%" stopColor="rgba(16,225,174,0.10)" />
          </linearGradient>
          <radialGradient id="rr-node" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(16,225,174,0.85)" />
            <stop offset="100%" stopColor="rgba(16,225,174,0)" />
          </radialGradient>
        </defs>

        {edges.map((edge) => (
          <motion.line
            key={edge.id}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke="url(#rr-edge)"
            strokeWidth={0.14}
            strokeLinecap="round"
            initial={{ opacity: 0.14 }}
            animate={reduceMotion ? { opacity: 0.18 } : { opacity: [0.08, 0.55, 0.12] }}
            transition={{ repeat: Infinity, duration: edge.duration, delay: edge.delay }}
          />
        ))}

        {reduceMotion
          ? null
          : edges.slice(0, 16).map((edge) => (
              <motion.circle
                key={`${edge.id}-packet`}
                r={0.35}
                fill="rgba(16,225,174,0.9)"
                initial={{ cx: edge.from.x, cy: edge.from.y, opacity: 0 }}
                animate={{
                  cx: [edge.from.x, edge.to.x],
                  cy: [edge.from.y, edge.to.y],
                  opacity: [0, 0.9, 0],
                }}
                transition={{ repeat: Infinity, duration: edge.duration, delay: edge.delay, ease: "linear" }}
              />
            ))}

        {nodes.map((node) => (
          <motion.circle
            key={`${node.id}-halo`}
            cx={node.x}
            cy={node.y}
            r={node.size * 0.85}
            fill="url(#rr-node)"
            initial={{ opacity: 0.1 }}
            animate={reduceMotion ? { opacity: 0.12 } : { opacity: [0.05, 0.28, 0.05] }}
            transition={{ repeat: Infinity, duration: node.duration, delay: node.delay }}
          />
        ))}
      </svg>

      {nodes.map((node) => (
        <motion.span
          key={node.id}
          className="absolute rounded-full bg-emerald-300/70 shadow-[0_0_18px_rgba(16,225,174,0.35)]"
          style={{
            top: `${node.y}%`,
            left: `${node.x}%`,
            width: `${node.size}px`,
            height: `${node.size}px`,
            y: ySlow,
          }}
          animate={reduceMotion ? { opacity: 0.3 } : { opacity: [0.12, 0.9, 0.12], scale: [1, 1.35, 1] }}
          transition={{ repeat: Infinity, duration: node.duration, delay: node.delay }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='200'%20height='200'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='.9'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='200'%20height='200'%20filter='url(%23n)'%20opacity='.35'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      <div className="absolute inset-0 opacity-[0.10] mix-blend-overlay" style={{ backgroundImage: "linear-gradient(transparent 0%, rgba(255,255,255,0.06) 48%, transparent 100%)", backgroundSize: "100% 6px" }} />
    </motion.div>
  );
}
