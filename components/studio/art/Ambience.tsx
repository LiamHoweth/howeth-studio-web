"use client";

import type { CSSProperties } from "react";
import { r1, seeded } from "./random";
import "@/styles/scenery.css";

/**
 * Living ambience for the painted world: dandelion seeds and petals on the
 * breeze, butterflies, fireflies at dusk and small clouds drifting past.
 *
 * Server-rendered and deterministic (seeded positions, no Math.random during
 * render). Each sprite is drawn once per layer as an inline SVG and reused by
 * the particles through `<use>`; every particle animates only transform and
 * opacity. The layer is aria-hidden, click-through and hidden entirely with
 * reduced motion. Drop it inside any `position: relative` box; it fills that
 * box behind the content (z-index 0 — give the content `position: relative;
 * z-index: 1`).
 */

export type AmbienceKind = "meadow" | "breeze" | "dusk" | "sky";

type Vars = CSSProperties & Record<`--${string}`, string>;

const PETALS: [string, string][] = [["#f4b8ae", "#d98a80"], ["#fff3d9", "#e6d2a8"], ["#f6d65a", "#d9ac2a"], ["#c9b6ec", "#9b84c8"]];
type WingSet = { base: string; edge: string; spot: string; vein: string };
const WINGS: WingSet[] = [
  { base: "#f1b84b", edge: "#3a2a24", spot: "#fff3d6", vein: "#c27a1e" },
  { base: "#8fc3e6", edge: "#24384b", spot: "#ffffff", vein: "#4f86ad" },
  { base: "#f4b8ae", edge: "#7a3a2a", spot: "#fff6e6", vein: "#c8613f" },
  { base: "#fff3d9", edge: "#6b5a3a", spot: "#f1b84b", vein: "#c9b07a" },
];

function SeedShape() {
  return (
    <g>
      <path d="M12 13 L12 33" stroke="#d9cfb8" strokeWidth=".9" strokeLinecap="round" />
      <ellipse cx="12" cy="34" rx="1.1" ry="2.6" fill="#a8956a" />
      <g strokeLinecap="round" fill="none">
        {[["#c9bb98", "1.1", ".45"], ["#fffaf0", ".55", "1"]].map(([stroke, width, opacity]) => (
          <g key={stroke} stroke={stroke} strokeWidth={width} opacity={opacity}>
            {Array.from({ length: 13 }, (_, i) => {
              const a = ((i / 12) * 150 - 75) * (Math.PI / 180);
              const l = 11 - Math.abs(i - 6) * 0.4;
              return <path key={i} d={`M12 13 Q${r1(12 + Math.sin(a) * l * 0.5)} ${r1(13 - Math.cos(a) * l * 0.6)} ${r1(12 + Math.sin(a) * l)} ${r1(13 - Math.cos(a) * l)}`} />;
            })}
          </g>
        ))}
      </g>
      <g fill="#fffaf0">{Array.from({ length: 7 }, (_, i) => { const a = ((i / 6) * 150 - 75) * (Math.PI / 180); return <circle key={i} cx={r1(12 + Math.sin(a) * 10)} cy={r1(13 - Math.cos(a) * 10)} r=".55" />; })}</g>
    </g>
  );
}

function PetalShape({ colours: [fill, vein] }: { colours: [string, string] }) {
  return (
    <g>
      <path d="M1 7 Q5 0 13 1.4 Q20 6 14 12 Q6 14.4 1 7 Z" fill={fill} />
      <path d="M1 7 Q8 9 14 12 Q6 14.4 1 7 Z" fill={vein} opacity=".35" />
      <path d="M2 7 Q8 5.6 16 6.4 M8 6 Q11 3.6 13.4 3 M8 6.6 Q11 9.4 13.6 10.4" stroke={vein} strokeWidth=".5" fill="none" opacity=".7" />
      <path d="M4 5 Q8 2.4 12 2.6" stroke="#ffffff" strokeWidth=".8" fill="none" opacity=".6" />
    </g>
  );
}

