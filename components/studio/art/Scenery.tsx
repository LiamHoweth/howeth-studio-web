"use client";

import type { CSSProperties, ReactNode } from "react";
import "@/styles/scenery.css";
import { r1, seeded } from "./random";

/**
 * Hand-painted scenery for the studio pages: summer skies with towering
 * cumulus, layered meadows with trees, hedgerows, cottages, sheep and a
 * footpath, and a dusk horizon for the footer.
 *
 * Everything is inline SVG rendered on the server, decorative (aria-hidden)
 * and deterministic: a seeded random generator places every sprite, so static
 * exports are stable.
 *
 * Performance: each scene defines its sprites once (`<g id>` in `<defs>`) and
 * places them with `<use>` + transforms. Moving parts (clouds, birds, grass,
 * glints, stars) are separate <svg> layers animated with CSS transform or
 * opacity, so the browser composites them instead of re-running the painterly
 * filters every frame. Styles and reduced-motion rules live in
 * styles/scenery.css.
 */

const INK = "#2b2621";

/* ------------------------------------------------------------------------ */
/* Palettes                                                                  */
/* ------------------------------------------------------------------------ */

type CloudTone = "day" | "golden" | "dusk";
type CloudColours = { core: string; shade: string; mid: string; light: string; warm: string; deep: string };
const cloudColours: Record<CloudTone, CloudColours> = {
  day: { core: "#a8b9d0", shade: "#c8d5e5", mid: "#eef3f8", light: "#ffffff", warm: "#fff3d6", deep: "#8a9fbc" },
  golden: { core: "#c7a2a4", shade: "#e0bfb2", mid: "#f9e4cf", light: "#fff7e8", warm: "#ffd79a", deep: "#a27f8e" },
  dusk: { core: "#5f5683", shade: "#86709a", mid: "#d6a2a6", light: "#ffd4b2", warm: "#ffc489", deep: "#463f6c" },
};

/** Colours that sprites (trees, grass, flowers, cottages) are painted with. */
type SpritePalette = {
  grass: [string, string, string];
  tip: string;
  trunk: [string, string];
  leaf: [string, string, string, string];
  pine: [string, string, string];
  poplar: [string, string, string];
  shadow: string;
  wall: [string, string];
  roof: [string, string];
  stone: [string, string, string];
  fence: string;
  flowerLight: number;
};
const dayPalette: SpritePalette = {
  grass: ["#3f7a34", "#5d9a42", "#7fb653"], tip: "#d9ec9c",
  trunk: ["#4a2f1f", "#6e4a31"],
  leaf: ["#2c5429", "#3f7234", "#5f9a45", "#a3cd6c"],
  pine: ["#1f4430", "#2f5f3e", "#4d7d52"],
  poplar: ["#2f5b2c", "#4a7f3a", "#8bbd5f"],
  shadow: "#24401f",
  wall: ["#f4e6c8", "#d9c49c"], roof: ["#c8613f", "#9d4429"],
  stone: ["#cfc8b6", "#b3ab98", "#e2dccd"], fence: "#8a6a4a",
  flowerLight: 1,
};
const duskPalette: SpritePalette = {
  grass: ["#1b2440", "#26304f", "#323d63"], tip: "#6f6a8f",
  trunk: ["#161c33", "#20283f"],
  leaf: ["#151b33", "#1d2442", "#28315a", "#3a4677"],
  pine: ["#131a30", "#1c2440", "#2b355c"],
  poplar: ["#161d36", "#222b4c", "#36416c"],
  shadow: "#0d1226",
  wall: ["#5a5778", "#45425f"], roof: ["#3a3550", "#2a2640"],
  stone: ["#3b4163", "#30365a", "#4a5176"], fence: "#2a2f4c",
  flowerLight: 0.5,
};

type Mood = "noon" | "golden";
type Land = { sky: [string, string, string]; glow: string; far: [string, string]; mid: [string, string]; near: [string, string]; front: [string, string]; fore: string; haze: string };
const meadowLand: Record<Mood, Land> = {
  noon: { sky: ["#3f84c2", "#92c2e6", "#f1eedb"], glow: "#fff3cc", far: ["#a7bdd5", "#8ea6c2"], mid: ["#bcd78e", "#94bd67"], near: ["#a0cc64", "#7aad4c"], front: ["#8abd54", "#6aa046"], fore: "#64994a", haze: "#eef3ea" },
  golden: { sky: ["#4a7db6", "#c6cdd0", "#fbd49a"], glow: "#ffd88a", far: ["#b9b1c9", "#9b97b6"], mid: ["#cbd384", "#a3b760"], near: ["#acc75d", "#88a94a"], front: ["#97ba50", "#76a046"], fore: "#6f9846", haze: "#fbe7c4" },
};

/* ------------------------------------------------------------------------ */
/* Filters                                                                   */
/* ------------------------------------------------------------------------ */

