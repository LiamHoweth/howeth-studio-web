/**
 * Sprite library for HeroJourney. Every piece of scenery is drawn once inside
 * <SpriteDefs> (a zero-size inline SVG of <defs>) and placed many times with
 * <use href="#hj-…">, so the detail costs bytes only once. All art is original;
 * light comes from the low golden-hour sun at the right of the scene, so lit
 * faces sit up and to the right and cast shadows fall to the left.
 */

export const TAU = Math.PI * 2;
export const INK = "#2b2621";

export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const r1 = (value: number) => Math.round(value * 10) / 10;
const r0 = (value: number) => Math.round(value);

/* ---------- trees ---------- */

const LEAF = ["#2f5528", "#44763a", "#5f9644", "#82b657", "#b9cf6e"];
const SUN = "#ead27e";

type Clump = [x: number, y: number, r: number, tone: number];

/** Foliage as overlapping clumps, toned by how much each faces the sun (up-right). */
function canopy(seed: number, w: number, h: number, bottom: number, count: number): Clump[] {
  const random = seeded(seed);
  const cy = bottom - h / 2;
  const clumps: Clump[] = [];
  for (let i = 0; i < count; i++) {
    const a = random() * TAU;
    const d = Math.sqrt(random());
    const x = Math.cos(a) * d * w * 0.4;
    const y = cy + Math.sin(a) * d * h * 0.4;
    const r = (0.15 + random() * 0.1) * Math.min(w, h * 1.1) * (1.1 - d * 0.35);
    const light = (x / w) * 0.9 + ((cy - y) / h) * 1.2 + (random() - 0.5) * 0.4;
    clumps.push([r1(x), r1(y), r1(r), light < -0.22 ? 0 : light < 0.12 ? 1 : 2]);
  }
  return clumps.sort((p, q) => p[3] - q[3] || q[1] - p[1]);
}

function Foliage({ clumps, w, h, bottom, seed }: { clumps: Clump[]; w: number; h: number; bottom: number; seed: number }) {
  const random = seeded(seed + 7);
  const cy = bottom - h / 2;
  const flecks = Array.from({ length: 14 }, () => [r1((random() - 0.5) * w * 0.7), r1(cy + (random() - 0.5) * h * 0.7), random()] as const);
  return (
    <>
      <g filter="url(#hj-leafy)">
        {clumps.map(([x, y, r, tone], index) => (
          <g key={index}>
            <circle cx={x} cy={y} r={r} fill={LEAF[tone]} />
            <circle cx={r1(x + r * 0.18)} cy={r1(y - r * 0.2)} r={r1(r * 0.85)} fill={`url(#hj-leaf-${tone})`} />
            {tone === 2 && x > -w * 0.1 && <circle cx={r1(x + r * 0.4)} cy={r1(y - r * 0.38)} r={r1(r * 0.55)} fill="url(#hj-leaf-sun)" />}
          </g>
        ))}
      </g>
      {flecks.map(([x, y, k], index) => <path key={index} d={`M${x} ${y}q1.4 -1.2 2.6 0`} stroke={k < 0.5 ? "#26461f" : "#c3da82"} strokeWidth=".8" fill="none" opacity=".75" />)}
    </>
  );
}

function CastShadow({ length, depth = 6 }: { length: number; depth?: number }) {
  return <ellipse cx={r1(-length * 0.55)} cy="1.5" rx={r1(length)} ry={depth} fill="url(#hj-g-cast)" />;
}

function DeciduousTree({ id, seed, w, h, trunk }: { id: string; seed: number; w: number; h: number; trunk: number }) {
  const clumps = canopy(seed, w, h, -trunk + 8, 24);
  const back = clumps.filter((clump) => clump[3] === 0);
  const front = clumps.filter((clump) => clump[3] !== 0);
  return (
    <g id={id}>
      <CastShadow length={w * 0.85} />
      <Foliage clumps={back} w={w} h={h} bottom={-trunk + 8} seed={seed} />
      {/* Trunk, root flare and a few branches reaching into the gaps. */}
      <path d={`M-4.5 0 C-3 -${r0(trunk * 0.4)} -4 -${r0(trunk * 0.7)} -2.5 -${trunk} L2.5 -${trunk} C3.5 -${r0(trunk * 0.7)} 3 -${r0(trunk * 0.4)} 5 0 Z`} fill="url(#hj-g-trunk)" />
      <path d={`M-9 0.5 Q-5 -1 -4 -4 M9 0.5 Q5 -1 4 -4`} stroke="#4a3324" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d={`M-1 -${r0(trunk * 0.8)} Q-${r0(w * 0.12)} -${r0(trunk + h * 0.15)} -${r0(w * 0.22)} -${r0(trunk + h * 0.28)} M1 -${r0(trunk * 0.9)} Q${r0(w * 0.12)} -${r0(trunk + h * 0.2)} ${r0(w * 0.2)} -${r0(trunk + h * 0.36)} M0 -${trunk} Q-1 -${r0(trunk + h * 0.3)} 1 -${r0(trunk + h * 0.5)}`} stroke="#5a3e2a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d={`M3 -2 C3.6 -${r0(trunk * 0.4)} 2.8 -${r0(trunk * 0.7)} 2.2 -${trunk - 2}`} stroke="#d9a868" strokeWidth="1.1" fill="none" opacity=".7" />
      <Foliage clumps={front} w={w} h={h} bottom={-trunk + 8} seed={seed + 1} />
    </g>
  );
}

