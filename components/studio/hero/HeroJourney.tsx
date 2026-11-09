"use client";

import type { CSSProperties, ReactNode } from "react";
import { Bramble } from "@/components/studio/art/Bramble";
import { BirdArt, ButterflyArt, cumulus, PetalArt, r1, Sails, SeedArt, seeded, SmokeArt, SpriteDefs, TAU } from "./heroArt";
import { HeroJourneyMotion } from "./HeroJourneyMotion";
import "@/styles/bramble.css";
import "@/styles/hero-journey.css";

/**
 * The front-page hero: Bramble, the wandering house, walks across a painted
 * golden-hour landscape. Original art only; the Ghibli-like feeling is the
 * mood, not any borrowed design.
 *
 * Everything is server-rendered inline SVG, decorative and deterministic (a
 * seeded generator places flowers, trees and clouds, so the static export is
 * stable). The world is drawn in one coordinate space: a tile 1600 units wide
 * and 1000 units tall whose bottom edge is the bottom of the hero. Each depth
 * layer is a strip of three identical tiles that pans left by one tile per loop
 * at its own pace (parallax). Detailed sprites (trees, windmill, cottages,
 * flowers, tufts, pebbles) live once in <SpriteDefs> (./heroArt) and are placed
 * with <use>. Small moving parts (sails, tufts, smoke, birds, seeds,
 * butterflies, glints) are HTML sprites so every animation is a compositor-only
 * transform/opacity change. The copy passed as `children` stays real HTML.
 */

const W = 1600;
const COPIES = 3;
const TW = W * COPIES;

type Layer = { top: number; height: number };
const LAYERS = {
  cloudsFar: { top: 0, height: 1000 },
  cloudsNear: { top: 0, height: 720 },
  mountains: { top: 250, height: 480 },
  hills: { top: 500, height: 380 },
  meadow: { top: 700, height: 300 },
  fringe: { top: 830, height: 170 },
} satisfies Record<string, Layer>;

/* ---------- deterministic helpers ---------- */

const pct = (value: number) => `${Math.round(value * 10000) / 10000}%`;

/** Rolling terrain whose period divides the tile, so strips loop seamlessly. */
function rolling(seed: number, base: number, terms: [amp: number, k: number][]) {
  const random = seeded(seed);
  const t = terms.map(([a, k]) => [a, k, random() * TAU] as const);
  return (x: number) => t.reduce((y, [a, k, p]) => y + a * Math.sin((TAU * k * x) / W + p), base);
}

/** Mountain ridges: sharp peaks, rounded valleys, still periodic per tile. */
function peaks(seed: number, base: number, terms: [amp: number, k: number, sharp: number][]) {
  const random = seeded(seed);
  const t = terms.map(([a, k, e]) => [a, k, e, random() * Math.PI] as const);
  return (x: number) => t.reduce((y, [a, k, e, p]) => y - a * Math.pow(1 - Math.abs(Math.sin((Math.PI * k * x) / W + p)), e), base);
}

function line(fn: (x: number) => number, step: number, x0 = 0, x1 = TW) {
  let d = `M${x0} ${r1(fn(x0))}`;
  for (let x = x0 + step; x <= x1 + 0.01; x += step) d += `L${r1(x)} ${r1(fn(x))}`;
  return d;
}

function area(fn: (x: number) => number, bottom: number, step: number) {
  return `${line(fn, step)}L${TW} ${bottom}L0 ${bottom}Z`;
}

/** Local summits of a ridge within one tile. */
function summits(fn: (x: number) => number, below: number) {
  const found: [number, number][] = [];
  for (let x = 8; x < W - 8; x += 4) {
    const y = fn(x);
    if (y < below && y <= fn(x - 4) && y <= fn(x + 4) && y < fn(x - 24) - 4 && y < fn(x + 24) - 4) found.push([x, y]);
  }
  return found;
}

/** Positions an HTML sprite inside a layer strip, in world units. */
function sprite(layer: Layer, x: number, y: number, w: number, h: number, extra?: Record<string, string | number>): CSSProperties {
  return {
    left: pct((x / TW) * 100),
    top: pct(((y - layer.top) / layer.height) * 100),
    width: pct((w / TW) * 100),
    height: pct((h / layer.height) * 100),
    ...extra,
  } as CSSProperties;
}

const copies = Array.from({ length: COPIES }, (_, index) => index * W);

/** One tile drawn once, then repeated with <use> (static art only). */
function Repeat({ id, offsets = copies.slice(1), children }: { id: string; offsets?: number[]; children: ReactNode }) {
  return (
    <>
      <g id={id}>{children}</g>
      {offsets.map((x) => <use key={x} href={`#${id}`} x={x} />)}
    </>
  );
}

const place = (x: number, y: number, s = 1) => `translate(${r1(x)} ${r1(y)})${s === 1 ? "" : ` scale(${r1(s * 100) / 100})`}`;

/* ---------- clouds ---------- */

type CloudSpec = { x: number; y: number; w: number; h: number; seed: number };

const FAR_CLOUDS: CloudSpec[] = [
  { x: 210, y: 560, w: 420, h: 330, seed: 3 },
  { x: 650, y: 548, w: 300, h: 230, seed: 8 },
  { x: 1050, y: 578, w: 520, h: 430, seed: 5 },
  { x: 1440, y: 552, w: 330, h: 260, seed: 12 },
];

const NEAR_CLOUDS: CloudSpec[] = [
  { x: 130, y: 330, w: 230, h: 120, seed: 21 },
  { x: 480, y: 230, w: 170, h: 90, seed: 22 },
  { x: 830, y: 360, w: 260, h: 140, seed: 23 },
  { x: 1190, y: 200, w: 190, h: 100, seed: 24 },
  { x: 1470, y: 420, w: 220, h: 110, seed: 25 },
];

