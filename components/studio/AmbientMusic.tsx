"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { AMBIENT_TRACKS, AmbientAudio, allowsAmbientMusic, type AmbientSnapshot } from "@/lib/ambientAudio";

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function AmbientMusicPlayer({ requestedPlaybackRef }: { requestedPlaybackRef: { current: boolean | null } }) {
  const [snapshot, setSnapshot] = useState<AmbientSnapshot>({
    status: "idle", trackIndex: 0, currentTime: 0, duration: AMBIENT_TRACKS[0].duration, volume: 0.2,
  });
  const [showVolume, setShowVolume] = useState(false);
  const engine = useRef<AmbientAudio | null>(null);
  const dock = useRef<HTMLDivElement>(null);
  const volumeButton = useRef<HTMLButtonElement>(null);
  const volumeRange = useRef<HTMLInputElement>(null);
  const track = AMBIENT_TRACKS[snapshot.trackIndex] ?? AMBIENT_TRACKS[0];
  const playing = snapshot.status === "playing";
  const starting = snapshot.status === "starting";
  const volume = Math.round(snapshot.volume * 100);
  const duration = snapshot.duration || track.duration;
  const currentTime = Math.min(snapshot.currentTime, duration);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const startPlayback = useCallback(async () => {
    const player = engine.current;
    if (!player || document.hidden) return false;
    const status = player.getSnapshot().status;
    if (status === "playing" || status === "starting") return status === "playing";
    try {
      return await player.play();
    } catch {
      if (engine.current === player) setSnapshot({ ...player.getSnapshot(), status: "unavailable" });
      return false;
    }
  }, []);

  useEffect(() => {
    let active = true;
    let visibilityPause = false;
    let previousStatus: AmbientSnapshot["status"] = "idle";
    const player = new AmbientAudio((state) => {
      if (!active) return;
      // A native/system pause also counts as a pause choice; only our visibility
      // suspension keeps automatic playback intent for returning to the page.
      if (state.status === "paused" && ["playing", "starting"].includes(previousStatus) && !visibilityPause) {
        requestedPlaybackRef.current = false;
      }
      previousStatus = state.status;
      setSnapshot(state);
    });
    engine.current = player;
    // A shareable quiet entry: no gesture starts music until Play is selected.
    if (requestedPlaybackRef.current === null) {
      requestedPlaybackRef.current = new URLSearchParams(window.location.search).get("music") !== "off";
    }

    const resumeIfRequested = () => {
      if (document.hidden) return;
      visibilityPause = false;
      if (requestedPlaybackRef.current) void startPlayback();
    };
    const handleVisibility = () => {
      if (document.hidden) {
        visibilityPause = true;
        player.pause();
      }
      else resumeIfRequested();
    };
    const pauseOnPageExit = () => {
      visibilityPause = true;
      player.pause();
    };
    const retryOnActivation = (event: PointerEvent | KeyboardEvent) => {
      if (!event.isTrusted || !requestedPlaybackRef.current || document.hidden) return;
      if (event.target instanceof Node && dock.current?.contains(event.target)) return;
      if (event instanceof PointerEvent && event.button !== 0) return;
      if (event instanceof KeyboardEvent && (
        event.ctrlKey || event.metaKey || event.altKey ||
        ["Shift", "Control", "Alt", "Meta", "Escape"].includes(event.key)
      )) return;
      const status = player.getSnapshot().status;
      if (status === "blocked" || status === "idle") void startPlayback();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("pointerdown", retryOnActivation);
    document.addEventListener("keydown", retryOnActivation);
    window.addEventListener("pagehide", pauseOnPageExit);
    window.addEventListener("pageshow", resumeIfRequested);
    resumeIfRequested();

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("pointerdown", retryOnActivation);
      document.removeEventListener("keydown", retryOnActivation);
      window.removeEventListener("pagehide", pauseOnPageExit);
      window.removeEventListener("pageshow", resumeIfRequested);
      player.close();
      if (engine.current === player) engine.current = null;
    };
  }, [requestedPlaybackRef, startPlayback]);

  useEffect(() => {
    if (!showVolume) return;
    volumeRange.current?.focus({ preventScroll: true });
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !dock.current?.contains(event.target)) setShowVolume(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [showVolume]);

  function toggleMusic() {
    const player = engine.current;
    if (!player) return;
    if (["playing", "starting"].includes(player.getSnapshot().status)) {
      requestedPlaybackRef.current = false;
      player.pause();
      return;
    }
    requestedPlaybackRef.current = true;
    void startPlayback();
  }

  async function changeTrack(direction: "previous" | "next") {
    const player = engine.current;
    if (!player) return;
    const status = player.getSnapshot().status;
    const retryRequested = requestedPlaybackRef.current && ["idle", "blocked", "unavailable"].includes(status);
    await player[direction]();
    // Blocked tracks select silently in the engine; this click can authorize playback.
    if (engine.current === player && requestedPlaybackRef.current && retryRequested) void startPlayback();
  }

  const announcement = snapshot.status === "unavailable" ? "Music is unavailable. Try another track or select Play to retry."
    : snapshot.status === "blocked" ? "Music is ready. Select Play to start."
      : starting ? `Starting ${track.title}.`
        : playing ? `Playing ${track.title} by Beopity.`
          : snapshot.status === "paused" ? "Music paused."
            : "";

  return (
    <div
      className="ambient-music"
      ref={dock}
      lang="en"
      role="region"
      aria-label="Beopity music player"
      data-playing={playing}
      style={{ "--ambient-track-accent": track.accent, "--ambient-progress": `${progress}%` } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === "Escape" && showVolume) {
          event.preventDefault();
          event.stopPropagation();
          setShowVolume(false);
          volumeButton.current?.focus({ preventScroll: true });
        }
      }}
    >
      <div className="ambient-music__dock">
        <div className="ambient-music__main">
          <div className="ambient-music__cover" aria-hidden="true">
            <span className="ambient-music__disc" />
            <span className="ambient-music__bars"><i /><i /><i /><i /></span>
          </div>
          <div className="ambient-music__track">
            <span className="ambient-music__title" title={track.title}>{track.title}</span>
            <span className="ambient-music__artist">Beopity <span aria-hidden="true">·</span> <span aria-label={`Track ${snapshot.trackIndex + 1} of ${AMBIENT_TRACKS.length}`}>{String(snapshot.trackIndex + 1).padStart(2, "0")} / {AMBIENT_TRACKS.length}</span></span>
          </div>
          <div className="ambient-music__transport" role="group" aria-label="Playback controls">
            <button type="button" aria-label="Previous track" title="Previous track" onClick={() => void changeTrack("previous")}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h2v14H5zm14 0v14L8 12z" /></svg>
            </button>
            <button className="ambient-music__play" type="button" onClick={toggleMusic} aria-label={playing || starting ? "Pause music" : "Play music"} title={playing || starting ? "Pause music" : "Play music"} aria-busy={starting}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={playing || starting ? "M7 5h3v14H7zM14 5h3v14h-3z" : "M8 5v14l11-7z"} /></svg>
            </button>
            <button type="button" aria-label="Next track" title="Next track" onClick={() => void changeTrack("next")}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 11 7-11 7zm12 0h2v14h-2z" /></svg>
            </button>
          </div>
        </div>
        <div className="ambient-music__timeline">
          <span className="ambient-music__time" aria-hidden="true">{formatTime(currentTime)}</span>
          <input
            className="ambient-music__seek"
            type="range"
            min="0"
            max={duration}
            step="0.25"
            value={currentTime}
            aria-label={`Seek in ${track.title}`}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            onChange={(event) => engine.current?.seek(Number(event.target.value))}
          />
          <span className="ambient-music__time" aria-hidden="true">{formatTime(duration)}</span>
          <button
            className="ambient-music__volume-toggle"
            type="button"
            aria-label={volume === 0 ? "Music volume, muted" : `Music volume, ${volume} percent`}
            title="Music volume"
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
      </div>
      <div className="ambient-music__panel" id="beopity-music-volume" hidden={!showVolume}>
        <div className="ambient-music__volume-label"><label htmlFor="beopity-volume">Music volume</label><output htmlFor="beopity-volume">{volume === 0 ? "Muted" : `${volume}%`}</output></div>
        <input
          id="beopity-volume"
          ref={volumeRange}
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          aria-valuetext={volume === 0 ? "Muted" : `${volume} percent`}
          onChange={(event) => engine.current?.setVolume(Number(event.target.value) / 100)}
        />
        <p>Ten original tracks. A slower pace.</p>
      </div>
      <span className="ambient-music__status" role="status">{announcement}</span>
    </div>
  );
}

export function AmbientMusic() {
  const pathname = usePathname();
  const requestedPlaybackRef = useRef<boolean | null>(null);
  // Public navigation keeps this player; private/personal routes release audio.
  return allowsAmbientMusic(pathname) ? <AmbientMusicPlayer requestedPlaybackRef={requestedPlaybackRef} /> : null;
}