function Poplar() {
  const random = seeded(61);
  let texture = "";
  let lights = "";
  for (let i = 0; i < 30; i++) {
    const y = -18 - random() * 86;
    const half = 11 * Math.sin(((-y - 12) / 96) * Math.PI) + 1;
    const x = (random() - 0.5) * 2 * half * 0.8;
    if (x > half * 0.15) lights += `M${r1(x)} ${r1(y)}q2 -2.4 4 -.6`;
    else texture += `M${r1(x)} ${r1(y)}q1.8 -2.2 3.6 -.6`;
  }
  return (
    <g id="hj-tree-poplar">
      <CastShadow length={34} depth={4} />
      <path d="M-2.2 0 L-1.6 -16 L1.6 -16 L2.4 0 Z" fill="url(#hj-g-trunk)" />
      <g filter="url(#hj-leafy)">
        <path d="M0 -108 C9 -92 13 -66 12 -44 C11 -28 7 -16 0 -12 C-7 -16 -11 -28 -12 -44 C-13 -66 -9 -92 0 -108 Z" fill={LEAF[0]} />
        <path d="M1 -106 C9 -90 12 -66 11 -45 C10 -30 6 -19 1 -15 C-4 -20 -6 -32 -6 -46 C-6 -68 -4 -90 1 -106 Z" fill={LEAF[1]} />
        <path d="M3 -102 C9 -88 11 -66 10 -46 C9 -34 6 -24 3 -20 C1 -30 0 -44 0 -58 C0 -76 1 -92 3 -102 Z" fill={LEAF[2]} />
        <path d="M5 -96 C9 -84 10 -66 9 -50 C8 -42 7 -36 6 -32 C5 -46 4 -64 5 -96 Z" fill={LEAF[3]} opacity=".85" />
      </g>
      <path d={texture} stroke="#24421d" strokeWidth=".9" fill="none" opacity=".7" />
      <path d={lights} stroke="#d5d77c" strokeWidth=".9" fill="none" opacity=".8" />
      <path d="M6 -98 C10 -84 12 -64 10 -42" stroke={SUN} strokeWidth="1.4" fill="none" opacity=".6" strokeLinecap="round" />
    </g>
  );
}

function Pine() {
  const tiers = [[-104, -84, 9], [-92, -68, 14], [-78, -52, 19], [-62, -36, 24], [-46, -20, 28]];
  return (
    <g id="hj-tree-pine">
      <CastShadow length={40} depth={5} />
      <path d="M-2.6 0 L-2 -24 L2 -24 L2.8 0 Z" fill="url(#hj-g-trunk)" />
      {tiers.map(([top, base, half], index) => (
        <g key={index}>
          <path d={`M0 ${top} L${half} ${base} Q${r1(half * 0.5)} ${base - 4} 0 ${base + 2} Q${r1(-half * 0.5)} ${base - 4} ${-half} ${base} Z`} fill="#2b5233" />
          <path d={`M0 ${top} L${half} ${base} Q${r1(half * 0.5)} ${base - 4} 0 ${base + 2} Z`} fill="#467a48" />
          <path d={`M${r1(half * 0.2)} ${top + 6} L${r1(half * 0.85)} ${base - 1}`} stroke="#5f9157" strokeWidth="2" opacity=".8" />
          <path d={`M0 ${top} L${half} ${base}`} stroke={SUN} strokeWidth="1.3" opacity=".75" />
          <path d={`M${r1(-half * 0.7)} ${base - 2} l3 -3 M${r1(-half * 0.35)} ${base} l2 -4 M${r1(half * 0.4)} ${base - 1} l2 -3`} stroke="#1f3d27" strokeWidth="1" />
        </g>
      ))}
    </g>
  );
}

function Bush() {
  const clumps = canopy(71, 40, 22, 0, 12);
  return (
    <g id="hj-bush">
      <CastShadow length={26} depth={4} />
      <Foliage clumps={clumps} w={40} h={22} bottom={0} seed={71} />
    </g>
  );
}

/* ---------- buildings ---------- */

