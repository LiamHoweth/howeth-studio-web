"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AmbientAudio, allowsAmbientMusic } from "@/lib/ambientAudio";

type MusicStatus = "idle" | "starting" | "playing" | "paused" | "unavailable";

function AmbientMusicPlayer() {
  const [status, setStatus] = useState<MusicStatus>("idle");
  const [volume, setVolume] = useState(38);
  const [showVolume, setShowVolume] = useState(false);
  const engine = useRef<AmbientAudio | null>(null);
  const mounted = useRef(true);
  const dock = useRef<HTMLDivElement>(null);
  const volumeButton = useRef<HTMLButtonElement>(null);
  const playing = status === "playing";

  useEffect(() => {
    mounted.current = true;
    const pauseWhenHidden = () => {
      if (document.hidden) engine.current?.pause();
    };
    const pauseOnPageExit = () => engine.current?.pause();
    document.addEventListener("visibilitychange", pauseWhenHidden);
    window.addEventListener("pagehide", pauseOnPageExit);
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      window.removeEventListener("pagehide", pauseOnPageExit);
      engine.current?.close();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    if (!showVolume) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !dock.current?.contains(event.target)) setShowVolume(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [showVolume]);

  async function toggleMusic() {
    if (playing) {
      engine.current?.pause();
      return;
    }
    if (document.hidden || status === "starting") return;
    setStatus("starting");
    try {
      engine.current ??= new AmbientAudio((state) => {
        if (mounted.current) setStatus(state);
      });
      engine.current.setVolume(volume / 100);
      const started = await engine.current.play();
      if (mounted.current && !started) setStatus("paused");
    } catch {
      engine.current?.close();
      engine.current = null;
      if (mounted.current) setStatus("unavailable");
    }
  }

  return (
    <div
      className="ambient-music"
      ref={dock}
      lang="en"
      data-playing={playing}
      onKeyDown={(event) => {
        if (event.key === "Escape" && showVolume) {
          event.preventDefault();
          setShowVolume(false);
          volumeButton.current?.focus();
        }
      }}
    >
      <div className="ambient-music__dock">
        <button
          className="ambient-music__play"
          type="button"
          onClick={() => void toggleMusic()}
          disabled={status === "starting" || status === "unavailable"}
          aria-label={playing ? "Pause music" : "Play music"}
        >
          <span className="ambient-music__bars" aria-hidden="true"><i /><i /><i /><i /></span>
          <svg className="ambient-music__mobile-action" viewBox="0 0 24 24" aria-hidden="true">
            <path d={playing ? "M7 5h3v14H7zM14 5h3v14h-3z" : "M7 5v14l12-7z"} />
          </svg>
          <span className="ambient-music__label">{status === "starting" ? "Starting…" : status === "unavailable" ? "Music unavailable" : playing ? "Pause music" : "Play music"}</span>
        </button>
        <button
          className="ambient-music__volume-toggle"
          type="button"
          aria-label="Music volume"
          aria-controls="beopity-music-volume"
          aria-expanded={showVolume}
          ref={volumeButton}
          onClick={() => setShowVolume((value) => !value)}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4V9Z" />
            <path d={volume === 0 ? "m17 9 5 6m0-6-5 6" : "M17 8a6 6 0 0 1 0 8"} />
          </svg>
        </button>
      </div>
      <div className="ambient-music__panel" id="beopity-music-volume" hidden={!showVolume}>
        <div className="ambient-music__panel-title"><span>Drift / Beopity</span><span>Original ambient</span></div>
        <div className="ambient-music__volume-label"><label htmlFor="beopity-volume">Volume</label><output htmlFor="beopity-volume">{volume === 0 ? "Muted" : `${volume}%`}</output></div>
        <input
          id="beopity-volume"
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          aria-valuetext={volume === 0 ? "Muted" : `${volume} percent`}
          onChange={(event) => {
            const next = Number(event.target.value);
            setVolume(next);
            engine.current?.setVolume(next / 100);
          }}
        />
        <p>Soft chords. A slower pace.</p>
      </div>
      <span className="ambient-music__status" role="status">
        {status === "unavailable" ? "Music is unavailable in this browser." : status === "paused" ? "Music paused. Select Play music to resume." : playing ? "Music playing." : ""}
      </span>
    </div>
  );
}

export function AmbientMusic() {
  const pathname = usePathname();
  // Unmounting the player releases all audio resources on private/personal routes.
  return allowsAmbientMusic(pathname) ? <AmbientMusicPlayer /> : null;
}
