"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const heartLine = "i love you  ·  i love you  ·  i love you  ·  i love you  ·  i love you  ·  ";

function WordHeart({ beat }: { beat: number }) {
  return (
    <svg
      key={beat}
      className="am-word-heart"
      viewBox="0 0 480 410"
      role="img"
      aria-label="A heart made of the words I love you"
    >
      <defs>
        <clipPath id="am-heart-shape">
          <path d="M240 385C208 356 18 220 18 120 18 44 77 16 133 16c50 0 85 27 107 58 22-31 57-58 107-58 56 0 115 28 115 104 0 100-190 236-222 265Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#am-heart-shape)" className="am-word-heart__words">
        {Array.from({ length: 25 }, (_, row) => (
          <text key={row} x={row % 2 ? -62 : -96} y={26 + row * 16}>
            {heartLine.repeat(3)}
          </text>
        ))}
      </g>
      <path
        className="am-word-heart__outline"
        d="M240 385C208 356 18 220 18 120 18 44 77 16 133 16c50 0 85 27 107 58 22-31 57-58 107-58 56 0 115 28 115 104 0 100-190 236-222 265Z"
      />
    </svg>
  );
}

function Memory({
  className,
  src,
  alt,
  caption,
  sizes,
}: {
  className: string;
  src: string;
  alt: string;
  caption: string;
  sizes: string;
}) {
  return (
    <figure className={`am-memory ${className}`}>
      <div className="am-memory__frame">
        <Image src={src} alt={alt} fill sizes={sizes} />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function AmelianteExperience() {
  const [opened, setOpened] = useState(false);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (!opened) return;

    const frame = requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("ameliante-letter")?.scrollIntoView({
        behavior: reduceMotion ? "instant" : "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [opened]);

  return (
    <main className="am-page">
      <section className="am-cover" aria-labelledby="am-cover-title">
        <div className="am-cover__topline">
          <span>A tiny corner of the internet</span>
          <span aria-hidden="true">✦</span>
          <span>Just for you</span>
        </div>

        <div className="am-cover__content">
          <div className="am-envelope" aria-hidden="true">
            <span className="am-envelope__flap" />
            <span className="am-envelope__seal">♡</span>
          </div>
          <p className="am-eyebrow">A note from Liam</p>
          <h1 id="am-cover-title">
            For <em>Ameliante.</em>
          </h1>
          <p className="am-cover__lede">I made you a little piece of my heart.</p>
          <button className="am-open" type="button" onClick={() => setOpened(true)}>
            Open your letter <span aria-hidden="true">↗</span>
          </button>
        </div>

        <p className="am-cover__bottom">Made with love, one word at a time.</p>
      </section>

      {opened && (
        <div className="am-letter" id="ameliante-letter">
          <header className="am-letter__header">
            <span>For Ameliante</span>
            <span aria-hidden="true">♡</span>
            <span>From Liam</span>
          </header>

          <section className="am-declaration" aria-labelledby="am-declaration-title">
            <div className="am-declaration__copy">
              <p className="am-eyebrow">In case you ever forget</p>
              <h2 id="am-declaration-title">
                I love you,
                <br />
                <em>Ameliante.</em>
              </h2>
              <p>
                The bright days. The stormy skies. The little moments in between.
                My favorite part of all of them is you.
              </p>
            </div>
            <div className="am-heart-area">
              <button
                className="am-heart-button"
                type="button"
                onClick={() => setBeat((value) => value + 1)}
                aria-label="Make the word heart beat"
              >
                <WordHeart beat={beat} />
              </button>
              <span>Tap the heart ♡</span>
            </div>
          </section>

          <section className="am-moments" aria-labelledby="am-moments-title">
            <div className="am-section-heading">
              <p className="am-eyebrow">A few pieces of us</p>
              <h2 id="am-moments-title">The moments I keep close.</h2>
              <p>Some loud, some quiet. All ours.</p>
            </div>

            <div className="am-gallery">
              <Memory
                className="am-memory--storm"
                src="/ameliante/lightning.webp"
                alt="Ameliante and Liam kissing in a field of yellow flowers as lightning flashes in the distance"
                caption="Even the sky showed up for this one."
                sizes="(max-width: 700px) 92vw, 50vw"
              />
              <Memory
                className="am-memory--close"
                src="/ameliante/close.webp"
                alt="Ameliante resting against Liam for a close selfie"
                caption="The quiet kind of perfect."
                sizes="(max-width: 700px) 92vw, 42vw"
              />
              <Memory
                className="am-memory--day"
                src="/ameliante/day-out.webp"
                alt="Ameliante and Liam smiling together outdoors under a clear blue sky"
                caption="Our first hiking trip."
                sizes="(max-width: 700px) 92vw, 42vw"
              />
              <Memory
                className="am-memory--sunlight"
                src="/ameliante/sunlight.webp"
                alt="Ameliante smiling in warm sunlight"
                caption="That smile. Always that smile."
                sizes="(max-width: 700px) 92vw, 48vw"
              />
              <figure className="am-memory am-memory--video">
                <div className="am-memory__frame">
                  <video
                    controls
                    playsInline
                    preload="none"
                    poster="/ameliante/a-little-moment-poster.jpg"
                    aria-label="A short candid video of Ameliante and Liam together"
                  >
                    <source src="/ameliante/a-little-moment.mp4" type="video/mp4" />
                    Your browser does not support this video.
                  </video>
                </div>
                <figcaption>One tiny moment, saved here.</figcaption>
              </figure>
            </div>
          </section>

          <section className="am-note" aria-labelledby="am-note-title">
            <p className="am-eyebrow">Just one more thing</p>
            <h2 id="am-note-title">Dear Ameliante,</h2>
            <p>
              I can&apos;t fit everything I feel into a page. But I can keep a few of
              our moments here and tell you what matters most: every kind of day
              feels better with you in it.
            </p>
            <p>
              I love you, Ameliante. More than this little page can hold.
            </p>
            <p className="am-note__signature">Love, Liam ♡</p>
          </section>

          <details className="am-spark">
            <summary>The little spark that started this <span aria-hidden="true">＋</span></summary>
            <div className="am-spark__inside">
              <p>
                I saw a heart made of the same three words over and over, and I
                wanted to make one for you.
              </p>
              <Image
                src="/ameliante/the-spark.webp"
                alt="Screenshot of a heart shape drawn with repeated I love you text"
                width={560}
                height={1212}
                sizes="(max-width: 700px) 60vw, 240px"
              />
            </div>
          </details>

          <footer className="am-ending">
            <span>Yours, always.</span>
            <Link href="/" aria-label="Back to Howeth Studio">↗</Link>
          </footer>
        </div>
      )}
    </main>
  );
}