function WindmillTower() {
  const random = seeded(81);
  const stones = Array.from({ length: 16 }, () => {
    const y = -12 - random() * 60;
    const half = 20 - ((-y - 10) / 74) * 6.5;
    return [r1((random() - 0.5) * 2 * (half - 4)), r1(y), r1(3 + random() * 3)] as const;
  });
  return (
    <g id="hj-windmill" strokeLinejoin="round">
      <ellipse cx="-50" cy="2" rx="68" ry="7" fill="url(#hj-g-cast)" />
      {/* Stone plinth. */}
      <path d="M-25 0 L-23 -11 L23 -11 L25 0 Z" fill="#b39a76" stroke={INK} strokeWidth="1.4" />
      <path d="M-18 -11 V0 M-8 -11 V0 M4 -11 V0 M15 -11 V0 M-23 -5.5 H24" stroke="#8c7556" strokeWidth=".9" />
      {/* Plastered tower, lit from the right, with patches of stone showing. */}
      <path d="M-21 -11 L-14 -86 L14 -86 L21 -11 Z" fill="url(#hj-g-plaster)" stroke={INK} strokeWidth="1.6" />
      <path d="M-21 -11 L-14 -86 L-6 -86 L-10 -11 Z" fill="#7d6b5c" opacity=".2" />
      {stones.map(([x, y, w], index) => <rect key={index} x={x} y={y} width={w} height={r1(w * 0.55)} rx="1" fill="#d8c29c" stroke="#a88f6a" strokeWidth=".7" />)}
      <path d="M-19 -34 H19 M-17 -58 H17" stroke="#c7ad83" strokeWidth=".9" opacity=".8" />
      <path d="M-11 -40 l3 4 l-1 4 M9 -66 l-2 5" stroke="#a88f6a" strokeWidth=".8" fill="none" />
      <path d="M20.5 -12 L13.6 -85" stroke="#ffe0a0" strokeWidth="1.8" opacity=".85" />
      {/* Arched plank door under a stone arch. */}
      <path d="M-8 -11 V-24 Q0 -34 8 -24 V-11 Z" fill="#c9b08a" stroke={INK} strokeWidth="1.2" />
      <path d="M-6 -11 V-24 Q0 -31 6 -24 V-11 Z" fill="#6e4329" />
      <path d="M-3 -11 V-28 M0 -11 V-29.5 M3 -11 V-28" stroke="#4a2c1b" strokeWidth=".8" />
      <circle cx="3.6" cy="-17" r=".9" fill="#f1b84b" />
      {/* A lamp-lit window and a small dark one above. */}
      <circle cx="0" cy="-52" r="11" fill="url(#hj-g-glow)" />
      <rect x="-4.5" y="-58" width="9" height="12" rx="4.5" fill="url(#hj-g-window)" stroke={INK} strokeWidth="1.2" />
      <path d="M0 -58 V-46 M-4.5 -51.5 H4.5" stroke="#6e4329" strokeWidth=".9" />
      <path d="M-5.5 -45.5 H5.5" stroke="#8a6a48" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="-2.5" y="-76" width="5" height="7" rx="2.5" fill="#3b3a44" stroke={INK} strokeWidth="1" />
      {/* Cap: a ledge, then a shingled dome and finial. */}
      <rect x="-18" y="-90" width="36" height="5" rx="1.5" fill="#7b5236" stroke={INK} strokeWidth="1.3" />
      <path d="M-17 -89 Q-15 -110 0 -117 Q15 -110 17 -89 Z" fill="#3d6c70" stroke={INK} strokeWidth="1.5" />
      <path d="M0 -117 Q10 -110 13 -96 Q14 -92 17 -89 L6 -89 Q7 -104 0 -117 Z" fill="#5c9195" opacity=".8" />
      <path d="M-15 -95 q2.5 2.5 5 0 q2.5 2.5 5 0 q2.5 2.5 5 0 q2.5 2.5 5 0 q2.5 2.5 5 0 q2.5 2.5 5 0 M-13 -102 q2.6 2.4 5.2 0 q2.6 2.4 5.2 0 q2.6 2.4 5.2 0 q2.6 2.4 5.2 0 q2.6 2.4 5.2 0 M-9 -109 q2.2 2 4.5 0 q2.2 2 4.5 0 q2.2 2 4.5 0 q2.2 2 4.5 0" stroke="#284b4e" strokeWidth=".9" fill="none" />
      <path d="M0 -117 V-124" stroke={INK} strokeWidth="1.4" />
      <circle cx="0" cy="-125" r="2" fill="#f1b84b" stroke={INK} strokeWidth="1" />
    </g>
  );
}