/** Painterly filters: wobbly watercolour edges, a soft feather and a haze. */
export function PaintFilters({ id }: { id: string }) {
  return (
    <>
      <filter id={`${id}-wash`} x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="3" seed="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" />
      </filter>
      <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <filter id={`${id}-feather`} x="-20%" y="-200%" width="140%" height="500%">
        <feGaussianBlur stdDeviation="7 3" />
      </filter>
      <filter id={`${id}-haze`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Clouds                                                                    */
/* ------------------------------------------------------------------------ */

/**
 * A believable cumulus. The silhouette is a dome (plus an optional billowing
 * tower) whose top edge is built from many lobes of varied size, so it reads
 * as a cauliflower heap rather than stacked bubbles. Each lobe is lit on its
 * own: a sunlit crescent on the upper left (warm on the sun side), a cool
 * shadow on the lower right. Underneath: a cool core shadow, a feathered flat
 * base, wispy fringes and a few soft satellite puffs, all pulled together by
 * a static watercolour displacement. `id` must be unique on the page;
 * `filters` names the PaintFilters set to use.
 */
export function Cloud({ id, filters, seed = 1, tone = "day", tower = 0, width = 300 }: { id: string; filters: string; seed?: number; tone?: CloudTone; tower?: number; width?: number }) {
  const random = seeded(seed * 977 + 13);
  const c = cloudColours[tone];
  const dome = 64 + random() * 26;
  const towerHeight = tower * 230;
  const towerCentre = (random() - 0.5) * 0.18 + 0.48;
  const profile = (t: number) => dome * Math.pow(Math.sin(Math.PI * t), 0.7) + towerHeight * Math.exp(-Math.pow((t - towerCentre) / (0.15 + tower * 0.05), 2));
  // Edge lobes along the top outline, pushed inward so their bumps form the edge.
  const lobes: { x: number; y: number; r: number; t: number }[] = [];
  let t = 0.015;
  while (t < 0.985) {
    const r = 9 + random() * 15 + Math.min(profile(t), 160) * 0.09;
    const x = -width / 2 + t * width;
    lobes.push({ x: r1(x), y: r1(-profile(t) + r * 0.55), r: r1(r), t });
    t += (r * (0.7 + random() * 0.35)) / width;
  }
  // The tower's flanks get their own bumps.
  if (tower > 0) {
    for (let k = 0; k < 10; k++) {
      const side = k % 2 ? 1 : -1;
      const yy = -dome - (k / 10) * towerHeight * 0.9;
      const tt = towerCentre + side * (0.06 + 0.1 * (1 - k / 10)) * (0.8 + tower * 0.4);
      const r = 14 + random() * 14;
      lobes.push({ x: r1(-width / 2 + tt * width), y: r1(yy), r: r1(r), t: tt });
    }
  }
  const outline = Array.from({ length: 41 }, (_, i) => `${r1(-width / 2 + (i / 40) * width)} ${r1(-profile(i / 40) + 10)}`).join(" L");
  const top = -dome - towerHeight - 30;
  const puffs = Array.from({ length: 3 }, (_, index) => {
    const side = index % 2 ? 1 : -1;
    return { x: r1(side * (width * 0.52 + 14 + random() * 34)), y: r1(-10 - random() * 26), s: r1(0.35 + random() * 0.3) };
  });
  const veil = Array.from({ length: 5 }, () => ({ x: r1((random() - 0.5) * width * 0.6), y: r1(-dome * (0.3 + random() * 0.4) - towerHeight * random() * 0.6), r: r1(30 + random() * 30) }));
  return (
    <g filter={`url(#${filters}-wash)`}>
      <defs>
        <clipPath id={`${id}-base`}><rect x={-width} y={top - 60} width={width * 2} height={-top + 62} /></clipPath>
        <g id={`${id}-lobes`}>
          <path d={`M${outline} L${width / 2} 2 L${-width / 2} 2 Z`} />
          {lobes.map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={l.r} />)}
        </g>
        <clipPath id={`${id}-shape`}>
          <path d={`M${outline} L${width / 2} 2 L${-width / 2} 2 Z`} />
          {lobes.map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={l.r} />)}
        </clipPath>
        <linearGradient id={`${id}-body`} gradientUnits="userSpaceOnUse" x1="-40" y1={top} x2="30" y2="2">
          <stop offset="0" stopColor={c.light} />
          <stop offset=".5" stopColor={c.mid} />
          <stop offset="1" stopColor={c.shade} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-base)`}>
        {/* Cool core silhouette, then the body. */}
        <use href={`#${id}-lobes`} fill={c.core} />
        <use href={`#${id}-lobes`} fill={`url(#${id}-body)`} transform="translate(-2.5 -3.5) scale(.985)" />
        <g clipPath={`url(#${id}-shape)`}>
        {/* Translucent inner billows for volume. */}
        <g fill={c.light} opacity=".35" filter={`url(#${filters}-soft)`}>{veil.map((v, i) => <circle key={i} cx={v.x} cy={v.y} r={v.r} />)}</g>
        {/* Each lobe's own light and shadow. */}
        <g fill={c.light} filter={`url(#${filters}-soft)`}>{lobes.filter((l) => l.t < 0.85).map((l, i) => <circle key={i} cx={r1(l.x - l.r * 0.32)} cy={r1(l.y - l.r * 0.36)} r={r1(l.r * 0.5)} fillOpacity={r1(Math.min(1, Math.max(0.2, 1.15 - l.t * 1.1)))} />)}</g>
        <g fill={c.warm} opacity=".45" filter={`url(#${filters}-soft)`}>{lobes.filter((l) => l.t < 0.4).map((l, i) => <circle key={i} cx={r1(l.x - l.r * 0.42)} cy={r1(l.y - l.r * 0.5)} r={r1(l.r * 0.3)} />)}</g>
        <g fill={c.shade} filter={`url(#${filters}-soft)`}>{lobes.filter((l) => l.t > 0.3).map((l, i) => <circle key={i} cx={r1(l.x + l.r * 0.3)} cy={r1(l.y + l.r * 0.32)} r={r1(l.r * 0.55)} fillOpacity={r1(Math.min(0.7, l.t * 0.9 - 0.15))} />)}</g>
        {/* Cool core shadow low in the heap. */}
        <ellipse cx={r1(width * 0.08)} cy="-16" rx={r1(width * 0.38)} ry="18" fill={c.deep} opacity=".26" filter={`url(#${filters}-soft)`} />
        </g>
      </g>
      {/* Feathered flat base. */}
      <ellipse cx="0" cy="-2" rx={r1(width * 0.5)} ry="6" fill={c.shade} filter={`url(#${filters}-feather)`} />
      <ellipse cx={r1(width * 0.06)} cy="-5" rx={r1(width * 0.4)} ry="3.5" fill={c.core} opacity=".55" filter={`url(#${filters}-feather)`} />
      {/* Wispy fringes trailing off the base. */}
      <g fill={c.mid} opacity=".55" filter={`url(#${filters}-feather)`}>
        <ellipse cx={r1(-width * 0.6)} cy="-4" rx="36" ry="3.6" />
        <ellipse cx={r1(width * 0.62)} cy="-7" rx="44" ry="4.4" />
        <ellipse cx={r1(width * 0.76)} cy="-1" rx="26" ry="2.6" />
      </g>
      {/* Satellite puffs, softer than the main heap. */}
      <g filter={`url(#${filters}-soft)`}>
        {puffs.map((s, index) => (
          <g key={index} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
            <ellipse cx="0" cy="-2" rx="34" ry="8" fill={c.shade} />
            <circle cx="-12" cy="-10" r="13" fill={c.mid} /><circle cx="6" cy="-16" r="16" fill={c.mid} /><circle cx="20" cy="-8" r="10" fill={c.mid} />
            <circle cx="-2" cy="-20" r="9" fill={c.light} />
          </g>
        ))}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------------ */
/* Flowers — shared shapes, origin at the stem base                          */
/* ------------------------------------------------------------------------ */

function Leaf({ d, fill = "#5a9a45", vein = "#3f7a34" }: { d: string; fill?: string; vein?: string }) {
  return <path d={d} fill={fill} stroke={vein} strokeWidth=".5" />;
}

function DaisyShape() {
  return (
    <g>
      <path d="M0 0 Q-2 -14 1 -30" stroke="#4f8a3a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Leaf d="M-1 -8 Q-9 -12 -11 -18 Q-4 -15 -1 -10 Z" />
      <Leaf d="M0 -15 Q8 -18 10 -24 Q3 -22 0 -17 Z" />
      <g transform="translate(1 -31)">
        {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx="0" cy="-5.6" rx="1.9" ry="5.2" fill={i % 3 === 0 ? "#f3efe6" : "#fffdf7"} stroke="#ded7c8" strokeWidth=".35" transform={`rotate(${r1(i * (360 / 14))})`} />)}
        <circle r="2.9" fill="#f2b630" />
        <circle r="2.9" fill="none" stroke="#c98a1c" strokeWidth=".6" strokeDasharray=".6 .8" />
        <circle cx="-.9" cy="-.9" r="1" fill="#ffe08a" />
      </g>
    </g>
  );
}

function PoppyShape() {
  return (
    <g>
      <path d="M0 0 Q3 -18 -1 -36" stroke="#58903f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M0 -4 l-1 -1 M1 -12 l1.4 -.6 M-.5 -22 l-1.4 -.4" stroke="#7fb05e" strokeWidth=".6" />
      <Leaf d="M0 -6 Q-6 -9 -10 -16 Q-7 -14 -6 -17 Q-4 -12 0 -9 Z" fill="#62a04a" />
      <g transform="translate(-1 -38)">
        <path d="M0 2 C-11 3 -13 -9 -6 -11 C-3 -12 -1 -10 0 -9 Z" fill="#c73a2a" />
        <path d="M0 2 C11 3 13 -9 6 -11 C3 -12 1 -10 0 -9 Z" fill="#d8452f" />
        <path d="M0 2 C-9 0 -8 -12 0 -12 C8 -12 9 0 0 2 Z" fill="#e2553a" />
        <path d="M-6 -9 C-3 -11 3 -11 6 -9" stroke="#f58a68" strokeWidth="1.1" fill="none" opacity=".8" />
        <path d="M-4 -3 C-2 -1 2 -1 4 -3" stroke="#9d2418" strokeWidth=".8" fill="none" />
        <circle cx="0" cy="-5" r="2.4" fill="#2b1d1a" />
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={r1(Math.cos(i * 0.785) * 3.6)} cy={r1(-5 + Math.sin(i * 0.785) * 3.6)} r=".55" fill="#3a2a24" />)}
      </g>
    </g>
  );
}

function ButtercupShape() {
  return (
    <g>
      <path d="M0 0 Q-3 -12 0 -26" stroke="#4f8a3a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M0 -12 Q5 -16 6 -20" stroke="#4f8a3a" strokeWidth="1" fill="none" />
      <Leaf d="M0 -3 Q-8 -4 -9 -9 Q-6 -8 -5 -11 Q-3 -6 0 -5 Z" />
      <circle cx="6" cy="-21" r="1.6" fill="#e9b326" />
      <g transform="translate(0 -28)">
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i * 72 - 90) * (Math.PI / 180);
          return <circle key={i} cx={r1(Math.cos(a) * 3.1)} cy={r1(Math.sin(a) * 3.1)} r="3.1" fill={i < 2 ? "#ffd23a" : "#f6c22b"} stroke="#d9a01a" strokeWidth=".4" />;
        })}
        <ellipse cx="-2.6" cy="-3.2" rx="1.2" ry=".7" fill="#fff6c4" opacity=".9" />
        <circle r="1.7" fill="#d99a12" />
        <circle r="1.7" fill="none" stroke="#8f6a10" strokeWidth=".5" strokeDasharray=".4 .6" />
      </g>
    </g>
  );
}

function LavenderShape() {
  const buds = Array.from({ length: 13 }, (_, i) => ({ y: -22 - i * 1.5, side: i % 2 ? 1 : -1, tone: ["#7a5cb8", "#9a7bd2", "#6a4fa3", "#b49ae0"][i % 4], s: 1 - i * 0.04 }));
  return (
    <g>
      <path d="M0 0 Q1 -12 0 -24 L0 -40" stroke="#6f8f5a" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M0 -4 Q-5 -10 -5 -16 M0 -6 Q4 -12 5 -17" stroke="#8aa874" strokeWidth=".9" fill="none" />
      {buds.map((b, i) => <ellipse key={i} cx={r1(b.side * 1.5 * b.s)} cy={r1(b.y)} rx={r1(1.5 * b.s)} ry={r1(2.4 * b.s)} fill={b.tone} transform={`rotate(${b.side * 22} ${r1(b.side * 1.5 * b.s)} ${r1(b.y)})`} />)}
      <ellipse cx="0" cy="-41.5" rx=".9" ry="1.6" fill="#b49ae0" />
    </g>
  );
}

function CloverShape() {
  return (
    <g>
      <path d="M0 0 Q1 -8 0 -16" stroke="#4f8a3a" strokeWidth="1.2" fill="none" />
      <g transform="translate(-6 -2)">
        {[0, 120, 240].map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path d="M0 0 C-4 -2 -4 -7 0 -6 C4 -7 4 -2 0 0 Z" fill="#4f8a3a" />
            <path d="M-1.6 -3.6 L0 -2.4 L1.6 -3.6" stroke="#a8cf86" strokeWidth=".5" fill="none" />
          </g>
        ))}
      </g>
      <g transform="translate(0 -19)">
        <circle r="4.6" fill="#c56d98" />
        {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="0" cy="-3.6" rx=".9" ry="2" fill={i % 2 ? "#e9a3c3" : "#d785ad"} transform={`rotate(${i * 30})`} />)}
        <ellipse cx="-1.2" cy="-2" rx="1.8" ry="1.2" fill="#f6c6db" opacity=".8" />
      </g>
    </g>
  );
}

const FLOWER_KINDS = ["daisy", "poppy", "buttercup", "lavender", "clover"] as const;
export type FlowerKind = (typeof FLOWER_KINDS)[number];
const FLOWER_SHAPES: Record<FlowerKind, () => ReactNode> = { daisy: DaisyShape, poppy: PoppyShape, buttercup: ButtercupShape, lavender: LavenderShape, clover: CloverShape };