function CloudDefs({ prefix, clouds }: { prefix: string; clouds: CloudSpec[] }) {
  return (
    <>
      {clouds.map((cloud, index) => {
        const { lobes } = cumulus(cloud.seed, cloud.w, cloud.h);
        const top = r1(-cloud.h * 1.05);
        const id = `${prefix}-${index}`;
        return (
          <g key={index}>
            {/* Flat but feathered base: the lobes fade out just below the condensation line. */}
            <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1="0" y1={r1(-cloud.h * 0.08)} x2="0" y2={r1(cloud.h * 0.025)}>
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </linearGradient>
            <mask id={`${id}-base`} maskUnits="userSpaceOnUse" x={-cloud.w} y={-cloud.h * 1.6} width={cloud.w * 2} height={cloud.h * 1.6 + 60}>
              <rect x={-cloud.w} y={-cloud.h * 1.6} width={cloud.w * 2} height={cloud.h * 1.6 + 60} fill={`url(#${id}-fade)`} />
            </mask>
            <linearGradient id={`${id}-shade`} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2="0">
              <stop offset="0" stopColor="#f6e9e2" />
              <stop offset=".45" stopColor="#d9c8cf" />
              <stop offset="1" stopColor="#9a8eb0" />
            </linearGradient>
            <linearGradient id={`${id}-mid`} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2="0">
              <stop offset="0" stopColor="#fff9ee" />
              <stop offset=".55" stopColor="#fbe7cc" />
              <stop offset="1" stopColor="#d7c0bb" />
            </linearGradient>
            <radialGradient id={`${id}-core`} gradientUnits="userSpaceOnUse" cx={r1(-cloud.w * 0.18)} cy={r1(-cloud.h * 0.22)} r={r1(cloud.w * 0.42)}>
              <stop offset="0" stopColor="#8478a0" stopOpacity=".42" />
              <stop offset="1" stopColor="#8478a0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-glow`} gradientUnits="userSpaceOnUse" cx={r1(cloud.w * 0.2)} cy={r1(-cloud.h * 0.78)} r={r1(cloud.w * 0.5)}>
              <stop offset="0" stopColor="#ffe2a6" stopOpacity=".55" />
              <stop offset="1" stopColor="#ffe2a6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}-under`} gradientUnits="userSpaceOnUse" x1="0" y1={r1(-cloud.h * 0.3)} x2="0" y2="0">
              <stop offset="0" stopColor="#7d7299" stopOpacity="0" />
              <stop offset="1" stopColor="#7d7299" stopOpacity=".38" />
            </linearGradient>
            {/* A mask (not a clipPath) so it can reuse the lobe group by reference. */}
            <mask id={`${id}-clip`} maskUnits="userSpaceOnUse" x={-cloud.w} y={-cloud.h * 1.6} width={cloud.w * 2} height={cloud.h * 1.6 + 60}>
              <use href={`#${id}-lobes`} fill="#fff" />
            </mask>
            <g id={`${id}-lobes`}>
              {lobes.map(([cx, cy, r], lobe) => <circle key={lobe} cx={cx} cy={cy} r={r} />)}
            </g>
          </g>
        );
      })}
    </>
  );
}

function Cumulus({ prefix, index, cloud }: { prefix: string; index: number; cloud: CloudSpec }) {
  const { lobes, wisps } = cumulus(cloud.seed, cloud.w, cloud.h);
  const id = `${prefix}-${index}`;
  const upper = lobes.filter(([, cy, r]) => cy < -cloud.h * 0.18 && r > 9);
  const creases = lobes.filter(([, cy, r], index) => cy < -cloud.h * 0.12 && r > 14 && index % 2 === 0);
  return (
    <g transform={`translate(${cloud.x} ${cloud.y})`} filter="url(#hj-cloud-paint)">
      <g mask={`url(#${id}-base)`}>
        {/* The heap is shaded as one form: a cool silhouette, then the same silhouette lifted
            toward the sun in warm light, so shadow gathers only along the lower edges and in
            the creases. Soft radial highlights and crease shadows model the cauliflower lobes
            without hard rings, and smooth washes (core shadow, warm glow, underside) sit on top. */}
        <use href={`#${id}-lobes`} fill={`url(#${id}-shade)`} />
        <g mask={`url(#${id}-clip)`}>
          <use href={`#${id}-lobes`} transform={`translate(${r1(cloud.w * 0.018)} ${r1(-cloud.h * 0.035)})`} fill={`url(#${id}-mid)`} />
          <g fill="url(#hj-lobe-crease)">
            {creases.map(([cx, cy, r], lobe) => <circle key={lobe} cx={r1(cx - r * 0.35)} cy={r1(cy + r * 0.45)} r={r1(r * 0.75)} />)}
          </g>
          <g fill="url(#hj-lobe-hi)">
            {upper.map(([cx, cy, r], lobe) => <circle key={lobe} cx={r1(cx + r * 0.22)} cy={r1(cy - r * 0.26)} r={r1(r * 0.8)} />)}
          </g>
        </g>
        <g mask={`url(#${id}-clip)`}>
          <rect x={-cloud.w} y={r1(-cloud.h * 1.3)} width={cloud.w * 2} height={r1(cloud.h * 1.3 + 20)} fill={`url(#${id}-core)`} />
          <rect x={-cloud.w} y={r1(-cloud.h * 1.3)} width={cloud.w * 2} height={r1(cloud.h * 1.3 + 20)} fill={`url(#${id}-glow)`} />
          <rect x={-cloud.w} y={r1(-cloud.h * 0.3)} width={cloud.w * 2} height={r1(cloud.h * 0.3 + 20)} fill={`url(#${id}-under)`} />
        </g>
      </g>
      <g fill="url(#hj-wisp-r)">
        {wisps.map(([cx, cy, rx, ry], wisp) => <ellipse key={wisp} cx={cx} cy={cy} rx={rx} ry={ry} />)}
      </g>
    </g>
  );
}

function CloudStrip({ prefix, clouds }: { prefix: string; clouds: CloudSpec[] }) {
  // Clouds near a tile edge spill into the next tile, so repeat one extra tile on each side.
  return (
    <Repeat id={`${prefix}-tile`} offsets={[-W, ...copies.slice(1), TW]}>
      {clouds.map((cloud, index) => <Cumulus key={index} prefix={prefix} index={index} cloud={cloud} />)}
    </Repeat>
  );
}

/* ---------- flowers and grass ---------- */

const SPECIES = ["daisy", "daisy", "buttercup", "poppy", "clover", "lavender", "buttercup"] as const;