function Cottage() {
  return (
    <g id="hj-cottage" strokeLinejoin="round">
      <ellipse cx="-30" cy="1.5" rx="46" ry="5" fill="url(#hj-g-cast)" />
      {/* Shaded gable end on the left, lit front wall. */}
      <path d="M-32 0 V-22 L-26 -30 V-3 Z" fill="#c9b08e" stroke={INK} strokeWidth="1.1" />
      <path d="M-26 -3 V-26 H24 V-3 Z" fill="url(#hj-g-plaster)" stroke={INK} strokeWidth="1.2" />
      <path d="M-26 -3 V-26 M-10 -3 V-26 M8 -3 V-26 M24 -3 V-26 M-26 -15 H24 M-26 -26 L-10 -15 M24 -26 L8 -15" stroke="#6a4630" strokeWidth="1.6" />
      <path d="M-27 -3 H25 V0 H-27 Z" fill="#a88f6a" stroke={INK} strokeWidth="1" />
      {/* Lamp-lit windows with sills and a window box. */}
      <circle cx="-18" cy="-20" r="8" fill="url(#hj-g-glow)" />
      <circle cx="16" cy="-20" r="8" fill="url(#hj-g-glow)" />
      <rect x="-22" y="-24" width="8" height="7" fill="url(#hj-g-window)" stroke={INK} strokeWidth="1" />
      <rect x="12" y="-24" width="8" height="7" fill="url(#hj-g-window)" stroke={INK} strokeWidth="1" />
      <path d="M-18 -24 V-17 M-22 -20.5 H-14 M16 -24 V-17 M12 -20.5 H20" stroke="#6e4329" strokeWidth=".7" />
      <path d="M-23 -16.5 H-13 M11 -16.5 H21" stroke="#7a5638" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="11" y="-15.5" width="10" height="3" rx="1" fill="#7a5638" />
      <circle cx="13" cy="-16" r="1.2" fill="#e7857a" /><circle cx="16" cy="-16.5" r="1.2" fill="#f6d65a" /><circle cx="19" cy="-16" r="1.2" fill="#e7857a" />
      {/* Door with a step and lantern. */}
      <path d="M-5 -3 V-12 Q-1 -16 3 -12 V-3 Z" fill="#3f7f80" stroke={INK} strokeWidth="1" />
      <path d="M-1 -3 V-14.5" stroke="#2c5f60" strokeWidth=".7" />
      <circle cx="1.6" cy="-7.5" r=".6" fill="#f1b84b" />
      <rect x="-6" y="-1" width="10" height="2" rx="1" fill="#cdb894" />
      <circle cx="6" cy="-12" r="4" fill="url(#hj-g-glow)" />
      <rect x="5" y="-13.5" width="2" height="3" rx=".8" fill="#ffd27a" />
      {/* Clay-tile roof with courses, a mossy patch and a ridge. */}
      <path d="M-34 -21 L-24 -40 L22 -40 L30 -24 L24 -24 L-26 -24 Z" fill="#c8613f" stroke={INK} strokeWidth="1.3" />
      <path d="M-34 -21 L-24 -40 L-18 -40 L-28 -22 Z" fill="#8f3f27" opacity=".6" />
      <path d="M-30 -27.5 H27 M-27.5 -32 H25 M-25.5 -36.5 H23" stroke="#9d4429" strokeWidth="1" strokeDasharray="3.2 1.2" />
      <path d="M2 -40 L26 -40 L29 -25" stroke="#ef9a6c" strokeWidth="1.1" fill="none" opacity=".8" />
      <path d="M-24 -40.5 H22" stroke="#7b3522" strokeWidth="2" strokeLinecap="round" />
      <path d="M-14 -34 q4 -3 8 -1 q2 2 -2 3 q-4 1 -6 -2 Z" fill="#6f9e4f" opacity=".85" />
      {/* Brick chimney with a cap. */}
      <path d="M10 -40 V-51 H17 V-40 Z" fill="#a9553a" stroke={INK} strokeWidth="1.1" />
      <path d="M10 -44 H17 M10 -47.5 H17 M13.5 -40 V-44 M12 -44 V-47.5 M15 -47.5 V-51" stroke="#7d3a26" strokeWidth=".6" />
      <rect x="9" y="-53" width="9" height="2.4" fill="#8f432c" stroke={INK} strokeWidth=".9" />
      <path d="M13.5 -54 q-3 -5 1 -9 q3 -4 -1 -9" stroke="#efe6d6" strokeWidth="2.4" fill="none" opacity=".45" strokeLinecap="round" />
      {/* Picket fence and a tiny garden. */}
      <path d="M26 0 V-7 M30 0 V-7 M34 0 V-7 M38 0 V-7 M25 -2.5 H39 M25 -5 H39" stroke="#f4ead6" strokeWidth="1.2" />
      <circle cx="28" cy="-1" r="1.3" fill="#e7857a" /><circle cx="33" cy="-1.5" r="1.3" fill="#b9a6e3" /><circle cx="-34" cy="-1" r="1.3" fill="#f6d65a" />
    </g>
  );
}

/* ---------- flowers ---------- */

const PETAL = "M0 0 C1.6 -1.2 1.8 -4 0 -5.6 C-1.8 -4 -1.6 -1.2 0 0 Z";

function Flowers() {
  return (
    <>
      <g id="hj-fl-daisy">
        <path d="M0 0 Q2 -10 0 -22" stroke="#4e8436" strokeWidth="1.4" fill="none" />
        <path d="M0.6 -6 Q-6 -10 -9 -5 Q-4 -3.4 0.6 -6 Z M1 -11 Q7 -14 9 -9 Q4 -8 1 -11 Z" fill="#5f9a42" />
        <g transform="translate(0 -22)">
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={PETAL} transform={`rotate(${i * 30}) scale(.9 1)`} fill={i % 2 ? "#f3ece0" : "#fffbf3"} />)}
          <circle r="2.5" fill="#f2b630" />
          <circle cx="-.7" cy=".8" r="1.4" fill="#d48d1e" opacity=".8" />
          <circle cx=".7" cy="-.8" r=".7" fill="#ffe28a" />
        </g>
      </g>
      <g id="hj-fl-poppy">
        <path d="M0 0 Q3.5 -12 1.5 -24" stroke="#557f36" strokeWidth="1.4" fill="none" />
        <path d="M1 -6 l-2 -1 M2.2 -12 l2 -1 M2.4 -17 l-2 -1" stroke="#557f36" strokeWidth=".7" />
        <path d="M0.6 -5 Q-5 -8 -7 -3 Q-3 -2 0.6 -5 Z" fill="#5a8f3e" />
        <circle cx="-2.4" cy="-28" r="4.6" fill="#c63b28" />
        <circle cx="5" cy="-28" r="4.6" fill="#d64a30" />
        <path d="M-4.5 -26 Q1.5 -18.5 7.5 -26 Q7 -32 1.5 -32 Q-4 -32 -4.5 -26 Z" fill="#ec5a38" />
        <path d="M-2 -28 Q1.5 -24 5 -28" stroke="#ff9a72" strokeWidth=".9" fill="none" />
        <ellipse cx="1.5" cy="-30" rx="2.2" ry="1.2" fill={INK} />
      </g>
      <g id="hj-fl-buttercup">
        <path d="M0 0 Q-2 -9 0 -18" stroke="#4e8436" strokeWidth="1.2" fill="none" />
        <path d="M0 -5 Q5 -8 7 -4 Q3 -2.5 0 -5 Z" fill="#5f9a42" />
        <g transform="translate(0 -19)">
          {Array.from({ length: 5 }, (_, i) => <circle key={i} cx="0" cy="-2.6" r="2.5" transform={`rotate(${i * 72})`} fill="#f6d040" />)}
          {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx=".6" cy="-3.4" rx=".8" ry=".5" transform={`rotate(${i * 72})`} fill="#fff6c4" />)}
          <circle r="1.4" fill="#d79a1c" />
        </g>
      </g>
      <g id="hj-fl-lavender">
        <path d="M0 0 V-32" stroke="#6f8a5a" strokeWidth="1.1" />
        <path d="M0 -2 Q-5 -8 -6 -14 M0 -3 Q4 -9 5 -13" stroke="#8aa274" strokeWidth="1" fill="none" />
        {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={i % 2 ? 1.2 : -1.2} cy={-18 - i * 1.6} rx="1.5" ry="2" fill={i > 6 ? "#7f68c2" : i % 3 ? "#9c86d6" : "#b9a6e3"} />)}
        <ellipse cx="1.4" cy="-27" rx=".6" ry="1" fill="#e2d8ff" opacity=".8" />
      </g>
      <g id="hj-fl-clover">
        <path d="M0 0 Q1 -6 0 -12" stroke="#5a8a3e" strokeWidth="1.1" fill="none" />
        <g fill="#5f9a42"><circle cx="-3.4" cy="-3" r="2.2" /><circle cx="-1.6" cy="-5.6" r="2.2" /><circle cx="-5.6" cy="-5" r="2.2" /></g>
        <path d="M-3.4 -3 l-0.6 -1.2 M-1.6 -5.6 l-1 -.4" stroke="#b9d68a" strokeWidth=".6" />
        <circle cx="0" cy="-14.5" r="3.6" fill="#d97f9c" />
        {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx="0" cy="-2.6" rx=".8" ry="1.8" transform={`translate(0 -14.5) rotate(${-120 + i * 30})`} fill={i % 2 ? "#f7d3df" : "#eda7bd"} />)}
      </g>
    </>
  );
}