/* ------------------------------------------------------------------------ */
/* Sprite sheet: defined once per scene, placed with <use>                    */
/* ------------------------------------------------------------------------ */

function Tuft({ seed, palette }: { seed: number; palette: SpritePalette }) {
  const random = seeded(seed);
  const blades = Array.from({ length: 9 }, (_, i) => {
    const x = r1((i - 4) * 2.4 + (random() - 0.5) * 2);
    const h = r1(12 + random() * 18);
    const lean = r1((random() - 0.5) * 14);
    const w = r1(1.6 + random() * 1.2);
    const tone = palette.grass[Math.floor(random() * 3)];
    return { x, h, lean, w, tone };
  });
  return (
    <g>
      {blades.map((b, i) => <path key={i} d={`M${b.x - b.w} 0 Q${r1(b.x + b.lean * 0.3)} ${r1(-b.h * 0.6)} ${r1(b.x + b.lean)} ${-b.h} Q${r1(b.x + b.lean * 0.3 + b.w)} ${r1(-b.h * 0.55)} ${r1(b.x + b.w)} 0 Z`} fill={b.tone} />)}
      {blades.filter((_, i) => i % 2 === 0).map((b, i) => <path key={i} d={`M${r1(b.x + b.lean * 0.62)} ${r1(-b.h * 0.72)} Q${r1(b.x + b.lean * 0.85)} ${r1(-b.h * 0.9)} ${r1(b.x + b.lean)} ${-b.h}`} stroke={palette.tip} strokeWidth=".9" fill="none" strokeLinecap="round" opacity=".85" />)}
    </g>
  );
}

function Oak({ palette }: { palette: SpritePalette }) {
  const random = seeded(71);
  const clumps = Array.from({ length: 16 }, () => ({ x: r1((random() - 0.5) * 120), y: r1(-96 - random() * 70), r: r1(20 + random() * 18) }));
  const [d1, d2, d3, d4] = palette.leaf;
  return (
    <g>
      <ellipse cx="34" cy="2" rx="78" ry="9" fill={palette.shadow} opacity=".26" />
      <ellipse cx="22" cy="1" rx="44" ry="5" fill={palette.shadow} opacity=".22" />
      <path d="M-11 1 Q-16 0 -18 3 L18 3 Q15 0 11 1 Q6 -40 5 -70 L13 -98 L8 -100 L1 -80 L-3 -100 L-9 -98 L-6 -70 Q-7 -40 -11 1 Z" fill={palette.trunk[0]} />
      <path d="M-4 -2 Q-3 -40 -2 -70 M3 -10 Q4 -40 4 -62" stroke={palette.trunk[1]} strokeWidth="2" fill="none" opacity=".8" />
      <path d="M2 -78 Q24 -92 40 -108 M-3 -82 Q-24 -96 -42 -104" stroke={palette.trunk[0]} strokeWidth="5" fill="none" strokeLinecap="round" />
      <g fill={d1}>{clumps.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.r} />)}</g>
      <g fill={d2}>{clumps.map((c, i) => <circle key={i} cx={r1(c.x - 5)} cy={r1(c.y - 6)} r={r1(c.r * 0.82)} />)}</g>
      <g fill={d3}>{clumps.filter((c) => c.x < 25).map((c, i) => <circle key={i} cx={r1(c.x - 10)} cy={r1(c.y - 11)} r={r1(c.r * 0.55)} />)}</g>
      <g fill={d4} opacity=".7">{clumps.filter((c) => c.x < 5 && c.y < -120).map((c, i) => <circle key={i} cx={r1(c.x - 14)} cy={r1(c.y - 15)} r={r1(c.r * 0.26)} />)}</g>
      <g fill={d1} opacity=".55">{clumps.filter((c) => c.x > 20).map((c, i) => <circle key={i} cx={r1(c.x + 4)} cy={r1(c.y + 8)} r={r1(c.r * 0.5)} />)}</g>
    </g>
  );
}

function Poplar({ palette }: { palette: SpritePalette }) {
  const [p1, p2, p3] = palette.poplar;
  return (
    <g>
      <ellipse cx="16" cy="1" rx="30" ry="4" fill={palette.shadow} opacity=".24" />
      <path d="M-3 1 L-2 -22 L2 -22 L3 1 Z" fill={palette.trunk[0]} />
      <path d="M0 -18 C-15 -30 -16 -78 -6 -112 C-2 -124 2 -124 6 -112 C16 -78 15 -30 0 -18 Z" fill={p1} />
      <path d="M-2 -24 C-13 -38 -12 -80 -4 -108 C-1 -116 1 -110 2 -100 C-2 -70 -2 -40 -2 -24 Z" fill={p2} />
      <path d="M-8 -40 Q-10 -56 -7 -70 M-6 -78 Q-7 -90 -4 -100 M-9 -54 Q-6 -60 -5 -66" stroke={p3} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".8" />
      <path d="M6 -36 Q9 -60 6 -90" stroke={p1} strokeWidth="3" fill="none" opacity=".6" />
    </g>
  );
}