/** Flowers grow in natural clusters of one species, bigger toward the viewer. */
function FlowerField({ seed, clusters, band, scale }: { seed: number; clusters: number; band: [(x: number) => number, (x: number) => number]; scale: [number, number] }) {
  const random = seeded(seed);
  const items: { x: number; y: number; s: number; kind: string }[] = [];
  for (let c = 0; c < clusters; c++) {
    const cx = 40 + random() * (W - 80);
    const kind = SPECIES[Math.floor(random() * SPECIES.length)];
    const n = 3 + Math.floor(random() * 5);
    for (let k = 0; k < n; k++) {
      const x = Math.min(W - 18, Math.max(18, cx + (random() - 0.5) * 56));
      const t = random();
      const y = band[0](x) + t * (band[1](x) - band[0](x));
      items.push({ x, y, s: (scale[0] + t * (scale[1] - scale[0])) * (0.82 + random() * 0.36), kind });
    }
  }
  items.sort((p, q) => p.y - q.y);
  return (
    <Repeat id={`hj-flowers-${seed}`}>
      {items.map((item, index) => <use key={index} href={`#hj-fl-${item.kind}`} transform={place(item.x, item.y, item.s)} />)}
    </Repeat>
  );
}

/** Distant blooms: clustered dots of colour where petals would be too small to read. */
function FlowerSpecks({ seed, count, band }: { seed: number; count: number; band: [(x: number) => number, (x: number) => number] }) {
  const random = seeded(seed);
  const colors = ["#fff8ec", "#f6d65a", "#e7857a", "#b9a6e3", "#fff8ec", "#ec5a38"];
  const dots: string[] = colors.map(() => "");
  let cx = 0;
  let color = 0;
  for (let i = 0; i < count; i++) {
    if (i % 6 === 0) { cx = 20 + random() * (W - 40); color = Math.floor(random() * colors.length); }
    const x = Math.min(W - 6, Math.max(6, cx + (random() - 0.5) * 60));
    const t = random();
    const y = band[0](x) + t * (band[1](x) - band[0](x));
    const r = 1.2 + t * 1.6;
    dots[color] += `M${r1(x - r)} ${r1(y)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(r * 2)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-r * 2)} 0`;
  }
  return (
    <Repeat id={`hj-specks-${seed}`}>
      {dots.map((d, index) => d && <path key={index} d={d} fill={colors[index]} />)}
    </Repeat>
  );
}

/** One tile of grass in three greens with sunlit tips, repeated across the strip. */
function Grass({ seed, count, ground, min, spread, width, tones }: { seed: number; count: number; ground: (x: number) => number; min: number; spread: number; width: number; tones: [string, string, string] }) {
  const random = seeded(seed);
  const paths = ["", "", ""];
  let tips = "";
  for (let i = 0; i < count; i++) {
    const x = 4 + random() * (W - 8);
    const h = min + random() * spread;
    const lean = (random() - 0.5) * h * 0.7;
    const y = ground(x) + 2;
    paths[i % 3] += `M${r1(x)} ${r1(y)}q${r1(lean * 0.4)} ${r1(-h * 0.5)} ${r1(lean)} ${r1(-h)}`;
    if (i % 2 === 0) tips += `M${r1(x + lean * 0.6)} ${r1(y - h * 0.76)}L${r1(x + lean)} ${r1(y - h)}`;
  }
  return (
    <Repeat id={`hj-grass-${seed}`}>
      {paths.map((d, index) => <path key={index} d={d} fill="none" stroke={tones[index]} strokeWidth={width} strokeLinecap="round" />)}
      <path d={tips} fill="none" stroke="#dfe592" strokeWidth={r1(width * 0.6)} strokeLinecap="round" opacity=".8" />
    </Repeat>
  );
}

/* ---------- the layers ---------- */

function Strip({ name, layer, depth, children, sprites }: { name: string; layer: Layer; depth: number; children: ReactNode; sprites?: ReactNode }) {
  return (
    <div className={`hj-layer hj-band hj-layer--${name}`} data-depth={depth} style={{ "--lt": layer.top, "--lh": layer.height } as CSSProperties}>
      <div className="hj-track">
        <svg className="hj-strip" viewBox={`0 ${layer.top} ${TW} ${layer.height}`} preserveAspectRatio="none" focusable="false">
          {children}
        </svg>
        {sprites}
      </div>
    </div>
  );
}

function Sky() {
  return (
    <div className="hj-layer hj-layer--sky" data-depth="0">
      <svg className="hj-sky" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="hj-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c5f8f" />
            <stop offset=".2" stopColor="#4f8fc4" />
            <stop offset=".44" stopColor="#9cc0d6" />
            <stop offset=".6" stopColor="#ecd8ad" />
            <stop offset=".74" stopColor="#f6c681" />
            <stop offset="1" stopColor="#f1b066" />
          </linearGradient>
          <radialGradient id="hj-sky-warm" cx=".8" cy=".56" r=".7">
            <stop offset="0" stopColor="#ffe3a3" stopOpacity=".8" />
            <stop offset=".45" stopColor="#ffcf86" stopOpacity=".28" />
            <stop offset="1" stopColor="#ffcf86" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#hj-sky)" />
        <rect width="100" height="100" fill="url(#hj-sky-warm)" />
      </svg>
      <div className="hj-sun">
        <span className="hj-sun__rays">
          <svg viewBox="-300 -300 600 600" focusable="false">
            <defs>
              <linearGradient id="hj-ray" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffe8b4" stopOpacity=".6" />
                <stop offset="1" stopColor="#ffe0a0" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g fill="url(#hj-ray)">
              {Array.from({ length: 16 }, (_, index) => <path key={index} d={index % 2 ? "M-6 0 L0 -230 L6 0 Z" : "M-11 0 L0 -292 L11 0 Z"} transform={`rotate(${index * 22.5 + (index % 3) * 4})`} />)}
            </g>
          </svg>
        </span>
        <svg className="hj-sun__disc" viewBox="-300 -300 600 600" focusable="false">
          <defs>
            <radialGradient id="hj-sun-halo">
              <stop offset="0" stopColor="#fffaea" stopOpacity="1" />
              <stop offset=".15" stopColor="#ffe9b6" stopOpacity=".95" />
              <stop offset=".4" stopColor="#ffc979" stopOpacity=".4" />
              <stop offset="1" stopColor="#f7b061" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle r="300" fill="url(#hj-sun-halo)" />
          <circle r="46" fill="#fff8e6" />
          <circle r="58" fill="none" stroke="#fff3cf" strokeWidth="6" opacity=".35" />
        </svg>
      </div>
    </div>
  );
}