/** A butterfly with patterned, veined wings that flap from the body. */
export function Butterfly({ colours, className, wings }: { colours?: [string, string]; className?: string; wings?: WingSet }) {
  const set = wings ?? (colours ? { base: colours[0], edge: colours[1], spot: "#fff6e6", vein: colours[1] } : WINGS[0]);
  const wing = (side: 1 | -1) => (
    <g className={`butterfly__wing butterfly__wing--${side === 1 ? "r" : "l"}`}>
      <g transform={side === -1 ? "translate(40 0) scale(-1 1)" : undefined}>
        <path d="M21 15 Q30 -1 37 4 Q41 11 31 16 Z" fill={set.base} />
        <path d="M21 17 Q34 18 34 25 Q31 31 24 27 Q21 23 21 17 Z" fill={set.base} />
        <path d="M21 15 Q30 -1 37 4 Q41 11 31 16 Z M21 17 Q34 18 34 25 Q31 31 24 27 Q21 23 21 17 Z" fill="none" stroke={set.edge} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M30 2 Q38 3 38.6 9" stroke={set.edge} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M21 15 Q27 8 33 5 M21 15 Q29 12 36 10 M21 17 Q27 21 31 25" stroke={set.vein} strokeWidth=".6" fill="none" opacity=".8" />
        <circle cx="35" cy="6.4" r="1" fill={set.spot} /><circle cx="37" cy="9" r=".8" fill={set.spot} />
        <circle cx="29" cy="22" r="2" fill={set.edge} opacity=".75" /><circle cx="29" cy="22" r=".9" fill={set.spot} />
      </g>
    </g>
  );
  return (
    <svg className={`butterfly${className ? ` ${className}` : ""}`} viewBox="0 0 40 32" aria-hidden="true" focusable="false">
      {wing(-1)}
      {wing(1)}
      <ellipse cx="20" cy="17" rx="1.6" ry="7" fill="#2b2621" />
      <circle cx="20" cy="9.6" r="1.6" fill="#2b2621" />
      <path d="M20 9 Q17.6 4 15.6 3.2 M20 9 Q22.4 4 24.4 3.2" stroke="#2b2621" strokeWidth=".7" fill="none" strokeLinecap="round" />
      <circle cx="15.6" cy="3.2" r=".7" fill="#2b2621" /><circle cx="24.4" cy="3.2" r=".7" fill="#2b2621" />
    </svg>
  );
}

function PuffShape() {
  return (
    <g>
      <g fill="#d3dfeb">
        <circle cx="58" cy="60" r="28" /><circle cx="94" cy="44" r="36" /><circle cx="134" cy="54" r="30" /><circle cx="162" cy="66" r="20" /><circle cx="34" cy="70" r="18" />
        <rect x="20" y="64" width="160" height="22" rx="11" />
      </g>
      <g fill="#ffffff">
        <circle cx="56" cy="56" r="25" /><circle cx="90" cy="39" r="32" /><circle cx="130" cy="49" r="26" /><circle cx="158" cy="62" r="16" /><circle cx="33" cy="66" r="15" />
      </g>
      <g fill="#fff6dc" opacity=".8"><circle cx="80" cy="30" r="14" /><circle cx="48" cy="48" r="10" /><circle cx="122" cy="40" r="10" /></g>
      <ellipse cx="100" cy="84" rx="78" ry="4" fill="#c4d2e2" opacity=".7" />
    </g>
  );
}

const counts: Record<AmbienceKind, { seeds: number; petals: number; butterflies: number; fireflies: number; puffs: number }> = {
  meadow: { seeds: 7, petals: 4, butterflies: 2, fireflies: 0, puffs: 0 },
  breeze: { seeds: 5, petals: 3, butterflies: 1, fireflies: 0, puffs: 0 },
  dusk: { seeds: 0, petals: 0, butterflies: 0, fireflies: 16, puffs: 0 },
  sky: { seeds: 3, petals: 0, butterflies: 0, fireflies: 0, puffs: 3 },
};

/**
 * `density` scales every count (0.5 = half as busy). Positions are fractions
 * of the box, so the same layer works at any size.
 */
