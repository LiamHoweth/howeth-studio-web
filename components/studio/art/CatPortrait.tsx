"use client";

import { Cloud, FlowerSprite, GrassTuft, PaintFilters } from "./Scenery";
import { r1, seeded } from "./random";
import "@/styles/scenery.css";

/**
 * The beopity black cat sitting on a grassy knoll in a golden-hour meadow:
 * an original painted SVG portrait for the About section's arched window.
 *
 * Near-black coat with a blue-grey sheen and a warm rim of evening light,
 * painterly fur tufts, big mint/green-gold eyes, mauve inner ears, a rose
 * nose and fine whiskers. Gentle CSS-only life: blink, ear twitch, tail-tip
 * flick, breathing, swaying grass and a butterfly resting on a daisy. All
 * motion lives in styles/scenery.css and stops under reduced motion. A client
 * component (no hooks) like Scenery, so its markup is not repeated in the RSC
 * payload.
 *
 * viewBox 420×520 with `xMidYMid slice`, so it fills a 420/520 window; the
 * head and ears sit well inside an arched top.
 */

const COAT = "#1b1b22";
const COAT_DEEP = "#111116";
const SHEEN = "#56607a";
const SHEEN_SOFT = "#3a4053";
const RIM = "#c48a62";
const WHISKER = "#f3eee4";

/** Short painterly fur strokes scattered over a region, pointing roughly `angle` degrees. */
function FurStrokes({ seed, count, x0, x1, y0, y1, angle, length, colour, opacity, width = 1.1 }: { seed: number; count: number; x0: number; x1: number; y0: number; y1: number; angle: number; length: number; colour: string; opacity: number; width?: number }) {
  const random = seeded(seed);
  const d = Array.from({ length: count }, () => {
    const x = x0 + random() * (x1 - x0);
    const y = y0 + random() * (y1 - y0);
    const a = ((angle + (random() - 0.5) * 30) * Math.PI) / 180;
    const l = length * (0.6 + random() * 0.7);
    const bend = (random() - 0.5) * 4;
    return `M${r1(x)} ${r1(y)} q${r1(Math.cos(a) * l * 0.5 + bend)} ${r1(Math.sin(a) * l * 0.5)} ${r1(Math.cos(a) * l)} ${r1(Math.sin(a) * l)}`;
  }).join(" ");
  return <path d={d} stroke={colour} strokeWidth={width} strokeLinecap="round" fill="none" opacity={opacity} />;
}

function Eye({ id, cx, cy }: { id: string; cx: number; cy: number }) {
  return (
    <g>
      {/* Socket and rim. */}
      <ellipse cx={cx} cy={cy + 1} rx="33" ry="32" fill={COAT_DEEP} />
      <circle cx={cx} cy={cy} r="29" fill={`url(#${id}-iris)`} />
      {/* Iris texture: fine radial fibres and a darker limbal ring. */}
      <g stroke="#8fb878" strokeWidth=".6" opacity=".3">
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return <path key={i} d={`M${r1(cx + Math.cos(a) * 12)} ${r1(cy + Math.sin(a) * 12)} L${r1(cx + Math.cos(a) * 26)} ${r1(cy + Math.sin(a) * 26)}`} />;
        })}
      </g>
      <circle cx={cx} cy={cy} r="28" fill="none" stroke="#3f6a46" strokeWidth="2.6" opacity=".75" />
      {/* A soft slit pupil, glancing up toward the butterfly. */}
      <ellipse cx={cx + 3} cy={cy - 3} rx="10.5" ry="21" fill="#0a0e10" />
      <ellipse cx={cx + 3} cy={cy - 3} rx="13" ry="23" fill="none" stroke="#0a0e10" strokeOpacity=".2" strokeWidth="3" />
      {/* Shadow from the brow and the sky's reflection low in the eye. */}
      <path d={`M${cx - 29} ${cy - 2} A29 29 0 0 1 ${cx + 29} ${cy - 2} A29 22 0 0 0 ${cx - 29} ${cy - 2} Z`} fill="#0d1210" opacity=".35" />
      <path d={`M${cx - 18} ${cy + 17} Q${cx} ${cy + 26} ${cx + 18} ${cy + 17}`} stroke="#f7f4cf" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".45" />
      {/* Catchlights. */}
      <ellipse cx={cx - 10} cy={cy - 12} rx="8" ry="7" fill="#ffffff" />
      <circle cx={cx + 9} cy={cy + 10} r="3.2" fill="#ffffff" opacity=".9" />
      <circle cx={cx - 15} cy={cy + 4} r="1.6" fill="#ffffff" opacity=".7" />
      <circle cx={cx} cy={cy} r="29" fill="none" stroke="#08090a" strokeWidth="2.2" />
      {/* Eyelid for the blink (scales down from the brow). */}
      <ellipse className="cat-portrait__lid" cx={cx} cy={cy} rx="32" ry="31" fill={COAT} />
    </g>
  );
}