function FarClouds() {
  const random = seeded(31);
  const wisps = Array.from({ length: 5 }, () => ({ x: 120 + random() * (W - 240), y: 60 + random() * 140, w: 160 + random() * 240 }));
  return (
    <Strip name="clouds-far" layer={LAYERS.cloudsFar} depth={0.05}>
      <defs><CloudDefs prefix="hjf" clouds={FAR_CLOUDS} /></defs>
      {/* High cirrus streaks catching the late light. */}
      <g opacity=".42" filter="url(#hj-wash)">
        <Repeat id="hj-wisps">
          {wisps.map((wisp, index) => (
            <g key={index}>
              <ellipse cx={r1(wisp.x)} cy={r1(wisp.y)} rx={r1(wisp.w / 2)} ry={r1(2 + wisp.w / 90)} fill="url(#hj-wisp)" />
              <ellipse cx={r1(wisp.x + wisp.w * 0.18)} cy={r1(wisp.y + 9)} rx={r1(wisp.w / 3)} ry="2.2" fill="url(#hj-wisp)" />
            </g>
          ))}
        </Repeat>
      </g>
      <CloudStrip prefix="hjf" clouds={FAR_CLOUDS} />
    </Strip>
  );
}

function NearClouds() {
  return (
    <Strip name="clouds-near" layer={LAYERS.cloudsNear} depth={0.12}>
      <defs><CloudDefs prefix="hjn" clouds={NEAR_CLOUDS} /></defs>
      <CloudStrip prefix="hjn" clouds={NEAR_CLOUDS} />
    </Strip>
  );
}

/** Ridges, spurs and gullies on one tile of a range, plus snow streaks above the snowline. */
function Facets({ id, ridge, snowline, scale, shade, light, snowLit, snowShade }: { id: string; ridge: (x: number) => number; snowline: (x: number) => number; scale: number; shade: string; light: string; snowLit: string; snowShade: string }) {
  const tops = summits(ridge, 560);
  let dark = "";
  let lit = "";
  let snowL = "";
  let snowS = "";
  for (const [px, py] of tops) {
    const s = scale;
    const f = (x: number, y: number) => `${r1(px + x * s)} ${r1(py + y * s)}`;
    dark += `M${f(0, 0)}L${f(-34, 112)}L${f(-6, 124)}Q${f(-2, 60)} ${f(0, 0)}ZM${f(20, 40)}L${f(9, 120)}L${f(17, 120)}Z`;
    lit += `M${f(1, 0)}Q${f(7, 52)} ${f(16, 120)}L${f(48, 110)}Z`;
    const snow = snowline(px);
    if (py < snow - 6) {
      const d = Math.min(snow - py + 30 * s, 92 * s) / s;
      snowL += `M${f(0, 0)}Q${f(9, d * 0.5)} ${f(21, d)}L${f(11, d * 0.78)}L${f(4, d * 0.96)}Q${f(2, d * 0.4)} ${f(0, 0)}Z`;
      snowS += `M${f(-1, 1)}Q${f(-8, d * 0.4)} ${f(-21, d * 0.9)}L${f(-9, d * 0.74)}L${f(-3, d * 0.9)}Z`;
    }
  }
  return (
    <Repeat id={id}>
      <path d={dark} fill={shade} opacity=".3" />
      <path d={lit} fill={light} opacity=".2" />
      <path d={snowS} fill={snowShade} opacity=".9" />
      <path d={snowL} fill={snowLit} />
    </Repeat>
  );
}