/* ---------- grass tufts ---------- */

function bladePath(x: number, h: number, lean: number, w: number) {
  return `M${r1(x - w)} 0Q${r1(x + lean * 0.35 - w * 0.4)} ${r1(-h * 0.55)} ${r1(x + lean)} ${r1(-h)}Q${r1(x + lean * 0.35 + w * 0.4)} ${r1(-h * 0.55)} ${r1(x + w)} 0Z`;
}

function Tuft({ id, seed, count, height, spread, heads = 0 }: { id: string; seed: number; count: number; height: number; spread: number; heads?: number }) {
  const random = seeded(seed);
  const greens = ["#3f7a2e", "#558f3b", "#6fa749"];
  const paths = ["", "", ""];
  let tips = "";
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1) - 0.5) * spread + (random() - 0.5) * 3;
    const h = height * (0.55 + random() * 0.45);
    const lean = (random() - 0.5) * height * 0.5 + x * 0.6;
    paths[i % 3] += bladePath(x, h, lean, 1.4 + random() * 1.2);
    tips += `M${r1(x + lean * 0.62)} ${r1(-h * 0.78)}L${r1(x + lean)} ${r1(-h)}`;
  }
  const stalks = Array.from({ length: heads }, (_, i) => {
    const x = (i - (heads - 1) / 2) * 6;
    const h = height * (1.05 + random() * 0.2);
    const lean = (random() - 0.5) * 14;
    return { x, h, lean };
  });
  return (
    <g id={id}>
      {paths.map((d, index) => <path key={index} d={d} fill={greens[index]} />)}
      <path d={tips} stroke="#d6e38c" strokeWidth="1" strokeLinecap="round" opacity=".85" />
      {stalks.map(({ x, h, lean }, index) => (
        <g key={index}>
          <path d={`M${r1(x)} 0 Q${r1(x + lean * 0.3)} ${r1(-h * 0.6)} ${r1(x + lean)} ${r1(-h)}`} stroke="#a7a35a" strokeWidth=".9" fill="none" />
          {Array.from({ length: 6 }, (_, k) => {
            const t = 0.72 + k * 0.05;
            return <ellipse key={k} cx={r1(x + lean * t + (k % 2 ? 1.6 : -1.6))} cy={r1(-h * t)} rx=".9" ry="2.1" transform={`rotate(${k % 2 ? 24 : -24} ${r1(x + lean * t + (k % 2 ? 1.6 : -1.6))} ${r1(-h * t)})`} fill={k % 2 ? "#e2cf86" : "#cdbb6e"} />;
          })}
        </g>
      ))}
    </g>
  );
}

/* ---------- path pebbles ---------- */

function Pebbles() {
  return (
    <>
      <g id="hj-pebble-a">
        <ellipse cx="-1" cy="1" rx="5.4" ry="2.4" fill="#9d8762" opacity=".55" />
        <ellipse cx="0" cy="0" rx="5" ry="3" fill="url(#hj-g-pebble)" />
        <ellipse cx="1.4" cy="-1.1" rx="1.8" ry=".8" fill="#fbf2dc" opacity=".8" />
      </g>
      <g id="hj-pebble-b">
        <path d="M-4 1 Q-5 -2 -1 -3 Q4 -3.4 4.4 0 Q4 1.8 0 2 Q-3 2 -4 1 Z" fill="#a89574" />
        <path d="M-3 0 Q-3 -2 -.5 -2.4 Q3 -2.6 3.4 -.4" fill="#d9c9a4" />
        <circle cx="1.6" cy="-1.6" r=".7" fill="#fff6e0" opacity=".8" />
      </g>
    </>
  );
}

