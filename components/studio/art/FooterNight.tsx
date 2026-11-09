import Image from "next/image";
import Link from "next/link";
import "@/styles/footer-night.css";

/**
 * The footer's closing panorama: a moonlit hillside where the beopity cat sits
 * on a rock watching the moon. Decorative SVG (aria-hidden) with deterministic
 * stars and fireflies; the only interactive element is the wordmark home link.
 */

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (value: number) => Math.round(value * 10) / 10;

/** Grass-tip silhouette along a hill crest: many short blades leaning in the breeze. */
function crestBlades(seed: number, y: (x: number) => number, from: number, to: number, step: number) {
  const random = seeded(seed);
  let d = "";
  for (let x = from; x < to; x += step * (0.6 + random() * 0.8)) {
    const base = y(x);
    const h = 5 + random() * 12;
    const lean = (random() - 0.35) * 7;
    d += `M${r1(x - 1.6)} ${r1(base + 2)} Q${r1(x + lean * 0.4)} ${r1(base - h * 0.6)} ${r1(x + lean)} ${r1(base - h)} Q${r1(x + lean * 0.3 + 1)} ${r1(base - h * 0.5)} ${r1(x + 1.6)} ${r1(base + 2)} Z `;
  }
  return d;
}

const hillNear = (x: number) => 286 + Math.sin(x / 210) * 14 + Math.sin(x / 77) * 4 - (x > 1080 && x < 1420 ? Math.sin(((x - 1080) / 340) * Math.PI) * 46 : 0);
const hillMid = (x: number) => 238 + Math.sin(x / 260 + 1.4) * 18 + Math.sin(x / 95) * 5;