function Mountains() {
  const farthest = (x: number) => peaks(40, 520, [[120, 3, 1.4], [60, 5, 1.2]])(x) + rolling(39, 0, [[4, 19], [2, 37]])(x);
  const farPeaks = peaks(41, 560, [[140, 2, 1.5], [70, 3, 1.3], [26, 7, 1.1]]);
  const farRough = rolling(46, 0, [[5, 13], [3, 23], [2, 41]]);
  const nearPeaks = peaks(43, 650, [[118, 3, 1.35], [62, 4, 1.2], [26, 7, 1.1], [10, 13, 1]]);
  const nearRough = rolling(47, 0, [[6, 17], [4, 29], [2.5, 47]]);
  const far = (x: number) => farPeaks(x) + farRough(x);
  const near = (x: number) => nearPeaks(x) + nearRough(x);
  const snowFar = rolling(44, 390, [[8, 6], [5, 11]]);
  const snowNear = rolling(45, 472, [[10, 7], [6, 13]]);
  const bottom = LAYERS.mountains.top + LAYERS.mountains.height;
  const farthestD = area(farthest, bottom, 10);
  const farD = area(far, bottom, 8);
  const nearD = area(near, bottom, 6);
  const snowFarD = `${line(snowFar, 20)}L${TW} 200L0 200Z`;
  const snowNearD = `${line(snowNear, 16)}L${TW} 200L0 200Z`;
  const random = seeded(48);
  const mists = Array.from({ length: 6 }, (_, index) => ({ x: 140 + index * 260 + random() * 60, y: index % 2 ? 610 : 668, rx: 200 + random() * 120 }));
  return (
    <Strip name="mountains" layer={LAYERS.mountains} depth={0.2}>
      <defs>
        <linearGradient id="hj-mtn-farthest" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="0" y2="560">
          <stop offset="0" stopColor="#c3bfd2" />
          <stop offset="1" stopColor="#efd6b6" />
        </linearGradient>
        <linearGradient id="hj-mtn-far" gradientUnits="userSpaceOnUse" x1="0" y1="320" x2="0" y2="600">
          <stop offset="0" stopColor="#a3a9c6" />
          <stop offset="1" stopColor="#e3ccb0" />
        </linearGradient>
        <linearGradient id="hj-mtn-near" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="700">
          <stop offset="0" stopColor="#8394b4" />
          <stop offset=".6" stopColor="#a8a8b4" />
          <stop offset="1" stopColor="#cdbba8" />
        </linearGradient>
        <linearGradient id="hj-mtn-near-shade" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="700">
          <stop offset="0" stopColor="#56658a" />
          <stop offset="1" stopColor="#8a8aa0" />
        </linearGradient>
        <linearGradient id="hj-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d9a6" stopOpacity="0" />
          <stop offset="1" stopColor="#f6d9a6" stopOpacity=".72" />
        </linearGradient>
        <radialGradient id="hj-mist">
          <stop offset="0" stopColor="#fbe6c2" stopOpacity=".7" />
          <stop offset="1" stopColor="#fbe6c2" stopOpacity="0" />
        </radialGradient>
        <clipPath id="hj-mtn-far-clip" clipPathUnits="userSpaceOnUse"><path d={farD} /></clipPath>
        <clipPath id="hj-mtn-far-lit" clipPathUnits="userSpaceOnUse"><path d={farD} transform="translate(26 8)" /></clipPath>
        <clipPath id="hj-mtn-near-clip" clipPathUnits="userSpaceOnUse"><path d={nearD} /></clipPath>
        <clipPath id="hj-mtn-near-lit" clipPathUnits="userSpaceOnUse"><path d={nearD} transform="translate(34 8)" /></clipPath>
      </defs>
      {/* Farthest range: barely there, dissolved into the warm air. */}
      <path d={farthestD} fill="url(#hj-mtn-farthest)" opacity=".85" />
      <rect x="0" y="470" width={TW} height={bottom - 470} fill="url(#hj-haze)" opacity=".8" />
      {/* Far range: soft shade on the left faces, lit snow on the right. */}
      <path d={farD} fill="#9aa0bf" />
      <g clipPath="url(#hj-mtn-far-clip)">
        <path d={farD} transform="translate(26 8)" fill="url(#hj-mtn-far)" />
        <path d={snowFarD} fill="#d9d4e2" />
        <path d={snowFarD} clipPath="url(#hj-mtn-far-lit)" fill="#fbeedb" />
        <Facets id="hj-facets-far" ridge={far} snowline={snowFar} scale={0.75} shade="#7f86a8" light="#f1dcc0" snowLit="#fff6e8" snowShade="#c9c6d8" />
      </g>
      <rect x="0" y="520" width={TW} height={bottom - 520} fill="url(#hj-haze)" opacity=".6" />
      {/* Near range: deeper shade, faceted spurs, shaded and sunlit snow. */}
      <path d={nearD} fill="url(#hj-mtn-near-shade)" />
      <g clipPath="url(#hj-mtn-near-clip)">
        <path d={nearD} transform="translate(34 8)" fill="url(#hj-mtn-near)" />
        <path d={snowNearD} fill="#bfc1d6" />
        <path d={snowNearD} clipPath="url(#hj-mtn-near-lit)" fill="#fff0da" />
        <path d={line((x) => snowNear(x) + 2, 16)} stroke="#e6ddd8" strokeWidth="2" fill="none" strokeDasharray="14 9 6 12" opacity=".7" />
        <Facets id="hj-facets-near" ridge={near} snowline={snowNear} scale={1} shade="#4b5878" light="#f6dcbc" snowLit="#fff8ec" snowShade="#b4b7cf" />
        <path d={line((x) => near(x) + 1.5, 6)} transform="translate(2 0)" stroke="#ffe2b0" strokeWidth="1.6" fill="none" opacity=".55" />
      </g>
      <rect x="0" y="560" width={TW} height={bottom - 560} fill="url(#hj-haze)" />
      <Repeat id="hj-mists">
        {mists.map((mist, index) => <ellipse key={index} cx={r1(mist.x)} cy={mist.y} rx={r1(mist.rx)} ry="26" fill="url(#hj-mist)" />)}
      </Repeat>
    </Strip>
  );
}

type Placed = { x: number; y: number; s: number; kind: string };