export function CatPortrait({ title = "The beopity black cat sitting in a summer meadow", className }: { title?: string; className?: string }) {
  const id = "catp";
  return (
    <svg className={`cat-portrait${className ? ` ${className}` : ""}`} viewBox="0 0 420 520" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby={`${id}-title`} focusable="false">
      <title id={`${id}-title`}>{title}</title>
      <defs>
        <PaintFilters id={id} />
        <filter id={`${id}-fur`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="3.2" />
        </filter>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f90c6" />
          <stop offset=".42" stopColor="#b9cbd6" />
          <stop offset=".64" stopColor="#fbd79e" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx=".8" cy=".63" r=".55">
          <stop offset="0" stopColor="#fff2c8" stopOpacity="1" />
          <stop offset=".35" stopColor="#ffd98f" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffd98f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff4d6" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-knoll`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9c95e" />
          <stop offset="1" stopColor="#6f9c44" />
        </linearGradient>
        <linearGradient id={`${id}-coat`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#262732" />
          <stop offset=".55" stopColor={COAT} />
          <stop offset="1" stopColor={COAT_DEEP} />
        </linearGradient>
        <radialGradient id={`${id}-iris`} cx=".45" cy=".42" r=".6">
          <stop offset="0" stopColor="#fbf6c6" />
          <stop offset=".45" stopColor="#e4efaa" />
          <stop offset=".82" stopColor="#b5d58f" />
          <stop offset="1" stopColor="#6f9c62" />
        </radialGradient>
        <linearGradient id={`${id}-ear`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a6474" />
          <stop offset=".5" stopColor="#d59aa6" />
          <stop offset="1" stopColor="#e7b5bc" />
        </linearGradient>
        <pattern id={`${id}-turf`} width="18" height="12" patternUnits="userSpaceOnUse">
          <path d="M2 11 l1 -4 M8 12 l-1 -5 M13 10 l1.4 -4" stroke="#24401f" strokeWidth=".8" strokeLinecap="round" />
        </pattern>
        <g id={`${id}-cloud`}><Cloud id={`${id}-cloud`} filters={id} seed={58} tone="golden" tower={0.75} width={300} /></g>
        <g id={`${id}-cloudlet`}><Cloud id={`${id}-cloudlet`} filters={id} seed={61} tone="golden" width={200} /></g>
      </defs>

      {/* Golden-hour sky, low sun and clouds. */}
      <rect width="420" height="520" fill={`url(#${id}-sky)`} />
      <rect width="420" height="520" fill={`url(#${id}-sun)`} />
      <circle cx="338" cy="328" r="22" fill="#fff4d2" opacity=".95" />
      <use href={`#${id}-cloud`} transform="translate(96 318) scale(.62)" />
      <g className="cat-portrait__cloudlet"><use href={`#${id}-cloudlet`} transform="translate(352 150) scale(.32)" /></g>

      {/* Far hills, a cottage with a lit window, the middle meadow. */}
      <path d="M0 346 Q80 314 170 332 T330 320 T420 334 L420 520 L0 520 Z" fill="#b6aec8" />
      <path d="M0 350 Q80 318 170 336" stroke="#fff3e0" strokeOpacity=".35" strokeWidth="3" fill="none" />
      <g transform="translate(372 338) scale(.42)">
        <path d="M-20 0 L-20 -22 L20 -22 L20 0 Z" fill="#efdcbc" />
        <path d="M-26 -20 L-3 -40 L22 -40 L28 -20 Z" fill="#b9573a" />
        <rect x="-12" y="-15" width="7" height="7" fill="#ffcf6a" />
      </g>
      <path d="M0 380 Q120 352 240 370 T420 358 L420 520 L0 520 Z" fill="#c4cf80" />
      <path d="M0 380 Q120 352 240 370 T420 358 L420 520 L0 520 Z" fill={`url(#${id}-turf)`} opacity=".08" />
      <g fill="#5d8a45" opacity=".75">
        {[[34, 376], [52, 373], [70, 372], [300, 364], [318, 362], [336, 361]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 1 ? 8 : 6} />)}
      </g>
      <g opacity=".9">
        <path d="M40 372 C34 352 36 330 42 318 C48 330 50 352 44 372 Z" fill="#4a7a3a" />
        <path d="M58 372 C53 356 54 338 59 328 C64 338 65 356 61 372 Z" fill="#5b8a45" />
      </g>

      {/* Warm halo behind the cat so the dark coat reads clearly. */}
      <ellipse cx="214" cy="270" rx="190" ry="210" fill={`url(#${id}-halo)`} />

      {/* The knoll. */}
      <path d="M0 470 Q90 432 210 440 T420 466 L420 520 L0 520 Z" fill={`url(#${id}-knoll)`} />
      <path d="M0 470 Q90 432 210 440 T420 466 L420 520 L0 520 Z" fill={`url(#${id}-turf)`} opacity=".16" />
      <path d="M30 458 Q120 432 210 436 T390 458" stroke="#d9ec9c" strokeWidth="2.4" fill="none" opacity=".55" />
      <ellipse cx="226" cy="468" rx="118" ry="12" fill="#2f4a2a" opacity=".34" />

      {/* ---- The cat ---- */}
      <g className="cat-portrait__cat">
        {/* Body, haunches and chest ruff. */}
        <g className="cat-portrait__breath">
          <g filter={`url(#${id}-fur)`}>
            <path d="M160 284 C130 318 116 370 118 412 C120 446 144 458 170 460 L250 460 C276 458 300 446 302 412 C304 370 290 318 260 284 Z" fill={`url(#${id}-coat)`} />
            <ellipse cx="146" cy="424" rx="32" ry="34" fill="#1f1f28" />
            <ellipse cx="274" cy="424" rx="32" ry="34" fill="#18181f" />
            {/* Chest ruff. */}
            <path d="M168 282 L176 298 L170 310 L182 318 L176 332 L190 338 L186 352 L200 356 L210 372 L220 356 L234 352 L230 338 L244 332 L238 318 L250 310 L244 298 L252 282 Z" fill="#23242e" />
          </g>
          {/* Sheen on the left, warm evening rim on the right. */}
          <g filter={`url(#${id}-soft)`} opacity=".9">
            <path d="M124 418 C120 380 130 338 154 304" stroke={SHEEN} strokeWidth="4" fill="none" opacity=".55" strokeLinecap="round" />
            <path d="M298 420 C302 380 292 336 268 300" stroke={RIM} strokeWidth="3.4" fill="none" opacity=".75" strokeLinecap="round" />
          </g>
          <path d="M120 430 C120 408 132 396 148 396" stroke={SHEEN} strokeWidth="2" fill="none" opacity=".5" strokeLinecap="round" />
          <path d="M300 430 C300 408 288 396 272 396" stroke={RIM} strokeWidth="2" fill="none" opacity=".6" strokeLinecap="round" />
          <FurStrokes seed={3} count={26} x0={178} x1={242} y0={292} y1={360} angle={90} length={9} colour={SHEEN} opacity={0.42} width={1} />
          <FurStrokes seed={4} count={14} x0={126} x1={160} y0={340} y1={430} angle={105} length={10} colour={SHEEN_SOFT} opacity={0.6} width={1} />
          <FurStrokes seed={5} count={14} x0={262} x1={296} y0={340} y1={430} angle={75} length={10} colour={SHEEN_SOFT} opacity={0.6} width={1} />

          {/* Front legs and paws. */}
          <g filter={`url(#${id}-fur)`}>
            <path d="M180 326 C177 372 174 414 174 452 L204 452 C205 414 206 372 208 336 Z" fill="#1e1e26" />
            <path d="M240 326 C243 372 246 414 246 452 L216 452 C215 414 214 372 212 336 Z" fill="#1a1a21" />
            <ellipse cx="188" cy="455" rx="20" ry="11" fill="#22222b" />
            <ellipse cx="232" cy="455" rx="20" ry="11" fill="#1e1e26" />
          </g>
          <path d="M210 340 C210 390 210 430 210 456" stroke={COAT_DEEP} strokeWidth="2.6" fill="none" />
          <path d="M183 340 C180 384 178 420 178 446" stroke={SHEEN} strokeWidth="1.8" fill="none" opacity=".5" strokeLinecap="round" />
          <path d="M242 342 C244 384 244 420 243 446" stroke={RIM} strokeWidth="1.6" fill="none" opacity=".55" strokeLinecap="round" />
          <path d="M176 452 Q188 446 202 452 M218 452 Q232 446 246 452" stroke={SHEEN} strokeWidth="1.4" fill="none" opacity=".55" />
          <path d="M182 457 q2.4 -5 4.8 0 M191 457 q2.4 -5 4.8 0 M226 457 q2.4 -5 4.8 0 M235 457 q2.4 -5 4.8 0" stroke="#6a7390" strokeWidth="1.1" fill="none" opacity=".8" />
        </g>

        {/* Tail: from behind the right hip, round the front of the paws, the tip curling up. */}
        <g filter={`url(#${id}-fur)`}>
          <path d="M290 436 C326 430 340 452 320 466 C296 482 220 484 140 476" stroke={COAT} strokeWidth="21" fill="none" strokeLinecap="round" />
          <path d="M306 438 C330 442 334 456 318 464" stroke={RIM} strokeWidth="2.2" fill="none" opacity=".6" strokeLinecap="round" />
          <path d="M290 472 C250 478 200 478 150 470" stroke={SHEEN} strokeWidth="2.6" fill="none" opacity=".5" strokeLinecap="round" />
          <g className="cat-portrait__tail-tip">
            <path d="M144 476 C114 474 98 460 100 442 C101 430 112 424 120 430" stroke={COAT} strokeWidth="17" fill="none" strokeLinecap="round" />
            <path d="M130 468 C114 464 106 454 107 444" stroke={SHEEN} strokeWidth="2.2" fill="none" opacity=".55" strokeLinecap="round" />
            <path d="M94 442 l-5 -3 M96 434 l-5 -2 M102 426 l-3 -5 M110 422 l0 -5" stroke={COAT} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </g>

        {/* Head, tilted a touch. */}
        <g transform="rotate(-7 210 226)">
          {/* Ears. */}
          <g filter={`url(#${id}-fur)`}>
            <path d="M126 178 C120 142 126 102 146 72 C152 66 160 68 164 76 C178 100 192 120 202 140 Z" fill={COAT} />
            <path d="M138 162 C136 134 142 108 152 90 C164 108 176 126 186 142 Z" fill={`url(#${id}-ear)`} />
          </g>
          <path d="M142 150 l6 -18 M148 154 l8 -16 M154 156 l9 -12 M146 138 l3 -14" stroke="#efe6e4" strokeWidth="1" strokeLinecap="round" opacity=".75" />
          <path d="M150 76 C142 96 136 120 134 150" stroke={SHEEN} strokeWidth="1.8" fill="none" opacity=".5" />
          <g className="cat-portrait__ear">
            <g filter={`url(#${id}-fur)`}>
              <path d="M220 138 C236 114 256 90 280 74 C287 70 294 74 294 82 C298 112 298 150 292 180 Z" fill={COAT} />
              <path d="M234 142 C248 122 264 106 282 92 C286 112 286 136 282 160 Z" fill={`url(#${id}-ear)`} />
            </g>
            <path d="M272 150 l-4 -18 M266 152 l-6 -15 M278 146 l0 -16 M258 148 l-8 -10" stroke="#efe6e4" strokeWidth="1" strokeLinecap="round" opacity=".75" />
            <path d="M290 84 C294 110 294 140 290 168" stroke={RIM} strokeWidth="2" fill="none" opacity=".6" />
          </g>

          {/* Head shape with cheek ruffs and a tuft on top. */}
          <g filter={`url(#${id}-fur)`}>
            <path d="M118 212 C114 152 158 120 210 120 C262 120 306 152 302 212 C302 252 278 284 242 294 L178 294 C142 284 118 252 118 212 Z" fill={`url(#${id}-coat)`} />
            <path d="M122 226 L108 238 L120 244 L106 256 L124 258 L114 272 L130 270 L126 284 L148 280 L150 256 Z" fill={COAT} />
            <path d="M298 226 L312 238 L300 244 L314 256 L296 258 L306 272 L290 270 L294 284 L272 280 L270 256 Z" fill="#17171d" />
            <path d="M198 124 Q200 114 206 110 Q206 118 210 120 Q214 108 222 106 Q218 116 220 122 Q226 116 230 116 Q228 122 230 128 Z" fill={COAT} />
          </g>
          <FurStrokes seed={8} count={26} x0={140} x1={282} y0={134} y1={176} angle={-90} length={7} colour={SHEEN} opacity={0.3} width={1} />
          <FurStrokes seed={9} count={10} x0={124} x1={150} y0={240} y1={276} angle={150} length={8} colour={SHEEN} opacity={0.4} width={1} />
          <FurStrokes seed={10} count={10} x0={270} x1={296} y0={240} y1={276} angle={30} length={8} colour={RIM} opacity={0.3} width={1} />
          <path d="M150 146 Q186 126 232 130" stroke={SHEEN} strokeWidth="5" fill="none" opacity=".5" strokeLinecap="round" filter={`url(#${id}-soft)`} />
          <path d="M298 196 Q302 236 286 264" stroke={RIM} strokeWidth="3" fill="none" opacity=".7" strokeLinecap="round" filter={`url(#${id}-soft)`} />
          <path d="M122 196 Q120 234 136 262" stroke={SHEEN} strokeWidth="2.4" fill="none" opacity=".4" strokeLinecap="round" />

          {/* Muzzle and the faintest blush. */}
          <ellipse cx="211" cy="254" rx="32" ry="20" fill="#23242e" filter={`url(#${id}-soft)`} />

          <Eye id={id} cx={170} cy={206} />
          <Eye id={id} cx={252} cy={206} />

          {/* Nose, mouth and whiskers. */}
          <path d="M202 236 Q211 231 220 236 Q217 245 211 247 Q205 245 202 236 Z" fill="#cf8592" />
          <ellipse cx="208" cy="237" rx="3.2" ry="1.4" fill="#f4c6cc" />
          <path d="M211 247 L211 252 M211 252 Q205 260 197 256 M211 252 Q217 260 225 256" stroke="#7a7f96" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <g fill="#3a3c4c">
            <circle cx="190" cy="252" r="1.3" /><circle cx="186" cy="258" r="1.3" /><circle cx="194" cy="259" r="1.2" />
            <circle cx="232" cy="252" r="1.3" /><circle cx="236" cy="258" r="1.3" /><circle cx="228" cy="259" r="1.2" />
          </g>
          <g stroke={WHISKER} strokeWidth=".9" fill="none" strokeLinecap="round" opacity=".88">
            <path d="M188 252 Q140 238 90 232" /><path d="M187 257 Q138 254 86 258" /><path d="M189 262 Q144 270 98 286" />
            <path d="M234 252 Q282 238 332 232" /><path d="M235 257 Q284 254 336 258" /><path d="M233 262 Q278 270 324 286" />
            <path d="M156 174 Q146 152 136 140" strokeWidth=".7" /><path d="M164 172 Q158 150 152 136" strokeWidth=".7" />
            <path d="M266 174 Q276 152 286 140" strokeWidth=".7" /><path d="M258 172 Q264 150 270 136" strokeWidth=".7" />
          </g>
        </g>
      </g>

      {/* Front of the knoll: grass, wildflowers and a butterfly on a daisy. */}
      <g className="cat-portrait__grass">
        {[[20, 510, 1.5, 1], [64, 520, 1.7, 2], [112, 520, 1.1, 3], [204, 524, 1.2, 1], [300, 522, 1.1, 2], [350, 520, 1.6, 3], [404, 508, 1.5, 1]].map(([x, y, s, seed], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${i % 2 ? -s : s} ${s})`}><GrassTuft seed={seed * 13} /></g>
        ))}
      </g>
      <g transform="translate(28 524) scale(1.6)"><FlowerSprite kind="lavender" /></g>
      <g transform="translate(58 534) scale(1.25)"><FlowerSprite kind="poppy" /></g>
      <g transform="translate(86 522) scale(1.4)"><FlowerSprite kind="daisy" /></g>
      <g transform="translate(300 520) scale(1.2)"><FlowerSprite kind="buttercup" /></g>
      <g transform="translate(338 522) scale(1.25)"><FlowerSprite kind="clover" /></g>
      <g transform="translate(378 512) scale(1.9)"><FlowerSprite kind="daisy" /></g>
      {/* Butterfly perched on the tall daisy, wings slowly opening and closing. */}
      <g transform="translate(380 446) rotate(-8)">
        <g className="cat-portrait__wings">
          <path d="M0 0 C-6 -16 -22 -22 -24 -10 C-25 -2 -14 2 0 1 Z" fill="#f1b84b" stroke="#3a2a24" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M0 1 C-10 4 -20 10 -16 17 C-12 22 -4 14 0 4 Z" fill="#e9a23c" stroke="#3a2a24" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M-22 -14 C-24 -8 -22 -4 -18 -3" stroke="#3a2a24" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M0 0 L-16 -12 M0 0 L-20 -6 M0 2 L-12 10" stroke="#c27a1e" strokeWidth=".6" />
          <circle cx="-19" cy="-12" r="1.2" fill="#fff3d6" /><circle cx="-11" cy="10" r="1.6" fill="#3a2a24" /><circle cx="-11" cy="10" r=".7" fill="#fff3d6" />
        </g>
        <ellipse cx="1" cy="2" rx="1.6" ry="7" fill="#2b2621" transform="rotate(10 1 2)" />
        <path d="M1 -4 Q-1 -11 -4 -13 M1 -4 Q4 -11 6 -12" stroke="#2b2621" strokeWidth=".7" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
