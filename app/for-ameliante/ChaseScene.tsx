"use client";

import { useEffect, useRef, useState } from "react";

export function ChaseScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="am-chase" aria-labelledby="am-chase-title" ref={sectionRef}>
      <div className="am-chase__heading">
        <h2 id="am-chase-title">Catch me if you can.</h2>
        <button
          className="am-chase__replay"
          type="button"
          onClick={() => {
            setStarted(true);
            setPlayCount((count) => count + 1);
          }}
        >
          <span aria-hidden="true">↺</span> Replay
        </button>
      </div>

      <div className="am-chase__art">
        <svg
          key={playCount}
          className={`am-chase-scene${started ? " am-chase-scene--playing" : ""}`}
          viewBox="0 0 720 300"
          role="img"
          aria-label="A little brown-haired Liam runs after a long black-haired Latina Ameliante across a flowered field. He catches up, and a heart appears between them."
        >
          <defs>
            <linearGradient id="am-chase-sky" x2="0" y2="1">
              <stop offset="0" stopColor="#e6c9d6" />
              <stop offset="1" stopColor="#fae8d8" />
            </linearGradient>
          </defs>
          <rect width="720" height="300" fill="url(#am-chase-sky)" />
          <circle cx="594" cy="61" r="30" fill="#ffefc8" opacity="0.85" />
          <path d="M0 206Q115 158 255 202T520 189Q625 169 720 200v100H0Z" fill="#c2b6bf" />
          <path d="M0 227Q145 205 280 225T555 215Q646 205 720 223v77H0Z" fill="#a8bca6" />
          <path d="M0 241Q160 230 320 242T720 237v63H0Z" fill="#789b84" />
          <path d="M0 266Q235 246 445 259T720 257" fill="none" stroke="#e8d7b2" strokeWidth="3" opacity="0.7" />
          <g fill="#f9e7bb">
            <circle cx="88" cy="244" r="3" /><circle cx="101" cy="252" r="2.5" />
            <circle cx="608" cy="240" r="3" /><circle cx="626" cy="253" r="2.5" />
            <circle cx="679" cy="235" r="2.5" /><circle cx="41" cy="264" r="2.5" />
          </g>
          <g fill="#f7f1e6" opacity="0.75">
            <circle cx="79" cy="55" r="2" /><circle cx="119" cy="92" r="1.5" />
            <circle cx="331" cy="51" r="1.5" /><circle cx="685" cy="103" r="2" />
          </g>

          <g transform="translate(453 104)">
            <g className="am-chase-runner am-chase-runner--her">
              <g className="am-chase-runner__bounce">
                <path d="M-20 53Q-34 66-31 93L-16 91-13 49Z" fill="#1f1925" />
                <path d="M18 51Q34 65 31 94L16 91 12 49Z" fill="#1f1925" />
                <path d="M-9 96-16 131M9 96 17 131" fill="none" stroke="#b97857" strokeWidth="8" strokeLinecap="round" />
                <path d="M-18 131h-14M16 131h15" fill="none" stroke="#483e55" strokeWidth="8" strokeLinecap="round" />
                <path d="M-14 58Q0 55 14 58l16 45h-60Z" fill="#fff7ee" stroke="#dfd0d2" strokeWidth="2" />
                <path d="M-13 66-28 82M13 66 29 80" fill="none" stroke="#b97857" strokeWidth="8" strokeLinecap="round" />
                <ellipse cx="0" cy="30" rx="23" ry="29" fill="#1f1925" />
                <circle cx="0" cy="31" r="18" fill="#b97857" />
                <path d="M-19 28Q-17 5 1 7Q19 7 21 27Q10 17 0 20q-12-5-19 8Z" fill="#1f1925" />
                <circle cx="-6" cy="32" r="1.6" fill="#33202a" /><circle cx="7" cy="32" r="1.6" fill="#33202a" />
                <path d="M-4 40q5 5 10 0" fill="none" stroke="#733d3c" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M-17 55Q-28 74-20 97" fill="none" stroke="#1f1925" strokeWidth="9" strokeLinecap="round" />
              </g>
            </g>
          </g>

          <g transform="translate(215 104)">
            <g className="am-chase-runner am-chase-runner--him">
              <g className="am-chase-runner__bounce">
                <path d="M-12 94-19 130M11 94 20 130" fill="none" stroke="#34485d" strokeWidth="11" strokeLinecap="round" />
                <path d="M-19 130h-15M20 130h15" fill="none" stroke="#2f303d" strokeWidth="9" strokeLinecap="round" />
                <path d="M-17 60Q0 52 17 60l6 43h-46Z" fill="#f2eee8" stroke="#d3c7c3" strokeWidth="2" />
                <path d="M-16 65-32 80M16 65 30 80" fill="none" stroke="#dfa982" strokeWidth="9" strokeLinecap="round" />
                <circle cx="0" cy="31" r="19" fill="#dfa982" />
                <path d="M-20 25q-5-14 5-22 4-5 10 0Q1-3 8 3q14-4 15 14l-4 10q-8-10-19-10-12-2-20 8Z" fill="#67412e" />
                <circle cx="-6" cy="32" r="1.6" fill="#34292c" /><circle cx="7" cy="32" r="1.6" fill="#34292c" />
                <path d="M-3 40q5 4 10 0" fill="none" stroke="#8d5a4c" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            </g>
          </g>

          <g transform="translate(424 105)">
            <g className="am-chase-scene__heart">
              <path d="M0 18C-6 12-16 6-16-2c0-9 11-11 16-3 5-8 16-6 16 3C16 6 6 12 0 18Z" fill="#ce738c" />
            </g>
          </g>
        </svg>
      </div>
    </section>
  );
}