function Hills() {
  const far = rolling(51, 640, [[24, 2], [13, 5], [5, 9]]);
  const near = rolling(52, 712, [[20, 3], [11, 4], [4, 11]]);
  const bottom = LAYERS.hills.top + LAYERS.hills.height;
  const random = seeded(53);
  const millX = 1120;
  const millY = near(millX) + 6;
  const farm = { x: 400, y: far(400) + 5, s: 0.85 };
  const cottage = { x: 1470, y: near(1470) + 8, s: 1.05 };
  const fields = rolling(54, 672, [[22, 2], [13, 5], [5, 9]]);
  const kinds = ["oak", "oak", "elm", "poplar", "pine", "pine", "oak", "elm"];
  const trees: Placed[] = [];
  for (const x0 of [70, 150, 215, 290, 520, 585, 650, 700, 860, 925, 985, 1270, 1330, 1395, 1540]) {
    const x = x0 + (random() - 0.5) * 26;
    const onFar = random() < 0.4;
    trees.push({ x, y: (onFar ? far(x) : near(x)) + 4, s: onFar ? 0.5 + random() * 0.18 : 0.78 + random() * 0.3, kind: kinds[Math.floor(random() * kinds.length)] });
  }
  for (let i = 0; i < 9; i++) {
    const x = 60 + random() * (W - 120);
    if (Math.abs(x - millX) < 60 || Math.abs(x - farm.x) < 40) continue;
    trees.push({ x, y: fields(x) + 22, s: 0.45 + random() * 0.2, kind: "bush" });
  }
  trees.sort((a, b) => a.y - b.y);
  const sprites = copies.flatMap((offset) => [
    <span key={`sails-${offset}`} className="hj-sprite hj-sails" style={sprite(LAYERS.hills, millX + offset - 80, millY - 100 - 80, 160, 160)}><Sails /></span>,
    ...[farm, cottage].flatMap((house, h) => [0, 1].map((puff) => (
      <span key={`smoke-${offset}-${h}-${puff}`} className="hj-sprite hj-smoke" style={sprite(LAYERS.hills, house.x + offset + 13.5 * house.s - 8, house.y - 56 * house.s - 8, 16, 16, { "--smoke-delay": `${-(puff * 2.6 + h * 1.3)}s` })}><SmokeArt /></span>
    ))),
  ]);
  return (
    <Strip name="hills" layer={LAYERS.hills} depth={0.4} sprites={sprites}>
      <defs>
        <linearGradient id="hj-hill-far" gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="760">
          <stop offset="0" stopColor="#bfcf8c" />
          <stop offset="1" stopColor="#9bbd70" />
        </linearGradient>
        <linearGradient id="hj-hill-near" gradientUnits="userSpaceOnUse" x1="0" y1="680" x2="0" y2="860">
          <stop offset="0" stopColor="#a6c66e" />
          <stop offset="1" stopColor="#82b257" />
        </linearGradient>
        <linearGradient id="hj-hill-haze" gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="720">
          <stop offset="0" stopColor="#f8dfae" stopOpacity="0" />
          <stop offset=".35" stopColor="#f8dfae" stopOpacity=".42" />
          <stop offset="1" stopColor="#f8dfae" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area(far, bottom, 10)} fill="url(#hj-hill-far)" />
      {/* Field strips, a hedgerow and the farm on the far hill, softened by haze. */}
      <path d={line(fields, 12)} fill="none" stroke="#dfdc9a" strokeWidth="9" opacity=".55" />
      <path d={line((x) => fields(x) + 12, 12)} fill="none" stroke="#b6c97e" strokeWidth="6" opacity=".5" />
      <path d={line((x) => fields(x) + 22, 12)} fill="none" stroke="#5f8f45" strokeWidth="6" strokeDasharray="2 10" strokeLinecap="round" opacity=".8" />
      <Repeat id="hj-far-props">
        <use href="#hj-cottage" transform={place(farm.x, farm.y, farm.s)} />
        {trees.filter((tree) => tree.y < 690).map((tree, index) => <use key={index} href={`#hj-${tree.kind === "bush" ? "bush" : `tree-${tree.kind}`}`} transform={place(tree.x, tree.y, tree.s)} />)}
      </Repeat>
      <rect x="0" y="590" width={TW} height="140" fill="url(#hj-hill-haze)" />
      <path d={area(near, bottom, 10)} fill="url(#hj-hill-near)" />
      <path d={line((x) => near(x) + 3, 10)} fill="none" stroke="#f0e19a" strokeWidth="3.5" opacity=".75" />
      <Repeat id="hj-near-props">
        {trees.filter((tree) => tree.y >= 690).map((tree, index) => <use key={index} href={`#hj-${tree.kind === "bush" ? "bush" : `tree-${tree.kind}`}`} transform={place(tree.x, tree.y, tree.s)} />)}
        <use href="#hj-windmill" transform={place(millX, millY)} />
        <use href="#hj-cottage" transform={place(cottage.x, cottage.y, cottage.s)} />
      </Repeat>
    </Strip>
  );
}

/** The meadow and footpath Bramble walks along (feet at y ≈ 936). */
const meadowBack = rolling(61, 772, [[14, 2], [8, 5], [3, 9]]);
const meadowMid = rolling(62, 852, [[10, 3], [6, 7]]);
const pathTop = rolling(63, 910, [[3, 4], [2, 9]]);
const pathBottom = rolling(64, 962, [[3, 3], [2, 8]]);
const rut = (t: number) => (x: number) => pathTop(x) + (pathBottom(x) - pathTop(x)) * t;

function TuftSprite({ kind, flower, style }: { kind: string; flower?: { kind: string; x: number; y: number; s: number }; style: CSSProperties }) {
  return (
    <span className="hj-sprite hj-sway" style={style}>
      <svg viewBox="-30 -110 60 110" focusable="false">
        <use href={`#hj-tuft-${kind}`} />
        {flower && <use href={`#hj-fl-${flower.kind}`} transform={place(flower.x, flower.y, flower.s)} />}
      </svg>
    </span>
  );
}