export function Ambience({ kind = "meadow", seed = 1, density = 1, className }: { kind?: AmbienceKind; seed?: number; density?: number; className?: string }) {
  const random = seeded(seed * 101 + kind.length);
  const n = (value: number) => Math.max(0, Math.round(value * density));
  const plan = counts[kind];
  const pct = (value: number) => `${r1(value * 100)}%`;
  const sec = (value: number) => `${r1(value)}s`;
  const p = `amb-${kind}-${seed}`;

  const seeds = Array.from({ length: n(plan.seeds) }, () => ({
    "--x": pct(random() * 0.9), "--y": pct(0.35 + random() * 0.6),
    "--dx": `${Math.round(160 + random() * 260)}px`, "--dy": `${Math.round(-140 - random() * 220)}px`,
    "--d": sec(16 + random() * 14), "--delay": sec(-random() * 30), "--s": `${r1(0.7 + random() * 0.7)}`,
  }) as Vars);
  const petals = Array.from({ length: n(plan.petals) }, () => ({
    style: {
      "--x": pct(0.1 + random() * 0.9), "--y": pct(random() * 0.4),
      "--dx": `${Math.round(-220 - random() * 240)}px`, "--dy": `${Math.round(160 + random() * 200)}px`,
      "--d": sec(14 + random() * 10), "--delay": sec(-random() * 24), "--s": `${r1(0.7 + random() * 0.6)}`, "--spin": sec(2 + random() * 1.6),
    } as Vars,
    tone: Math.floor(random() * PETALS.length),
  }));
  const butterflies = Array.from({ length: n(plan.butterflies) }, (_, index) => ({
    style: {
      "--x": pct(0.08 + random() * 0.8), "--y": pct(0.5 + random() * 0.35),
      "--dx": `${Math.round((random() > 0.5 ? 1 : -1) * (60 + random() * 90))}px`, "--dy": `${Math.round(-30 - random() * 50)}px`,
      "--d": sec(9 + random() * 6), "--delay": sec(-random() * 12), "--flap": sec(0.22 + random() * 0.12), "--s": `${r1(0.8 + random() * 0.4)}`,
    } as Vars,
    wings: WINGS[(seed + index) % WINGS.length],
  }));
  const fireflies = Array.from({ length: n(plan.fireflies) }, () => ({
    "--x": pct(random()), "--y": pct(0.15 + random() * 0.8),
    "--dx": `${Math.round((random() - 0.5) * 60)}px`, "--dy": `${Math.round(-20 - random() * 40)}px`,
    "--d": sec(5 + random() * 5), "--delay": sec(-random() * 8), "--s": `${r1(0.7 + random() * 0.8)}`,
  }) as Vars);
  const puffs = Array.from({ length: n(plan.puffs) }, (_, index) => ({
    "--y": pct(0.05 + (index / Math.max(1, n(plan.puffs))) * 0.5 + random() * 0.1),
    "--d": sec(70 + random() * 50), "--delay": sec(-random() * 90), "--s": `${r1(0.5 + random() * 0.7)}`, "--o": `${r1(0.55 + random() * 0.35)}`,
  }) as Vars);

  const needsSeed = seeds.length > 0;
  const petalTones = [...new Set(petals.map((petal) => petal.tone))];
  return (
    <div className={`ambience ambience--${kind}${className ? ` ${className}` : ""}`} aria-hidden="true">
      {/* Sprite sheet for this layer: each shape is drawn once and reused. */}
      <svg className="ambience__sprites" width="0" height="0" focusable="false">
        <defs>
          {needsSeed && <g id={`${p}-seed`}><SeedShape /></g>}
          {petalTones.map((tone) => <g key={tone} id={`${p}-petal-${tone}`}><PetalShape colours={PETALS[tone]} /></g>)}
          {puffs.length > 0 && <g id={`${p}-puff`}><PuffShape /></g>}
        </defs>
      </svg>
      {puffs.map((style, index) => <span key={`p${index}`} className="amb amb--puff" style={style}><svg viewBox="0 0 200 90" focusable="false"><use href={`#${p}-puff`} /></svg></span>)}
      {seeds.map((style, index) => <span key={`s${index}`} className="amb amb--seed" style={style}><span className="amb__spin"><svg viewBox="0 0 24 38" focusable="false"><use href={`#${p}-seed`} /></svg></span></span>)}
      {petals.map(({ style, tone }, index) => <span key={`t${index}`} className="amb amb--petal" style={style}><span className="amb__spin"><svg viewBox="0 0 20 15" focusable="false"><use href={`#${p}-petal-${tone}`} /></svg></span></span>)}
      {butterflies.map(({ style, wings }, index) => <span key={`b${index}`} className="amb amb--butterfly" style={style}><Butterfly wings={wings} /></span>)}
      {fireflies.map((style, index) => <span key={`f${index}`} className="amb amb--firefly" style={style}><i /></span>)}
    </div>
  );
}