/* ---------- clouds ---------- */

export type Lobe = [cx: number, cy: number, r: number];

/**
 * A towering cumulus as a few hundred overlapping lobes: a broad base of small
 * lobes, a body that narrows upward, cauliflower turrets on the crown, bumps
 * along the silhouette, and a couple of satellite puffs drifting beside it.
 */
export function cumulus(seed: number, w: number, h: number) {
  const random = seeded(seed);
  const body: Lobe[] = [];
  const base = Math.max(4, Math.round(w / 38));
  for (let i = 0; i < base; i++) {
    const t = i / (base - 1);
    const r = w * (0.06 + random() * 0.04) * (1.1 - Math.abs(t - 0.5) * 0.7);
    body.push([r0((t - 0.5) * w * 0.94 + (random() - 0.5) * 8), r0(-r * 0.4 - random() * 6), r0(r)]);
  }
  const rows = Math.max(2, Math.round(h / 34));
  let lean = 0;
  for (let j = 1; j <= rows; j++) {
    const p = j / rows;
    const rowW = w * 0.84 * Math.pow(1 - p * 0.72, 1.2);
    lean += (random() - 0.4) * w * 0.02;
    const n = Math.max(1, Math.round(rowW / 56) + 1);
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const r = Math.max((rowW / n) * 0.75, w * 0.075) * (0.75 + random() * 0.5);
      body.push([r0(lean + (t - 0.5) * rowW + (random() - 0.5) * r * 0.5), r0(-p * h * 0.88 + r * 0.75 + (random() - 0.5) * r * 0.3), r0(r)]);
    }
  }
  // Cauliflower bumps along the upper silhouette.
  const bumps: Lobe[] = [];
  for (const [cx, cy, r] of body) {
    if (cy > -h * 0.25 || r < 14 || random() < 0.45) continue;
    const a = -Math.PI * (0.2 + random() * 0.6);
    const rr = r * (0.45 + random() * 0.2);
    bumps.push([r0(cx + Math.cos(a) * r * 0.62), r0(cy + Math.sin(a) * r * 0.62), r0(rr)]);
  }
  // Satellite puffs beside the base.
  const puffs: Lobe[] = [];
  for (const side of [-1, 1]) {
    if (random() < 0.25) continue;
    const px = side * (w * 0.52 + random() * w * 0.12);
    const py = -h * (0.05 + random() * 0.22);
    const s = w * (0.035 + random() * 0.02);
    for (let i = 0; i < 5; i++) puffs.push([r0(px + (i - 2) * s * 1.1), r0(py - Math.sin((i / 4) * Math.PI) * s * 0.9), r0(s * (0.7 + Math.sin((i / 4) * Math.PI) * 0.6))]);
  }
  const lobes = [...body, ...bumps, ...puffs].filter(([, , r]) => r > 2);
  const wisps = [
    [r0(-w * 0.45), -6, r0(w * 0.28), 7],
    [r0(w * 0.42), -10, r0(w * 0.24), 6],
    [r0(lean + w * 0.12), r0(-h * 0.92), r0(w * 0.16), 9],
  ] as const;
  return { lobes, wisps };
}

/* ---------- the defs ---------- */

export function SpriteDefs() {
  return (
    <svg className="hj-defs" width="0" height="0" focusable="false">
      <defs>
        <filter id="hj-wash" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency=".013" numOctaves="3" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="12" />
        </filter>
        {/* Clouds: fine turbulence frays the lobe edges into a painterly, feathered rim. */}
        <filter id="hj-cloud-paint" x="-15%" y="-20%" width="130%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves="3" seed="9" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="11" xChannelSelector="R" yChannelSelector="G" result="frayed" />
          <feGaussianBlur in="frayed" stdDeviation=".7" />
        </filter>
        <filter id="hj-leafy" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".32" numOctaves="1" seed="2" />
          <feDisplacementMap in="SourceGraphic" scale="3.6" />
        </filter>
        {[0, 1, 2].map((tone) => (
          <radialGradient key={tone} id={`hj-leaf-${tone}`} cx=".55" cy=".42" r=".55">
            <stop offset="0" stopColor={LEAF[tone + 1]} />
            <stop offset=".6" stopColor={LEAF[tone + 1]} stopOpacity=".75" />
            <stop offset="1" stopColor={LEAF[tone + 1]} stopOpacity="0" />
          </radialGradient>
        ))}
        <radialGradient id="hj-leaf-sun" cx=".6" cy=".4" r=".5">
          <stop offset="0" stopColor={SUN} stopOpacity=".9" />
          <stop offset="1" stopColor={SUN} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hj-lobe-hi" cx=".55" cy=".4" r=".55">
          <stop offset="0" stopColor="#fffdf6" stopOpacity=".95" />
          <stop offset=".55" stopColor="#fff4dc" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff4dc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hj-lobe-crease" r=".5">
          <stop offset="0" stopColor="#9285ab" stopOpacity=".34" />
          <stop offset="1" stopColor="#9285ab" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hj-wisp-r">
          <stop offset="0" stopColor="#fff4dc" stopOpacity=".8" />
          <stop offset="1" stopColor="#fff4dc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hj-wisp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff2d6" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff2d6" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff2d6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hj-g-cast">
          <stop offset="0" stopColor="#2c3e24" stopOpacity=".42" />
          <stop offset=".6" stopColor="#2c3e24" stopOpacity=".18" />
          <stop offset="1" stopColor="#2c3e24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hj-g-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3f2b1f" />
          <stop offset=".55" stopColor="#6e4c33" />
          <stop offset="1" stopColor="#a27a52" />
        </linearGradient>
        <linearGradient id="hj-g-plaster" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d4bc98" />
          <stop offset=".55" stopColor="#f1e1c2" />
          <stop offset="1" stopColor="#fff1d6" />
        </linearGradient>
        <radialGradient id="hj-g-window" cx=".5" cy=".6" r=".7">
          <stop offset="0" stopColor="#fff3c0" />
          <stop offset=".55" stopColor="#ffc861" />
          <stop offset="1" stopColor="#e08a2c" />
        </radialGradient>
        <radialGradient id="hj-g-glow">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity=".6" />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hj-g-pebble" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe3c6" />
          <stop offset="1" stopColor="#b29e78" />
        </linearGradient>
        <DeciduousTree id="hj-tree-oak" seed={11} w={74} h={62} trunk={30} />
        <DeciduousTree id="hj-tree-elm" seed={23} w={92} h={70} trunk={34} />
        <Poplar />
        <Pine />
        <Bush />
        <WindmillTower />
        <Cottage />
        <Flowers />
        <Pebbles />
        <Tuft id="hj-tuft-short" seed={31} count={11} height={40} spread={30} />
        <Tuft id="hj-tuft-tall" seed={32} count={13} height={74} spread={34} heads={2} />
        <Tuft id="hj-tuft-broad" seed={33} count={15} height={54} spread={46} heads={1} />
      </defs>
    </svg>
  );
}