function Meadow() {
  const bottom = LAYERS.meadow.top + LAYERS.meadow.height;
  const random = seeded(65);
  const tufts = [90, 330, 560, 790, 1040, 1270, 1490].map((x, index) => ({
    x: x + (random() - 0.5) * 50,
    kind: ["short", "broad", "short", "tall", "broad", "short", "broad"][index],
    onMid: index % 2 === 0,
    flower: index % 3 === 1 ? undefined : { kind: ["poppy", "daisy", "buttercup", "clover"][index % 4], x: (random() - 0.5) * 16, y: -16 - random() * 14, s: 1.1 },
  }));
  const pebbles = Array.from({ length: 30 }, () => ({ x: 14 + random() * (W - 28), t: random(), s: 0.45 + random() * 0.8, b: random() < 0.45 }));
  let gravel = "";
  for (let i = 0; i < 70; i++) {
    const x = 6 + random() * (W - 12);
    const y = rut(0.1 + random() * 0.8)(x);
    gravel += `M${r1(x)} ${r1(y)}h1.4`;
  }
  const soil = Array.from({ length: 12 }, () => ({ x: 30 + random() * (W - 60), top: random() < 0.5, w: 20 + random() * 50 }));
  return (
    <Strip
      name="meadow"
      layer={LAYERS.meadow}
      depth={0.8}
      sprites={copies.map((offset) => tufts.map((tuft, index) => {
        const ground = tuft.onMid ? meadowMid(tuft.x) + 6 : pathBottom(tuft.x) + 20;
        return <TuftSprite key={`${offset}-${index}`} kind={tuft.kind} flower={tuft.flower} style={sprite(LAYERS.meadow, tuft.x + offset - 30, ground - 110, 60, 110, { "--sway-d": `${r1(3.8 + index * 0.55)}s`, "--sway-delay": `${r1(-index * 1.7)}s` })} />;
      }))}
    >
      <defs>
        <linearGradient id="hj-meadow-back" gradientUnits="userSpaceOnUse" x1="0" y1="740" x2="0" y2="880">
          <stop offset="0" stopColor="#a2c766" />
          <stop offset="1" stopColor="#80b455" />
        </linearGradient>
        <linearGradient id="hj-meadow-front" gradientUnits="userSpaceOnUse" x1="0" y1="950" x2="0" y2="1000">
          <stop offset="0" stopColor="#6ea648" />
          <stop offset="1" stopColor="#5d963d" />
        </linearGradient>
        <linearGradient id="hj-path" gradientUnits="userSpaceOnUse" x1="0" y1="905" x2="0" y2="966">
          <stop offset="0" stopColor="#cfb47e" />
          <stop offset=".12" stopColor="#e9d6a5" />
          <stop offset=".5" stopColor="#f0e0b4" />
          <stop offset=".88" stopColor="#e2cc98" />
          <stop offset="1" stopColor="#c7ab76" />
        </linearGradient>
      </defs>
      <path d={area(meadowBack, bottom, 12)} fill="url(#hj-meadow-back)" />
      <path d={line((x) => meadowBack(x) + 2, 12)} fill="none" stroke="#efe39a" strokeWidth="3.5" opacity=".75" />
      <Grass seed={65} count={200} ground={(x) => meadowBack(x) + 14} min={4} spread={7} width={1.6} tones={["#84b656", "#94c062", "#76a94c"]} />
      <FlowerSpecks seed={68} count={150} band={[(x) => meadowBack(x) + 10, (x) => meadowMid(x) - 4]} />
      <path d={area(meadowMid, bottom, 12)} fill="#79ad50" />
      <path d={line((x) => meadowMid(x) + 1.5, 12)} fill="none" stroke="#c9dc84" strokeWidth="2.5" opacity=".6" />
      <Grass seed={66} count={260} ground={meadowMid} min={6} spread={12} width={2} tones={["#5f9640", "#6fa64a", "#80b455"]} />
      <FlowerField seed={69} clusters={16} band={[(x) => meadowMid(x) + 8, (x) => pathTop(x) - 6]} scale={[0.4, 0.62]} />
      {/* The footpath: worn soil edges, two wheel ruts with a grassy-pale crown, pebbles and gravel. */}
      <path d={`${line(pathTop, 12)}L${TW} ${bottom}L0 ${bottom}Z`} fill="url(#hj-path)" />
      <Repeat id="hj-path-wear">
        {soil.map((patch, index) => <ellipse key={index} cx={r1(patch.x)} cy={r1(patch.top ? pathTop(patch.x) + 5 : pathBottom(patch.x) - 5)} rx={r1(patch.w)} ry="3.5" fill="#c2a46e" opacity=".45" />)}
      </Repeat>
      <path d={line((x) => rut(0.3)(x), 12)} fill="none" stroke="#cdb582" strokeWidth="6" strokeLinecap="round" opacity=".75" />
      <path d={line((x) => rut(0.3)(x) + 3.4, 12)} fill="none" stroke="#f7ebc8" strokeWidth="1.6" opacity=".8" />
      <path d={line((x) => rut(0.72)(x), 12)} fill="none" stroke="#cdb582" strokeWidth="6" strokeLinecap="round" opacity=".75" />
      <path d={line((x) => rut(0.72)(x) + 3.4, 12)} fill="none" stroke="#f7ebc8" strokeWidth="1.6" opacity=".8" />
      <path d={line((x) => rut(0.51)(x), 12)} fill="none" stroke="#c9cf86" strokeWidth="2.4" strokeDasharray="6 14 3 22" strokeLinecap="round" opacity=".55" />
      <Repeat id="hj-pebbles">
        <path d={gravel} stroke="#a8936c" strokeWidth="1.3" strokeLinecap="round" />
        {pebbles.map((pebble, index) => <use key={index} href={pebble.b ? "#hj-pebble-b" : "#hj-pebble-a"} transform={place(pebble.x, rut(0.12 + pebble.t * 0.76)(pebble.x), pebble.s)} />)}
      </Repeat>
      <Grass seed={63} count={160} ground={(x) => pathTop(x) + 4} min={3} spread={6} width={1.6} tones={["#6fa64a", "#7fb455", "#5f9640"]} />
      <path d={area(pathBottom, bottom, 12)} fill="url(#hj-meadow-front)" />
      <path d={line((x) => pathBottom(x) + 1, 12)} fill="none" stroke="#a8c86a" strokeWidth="2" opacity=".6" />
      <Grass seed={67} count={240} ground={pathBottom} min={5} spread={11} width={2} tones={["#4f8a37", "#5e9a42", "#6fa94c"]} />
      <FlowerField seed={70} clusters={11} band={[(x) => pathBottom(x) + 10, () => 996]} scale={[0.68, 0.9]} />
    </Strip>
  );
}

function Fringe() {
  const ground = rolling(81, 986, [[5, 5], [3, 11]]);
  const bottom = LAYERS.fringe.top + LAYERS.fringe.height;
  const random = seeded(82);
  const tufts = Array.from({ length: 9 }, (_, index) => ({
    x: 90 + index * 175 + (random() - 0.5) * 70,
    kind: index % 3 === 0 ? "tall" : index % 3 === 1 ? "broad" : "short",
    flower: index % 2 ? { kind: ["poppy", "daisy", "lavender", "buttercup", "clover"][index % 5], x: (random() - 0.5) * 18, y: -24 - random() * 20, s: 1.5 } : undefined,
  }));
  return (
    <Strip
      name="fringe"
      layer={LAYERS.fringe}
      depth={1}
      sprites={copies.map((offset) => tufts.map((tuft, index) => (
        <TuftSprite key={`${offset}-${index}`} kind={tuft.kind} flower={tuft.flower} style={sprite(LAYERS.fringe, tuft.x + offset - 30, ground(tuft.x) - 104, 60, 110, { "--sway-d": `${r1(3.2 + index * 0.4)}s`, "--sway-delay": `${r1(-index * 0.83)}s`, "--sway-a": `${index % 2 ? 6 : 8}deg` })} />
      )))}
    >
      <Grass seed={83} count={300} ground={ground} min={14} spread={30} width={3} tones={["#4f8f37", "#5c9a41", "#6aa64b"]} />
      <FlowerField seed={85} clusters={9} band={[(x) => ground(x) - 2, (x) => ground(x) + 6]} scale={[1.05, 1.45]} />
      <Grass seed={84} count={220} ground={ground} min={10} spread={22} width={3.2} tones={["#3d7a2c", "#467d31", "#538c39"]} />
      <path d={area(ground, bottom, 10)} fill="#4a8434" />
    </Strip>
  );
}