export function FooterNight({ year }: { year: number }) {
  const random = seeded(2026);
  const stars = Array.from({ length: 90 }, () => ({ x: r1(random() * 1600), y: r1(random() * 200), r: r1(0.5 + random() * 1.5), o: r1(0.35 + random() * 0.65), tw: random() < 0.22 }));
  const flies = Array.from({ length: 22 }, () => ({ x: r1(40 + random() * 1520), y: r1(250 + random() * 110), d: r1(random() * 5), s: r1(4 + random() * 4) }));
  const nearPath = `M0 ${r1(hillNear(0))} ${Array.from({ length: 81 }, (_, i) => `L${i * 20} ${r1(hillNear(i * 20))}`).join(" ")} L1600 380 L0 380 Z`;
  const midPath = `M0 ${r1(hillMid(0))} ${Array.from({ length: 81 }, (_, i) => `L${i * 20} ${r1(hillMid(i * 20))}`).join(" ")} L1600 380 L0 380 Z`;

  return (
    <div className="footer-night">
      <svg className="footer-night__scene" viewBox="0 0 1600 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="fn-moonglow" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#fff4d6" stopOpacity=".55" />
            <stop offset=".35" stopColor="#d9d2f0" stopOpacity=".18" />
            <stop offset="1" stopColor="#d9d2f0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fn-moon" cx=".38" cy=".35" r=".7">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset=".7" stopColor="#f3e7c8" />
            <stop offset="1" stopColor="#dccfae" />
          </radialGradient>
          <linearGradient id="fn-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c3757" />
            <stop offset="1" stopColor="#1d2540" />
          </linearGradient>
          <linearGradient id="fn-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#151b2f" />
            <stop offset="1" stopColor="#0f1424" />
          </linearGradient>
          <radialGradient id="fn-fly" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#fff3a6" />
            <stop offset=".35" stopColor="#f6d65a" stopOpacity=".7" />
            <stop offset="1" stopColor="#f6d65a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g fill="#fff6dc">
          {stars.map((s, i) => <circle key={i} className={s.tw ? "footer-night__twinkle" : undefined} cx={s.x} cy={s.y} r={s.r} opacity={s.o} style={s.tw ? { animationDelay: `${r1((i % 7) * 0.6)}s` } : undefined} />)}
        </g>
        {/* A shooting star crosses now and then. */}
        <path className="footer-night__meteor" d="M260 40 l90 26" stroke="#fff6dc" strokeWidth="1.6" strokeLinecap="round" />

        {/* Moon with soft halo and faint maria. */}
        <circle cx="1240" cy="92" r="120" fill="url(#fn-moonglow)" />
        <circle cx="1240" cy="92" r="38" fill="url(#fn-moon)" />
        <g fill="#cbbd98" opacity=".55">
          <circle cx="1228" cy="82" r="7" /><circle cx="1252" cy="104" r="5" /><circle cx="1247" cy="78" r="3" /><circle cx="1224" cy="104" r="3.5" />
        </g>
        {/* Thin moonlit cloud bands. */}
        <g fill="#c6c3e3" opacity=".22">
          <ellipse cx="1120" cy="118" rx="150" ry="7" />
          <ellipse cx="1320" cy="132" rx="110" ry="5" />
          <ellipse cx="420" cy="96" rx="180" ry="6" />
        </g>

        {/* Far ridge, a lit cottage window and a winding lane. */}
        <path d="M0 214 Q180 186 360 204 T760 196 T1180 204 T1600 192 L1600 380 L0 380 Z" fill="#36426a" opacity=".85" />
        <g transform="translate(420 196)">
          <path d="M-14 0 V-14 L0 -24 L14 -14 V0 Z" fill="#1f2742" />
          <rect x="-5" y="-11" width="5" height="5" fill="#ffc861" className="footer-night__window" />
          <path d="M6 -19 v-9 h4 v12" fill="#1f2742" />
        </g>
        <path d={midPath} fill="url(#fn-mid)" />
        <path d="M220 252 Q300 262 380 256 T540 262" stroke="#4a5682" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
        {/* Fence posts on the middle hill. */}
        <g stroke="#141a2c" strokeWidth="3" strokeLinecap="round">
          {Array.from({ length: 9 }, (_, i) => { const x = 620 + i * 34; const y = hillMid(x); return <path key={i} d={`M${x} ${r1(y + 2)} v-16`} />; })}
          <path d={`M620 ${r1(hillMid(620) - 10)} ${Array.from({ length: 9 }, (_, i) => `L${620 + i * 34} ${r1(hillMid(620 + i * 34) - 10)}`).join(" ")}`} fill="none" strokeWidth="2" />
        </g>

        {/* Near hill with the cat's rock and a lone tree. */}
        <path d={nearPath} fill="url(#fn-near)" />
        <path d={crestBlades(31, hillNear, 0, 1600, 7)} fill="#0f1424" />
        <path d="M1180 248 Q1196 224 1238 222 Q1284 222 1300 246 Q1270 254 1238 254 Q1200 254 1180 248 Z" fill="#232b45" />
        <path d="M1196 236 Q1230 226 1270 232" stroke="#55628f" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
        <g transform="translate(540 290)">
          <path d="M-4 0 Q-6 -40 -2 -70 Q-14 -90 -26 -96 M-2 -70 Q8 -96 24 -104 M-3 -50 Q-20 -58 -34 -56" stroke="#0d1220" strokeWidth="6" fill="none" strokeLinecap="round" />
          <g fill="#0d1220">
            <circle cx="-28" cy="-106" r="22" /><circle cx="2" cy="-118" r="28" /><circle cx="28" cy="-108" r="22" /><circle cx="-40" cy="-80" r="16" /><circle cx="38" cy="-86" r="15" /><circle cx="-6" cy="-92" r="20" />
          </g>
          <g fill="#3a4670" opacity=".55">
            <circle cx="8" cy="-132" r="8" /><circle cx="34" cy="-118" r="6" /><circle cx="22" cy="-124" r="5" />
          </g>
        </g>

        <g className="footer-night__flies">
          {flies.map((f, i) => (
            <circle key={i} cx={f.x} cy={f.y} r="7" fill="url(#fn-fly)" style={{ animationDelay: `${f.d}s`, animationDuration: `${f.s}s` }} />
          ))}
        </g>
      </svg>

      {/* The beopity cat on its rock, rim-lit by the moon. */}
      <Image className="footer-night__cat" src="/beopity/cat-sitting.webp" alt="" width={540} height={640} sizes="140px" />

      <div className="footer-night__sign">
        <Link className="footer-night__wordmark" href="/" aria-label="beopity — home"><span aria-hidden="true" /></Link>
        <div className="footer-night__bottom studio-mono">
          <span>Independent apps &amp; games</span>
          <span>© {year} <span className="studio-brand-name">beopity</span></span>
        </div>
      </div>
    </div>
  );
}
