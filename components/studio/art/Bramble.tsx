import type { CSSProperties } from "react";

/**
 * Bramble, the beopity wandering house: an original mascot. A weathered,
 * soot-stained stone cottage with a slate-roofed tower, a mossy timber attic and
 * a gnarled rooftop tree, two lamp-lit windows for eyes behind old shutters, and
 * a pair of long charcoal-and-rust striped legs in worn walking boots.
 *
 * Pure SVG with no client code. Motion comes from CSS (styles/bramble.css):
 * `--phase` (0–1 per stride) swings the legs and bobs the body, `data-moving`
 * switches between walking and an idle sway. Every id is prefixed so several
 * Brambles can share a page.
 */
export type BrambleProps = {
  id: string;
  className?: string;
  /** "rest" folds the legs under the house, for the dusk footer and portraits. */
  pose?: "walk" | "rest";
  /** Accessible name; omit for decorative copies. */
  title?: string;
  style?: CSSProperties;
  /** Set when nested inside another SVG scene (user units). */
  width?: number;
  height?: number;
};

const INK = "#1b1715";
const STONE_LINE = "#25211e";
const MOSS = "#5f7d3c";
const MOSS_DARK = "#3f5a2a";
const EMBER = "#ffb347";

function Leg({ id, side, x }: { id: string; side: "l" | "r"; x: number }) {
  return (
    <g className={`bramble__leg bramble__leg--${side}`} style={{ transformOrigin: `${x}px 206px` }}>
      <path d={`M${x - 7} 204 L${x + 7} 204 L${x + 6} 250 L${x - 6} 250 Z`} fill={`url(#${id}-stripes)`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      {/* A darned patch on the thigh. */}
      <path d={`M${x - 4} 226 h7 v7 h-7 Z`} fill="#6b5a45" stroke={INK} strokeWidth="1.4" />
      <g className="bramble__shin" style={{ transformOrigin: `${x}px 249px` }}>
        <path d={`M${x - 6} 248 L${x + 6} 248 L${x + 5} 278 L${x - 5} 278 Z`} fill={`url(#${id}-stripes)`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <circle cx={x} cy={249} r={6.5} fill="#3a3330" stroke={INK} strokeWidth="2.4" />
        {/* Worn walking boot with a turned-down cuff and hobnailed sole. */}
        <path d={`M${x - 9} 276 Q${x - 10} 292 ${x - 4} 293 L${x + 17} 293 Q${x + 22} 292 ${x + 19} 285 Q${x + 14} 280 ${x + 7} 279 L${x + 7} 274 L${x - 8} 274 Z`} fill="#2e211a" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <path d={`M${x - 10} 272 h19 v5 h-19 Z`} fill="#4a3528" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d={`M${x - 8} 288 L${x + 20} 288`} stroke="#120e0c" strokeWidth="2.4" strokeLinecap="round" />
        <path d={`M${x - 3} 282 l4 -2`} stroke="#5b4535" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function Bramble({ id, className, pose = "walk", title, style, width, height }: BrambleProps) {
  const label = title ? `${id}-title` : undefined;
  return (
    <svg
      className={`bramble${className ? ` ${className}` : ""}`}
      data-pose={pose}
      viewBox="0 0 220 300"
      width={width}
      height={height}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-labelledby={label}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={style}
    >
      {title && <title id={label}>{title}</title>}
      <defs>
        <pattern id={`${id}-stripes`} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#2f2b29" />
          <rect width="10" height="5" fill="#7d3a28" />
        </pattern>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a645c" />
          <stop offset=".55" stopColor="#4f4a44" />
          <stop offset="1" stopColor="#36322e" />
        </linearGradient>
        <linearGradient id={`${id}-tower`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6e675e" />
          <stop offset=".65" stopColor="#524c45" />
          <stop offset="1" stopColor="#3a3531" />
        </linearGradient>
        <linearGradient id={`${id}-slate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#47586a" />
          <stop offset="1" stopColor="#2b3540" />
        </linearGradient>
        <linearGradient id={`${id}-timber`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a4636" />
          <stop offset="1" stopColor="#3b2d23" />
        </linearGradient>
        <radialGradient id={`${id}-lamp`} cx=".42" cy=".4" r=".7">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset=".45" stopColor={EMBER} />
          <stop offset="1" stopColor="#c4611f" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={EMBER} stopOpacity=".55" />
          <stop offset="1" stopColor={EMBER} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-hand`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
      </defs>

      <ellipse className="bramble__shadow" cx="110" cy="294" rx="64" ry="6.5" fill="#120e0c" opacity=".3" />

      {pose === "walk" && (
        <g className="bramble__legs">
          <Leg id={id} side="l" x={86} />
          <Leg id={id} side="r" x={134} />
        </g>
      )}

      {/* At rest the undercarriage settles on the grass (CSS repeats this offset). */}
      <g className="bramble__body" filter={`url(#${id}-hand)`} transform={pose === "rest" ? "translate(0 78)" : undefined}>
        {/* Heavy coal smoke from the chimney; CSS loops each puff. */}
        <g className="bramble__smoke" fill="#8d8781" stroke="#5c5752" strokeWidth="1.5">
          <circle className="bramble__puff bramble__puff--1" cx="106" cy="20" r="8" />
          <circle className="bramble__puff bramble__puff--2" cx="112" cy="7" r="10" fill="#77716b" />
          <circle className="bramble__puff bramble__puff--3" cx="103" cy="-8" r="12" fill="#a39d96" />
        </g>

        {/* Squat stone tower, slate cone, a tattered pennant on an iron spike. */}
        <path d="M130 46 L168 46 L171 128 L127 128 Z" fill={`url(#${id}-tower)`} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M130 60 h16 M150 60 h18 M132 74 h10 M146 74 h22 M130 90 h20 M154 90 h15 M131 106 h12 M147 106 h22 M129 120 h18" stroke={STONE_LINE} strokeWidth="1.8" strokeLinecap="round" opacity=".85" />
        <path d="M146 60 v14 M142 74 v16 M150 90 v16 M143 106 v14" stroke={STONE_LINE} strokeWidth="1.6" opacity=".7" />
        <path d="M160 98 l4 6 -3 5 4 7" stroke="#1d1a17" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M124 50 L149 4 L174 50 Q149 57 124 50 Z" fill={`url(#${id}-slate)`} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M131 40 Q149 46 167 40 M137 28 Q149 32 161 28 M142 17 Q149 20 156 17" stroke="#1f2830" strokeWidth="1.8" fill="none" />
        <path d="M128 48 Q136 44 142 50" fill={MOSS} stroke={INK} strokeWidth="1.4" />
        <path d="M149 4 L149 -12" stroke="#2a2522" strokeWidth="2.6" strokeLinecap="round" />
        <path className="bramble__flag" d="M149 -12 L168 -8 L161 -5 L167 -1 L149 -2 Z" fill="#7d2b22" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="148.5" cy="79" r="16" fill={`url(#${id}-halo)`} />
        <path d="M142 88 V76 Q148.5 66 155 76 V88 Z" fill={`url(#${id}-lamp)`} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M148.5 70 V88" stroke={INK} strokeWidth="1.6" />

        {/* Soot-black brick chimney with an iron cap. */}
        <path d="M98 30 L114 30 L115 70 L97 70 Z" fill="#3d2b26" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M98 40 h16 M98 50 h17 M97 60 h18 M104 30 v10 M108 40 v10 M103 50 v10" stroke="#24180f" strokeWidth="1.4" opacity=".8" />
        <path d="M94 25 h24 v7 h-24 Z" fill="#2a2522" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />

        {/* Plank attic, slate roof gone green with moss, leaning a touch left. */}
        <g transform="rotate(-4 84 80)">
          <path d="M58 64 L108 64 L108 104 L58 104 Z" fill={`url(#${id}-timber)`} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M58 74 h50 M58 84 h50 M58 94 h50" stroke="#2a1f17" strokeWidth="1.6" opacity=".8" />
          <path d="M96 86 h10 v9 h-10 Z" fill="#6b5a45" stroke={INK} strokeWidth="1.4" />
          <path d="M50 68 L83 26 L116 68 Z" fill={`url(#${id}-slate)`} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M62 60 L83 34 M74 62 L90 42 M88 64 L101 49" stroke="#1f2830" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M52 68 Q60 58 70 64 Q76 56 84 64 L86 68 Z" fill={MOSS} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="83" cy="84" r="13" fill={`url(#${id}-halo)`} />
          <circle cx="83" cy="84" r="8.5" fill={`url(#${id}-lamp)`} stroke={INK} strokeWidth="2.2" />
          <path d="M83 75.5 v17 M74.5 84 h17" stroke={INK} strokeWidth="1.8" />
        </g>

        {/* A frayed rope of laundry from chimney to tower. */}
        <path d="M114 44 Q122 53 130 48" stroke="#4a3f36" strokeWidth="1.4" fill="none" />
        <path d="M117 47 l3 9 l4 -1 l-1 -8 Z" fill="#4b5d6e" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M124 49 l1 7 l5 0 l0 -7 Z" fill="#8a6a3a" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />

        {/* Main slate roof, chipped and mossy, with a gnarled rooftop tree. */}
        <path d="M34 128 L56 98 L184 98 L192 128 Z" fill={`url(#${id}-slate)`} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M46 117 h138 M56 107 h124 M70 98 v9 M96 98 v9 M124 98 v9 M152 98 v9 M60 107 v10 M84 107 v10 M112 107 v10 M140 107 v10 M168 107 v10" stroke="#1f2830" strokeWidth="1.6" strokeLinecap="round" opacity=".9" />
        <path d="M150 117 l8 0 -2 6 -7 0 Z" fill="#20262d" />
        <path d="M38 124 Q46 106 60 112 Q66 100 78 110 Q86 104 92 114 L94 124 Z" fill={MOSS} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M44 120 Q52 112 62 117 M70 116 Q78 110 86 118" stroke={MOSS_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M176 100 Q173 90 178 84 Q174 80 176 74" stroke="#2e2219" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M177 84 l7 -5" stroke="#2e2219" strokeWidth="2" strokeLinecap="round" />
        <circle cx="175" cy="70" r="11" fill={MOSS_DARK} stroke={INK} strokeWidth="2.2" />
        <circle cx="185" cy="77" r="6" fill={MOSS_DARK} stroke={INK} strokeWidth="2" />
        <circle cx="171" cy="66" r="4" fill={MOSS} />

        {/* Main cottage: rough-cut stone, sooty timber and creeping ivy. */}
        <path d="M44 128 L182 128 L180 204 L46 204 Z" fill={`url(#${id}-stone)`} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M46 150 h18 M46 172 h18 M46 192 h18 M160 150 h20 M160 172 h20 M160 192 h20 M66 196 h28 M126 196 h32" stroke={STONE_LINE} strokeWidth="1.8" strokeLinecap="round" opacity=".8" />
        <path d="M55 128 v22 M58 150 v22 M54 172 v20 M170 128 v22 M168 150 v22 M172 172 v20" stroke={STONE_LINE} strokeWidth="1.6" opacity=".6" />
        <path d="M46 140 L180 140 M66 128 L67 204 M158 128 L157 204" stroke="#2b2019" strokeWidth="4" strokeLinecap="round" />
        <path d="M74 132 l3 5 -2 4" stroke="#1d1a17" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M178 130 Q172 148 178 162 Q184 176 176 196" stroke={MOSS_DARK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <g fill={MOSS} stroke={INK} strokeWidth="1.2">
          <ellipse cx="175" cy="140" rx="4" ry="2.6" transform="rotate(-30 175 140)" />
          <ellipse cx="180" cy="154" rx="4" ry="2.6" transform="rotate(25 180 154)" />
          <ellipse cx="174" cy="168" rx="4" ry="2.6" transform="rotate(-20 174 168)" />
          <ellipse cx="181" cy="184" rx="4" ry="2.6" transform="rotate(30 181 184)" />
        </g>

        <g className="bramble__eyes">
          <circle cx="92" cy="162" r="22" fill={`url(#${id}-halo)`} />
          <circle cx="134" cy="162" r="22" fill={`url(#${id}-halo)`} />
          <circle cx="92" cy="162" r="14" fill={`url(#${id}-lamp)`} stroke={INK} strokeWidth="2.8" />
          <circle cx="134" cy="162" r="14" fill={`url(#${id}-lamp)`} stroke={INK} strokeWidth="2.8" />
          {/* Lead mullions give each lamp-lit eye a gaze. */}
          <circle cx="95" cy="164" r="5.4" fill="#2b1a10" />
          <circle cx="137" cy="164" r="5.4" fill="#2b1a10" />
          <circle cx="97" cy="161" r="1.8" fill="#fff1c4" />
          <circle cx="139" cy="161" r="1.8" fill="#fff1c4" />
          {/* Heavy brows of rough stone lintel. */}
          <path d="M76 146 Q92 140 108 147 M118 147 Q134 140 150 146" stroke="#2b2019" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {/* Weathered plank shutters close for a blink (CSS scales them down from the lintel). */}
          <g className="bramble__lids" fill="#2f4a3f" stroke={INK} strokeWidth="2.2">
            <rect className="bramble__lid" x="77" y="147" width="30" height="30" rx="14" transform="matrix(1 0 0 0 0 147)" style={{ transformOrigin: "92px 147px" }} />
            <rect className="bramble__lid" x="119" y="147" width="30" height="30" rx="14" transform="matrix(1 0 0 0 0 147)" style={{ transformOrigin: "134px 147px" }} />
          </g>
        </g>
        <path d="M76 180 h32 M118 180 h32" stroke="#2e2219" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="82" cy="177.5" r="2.6" fill="#8e2a22" /><circle cx="92" cy="177" r="2.6" fill="#b86a2a" /><circle cx="102" cy="177.5" r="2.6" fill="#8e2a22" />
        <circle cx="124" cy="177.5" r="2.6" fill="#b86a2a" /><circle cx="134" cy="177" r="2.6" fill="#8e2a22" /><circle cx="144" cy="177.5" r="2.6" fill="#b86a2a" />

        {/* Iron-banded oak door; lamplight leaks round its edge. */}
        <path d="M103 204 L103 190 Q113 179 123 190 L123 204 Z" fill={EMBER} opacity=".55" />
        <path d="M104.5 204 L104.5 191 Q113 181.5 121.5 191 L121.5 204 Z" fill="#2e211a" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M105 194 h16 M105 200 h16" stroke="#4b4642" strokeWidth="1.8" />
        <circle cx="118" cy="197" r="1.6" fill={EMBER} />

        {/* Heavy timber undercarriage, iron straps and a lit lantern. */}
        <path d="M40 202 L186 202 Q184 215 172 215 L54 215 Q42 215 40 202 Z" fill="#3b2d23" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M62 203 v11 M110 203 v12 M160 203 v11" stroke="#4b4642" strokeWidth="3" />
        <g fill="#7d7670"><circle cx="62" cy="206" r="1.3" /><circle cx="110" cy="206" r="1.3" /><circle cx="160" cy="206" r="1.3" /><circle cx="62" cy="211" r="1.3" /><circle cx="110" cy="211" r="1.3" /><circle cx="160" cy="211" r="1.3" /></g>
        {pose === "walk" && (
          <>
            <path d="M168 215 v8" stroke={INK} strokeWidth="1.6" />
            <circle cx="168" cy="228" r="11" fill={`url(#${id}-halo)`} />
            <rect className="bramble__lantern" x="163" y="222" width="10" height="12" rx="3" fill={`url(#${id}-lamp)`} stroke={INK} strokeWidth="2" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Bramble's face for the header, favicon and footer badge. */
export function BrambleMark({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3550" />
          <stop offset="1" stopColor="#c9826a" />
        </linearGradient>
        <radialGradient id={`${id}-lamp`} cx=".42" cy=".4" r=".7">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset=".5" stopColor={EMBER} />
          <stop offset="1" stopColor="#c4611f" />
        </radialGradient>
        <clipPath id={`${id}-clip`}><circle cx="32" cy="32" r="32" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="64" height="64" fill={`url(#${id}-sky)`} />
        <path d="M0 50 Q18 42 34 48 T64 46 V64 H0 Z" fill="#3f5a2a" />
        <path d="M37 18 V7 h6 v11" fill="#3d2b26" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M13 31 L22 18 L44 18 L52 31 Z" fill="#37444f" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14 30 Q19 24 26 28 L27 31 Z" fill={MOSS} />
        <path d="M16 31 H49 L48 52 H17 Z" fill="#5a544d" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M17 38 h5 M43 44 h5 M18 46 h4" stroke={STONE_LINE} strokeWidth="1" />
        <circle cx="26" cy="39" r="4.8" fill={`url(#${id}-lamp)`} stroke={INK} strokeWidth="1.6" />
        <circle cx="39" cy="39" r="4.8" fill={`url(#${id}-lamp)`} stroke={INK} strokeWidth="1.6" />
        <circle cx="27" cy="40" r="1.8" fill="#2b1a10" />
        <circle cx="40" cy="40" r="1.8" fill="#2b1a10" />
        <path d="M20.5 33.5 Q26 31.5 31 34 M34 34 Q39 31.5 44.5 33.5" stroke="#2b2019" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M29 52 V47 Q32.5 43 36 47 V52 Z" fill="#2e211a" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
