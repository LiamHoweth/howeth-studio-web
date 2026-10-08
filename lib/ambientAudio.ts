import { AMBIENT_TRACKS } from "./ambientTracks";

export { AMBIENT_TRACKS } from "./ambientTracks";

export type AmbientPlaybackStatus = "idle" | "starting" | "playing" | "paused" | "blocked" | "unavailable";

export interface AmbientSnapshot {
  status: AmbientPlaybackStatus;
  trackIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
}

export function allowsAmbientMusic(pathname: string): boolean {
  return !["/for-ameliante", "/elevenward/admin"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

type AudioFactory = () => HTMLAudioElement;
let mediaSessionOwner: object | null = null;

function browserAudio(): HTMLAudioElement {
  return new Audio();
}

/** Streams one selected recording. The caller owns autoplay and visibility intent. */
export class AmbientAudio {
  private audio: HTMLAudioElement | null = null;
  private snapshot: AmbientSnapshot = {
    status: "idle", trackIndex: 0, currentTime: 0,
    duration: AMBIENT_TRACKS[0].duration, volume: 0.2,
  };
  private requestedPlayback = false;
  private disposed = false;
  private generation = 0;
  private pendingPlay: number | null = null;
  private changingSource = false;
  private pendingSeek: number | null = null;
  private mediaSession: MediaSession | null = null;
  private readonly mediaSessionIdentity = {};

  constructor(
    private readonly onChange: (snapshot: AmbientSnapshot) => void,
    private readonly createAudio: AudioFactory = browserAudio,
  ) {}

  getSnapshot(): AmbientSnapshot {
    return { ...this.snapshot };
  }

  async play(): Promise<boolean> {
    if (this.disposed) return false;
    if (this.snapshot.status === "playing" && this.audio && !this.audio.paused) return true;
    const request = ++this.generation;
    this.pendingPlay = request;
    this.requestedPlayback = true;
    this.update({ status: "starting" });
    let audio: HTMLAudioElement;
    try {
      audio = this.ensureAudio();
      await audio.play();
      if (this.disposed || request !== this.generation) {
        // An old play can resolve after pause or a source change. Do not pause
        // a newer, valid playback request on the shared element.
        if (this.disposed || !this.requestedPlayback) audio.pause();
        return false;
      }
      this.pendingPlay = null;
      if (audio.paused) {
        this.requestedPlayback = false;
        this.update({ status: "paused" });
        return false;
      }
      this.readPosition();
      this.update({ status: "playing" });
      return true;
    } catch (error) {
      if (this.disposed || request !== this.generation) return false;
      this.pendingPlay = null;
      this.requestedPlayback = false;
      const blocked = typeof error === "object" && error !== null && "name" in error && error.name === "NotAllowedError";
      this.update({ status: blocked ? "blocked" : "unavailable" });
      this.audio?.pause();
      return false;
    }
  }

  pause(): void {
    if (this.disposed) return;
    ++this.generation;
    this.pendingPlay = null;
    this.requestedPlayback = false;
    this.update({ status: "paused" });
    this.audio?.pause();
    this.readPosition();
  }

  next(): Promise<boolean> {
    return this.selectTrack(this.snapshot.trackIndex + 1);
  }

  previous(): Promise<boolean> {
    if (this.snapshot.currentTime > 3) {
      this.seek(0);
      return Promise.resolve(this.snapshot.status === "playing");
    }
    return this.selectTrack(this.snapshot.trackIndex - 1);
  }

  seek(seconds: number): void {
    if (this.disposed || !Number.isFinite(seconds)) return;
    const currentTime = Math.max(0, Math.min(this.snapshot.duration, seconds));
    this.pendingSeek = currentTime;
    if (this.audio) this.applyPendingSeek();
    this.update({ currentTime });
  }

  setVolume(volume: number): void {
    if (this.disposed) return;
    const bounded = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
    if (this.audio) {
      this.audio.volume = bounded;
      // Muting also works on platforms where hardware owns the volume level.
      this.audio.muted = bounded === 0;
    }
    this.update({ volume: bounded });
  }

  close(): void {
    if (this.disposed) return;
    this.disposed = true;
    ++this.generation;
    this.pendingPlay = null;
    this.requestedPlayback = false;
    this.snapshot.status = "paused";
    this.pendingSeek = null;
    const audio = this.audio;
    if (audio) {
      for (const [event, listener] of this.listeners) audio.removeEventListener(event, listener);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    this.audio = null;
    if (this.mediaSession && mediaSessionOwner === this.mediaSessionIdentity) {
      try {
        this.mediaSession.metadata = null;
        this.mediaSession.playbackState = "none";
      } catch { /* The platform may release its session before cleanup. */ }
      mediaSessionOwner = null;
    }
    this.mediaSession = null;
  }

  private async selectTrack(index: number): Promise<boolean> {
    if (this.disposed) return false;
    const shouldPlay = this.requestedPlayback;
    ++this.generation;
    this.pendingPlay = null;
    this.pendingSeek = null;
    const trackIndex = (index + AMBIENT_TRACKS.length) % AMBIENT_TRACKS.length;
    this.update({
      trackIndex, currentTime: 0, duration: AMBIENT_TRACKS[trackIndex].duration,
      status: shouldPlay ? "starting" : this.snapshot.status === "idle" ? "idle" : "paused",
    });
    if (this.audio) {
      this.changingSource = true;
      try {
        this.audio.pause();
        this.audio.src = AMBIENT_TRACKS[trackIndex].src;
        this.audio.load();
      } catch {
        this.requestedPlayback = false;
        this.update({ status: "unavailable" });
        return false;
      } finally {
        this.changingSource = false;
      }
    }
    return shouldPlay ? this.play() : false;
  }

  private ensureAudio(): HTMLAudioElement {
    if (this.audio) {
      if (this.audio.error) {
        // A media error can persist across play() calls. Reload the selected
        // recording on an explicit retry and restore its last position.
        this.pendingSeek ??= this.snapshot.currentTime;
        this.audio.load();
        this.applyPendingSeek();
      }
      return this.audio;
    }
    const audio = this.createAudio();
    this.audio = audio;
    audio.preload = "metadata";
    audio.loop = false;
    audio.volume = this.snapshot.volume;
    audio.muted = this.snapshot.volume === 0;
    for (const [event, listener] of this.listeners) audio.addEventListener(event, listener);
    audio.src = AMBIENT_TRACKS[this.snapshot.trackIndex].src;
    audio.load();
    this.applyPendingSeek();
    this.installMediaSession();
    return audio;
  }

  private readonly handlePlaying = (): void => {
    const audio = this.audio;
    if (!audio) return;
    if (this.disposed || !this.requestedPlayback) {
      audio.pause();
      return;
    }
    if (!audio.paused) this.update({ status: "playing" });
  };

  private readonly handlePause = (): void => {
    if (!this.audio?.paused || this.disposed || this.changingSource) return;
    // Native media queues pause before ended at the end of a recording.
    // Preserve the playlist intent so the ended handler can advance it.
    if (this.audio.ended && this.requestedPlayback) {
      this.readPosition();
      return;
    }
    // load() may queue the old source's pause while a new play is pending.
    if (this.snapshot.status === "playing" ||
      (this.snapshot.status === "starting" && this.pendingPlay !== this.generation)) {
      ++this.generation;
      this.pendingPlay = null;
      this.requestedPlayback = false;
      this.update({ status: "paused" });
    }
    this.readPosition();
  };

  private readonly handleEnded = (): void => {
    if (this.disposed || !this.requestedPlayback || !this.audio?.ended) return;
    void this.next();
  };

  private readonly handleError = (): void => {
    if (this.disposed || !this.audio?.error) return;
    ++this.generation;
    this.pendingPlay = null;
    this.requestedPlayback = false;
    this.update({ status: "unavailable" });
    this.audio.pause();
  };

  private readonly handleWaiting = (): void => {
    if (!this.disposed && this.requestedPlayback && !this.audio?.paused) this.update({ status: "starting" });
  };

  private readonly handleMetadata = (): void => {
    if (this.disposed) return;
    this.readPosition();
    this.applyPendingSeek();
  };

  private readonly handleTime = (): void => {
    this.readPosition();
  };

  private readonly listeners: ReadonlyArray<readonly [string, EventListener]> = [
    ["playing", this.handlePlaying], ["pause", this.handlePause], ["ended", this.handleEnded],
    ["error", this.handleError], ["waiting", this.handleWaiting],
    ["loadedmetadata", this.handleMetadata], ["durationchange", this.handleMetadata],
    ["timeupdate", this.handleTime], ["seeked", this.handleTime],
  ];

  private applyPendingSeek(): void {
    if (!this.audio || this.pendingSeek === null) return;
    const time = Math.min(this.snapshot.duration, this.pendingSeek);
    try {
      this.audio.currentTime = time;
      this.pendingSeek = null;
    } catch { /* Retry after metadata on browsers that reject an early seek. */ }
  }

  private readPosition(): void {
    if (!this.audio || this.disposed) return;
    const duration = Number.isFinite(this.audio.duration) && this.audio.duration > 0
      ? this.audio.duration : AMBIENT_TRACKS[this.snapshot.trackIndex].duration;
    const position = this.pendingSeek ?? this.audio.currentTime;
    const currentTime = Number.isFinite(position) ? Math.max(0, Math.min(duration, position)) : 0;
    this.update({ duration, currentTime });
  }

  private update(changes: Partial<AmbientSnapshot>): void {
    if (this.disposed) return;
    this.snapshot = { ...this.snapshot, ...changes };
    this.updateMediaSession();
    this.onChange(this.getSnapshot());
  }

  private installMediaSession(): void {
    if (typeof navigator === "undefined" || !navigator.mediaSession) return;
    this.mediaSession = navigator.mediaSession;
    mediaSessionOwner = this.mediaSessionIdentity;
    this.updateMediaSession();
  }

  private updateMediaSession(): void {
    if (!this.mediaSession || mediaSessionOwner !== this.mediaSessionIdentity) return;
    try {
      const track = AMBIENT_TRACKS[this.snapshot.trackIndex];
      if (typeof MediaMetadata !== "undefined" && this.mediaSession.metadata?.title !== track.title) {
        this.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist });
      }
      this.mediaSession.playbackState = this.snapshot.status === "playing" ? "playing"
        : this.snapshot.status === "idle" ? "none" : "paused";
      if (this.snapshot.duration > 0) this.mediaSession.setPositionState?.({
        duration: this.snapshot.duration, playbackRate: 1, position: this.snapshot.currentTime,
      });
    } catch { /* Media Session is optional and never prevents playback. */ }
  }
}