function Pine({ palette }: { palette: SpritePalette }) {
  const [p1, p2, p3] = palette.pine;
  const tiers = Array.from({ length: 6 }, (_, i) => ({ y: -14 - i * 15, w: 30 - i * 4.4 }));
  return (
    <g>
      <ellipse cx="18" cy="1" rx="34" ry="4" fill={palette.shadow} opacity=".24" />
      <path d="M-3 1 L-2 -18 L2 -18 L3 1 Z" fill={palette.trunk[0]} />
      {tiers.map((t, i) => (
        <g key={i}>
          <path d={`M${-t.w} ${t.y} L${r1(-t.w * 0.55)} ${t.y - 6} L${r1(-t.w * 0.7)} ${t.y - 4} L0 ${t.y - 26} L${r1(t.w * 0.7)} ${t.y - 4} L${r1(t.w * 0.55)} ${t.y - 6} L${t.w} ${t.y} Q0 ${t.y + 5} ${-t.w} ${t.y} Z`} fill={p1} />
          <path d={`M${r1(-t.w * 0.85)} ${t.y - 1} L0 ${t.y - 24} L${r1(-t.w * 0.2)} ${t.y + 1} Z`} fill={p2} />
          <path d={`M${r1(-t.w * 0.6)} ${t.y - 6} L${r1(-t.w * 0.25)} ${t.y - 15}`} stroke={p3} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

function Bush({ palette }: { palette: SpritePalette }) {
  const [d1, d2, d3, d4] = palette.leaf;
  return (
    <g>
      <ellipse cx="6" cy="1" rx="16" ry="2.6" fill={palette.shadow} opacity=".25" />
      <circle cx="-7" cy="-6" r="7" fill={d1} /><circle cx="3" cy="-9" r="9" fill={d1} /><circle cx="11" cy="-5" r="6" fill={d1} />
      <circle cx="-6" cy="-8" r="5" fill={d2} /><circle cx="2" cy="-11" r="6.5" fill={d2} />
      <circle cx="-1" cy="-13" r="3.6" fill={d3} /><circle cx="-8" cy="-10" r="2.6" fill={d3} />
      <circle cx="-2" cy="-15" r="1.4" fill={d4} />
    </g>
  );
}

function Cottage({ p, palette }: { p: string; palette: SpritePalette }) {
  return (
    <g>
      <ellipse cx="6" cy="1" rx="30" ry="3" fill={palette.shadow} opacity=".22" />
      <path d="M-20 0 L-20 -22 L20 -22 L20 0 Z" fill={palette.wall[0]} />
      <path d="M8 0 L8 -22 L20 -22 L20 0 Z" fill={palette.wall[1]} opacity=".6" />
      <path d="M-26 -20 L-3 -40 L22 -40 L28 -20 Z" fill={palette.roof[0]} />
      <path d="M-22 -24 L26 -24 M-16 -30 L24 -30 M-10 -35 L23 -35" stroke={palette.roof[1]} strokeWidth="1.1" />
      <path d="M12 -38 L12 -48 L18 -48 L18 -37 Z" fill={palette.roof[1]} />
      <path d="M15 -50 Q11 -58 16 -64 Q21 -70 17 -78" stroke="#e9e4da" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".55" />
      <circle cx="-9" cy="-12" r="9" fill={`url(#${p}-lamp)`} />
      <rect x="-12.5" y="-15.5" width="7" height="7" fill="#ffcf6a" stroke="#6e4329" strokeWidth=".8" />
      <path d="M-9 -15.5 V-8.5 M-12.5 -12 H-5.5" stroke="#6e4329" strokeWidth=".6" />
      <rect x="4" y="-13" width="7" height="13" rx="1" fill="#6e4329" />
      <circle cx="9.5" cy="-6.5" r=".7" fill="#f1b84b" />
      <path d="M-30 0 V-6 M-26 0 V-6 M-22 0 V-6 M-31 -4 H-21" stroke={palette.fence} strokeWidth="1" />
    </g>
  );
}

function Sheep() {
  return (
    <g>
      <ellipse cx="1" cy=".4" rx="7" ry="1.2" fill="#2f4a2a" opacity=".2" />
      <path d="M-4 0 V-3 M-1 0 V-3 M3 0 V-3 M5 0 V-3" stroke="#3a3330" strokeWidth="1" />
      <circle cx="-3" cy="-5" r="3" fill="#f3efe4" /><circle cx="1" cy="-6" r="3.6" fill="#fbf8f0" /><circle cx="4" cy="-4.6" r="2.8" fill="#f3efe4" />
      <ellipse cx="7.4" cy="-5.6" rx="1.8" ry="1.5" fill="#3a3330" />
      <circle cx="0" cy="-7.6" r="1.4" fill="#ffffff" />
    </g>
  );
}

function Bird() {
  return (
    <g>
      <path d="M0 0 C-5 -5 -11 -7 -18 -4 C-12 -4 -7 -2 -2 1 Z M0 0 C5 -5 11 -7 18 -4 C12 -4 7 -2 2 1 Z" fill="#33404b" />
      <path d="M-14 -4.6 C-10 -5 -6 -3 -3 -1 M14 -4.6 C10 -5 6 -3 3 -1" stroke="#56636e" strokeWidth=".6" fill="none" />
      <ellipse cx="0" cy=".6" rx="3" ry="1.5" fill="#2b353f" />
      <path d="M2.6 .2 L4.6 .6 L2.6 1" fill="#2b353f" />
    </g>
  );
}

/** `ground` sheets (footpath, edges) carry only grass and flowers. */
function SpriteSheet({ p, palette, ground = false }: { p: string; palette: SpritePalette; ground?: boolean }) {
  return (
    <>
      <radialGradient id={`${p}-lamp`}>
        <stop offset="0" stopColor="#ffd27a" stopOpacity=".9" />
        <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
      </radialGradient>
      <pattern id={`${p}-mow`} width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
        <rect width="45" height="90" fill="#ffffff" />
      </pattern>
      <pattern id={`${p}-turf`} width="24" height="14" patternUnits="userSpaceOnUse">
        <path d="M2 12 l1 -4 M9 13 l-1 -5 M15 11 l1.4 -4 M21 13 l-.6 -4" stroke="#24401f" strokeWidth=".8" strokeLinecap="round" />
      </pattern>
      <g id={`${p}-tuftA`}><Tuft seed={11} palette={palette} /></g>
      <g id={`${p}-tuftB`}><Tuft seed={23} palette={palette} /></g>
      <g id={`${p}-tuftC`}><Tuft seed={37} palette={palette} /></g>
      {!ground && (
        <>
          <g id={`${p}-oak`}><Oak palette={palette} /></g>
          <g id={`${p}-poplar`}><Poplar palette={palette} /></g>
          <g id={`${p}-pine`}><Pine palette={palette} /></g>
          <g id={`${p}-bush`}><Bush palette={palette} /></g>
          <g id={`${p}-cottage`}><Cottage p={p} palette={palette} /></g>
          <g id={`${p}-sheep`}><Sheep /></g>
          <g id={`${p}-bird`}><Bird /></g>
        </>
      )}
      {FLOWER_KINDS.map((kind) => {
        const Shape = FLOWER_SHAPES[kind];
        return <g key={kind} id={`${p}-${kind}`}><Shape /></g>;
      })}
    </>
  );
}

/** One wildflower drawn in place (origin at the stem base), for hand-placed art. */
export function FlowerSprite({ kind }: { kind: FlowerKind }) {
  const Shape = FLOWER_SHAPES[kind];
  return <Shape />;
}

/** One grass tuft drawn in place (origin at its roots), for hand-placed art. */
export function GrassTuft({ seed }: { seed: number }) {
  return <Tuft seed={seed} palette={dayPalette} />;
}

/* ------------------------------------------------------------------------ */
/* Placement helpers                                                          */
/* ------------------------------------------------------------------------ */

function Use({ p, sprite, x, y, s = 1, flip = false, opacity, className, style }: { p: string; sprite: string; x: number; y: number; s?: number; flip?: boolean; opacity?: number; className?: string; style?: CSSProperties }) {
  const k = Math.round(s * 100) / 100;
  const scale = flip ? `${-k} ${k}` : k === 1 ? "" : `${k}`;
  return <use href={`#${p}-${sprite}`} transform={`translate(${r1(x)} ${r1(y)})${scale ? ` scale(${scale})` : ""}`} opacity={opacity} className={className} style={style} />;
}

/** Tiny distant flowers as dots. */
export function Flowers({ seed, count, x0, x1, y0, y1, palette }: { seed: number; count: number; x0: number; x1: number; y0: number; y1: number; palette: string[] }) {
  const random = seeded(seed);
  return (
    <g>
      {Array.from({ length: count }, (_, index) => {
        const y = y0 + random() * (y1 - y0);
        const depth = (y - y0) / Math.max(1, y1 - y0);
        return <circle key={index} cx={r1(x0 + random() * (x1 - x0))} cy={r1(y)} r={r1(1 + depth * 2.2 + random() * 0.8)} fill={palette[Math.floor(random() * palette.length)]} />;
      })}
    </g>
  );
}

const DOTS = ["#fff8ec", "#f6d65a", "#e7857a", "#b9a6e3", "#fff8ec", "#f3a46b"];

/** Detailed flowers along a band, growing with depth (y). Weighted toward daisies and buttercups. */
function FlowerBed({ p, seed, count, x0, x1, y0, y1, s0, s1 }: { p: string; seed: number; count: number; x0: number; x1: number; y0: number; y1: number; s0: number; s1: number }) {
  const random = seeded(seed);
  const weights: FlowerKind[] = ["daisy", "daisy", "buttercup", "buttercup", "poppy", "lavender", "clover", "daisy", "clover"];
  const items = Array.from({ length: count }, () => {
    const y = y0 + random() * (y1 - y0);
    const depth = (y - y0) / Math.max(1, y1 - y0);
    return { kind: weights[Math.floor(random() * weights.length)], x: x0 + random() * (x1 - x0), y, s: (s0 + (s1 - s0) * depth) * (0.8 + random() * 0.4), flip: random() > 0.5 };
  }).sort((a, b) => a.y - b.y);
  return <g>{items.map((f, i) => <Use key={i} p={p} sprite={f.kind} x={f.x} y={f.y} s={f.s} flip={f.flip} />)}</g>;
}

function TuftRow({ p, seed, count, x0, x1, y0, y1, s0, s1 }: { p: string; seed: number; count: number; x0: number; x1: number; y0: number; y1: number; s0: number; s1: number }) {
  const random = seeded(seed);
  const items = Array.from({ length: count }, (_, i) => {
    const y = y0 + random() * (y1 - y0);
    const depth = (y - y0) / Math.max(1, y1 - y0);
    return { sprite: ["tuftA", "tuftB", "tuftC"][i % 3], x: x0 + ((i + random()) / count) * (x1 - x0), y, s: (s0 + (s1 - s0) * depth) * (0.8 + random() * 0.5), flip: random() > 0.5 };
  }).sort((a, b) => a.y - b.y);
  return <g>{items.map((t, i) => <Use key={i} p={p} sprite={t.sprite} x={t.x} y={t.y} s={t.s} flip={t.flip} />)}</g>;
}

/** Points along a gentle wave, for hedgerows, walls and fences. */
function wave(x0: number, x1: number, step: number, y: number, amp: number, phase: number) {
  const points: [number, number][] = [];
  for (let x = x0; x <= x1; x += step) points.push([x, y + Math.sin(x / 210 + phase) * amp]);
  return points;
}

function StoneWall({ points, random, palette }: { points: [number, number][]; random: () => number; palette: SpritePalette }) {
  return (
    <g>
      {points.map(([x, y], i) => {
        const w = 7 + random() * 6;
        const tone = palette.stone[Math.floor(random() * 3)];
        return (
          <g key={i}>
            <rect x={r1(x)} y={r1(y - 7)} width={r1(w)} height="4.2" rx="2" fill={tone} />
            <rect x={r1(x + w * 0.4)} y={r1(y - 3.4)} width={r1(w)} height="4" rx="2" fill={palette.stone[(i + 1) % 3]} />
            {i % 5 === 0 && <circle cx={r1(x + 2)} cy={r1(y - 7)} r="1.6" fill="#7fa45a" />}
          </g>
        );
      })}
    </g>
  );
}

function Fence({ points, palette }: { points: [number, number][]; palette: SpritePalette }) {
  const rail = (dy: number) => `M${points.map(([x, y]) => `${r1(x)} ${r1(y + dy)}`).join(" L")}`;
  return (
    <g stroke={palette.fence} strokeLinecap="round">
      <path d={rail(-14)} strokeWidth="1.8" fill="none" />
      <path d={rail(-7)} strokeWidth="1.8" fill="none" />
      {points.map(([x, y], i) => <path key={i} d={`M${r1(x)} ${r1(y + 1)} L${r1(x)} ${r1(y - 18)}`} strokeWidth="2.6" />)}
      <path d={rail(-14.6)} stroke="#d9c29a" strokeWidth=".6" fill="none" opacity=".7" />
    </g>
  );
}

function Svg({ viewBox, className, preserve = "xMidYMax slice", style, children }: { viewBox: string; className?: string; preserve?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <svg className={className} viewBox={viewBox} preserveAspectRatio={preserve} aria-hidden="true" focusable="false" style={style}>
      {children}
    </svg>
  );
}

/** One stacked layer of a scene; every layer shares the viewBox and cropping so they line up. */
function Layer({ className, children, viewBox = "0 0 1600 900", preserve }: { className?: string; children: ReactNode; viewBox?: string; preserve?: string }) {
  return <Svg viewBox={viewBox} preserve={preserve} className={`scene__layer${className ? ` ${className}` : ""}`}>{children}</Svg>;
}

/** A flock of birds with an individual flap cycle each. */
function Flock({ p, x, y, s = 1, seed = 1 }: { p: string; x: number; y: number; s?: number; seed?: number }) {
  const random = seeded(seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i} transform={`translate(${r1(i * 34 + random() * 12)} ${r1((i % 2) * 18 - random() * 14)}) scale(${r1(0.7 + random() * 0.4)})`}>
          <g className="scene-bird" style={{ animationDelay: `${r1(-random())}s` }}><use href={`#${p}-bird`} /></g>
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------------ */
/* Meadow scene                                                               */
/* ------------------------------------------------------------------------ */

/**
 * A full-width meadow for chapter interludes and painted cards: a deep summer
 * sky with towering cumulus, layered hills with mown stripes, hedgerows, a
 * stone wall, a stream, cottages with lamp-lit windows, sheep, a fence, three
 * kinds of tree, swaying grass and detailed wildflowers. With `footpath` it
 * also paints a track across the front. Fills its positioned parent and
 * crops from the top so the ground always shows.
 */
export function MeadowScene({ seed = 1, mood = "noon", footpath = true, className }: { seed?: number; mood?: Mood; footpath?: boolean; className?: string }) {
  const p = `meadow-${seed}`;
  const land = meadowLand[mood];
  const palette = dayPalette;
  const flip = seed % 2 === 0;
  const random = seeded(seed * 7 + 3);
  const tone: CloudTone = mood === "golden" ? "golden" : "day";
  const side = (x: number) => (flip ? 1600 - x : x);
  const treeX = side(1250 + random() * 120);
  const cottageX = side(460 + random() * 160);
  const cottage2X = side(1080 + random() * 120);
  const hedge = wave(0, 1600, 26, 646, 9, seed).map(([x, y]) => [x + random() * 8, y - random() * 3] as [number, number]).filter((_, i) => i % 11 < 8);
  const wall = wave(side(80) < 800 ? 40 : 900, side(80) < 800 ? 700 : 1560, 13, 612, 6, seed + 1);
  const fence = wave(flip ? 980 : 60, flip ? 1560 : 620, 46, 742, 5, seed + 2);
  const sheep = Array.from({ length: 7 }, () => [r1(side(200 + random() * 700)), r1(600 + random() * 18), r1(0.8 + random() * 0.5)] as const);
  const poplars = Array.from({ length: 4 }, (_, i) => [side(860 + i * 26 + random() * 10), 604 + random() * 4, 0.42 + random() * 0.12] as const);
  return (
    <div className={`scene scene--meadow scene--${mood}${className ? ` ${className}` : ""}`} aria-hidden="true">
      <Layer>
        <defs>
          <PaintFilters id={p} />
          <SpriteSheet p={p} palette={palette} />
          <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={land.sky[0]} />
            <stop offset=".46" stopColor={land.sky[1]} />
            <stop offset=".68" stopColor={land.sky[2]} />
          </linearGradient>
          <radialGradient id={`${p}-glow`} cx={flip ? ".22" : ".8"} cy=".62" r=".6">
            <stop offset="0" stopColor={land.glow} stopOpacity=".95" />
            <stop offset="1" stopColor={land.glow} stopOpacity="0" />
          </radialGradient>
          {(["far", "mid", "near", "front"] as const).map((band) => (
            <linearGradient key={band} id={`${p}-${band}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={land[band][0]} />
              <stop offset="1" stopColor={land[band][1]} />
            </linearGradient>
          ))}
          <g id={`${p}-cu-tower`}><Cloud id={`${p}-cu-tower`} filters={p} seed={seed * 10 + 9} tone={tone} tower={1} width={330} /></g>
          <g id={`${p}-cu-big`}><Cloud id={`${p}-cu-big`} filters={p} seed={seed * 10 + 1} tone={tone} tower={0.45} width={320} /></g>
          <g id={`${p}-cu-wide`}><Cloud id={`${p}-cu-wide`} filters={p} seed={seed * 10 + 2} tone={tone} tower={0.1} width={300} /></g>
          <g id={`${p}-cu-small`}><Cloud id={`${p}-cu-small`} filters={p} seed={seed * 10 + 3} tone={tone} width={200} /></g>
        </defs>
        <rect width="1600" height="900" fill={`url(#${p}-sky)`} />
        <rect width="1600" height="900" fill={`url(#${p}-glow)`} />
        {/* A far, hazy thunderhead that barely moves. */}
        <g opacity=".82" filter={`url(#${p}-haze)`}><Use p={p} sprite="cu-tower" x={side(1180)} y={540} s={1.8} /></g>
        <rect y="500" width="1600" height="120" fill={land.haze} opacity=".35" filter={`url(#${p}-haze)`} />
      </Layer>
      <Layer className="scene-drift scene-drift--slow">
        <Use p={p} sprite="cu-big" x={side(330)} y={430} s={1.2} />
        <Use p={p} sprite="cu-wide" x={side(1000)} y={300} s={0.75} />
      </Layer>
      <Layer className="scene-drift scene-drift--fast">
        <Use p={p} sprite="cu-small" x={760} y={160} s={0.6} />
        <Use p={p} sprite="cu-small" x={1490} y={210} s={0.5} />
        <Use p={p} sprite="cu-wide" x={140} y={240} s={0.4} />
      </Layer>
      <Layer className="scene-birds">
        <Flock p={p} x={side(940)} y={250} seed={seed} />
        <Flock p={p} x={side(380)} y={330} s={0.6} seed={seed + 5} />
      </Layer>
      <Layer>
        {/* Far blue hills. */}
        <path d="M0 560 Q160 500 330 532 T700 510 T1080 528 T1400 498 T1600 520 L1600 900 L0 900 Z" fill={`url(#${p}-far)`} opacity=".85" />
        <path d="M0 566 Q160 506 330 538 T700 516" stroke="#ffffff" strokeOpacity=".25" strokeWidth="4" fill="none" />
        {/* Mid meadows with mown stripes, a stone wall, cottages, poplars and sheep. */}
        <path d="M0 600 Q260 552 520 590 T1060 572 T1600 584 L1600 900 L0 900 Z" fill={`url(#${p}-mid)`} />
        <path d="M0 600 Q260 552 520 590 T1060 572 T1600 584 L1600 900 L0 900 Z" fill={`url(#${p}-mow)`} opacity=".07" />
        <path d="M0 604 Q260 560 520 594 T1060 576" stroke="#ffffff" strokeOpacity=".22" strokeWidth="5" fill="none" />
        <StoneWall points={wall} random={random} palette={palette} />
        {sheep.map(([x, y, s], i) => <Use key={i} p={p} sprite="sheep" x={x} y={y} s={s} flip={i % 2 === 0} />)}
        {poplars.map(([x, y, s], i) => <Use key={i} p={p} sprite="poplar" x={x} y={y} s={s} />)}
        <Use p={p} sprite="cottage" x={cottageX} y={600} s={0.95} flip={flip} />
        <Use p={p} sprite="cottage" x={cottage2X} y={590} s={0.6} flip={!flip} />
        <Use p={p} sprite="pine" x={cottageX + (flip ? -70 : 70)} y={604} s={0.6} />
        <Use p={p} sprite="pine" x={cottageX + (flip ? -94 : 94)} y={606} s={0.45} />
        {/* Hedgerows stitched across the middle distance. */}
        {hedge.map(([x, y], i) => <Use key={i} p={p} sprite="bush" x={x} y={y} s={0.75 + (i % 3) * 0.12} flip={i % 2 === 0} />)}
        {/* A stream winding through the middle meadow, with its banks. */}
        <path d={flip ? "M1240 606 Q1180 618 1120 614 T1000 632 T880 660 L860 676 L904 676 Q960 652 1010 642 T1124 624 T1246 612 Z" : "M360 606 Q420 618 480 614 T600 632 T720 660 L740 676 L696 676 Q640 652 590 642 T476 624 T354 612 Z"} fill="#8cc0dc" />
        <path d={flip ? "M1240 606 Q1180 618 1120 614 T1000 632 T880 660" : "M360 606 Q420 618 480 614 T600 632 T720 660"} stroke="#5e8f6a" strokeWidth="1.6" fill="none" opacity=".55" />
        {/* Near hill. */}
        <path d="M0 670 Q300 630 640 672 T1300 662 T1600 652 L1600 900 L0 900 Z" fill={`url(#${p}-near)`} />
        <path d="M0 670 Q300 630 640 672 T1300 662 T1600 652 L1600 900 L0 900 Z" fill={`url(#${p}-mow)`} opacity=".06" />
        <path d="M0 670 Q300 630 640 672 T1300 662 T1600 652 L1600 900 L0 900 Z" fill={`url(#${p}-turf)`} opacity=".1" />
        <Flowers seed={seed * 31} count={60} x0={0} x1={1600} y0={664} y1={760} palette={DOTS} />
        <Use p={p} sprite="oak" x={treeX} y={712} s={1} flip={flip} />
        <Use p={p} sprite="oak" x={side(1500)} y={690} s={0.55} flip={flip} />
        <Use p={p} sprite="poplar" x={treeX + (flip ? 140 : -140)} y={700} s={0.8} />
        <Use p={p} sprite="pine" x={treeX + (flip ? 190 : -190)} y={706} s={0.7} />
        <Fence points={fence} palette={palette} />
        <FlowerBed p={p} seed={seed * 43} count={40} x0={0} x1={1600} y0={700} y1={760} s0={0.32} s1={0.5} />
        {/* Front meadow. */}
        <path d="M0 760 Q400 720 800 748 T1600 732 L1600 900 L0 900 Z" fill={`url(#${p}-front)`} />
        <path d="M0 760 Q400 720 800 748 T1600 732 L1600 900 L0 900 Z" fill={`url(#${p}-turf)`} opacity=".14" />
        {footpath && (
          <g>
            <path d="M0 790 Q400 760 800 780 T1600 770 L1600 814 Q1200 808 800 828 T0 838 Z" fill="#efdfb4" />
            <path d="M0 812 Q400 786 800 804 T1600 792" stroke="#f8eecf" strokeWidth="8" fill="none" opacity=".8" />
          </g>
        )}
        <path d="M0 838 Q420 806 820 836 T1600 822 L1600 900 L0 900 Z" fill={land.fore} />
        <Flowers seed={seed * 37} count={50} x0={0} x1={1600} y0={750} y1={900} palette={DOTS} />
        <FlowerBed p={p} seed={seed * 47} count={64} x0={0} x1={1600} y0={760} y1={900} s0={0.55} s1={1.05} />
      </Layer>
      <Layer className="scene-glints">
        <path d={flip ? "M1180 614 l12 -1 M1070 630 l14 -2 M950 648 l12 -3" : "M420 614 l12 -1 M530 630 l14 -2 M650 648 l12 -3"} stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity=".9" />
      </Layer>
      <Layer className="scene-sway">
        <TuftRow p={p} seed={seed * 53} count={44} x0={0} x1={1600} y0={760} y1={900} s0={0.9} s1={1.5} />
      </Layer>
      <Layer className="scene-sway scene-sway--b">
        <TuftRow p={p} seed={seed * 59} count={40} x0={0} x1={1600} y0={820} y1={900} s0={1.2} s1={1.8} />
      </Layer>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Footpath strip                                                             */
/* ------------------------------------------------------------------------ */

/**
 * The footpath strip at the front of an interlude: a worn sandy track with
 * ruts, pebbles and grass creeping over its edges, plus foreground flowers.
 * The track's centre line is the vertical middle of the strip; with
 * `xMidYMid slice` that stays exactly at the strip's 50% at any width, and
 * styles/scenery.css centres the strip on the band's ground line (88%).
 * A soft band of light above the line helps a dark walker read clearly.
 */
export function MeadowFootpath({ seed = 1, mood = "noon" }: { seed?: number; mood?: Mood }) {
  const p = `path-${seed}`;
  const land = meadowLand[mood];
  const random = seeded(seed * 13 + 5);
  const edge = (y: number, amp: number) => Array.from({ length: 61 }, (_, i) => `${i * 40} ${r1(y + Math.sin(i * 0.7 + seed) * amp + (random() - 0.5) * 3)}`).join(" L");
  const pebbles = Array.from({ length: 44 }, () => ({ x: r1(random() * 2400), y: r1(80 + (random() - 0.5) * 34), r: r1(1.4 + random() * 2.6), t: random() }));
  const ruts = (y: number) => Array.from({ length: 12 }, (_, i) => {
    const x = i * 200 + random() * 60;
    return `M${r1(x)} ${r1(y + (random() - 0.5) * 2)} q${r1(60 + random() * 40)} ${r1((random() - 0.5) * 3)} ${r1(110 + random() * 50)} 0`;
  }).join(" ");
  return (
    <div className="interlude__path" aria-hidden="true">
      <span className="interlude__walklight" />
      <Svg viewBox="0 0 2400 160" preserve="xMidYMid slice" className="scene__layer">
        <defs>
          <SpriteSheet p={p} palette={dayPalette} ground />
          <linearGradient id={`${p}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={land.front[1]} stopOpacity="0" />
            <stop offset=".3" stopColor={land.front[1]} />
            <stop offset="1" stopColor={land.front[1]} />
          </linearGradient>
          <linearGradient id={`${p}-track`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e4cf9c" />
            <stop offset=".5" stopColor="#f6ead0" />
            <stop offset="1" stopColor="#e2cb95" />
          </linearGradient>
        </defs>
        <rect width="2400" height="160" fill={`url(#${p}-g)`} />
        <rect y="30" width="2400" height="30" fill={`url(#${p}-turf)`} opacity=".14" />
        {/* The track: worn, irregular edges either side of the centre line (y = 80). */}
        <path d={`M${edge(60, 3)} L2400 100 L${edge(101, 3).split(" L").reverse().join(" L")} Z`} fill={`url(#${p}-track)`} />
        <path d={`M${edge(61, 3)}`} stroke="#c8ad78" strokeWidth="2" fill="none" opacity=".55" />
        <path d={`M${edge(100, 3)}`} stroke="#bfa36c" strokeWidth="2.4" fill="none" opacity=".6" />
        <path d={ruts(71)} stroke="#d2b985" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".8" />
        <path d={ruts(90)} stroke="#d2b985" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".8" />
        <path d="M0 80 Q600 77 1200 80 T2400 80" stroke="#fbf3dc" strokeWidth="6" fill="none" opacity=".7" />
        {pebbles.map((s, i) => (
          <g key={i}>
            <ellipse cx={s.x} cy={s.y} rx={r1(s.r * 1.5)} ry={s.r} fill={s.t > 0.6 ? "#c9b48a" : s.t > 0.3 ? "#b9a37a" : "#d9cbab"} stroke="#a88f5f" strokeOpacity=".5" strokeWidth=".8" />
            <ellipse cx={r1(s.x - s.r * 0.5)} cy={r1(s.y - s.r * 0.4)} rx={r1(s.r * 0.5)} ry={r1(s.r * 0.3)} fill="#f3ead6" opacity=".8" />
          </g>
        ))}
        <rect y="106" width="2400" height="54" fill={land.fore} />
        <path d={`M${edge(106, 2)} L2400 112 L0 112 Z`} fill={land.fore} />
        <Flowers seed={seed * 61} count={60} x0={0} x1={2400} y0={110} y1={158} palette={DOTS} />
        <FlowerBed p={p} seed={seed * 41} count={46} x0={0} x1={2400} y0={120} y1={160} s0={0.8} s1={1.25} />
        <FlowerBed p={p} seed={seed * 43} count={22} x0={0} x1={2400} y0={40} y1={56} s0={0.45} s1={0.6} />
      </Svg>
      <Svg viewBox="0 0 2400 160" preserve="xMidYMid slice" className="scene__layer scene-sway">
        <TuftRow p={p} seed={seed * 7} count={70} x0={0} x1={2400} y0={56} y1={64} s0={0.7} s1={0.9} />
      </Svg>
      <Svg viewBox="0 0 2400 160" preserve="xMidYMid slice" className="scene__layer scene-sway scene-sway--b">
        <TuftRow p={p} seed={seed * 9} count={70} x0={0} x1={2400} y0={100} y1={108} s0={0.8} s1={1} />
      </Svg>
      <Svg viewBox="0 0 2400 160" preserve="xMidYMid slice" className="scene__layer scene-sway scene-sway--c">
        <TuftRow p={p} seed={seed * 11} count={60} x0={0} x1={2400} y0={130} y1={160} s0={1.2} s1={1.6} />
      </Svg>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Meadow edge                                                                */
/* ------------------------------------------------------------------------ */

function Mushroom() {
  return (
    <g>
      <path d="M-2 0 Q-3 -6 -1.6 -10 L1.6 -10 Q3 -6 2 0 Z" fill="#f4ecdc" stroke="#cbbfa6" strokeWidth=".5" />
      <path d="M-9 -9 Q-8 -19 0 -19 Q8 -19 9 -9 Q0 -11 -9 -9 Z" fill="#c9462f" />
      <path d="M-7 -12 Q-4 -17 0 -17" stroke="#e8735a" strokeWidth="1.2" fill="none" />
      <circle cx="-4" cy="-14" r="1.4" fill="#fff6e6" /><circle cx="2" cy="-16" r="1.1" fill="#fff6e6" /><circle cx="5" cy="-12" r="1.2" fill="#fff6e6" />
    </g>
  );
}

function Ladybird() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="3.4" ry="2.6" fill="#d8352a" />
      <path d="M0 -2.6 V2.6" stroke="#2b1d1a" strokeWidth=".5" />
      <circle cx="3.4" cy="0" r="1.4" fill="#2b1d1a" />
      <circle cx="-1.4" cy="-1" r=".7" fill="#2b1d1a" /><circle cx="1.2" cy=".9" r=".7" fill="#2b1d1a" /><circle cx="-1.2" cy="1.2" r=".5" fill="#2b1d1a" />
      <ellipse cx="-1.6" cy="-1.6" rx=".9" ry=".5" fill="#ffffff" opacity=".6" />
    </g>
  );
}

/**
 * A painted garden border: tufted grass, wildflowers of every species, with a
 * mushroom and a ladybird tucked in. Crops (never stretches) to any width.
 */
export function MeadowEdge({ seed = 5, flip = false, className }: { seed?: number; flip?: boolean; className?: string }) {
  const p = `edge-${seed}`;
  const random = seeded(seed);
  const mushrooms = [r1(240 + random() * 300), r1(1300 + random() * 300)];
  return (
    <div className={`meadow-edge${flip ? " meadow-edge--flip" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true">
      <Svg viewBox="0 0 2000 90" className="scene__layer">
        <defs>
          <SpriteSheet p={p} palette={dayPalette} ground />
          <linearGradient id={`${p}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#86b955" />
            <stop offset="1" stopColor="#5d9442" />
          </linearGradient>
        </defs>
        <path d="M0 90 Q250 66 500 76 T1000 70 T1500 76 T2000 68 L2000 90 Z" fill={`url(#${p}-g)`} />
        <path d="M0 90 Q300 78 600 84 T1200 82 T2000 80 L2000 90 Z" fill="#4f8a3a" />
        <Flowers seed={seed + 1} count={60} x0={0} x1={2000} y0={74} y1={88} palette={DOTS} />
      </Svg>
      <Svg viewBox="0 0 2000 90" className="scene__layer scene-sway">
        <TuftRow p={p} seed={seed * 5} count={54} x0={0} x1={2000} y0={78} y1={88} s0={0.9} s1={1.2} />
      </Svg>
      <Svg viewBox="0 0 2000 90" className="scene__layer">
        <FlowerBed p={p} seed={seed * 3} count={30} x0={20} x1={1980} y0={80} y1={90} s0={1.15} s1={1.5} />
        {mushrooms.map((x, i) => <g key={i} transform={`translate(${x} ${88 - i * 2}) scale(${1.6 - i * 0.3})`}><Mushroom /></g>)}
        <g transform={`translate(${r1(mushrooms[0] + 3)} 56) rotate(-12) scale(1.3)`}><Ladybird /></g>
      </Svg>
      <Svg viewBox="0 0 2000 90" className="scene__layer scene-sway scene-sway--b">
        <TuftRow p={p} seed={seed * 7} count={30} x0={0} x1={2000} y0={86} y1={90} s0={0.7} s1={0.95} />
      </Svg>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Dusk                                                                       */
/* ------------------------------------------------------------------------ */

/**
 * Dusk over the hills for the footer: violet sky warming to apricot, a
 * crescent moon, stars that twinkle in three phases, rose-lit clouds, dark
 * hills with tree silhouettes, cottages with lamp-lit windows and fireflies.
 * The last hill is the footer's own colour so the scene melts into it.
 */
export function DuskScene() {
  const p = "dusk";
  const random = seeded(77);
  const stars = Array.from({ length: 96 }, () => ({ cx: r1(random() * 1600), cy: r1(random() * 260), r: r1(0.5 + random() * 1.5), o: r1(0.35 + random() * 0.6) }));
  const fence = wave(260, 700, 40, 448, 5, 2);
  return (
    <div className="scene scene--dusk" aria-hidden="true">
      <Layer viewBox="0 0 1600 520">
        <defs>
          <PaintFilters id={p} />
          <SpriteSheet p={p} palette={duskPalette} />
          <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f2742" />
            <stop offset=".36" stopColor="#3f4a80" />
            <stop offset=".7" stopColor="#c98a86" />
            <stop offset="1" stopColor="#f2c27f" />
          </linearGradient>
          <radialGradient id={`${p}-moonglow`}>
            <stop offset="0" stopColor="#fff3d6" stopOpacity=".45" />
            <stop offset="1" stopColor="#fff3d6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${p}-horizon`} cx=".3" cy="1" r=".7">
            <stop offset="0" stopColor="#ffd59a" stopOpacity=".7" />
            <stop offset="1" stopColor="#ffd59a" stopOpacity="0" />
          </radialGradient>
          <g id={`${p}-cu-a`}><Cloud id={`${p}-cu-a`} filters={p} seed={41} tone="dusk" tower={0.5} width={320} /></g>
          <g id={`${p}-cu-b`}><Cloud id={`${p}-cu-b`} filters={p} seed={42} tone="dusk" width={260} /></g>
        </defs>
        <rect width="1600" height="520" fill={`url(#${p}-sky)`} />
        <rect width="1600" height="520" fill={`url(#${p}-horizon)`} />
        <g fill="#fff6dc">{stars.filter((_, i) => i % 4 !== 0).map((star, index) => <circle key={index} cx={star.cx} cy={star.cy} r={star.r} opacity={star.o} />)}</g>
        <circle cx="1310" cy="110" r="90" fill={`url(#${p}-moonglow)`} />
        <path d="M1310 76 A34 34 0 1 0 1338 132 A28 28 0 1 1 1310 76 Z" fill="#fff3d6" />
        <circle cx="1296" cy="112" r="3" fill="#e9dcc0" opacity=".7" /><circle cx="1290" cy="98" r="2" fill="#e9dcc0" opacity=".6" />
      </Layer>
      {[0, 1, 2].map((phase) => (
        <Layer key={phase} viewBox="0 0 1600 520" className={`scene-stars scene-stars--${phase}`}>
          <g fill="#fffbe8">{stars.filter((_, i) => i % 4 === 0 && i % 3 === phase).map((star, index) => (
            <g key={index}>
              <circle cx={star.cx} cy={star.cy} r={r1(star.r + 0.4)} />
              <path d={`M${star.cx - 4} ${star.cy} H${star.cx + 4} M${star.cx} ${star.cy - 4} V${star.cy + 4}`} stroke="#fffbe8" strokeWidth=".5" opacity=".7" />
            </g>
          ))}</g>
        </Layer>
      ))}
      <Layer viewBox="0 0 1600 520" className="scene-drift scene-drift--slow">
        <Use p={p} sprite="cu-a" x={360} y={330} s={0.85} />
        <Use p={p} sprite="cu-b" x={1050} y={300} s={0.6} />
      </Layer>
      <Layer viewBox="0 0 1600 520">
        <path d="M0 392 Q220 336 460 372 T980 352 T1600 362 L1600 520 L0 520 Z" fill="#3c4470" />
        <path d="M0 392 Q220 336 460 372 T980 352 T1600 362" stroke="#e7a98a" strokeWidth="2" strokeOpacity=".45" fill="none" />
        <Use p={p} sprite="pine" x={200} y={384} s={0.75} />
        <Use p={p} sprite="pine" x={232} y={388} s={0.55} />
        <Use p={p} sprite="oak" x={300} y={392} s={0.45} />
        <Use p={p} sprite="poplar" x={1480} y={370} s={0.6} />
        <Use p={p} sprite="poplar" x={1508} y={372} s={0.5} />
        <circle cx="752" cy="350" r="46" fill={`url(#${p}-lamp)`} />
        <Use p={p} sprite="cottage" x={760} y={364} s={0.85} />
        <circle cx="1120" cy="372" r="34" fill={`url(#${p}-lamp)`} />
        <Use p={p} sprite="cottage" x={1126} y={382} s={0.55} flip />
        <path d="M0 440 Q300 398 640 434 T1300 416 T1600 426 L1600 520 L0 520 Z" fill="#2a3255" />
        <Fence points={fence} palette={duskPalette} />
        {Array.from({ length: 30 }, (_, i) => <Use key={i} p={p} sprite={["tuftA", "tuftB", "tuftC"][i % 3]} x={r1(random() * 1600)} y={r1(470 + random() * 20)} s={r1(1 + random() * 0.6)} />)}
        <path d="M0 482 Q400 456 800 476 T1600 470 L1600 520 L0 520 Z" fill="#1f2742" />
      </Layer>
      <Layer viewBox="0 0 1600 520" className="scene-fireflies">
        <g fill="#fbe58a">
          {Array.from({ length: 18 }, (_, index) => <circle key={index} cx={r1(random() * 1600)} cy={r1(360 + random() * 140)} r={r1(1.8 + random() * 1.4)} style={{ animationDelay: `${r1(random() * 4)}s` }} />)}
        </g>
      </Layer>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Hero vista (legacy, kept exported)                                         */
/* ------------------------------------------------------------------------ */

/**
 * A vista inside an arched window: towering clouds over blue mountains, a
 * lake, a windmill on the hill and a path through the meadow.
 */
export function HeroVista() {
  const p = "hero";
  return (
    <div className="scene scene--hero" aria-hidden="true">
      <Layer viewBox="0 0 800 900">
        <defs>
          <PaintFilters id={p} />
          <SpriteSheet p={p} palette={dayPalette} />
          <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3f84c2" />
            <stop offset=".45" stopColor="#9ccbe8" />
            <stop offset=".62" stopColor="#f2efdf" />
          </linearGradient>
          <linearGradient id={`${p}-lake`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fc1df" />
            <stop offset="1" stopColor="#5e9bc4" />
          </linearGradient>
          <g id={`${p}-cu-a`}><Cloud id={`${p}-cu-a`} filters={p} seed={11} tower={0.7} /></g>
          <g id={`${p}-cu-b`}><Cloud id={`${p}-cu-b`} filters={p} seed={12} width={220} /></g>
        </defs>
        <rect width="800" height="900" fill={`url(#${p}-sky)`} />
        <path d="M0 560 L90 470 L160 520 L270 410 L360 500 L440 450 L560 380 L660 470 L740 430 L800 470 L800 600 L0 600 Z" fill="#7f9fbd" />
        <path d="M270 410 L300 440 L282 446 L262 432 Z M560 380 L596 414 L574 418 L548 400 Z" fill="#f1f4f6" />
        <path d="M0 590 L120 540 L260 570 L400 530 L560 560 L700 520 L800 545 L800 640 L0 640 Z" fill="#6b9a7c" opacity=".9" />
        <rect x="0" y="600" width="800" height="40" fill={`url(#${p}-lake)`} />
        <path d="M120 618 h120 M420 626 h150 M620 612 h90" stroke="#e8f4fb" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
        <path d="M0 640 Q160 600 330 640 T800 620 L800 900 L0 900 Z" fill="#8fbf62" />
        <path d="M0 700 Q240 650 470 700 T800 690 L800 900 L0 900 Z" fill="#79ad50" />
        <path d="M0 780 Q300 720 520 780 T800 770 L800 900 L0 900 Z" fill="#649a42" />
        <g transform="translate(610 660)">
          <path d="M-14 0 L-9 -64 L9 -64 L14 0 Z" fill="#f3e5c8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-12 -62 L0 -80 L12 -62 Z" fill="#c8613f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="0" cy="-62" r="4" fill="#6e4329" />
        </g>
        <Use p={p} sprite="oak" x={110} y={700} s={0.8} />
        <Use p={p} sprite="poplar" x={170} y={700} s={0.7} />
        <Use p={p} sprite="pine" x={720} y={750} s={0.9} />
        <path d="M380 700 Q340 740 400 780 T360 900 L470 900 Q450 820 420 790 T400 700 Z" fill="#ead9ae" opacity=".95" />
        <FlowerBed p={p} seed={21} count={50} x0={0} x1={800} y0={700} y1={900} s0={0.5} s1={1.1} />
      </Layer>
      <Layer viewBox="0 0 800 900" className="scene-drift scene-drift--slow">
        <Use p={p} sprite="cu-a" x={250} y={330} s={1.3} />
        <Use p={p} sprite="cu-b" x={640} y={250} s={0.9} />
      </Layer>
      <Layer viewBox="0 0 800 900">
        <g transform="translate(610 598)">
          <g className="scene-windmill" stroke={INK} strokeWidth="2" fill="#fbf4e4">
            <path d="M0 0 L-6 -50 L6 -50 Z" /><path d="M0 0 L50 -6 L50 6 Z" /><path d="M0 0 L6 50 L-6 50 Z" /><path d="M0 0 L-50 6 L-50 -6 Z" />
          </g>
        </g>
      </Layer>
      <Layer viewBox="0 0 800 900" className="scene-birds"><Flock p={p} x={500} y={150} seed={3} /></Layer>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 404                                                                        */
/* ------------------------------------------------------------------------ */

/**
 * A meadow crossroads for the 404 page: a signpost whose arms all point
 * different ways and a drifting question mark. The right third is left as
 * open ground for an overlay to sit in.
 */
export function LostMeadow() {
  return (
    <div className="lost-meadow">
      <MeadowScene seed={404} mood="golden" />
      <Svg viewBox="0 0 1600 900" className="scene__layer lost-meadow__figures">
        <g transform="translate(700 822)">
          <ellipse cx="18" cy="2" rx="40" ry="5" fill="#2f4a2a" opacity=".25" />
          <path d="M-5 0 L-4 -150 L4 -150 L5 0 Z" fill="#6e4329" stroke={INK} strokeWidth="3" />
          <path d="M-1 -140 V-6" stroke="#8a5f3e" strokeWidth="1.4" />
          <g className="lost-meadow__sign">
            <path d="M-6 -140 L-96 -140 L-112 -126 L-96 -112 L-6 -112 Z" fill="#e9c98f" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <path d="M6 -104 L92 -100 L108 -86 L92 -72 L6 -76 Z" fill="#e9c98f" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <path d="M-6 -66 L-80 -70 L-94 -58 L-80 -46 L-6 -42 Z" fill="#f1d9a8" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <path d="M-84 -126 h56 M24 -86 h50 M-70 -56 h46" stroke="#8a5f3e" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 7" />
            <circle cx="-14" cy="-126" r="2" fill={INK} /><circle cx="14" cy="-88" r="2" fill={INK} /><circle cx="-14" cy="-54" r="2" fill={INK} />
          </g>
          <path d="M-14 0 Q-20 -18 -12 -30 M10 0 Q16 -14 12 -24" stroke="#4f8a3a" strokeWidth="2.4" fill="none" />
        </g>
        <text className="lost-meadow__question" x="760" y="620" fill="#fffaf0" stroke="#bdb3a3" strokeWidth="2" fontSize="74" fontFamily="Georgia, serif" fontStyle="italic">?</text>
      </Svg>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Small standalone art                                                       */
/* ------------------------------------------------------------------------ */

/** A wildflower sprig to tuck into a corner: three species on arching stems. */
export function Sprig({ className, variant = 0 }: { className?: string; variant?: number }) {
  const sets: FlowerKind[][] = [["daisy", "poppy", "lavender"], ["lavender", "buttercup", "daisy"], ["poppy", "daisy", "clover"]];
  const kinds = sets[variant % 3];
  return (
    <svg className={`sprig${className ? ` ${className}` : ""}`} viewBox="0 0 120 160" aria-hidden="true" focusable="false">
      <g className="sprig__sway">
        <path d="M60 160 Q52 150 44 156 M60 160 Q70 150 78 156" stroke="#4f8a3a" strokeWidth="2" fill="none" />
        <path d="M58 158 Q44 146 40 132 Q52 140 58 154 Z" fill="#62a04a" stroke="#3f7a34" strokeWidth=".5" />
        <path d="M62 158 Q78 148 84 134 Q70 140 62 154 Z" fill="#5a9a45" stroke="#3f7a34" strokeWidth=".5" />
        {kinds.map((kind, index) => {
          const Shape = FLOWER_SHAPES[kind];
          const placement = [`translate(56 160) rotate(-16) scale(2.4)`, `translate(60 160) scale(2.9)`, `translate(64 160) rotate(14) scale(2.3)`][index];
          return <g key={index} transform={placement}><Shape /></g>;
        })}
      </g>
    </svg>
  );
}

/** A diamond kite riding the breeze: stitched fabric panels, a bowed ribbon tail and a long string. */
export function Kite({ className }: { className?: string }) {
  return (
    <svg className={`kite${className ? ` ${className}` : ""}`} viewBox="0 0 160 240" aria-hidden="true" focusable="false">
      <path d="M80 92 Q52 150 26 196 T4 240" stroke="#5b6770" strokeWidth="1.1" fill="none" opacity=".75" />
      <g className="kite__body">
        <path d="M80 4 L122 46 L80 96 L38 46 Z" fill="#c8613f" />
        <path d="M80 4 L122 46 L80 46 Z" fill="#f1b84b" />
        <path d="M38 46 L80 96 L80 46 Z" fill="#3f8a8c" />
        <path d="M80 4 L38 46 L80 46 Z" fill="#e47a54" />
        <path d="M80 10 L116 46 M80 10 L44 46 M44 48 L80 90 M116 48 L80 90" stroke="#fff6e0" strokeWidth=".9" strokeDasharray="2.5 2" opacity=".75" fill="none" />
        <path d="M80 4 L122 46 L80 96 L38 46 Z" fill="none" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M80 4 L80 96 M38 46 L122 46" stroke={INK} strokeWidth="1.6" />
        <path d="M80 4 Q60 22 52 46" stroke="#ffffff" strokeWidth="1.4" opacity=".35" fill="none" />
        <circle cx="80" cy="46" r="3" fill={INK} />
        <g className="kite__tail">
          <path d="M80 96 Q92 112 80 128 T80 160 T80 192 T80 222" stroke={INK} strokeWidth="1.4" fill="none" />
          {([[84, 112, "#f1b84b"], [76, 142, "#e7857a"], [84, 172, "#7fb6d5"], [76, 202, "#f1b84b"]] as const).map(([x, y, fill], index) => (
            <g key={index} transform={`translate(${x} ${y})`}>
              <path d="M0 0 L-8 -5 L-7 5 Z M0 0 L8 -5 L7 5 Z" fill={fill} stroke={INK} strokeWidth=".9" strokeLinejoin="round" />
              <circle r="1.6" fill={INK} />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

/** A dandelion clock: a stem and leaf with a globe of fine-filamented seeds, a few already gone. */
export function Dandelion({ className }: { className?: string }) {
  const random = seeded(311);
  const seeds = Array.from({ length: 30 }, (_, index) => {
    const angle = (index / 30) * Math.PI * 2 + (random() - 0.5) * 0.12;
    const length = 21 + random() * 3;
    return { angle, x: r1(Math.cos(angle) * length), y: r1(Math.sin(angle) * length), gone: index === 4 || index === 5 || index === 17 };
  });
  return (
    <svg className={`dandelion${className ? ` ${className}` : ""}`} viewBox="0 0 80 180" aria-hidden="true" focusable="false">
      <path d="M40 180 Q35 120 40 60" stroke="#5f8f45" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M41 178 Q38 120 41 62" stroke="#8fbf6a" strokeWidth=".8" fill="none" />
      <path d="M38 166 L30 160 L33 156 L24 150 L28 146 L18 138 Q30 140 38 156 Z" fill="#6aa046" stroke="#4f8a3a" strokeWidth=".6" />
      <g transform="translate(40 40)">
        <circle r="24" fill="#fffaf0" opacity=".14" />
        {seeds.filter((s) => !s.gone).map((s, index) => (
          <g key={index}>
            <path d={`M0 0 L${s.x} ${s.y}`} stroke="#e4dccb" strokeWidth=".7" />
            <g transform={`translate(${s.x} ${s.y}) rotate(${r1((s.angle * 180) / Math.PI + 90)})`} stroke="#fffaf0" strokeWidth=".45" strokeLinecap="round">
              {[-60, -40, -20, 0, 20, 40, 60].map((a) => <path key={a} d={`M0 0 L${r1(Math.sin((a * Math.PI) / 180) * 4.6)} ${r1(-Math.cos((a * Math.PI) / 180) * 4.6)}`} />)}
            </g>
          </g>
        ))}
        <circle r="4.2" fill="#b8a77d" />
        <circle r="4.2" fill="none" stroke="#8f7f58" strokeWidth=".6" strokeDasharray=".6 .9" />
      </g>
    </svg>
  );
}