/** Long soft shafts of late sun slanting down from the low sun across the land. */
function SunBeams() {
  const ends = [[-40, 140], [240, 120], [560, 110], [900, 90], [1240, 70]];
  return (
    <div className="hj-layer hj-beams" data-depth="0.3">
      <svg viewBox="0 0 1800 640" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="hj-beam" gradientUnits="userSpaceOnUse" x1="1700" y1="40" x2="700" y2="620">
            <stop offset="0" stopColor="#fff1c8" stopOpacity=".55" />
            <stop offset=".55" stopColor="#ffe6b0" stopOpacity=".18" />
            <stop offset="1" stopColor="#ffe6b0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g fill="url(#hj-beam)">
          {ends.map(([x, w], index) => <path key={index} d={`M1700 40L${x} 640L${x + w} 640Z`} />)}
        </g>
      </svg>
    </div>
  );
}

/* ---------- living things ---------- */

function Flocks() {
  const flock = [[0, 30, 0], [42, 0, 0.18], [70, 44, 0.32], [100, 14, 0.1], [128, 52, 0.26]];
  return (
    <div className="hj-life" data-depth="0.3">
      <div className="hj-fly hj-fly--west">
        <div className="hj-flock">
          {flock.map(([x, y, delay], index) => (
            <span key={index} className="hj-bird" style={{ left: `calc(${x} * var(--u))`, top: `calc(${y} * var(--u))`, "--flap-delay": `${-delay * 2}s` } as CSSProperties}><BirdArt /></span>
          ))}
        </div>
      </div>
      <div className="hj-fly hj-fly--east">
        <div className="hj-flock hj-flock--far">
          {[[0, 0, 0.2], [30, 18, 0]].map(([x, y, delay], index) => (
            <span key={index} className="hj-bird" style={{ left: `calc(${x} * var(--u))`, top: `calc(${y} * var(--u))`, "--flap-delay": `${-delay * 3}s` } as CSSProperties}><BirdArt /></span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Butterfly({ variant }: { variant: "gold" | "lilac" }) {
  return (
    <span className={`hj-butterfly hj-butterfly--${variant}`}>
      <span className="hj-butterfly__bob"><ButterflyArt variant={variant} /></span>
    </span>
  );
}

function Drifters() {
  const random = seeded(101);
  const items = Array.from({ length: 16 }, (_, index) => {
    const seed = index % 3 !== 2;
    return {
      seed,
      color: ["#f6d65a", "#e7857a", "#fff8ec"][index % 3],
      x: r1(4 + random() * 92),
      y: r1(6 + random() * 26),
      dx: r1(160 + random() * 360),
      rise: r1(260 + random() * 360),
      dur: r1(11 + random() * 10),
      delay: r1(-random() * 20),
      spin: `${Math.round((random() - 0.5) * 540)}deg`,
      size: r1(seed ? 24 + random() * 10 : 10 + random() * 5),
    };
  });
  // Pollen glinting in the sunbeams, gathered toward the low sun at the right.
  const glints = Array.from({ length: 18 }, () => ({
    x: r1(42 + Math.pow(random(), 0.7) * 54),
    y: r1(14 + random() * 46),
    size: r1(4 + random() * 7),
    dur: r1(2.6 + random() * 3.4),
    delay: r1(-random() * 6),
    drift: r1(8 + random() * 22),
  }));
  return (
    <div className="hj-life hj-life--air" data-depth="0.9">
      {glints.map((glint, index) => (
        <span key={`g${index}`} className="hj-glint" style={{ left: `${glint.x}%`, bottom: `${glint.y}%`, "--size": glint.size, "--dur": `${glint.dur}s`, "--delay": `${glint.delay}s`, "--drift": glint.drift } as CSSProperties} />
      ))}
      {items.map((item, index) => (
        <span
          key={index}
          className={`hj-drift ${item.seed ? "hj-drift--seed" : "hj-drift--petal"}`}
          style={{ left: `${item.x}%`, bottom: `${item.y}%`, "--dx": item.dx, "--rise": item.rise, "--dur": `${item.dur}s`, "--delay": `${item.delay}s`, "--spin": item.spin, "--size": item.size } as CSSProperties}
        >
          <span className="hj-drift__sway">{item.seed ? <SeedArt /> : <PetalArt color={item.color} />}</span>
        </span>
      ))}
      <Butterfly variant="gold" />
      <Butterfly variant="lilac" />
    </div>
  );
}

function Walker() {
  return (
    <div className="hj-layer hj-layer--walker" data-depth="0.8">
      <div className="hj-cross">
        <div className="hj-walker">
          <div className="hj-walker__bob">
            <span className="hj-walker__shadow" />
            <Bramble id="hero-journey-bramble" className="bramble--walking" width={220} height={300} />
          </div>
        </div>
      </div>
    </div>
  );
}

export type HeroJourneyProps = {
  /** The headline, lede and actions, rendered as real HTML over the sky. */
  children: ReactNode;
  className?: string;
  /** Forwarded to the section, e.g. `aria-labelledby` the headline id. */
  "aria-labelledby"?: string;
  id?: string;
};

export function HeroJourney({ children, className, id, "aria-labelledby": labelledBy }: HeroJourneyProps) {
  return (
    <section id={id} className={`hero-journey${className ? ` ${className}` : ""}`} aria-labelledby={labelledBy}>
      <div className="hero-journey__scene" aria-hidden="true">
        <SpriteDefs />
        <Sky />
        <FarClouds />
        <NearClouds />
        <Flocks />
        <Mountains />
        <Hills />
        <SunBeams />
        <Meadow />
        <div className="hj-layer hj-layer--gust" data-depth="0.8"><span className="hj-gust" /><span className="hj-gust hj-gust--late" /></div>
        <Walker />
        <Fringe />
        <Drifters />
      </div>
      <div className="hero-journey__copy">
        <div className="hero-journey__copy-inner">{children}</div>
      </div>
      <HeroJourneyMotion />
    </section>
  );
}