/* ---------- HTML sprites (each animates on the compositor) ---------- */

/** Lattice windmill sails with canvas: two arms fully clothed, two furled. */
export function Sails() {
  const rungs = Array.from({ length: 10 }, (_, i) => `M2 ${-70 + i * 6}H20`).join("");
  const arm = (angle: number, clothed: boolean) => (
    <g key={angle} transform={`rotate(${angle})`}>
      <path d={rungs} stroke="#7a5638" strokeWidth="1" />
      <path d="M11 -74V-16" stroke="#7a5638" strokeWidth=".9" />
      {clothed ? (
        <>
          <path d="M3 -73H19V-17H3Z" fill="#f4e7cc" opacity=".93" />
          <path d="M3 -73H8V-17H3Z" fill="#d8c3a0" opacity=".55" />
          <path d="M8 -73Q9.5 -45 8 -17M13.5 -73Q15 -45 13.5 -17" stroke="#cdb690" strokeWidth=".8" fill="none" />
          <path d="M19 -73V-17" stroke="#ffe7b4" strokeWidth="1.1" />
        </>
      ) : (
        <path d="M2.5 -73Q6.5 -45 2.5 -17L5 -17Q9.5 -45 5 -73Z" fill="#e9d9b9" stroke="#b39b78" strokeWidth=".6" />
      )}
      <path d="M2 -74H20V-14H2Z" fill="none" stroke="#5a3e2a" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M0 -6V-78" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
  return (
    <svg viewBox="-80 -80 160 160" focusable="false">
      {arm(0, true)}
      {arm(90, false)}
      {arm(180, true)}
      {arm(270, false)}
      <circle r="7" fill="#6e4329" stroke={INK} strokeWidth="1.6" />
      <circle r="3" fill="#3b2a1d" />
      <circle cx="1.6" cy="-1.6" r="1.2" fill="#f1b84b" />
    </svg>
  );
}

/** A swallow-like bird seen from below; each wing pivots at the shoulder. */
export function BirdArt() {
  return (
    <svg viewBox="-20 -9 40 18" focusable="false">
      <g fill="#343a46">
        <path className="hj-bird__wing hj-bird__wing--l" d="M-1 -.5C-4 -3.5 -8 -4.6 -11.5 -3.4C-13.8 -2.6 -16 -1.2 -19 .6C-15 .2 -11 .8 -7.5 1.6C-5 2.1 -2.6 1.6 -1 .8Z" />
        <path className="hj-bird__wing hj-bird__wing--r" d="M1 -.5C4 -3.5 8 -4.6 11.5 -3.4C13.8 -2.6 16 -1.2 19 .6C15 .2 11 .8 7.5 1.6C5 2.1 2.6 1.6 1 .8Z" />
        <ellipse cx="0" cy=".4" rx="1.7" ry="3.2" />
        <circle cx="0" cy="-2.6" r="1.4" />
        <path d="M-1 3 L-2.2 7 L0 4.6 L2.2 7 L1 3Z" />
      </g>
      <path d="M-15 .9C-11 .7 -7.5 1.4 -4 1.8M15 .9C11 .7 7.5 1.4 4 1.8" stroke="#e9b673" strokeWidth=".7" fill="none" opacity=".7" />
    </svg>
  );
}

export function ButterflyArt({ variant }: { variant: "gold" | "lilac" }) {
  const gold = variant === "gold";
  const id = `hj-bf-${variant}`;
  const [inner, outer, lower, border] = gold ? ["#ffd37a", "#ee8f32", "#e7857a", "#3a2a22"] : ["#efe6ff", "#a690de", "#cdbff0", "#3d3550"];
  return (
    <svg viewBox="0 0 40 32" focusable="false">
      <defs>
        <radialGradient id={`${id}-up`} cx=".85" cy=".8" r=".9">
          <stop offset="0" stopColor={inner} />
          <stop offset=".75" stopColor={outer} />
          <stop offset="1" stopColor={border} />
        </radialGradient>
        <radialGradient id={`${id}-up-r`} cx=".15" cy=".8" r=".9">
          <stop offset="0" stopColor={inner} />
          <stop offset=".75" stopColor={outer} />
          <stop offset="1" stopColor={border} />
        </radialGradient>
      </defs>
      <g stroke={border} strokeWidth="1" strokeLinejoin="round">
        <path d="M20 16C12 1 1.5 2 2.5 10C3.5 16 12 17 20 16Z" fill={`url(#${id}-up)`} />
        <path d="M20 16C28 1 38.5 2 37.5 10C36.5 16 28 17 20 16Z" fill={`url(#${id}-up-r)`} />
        <path d="M20 16C13 18 6.5 26 11.5 28.5C16 30.5 19 22 20 16Z" fill={lower} />
        <path d="M20 16C27 18 33.5 26 28.5 28.5C24 30.5 21 22 20 16Z" fill={lower} />
      </g>
      <g stroke={border} strokeWidth=".5" fill="none" opacity=".75">
        <path d="M19 15L6 6M19 15L4 11M19 15.5L9 14M21 15L34 6M21 15L36 11M21 15.5L31 14M19.5 17L13 25M20.5 17L27 25" />
      </g>
      <g fill="#fffaf0">
        <circle cx="4.5" cy="7.5" r=".9" /><circle cx="6.5" cy="5.2" r=".7" /><circle cx="3.6" cy="10.4" r=".7" />
        <circle cx="35.5" cy="7.5" r=".9" /><circle cx="33.5" cy="5.2" r=".7" /><circle cx="36.4" cy="10.4" r=".7" />
      </g>
      <circle cx="13.5" cy="25" r="2" fill={border} /><circle cx="13.5" cy="25" r="1" fill={gold ? "#8fc1df" : "#f6d65a"} />
      <circle cx="26.5" cy="25" r="2" fill={border} /><circle cx="26.5" cy="25" r="1" fill={gold ? "#8fc1df" : "#f6d65a"} />
      <ellipse cx="20" cy="16.5" rx="1.3" ry="7.5" fill={INK} />
      <circle cx="20" cy="8.6" r="1.6" fill={INK} />
      <path d="M19.4 8 Q17 3.5 14.8 2.6 M20.6 8 Q23 3.5 25.2 2.6" stroke={INK} strokeWidth=".8" fill="none" />
      <circle cx="14.8" cy="2.6" r=".8" fill={INK} /><circle cx="25.2" cy="2.6" r=".8" fill={INK} />
    </svg>
  );
}

/** A dandelion seed: a fine pappus of forked filaments over a ribbed achene. */
export function SeedArt() {
  const rays = Array.from({ length: 15 }, (_, i) => {
    const a = (-160 + (i / 14) * 140) * (Math.PI / 180);
    const len = 9 + (i % 3) * 0.8;
    const x = r1(Math.cos(a) * len);
    const y = r1(Math.sin(a) * len);
    const fx = r1(Math.cos(a - 0.35) * 2);
    const fy = r1(Math.sin(a - 0.35) * 2);
    const gx = r1(Math.cos(a + 0.35) * 2);
    const gy = r1(Math.sin(a + 0.35) * 2);
    return `M0 0L${x} ${y}l${fx} ${fy}M${x} ${y}l${gx} ${gy}`;
  }).join("");
  return (
    <svg viewBox="-13 -13 26 32" focusable="false">
      <path d={rays} stroke="#fffdf6" strokeWidth=".55" strokeLinecap="round" fill="none" />
      <path d={rays} stroke="#e6dcc6" strokeWidth=".25" fill="none" transform="translate(.3 .3)" opacity=".6" />
      <path d="M0 0V11" stroke="#e9e0cc" strokeWidth=".6" />
      <path d="M0 11c-1.2 1.4 -1.1 4 0 6.4c1.1 -2.4 1.2 -5 0 -6.4Z" fill="#9a7a52" />
      <path d="M0 11.6V16.6" stroke="#c8a878" strokeWidth=".35" />
      <circle r=".9" fill="#efe4cc" />
    </svg>
  );
}

export function PetalArt({ color }: { color: string }) {
  return (
    <svg viewBox="-6 -6 12 12" focusable="false">
      <path d="M0 -5.2C3 -3.6 3.6 1.6 0 5C-3.6 1.6 -3 -3.6 0 -5.2Z" fill={color} transform="rotate(60)" />
      <path d="M0 -4C1.2 -2.4 1.4 1 0 3.6" stroke="#fff8ec" strokeWidth=".6" fill="none" opacity=".7" transform="rotate(60)" />
    </svg>
  );
}

export function SmokeArt() {
  return (
    <svg viewBox="-10 -10 20 20" focusable="false">
      <circle r="6" fill="#f4ede0" opacity=".7" />
      <circle cx="3" cy="-2" r="4" fill="#fffaf0" opacity=".6" />
      <circle cx="-2.5" cy="2" r="3.4" fill="#e3d9cb" opacity=".5" />
    </svg>
  );
}
