/** Original Beopity composition. No recording, network request, or persisted preference. */
export const AMBIENT_BEAT_SECONDS = 60 / 58;
export const AMBIENT_PHRASE_SECONDS = AMBIENT_BEAT_SECONDS * 8;

export interface AmbientNote {
  kind: "pad" | "bass" | "bell";
  midi: number;
  offset: number;
  duration: number;
  pan: number;
}

const harmony = [
  { bass: 38, pad: [50, 57, 61, 64], melody: [66, 64] },
  { bass: 35, pad: [47, 54, 57, 62], melody: [62, 59] },
  { bass: 31, pad: [43, 50, 54, 59], melody: [59, 62] },
  { bass: 33, pad: [45, 52, 59, 62], melody: [64, 61] },
] as const;

export function midiFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** A spacious D-major/B-minor progression, with alternate melody octaves each loop. */
export function ambientPhrase(index: number): AmbientNote[] {
  const chord = harmony[((Math.floor(index) % harmony.length) + harmony.length) % harmony.length];
  const octave = Math.floor(index / harmony.length) % 2 === 0 ? 12 : 0;
  return [
    ...chord.pad.map((midi, voice): AmbientNote => ({
      kind: "pad", midi, offset: 0, duration: AMBIENT_PHRASE_SECONDS + 2.6,
      pan: (voice - 1.5) * 0.16,
    })),
    { kind: "bass", midi: chord.bass, offset: 0, duration: AMBIENT_PHRASE_SECONDS, pan: 0 },
    ...chord.melody.map((midi, voice): AmbientNote => ({
      kind: "bell", midi: midi + octave, offset: (voice === 0 ? 2.5 : 6) * AMBIENT_BEAT_SECONDS,
      duration: 3.5, pan: voice === 0 ? -0.2 : 0.2,
    })),
  ];
}

export function allowsAmbientMusic(pathname: string): boolean {
  return !["/for-ameliante", "/elevenward/admin"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

type PlaybackState = "playing" | "paused";
type AudioContextFactory = () => AudioContext;
interface Voice {
  sources: OscillatorNode[];
  nodes: AudioNode[];
}

function browserAudioContext(): AudioContext {
  const BrowserAudioContext = window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!BrowserAudioContext) throw new Error("Web Audio is unavailable.");
  return new BrowserAudioContext({ latencyHint: "playback" });
}

/** The graph is created only inside play(), which is called from a user action. */
export class AmbientAudio {
  private context: AudioContext | null = null;
  private input: BiquadFilterNode | null = null;
  private output: GainNode | null = null;
  private graph: AudioNode[] = [];
  private voices = new Set<Voice>();
  private scheduler: ReturnType<typeof setInterval> | null = null;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;
  private phraseIndex = 0;
  private nextPhraseAt = 0;
  private volume = 0.38;
  private playing = false;
  private requestedPlayback = false;
  private disposed = false;
  private generation = 0;
  private readonly onPlaybackChange: (state: PlaybackState) => void;
  private readonly createContext: AudioContextFactory;

  constructor(
    onPlaybackChange: (state: PlaybackState) => void,
    createContext: AudioContextFactory = browserAudioContext,
  ) {
    this.onPlaybackChange = onPlaybackChange;
    this.createContext = createContext;
  }

  async play(): Promise<boolean> {
    if (this.disposed) return false;
    const request = ++this.generation;
    this.requestedPlayback = true;
    this.cancelSuspend();
    const context = this.context ?? this.createGraph();
    await context.resume();
    if (this.disposed || request !== this.generation) {
      if (!this.disposed && !this.requestedPlayback && context.state === "running") {
        void context.suspend().catch(() => {});
      }
      return false;
    }
    if (context.state !== "running") throw new Error("Audio playback is unavailable.");
    this.playing = true;
    this.output!.gain.cancelScheduledValues(context.currentTime);
    this.output!.gain.setTargetAtTime(this.volume * 0.42, context.currentTime, 0.25);
    this.schedule();
    this.stopScheduler();
    this.scheduler = setInterval(() => this.schedule(), 250);
    this.onPlaybackChange("playing");
    return true;
  }

  pause(): void {
    ++this.generation;
    this.requestedPlayback = false;
    this.playing = false;
    this.stopScheduler();
    this.cancelSuspend();
    const context = this.context;
    if (!context || context.state === "closed") return;
    const output = this.output!;
    output.gain.cancelScheduledValues(context.currentTime);
    output.gain.setTargetAtTime(0, context.currentTime, 0.035);
    this.onPlaybackChange("paused");
    // Fade before suspension to avoid an abrupt click. Never automatically resume.
    this.suspendTimer = setTimeout(() => {
      this.suspendTimer = null;
      if (!this.playing && !this.disposed && context.state !== "closed") {
        void context.suspend().catch(() => {});
      }
    }, 180);
  }

  setVolume(volume: number): void {
    this.volume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
    if (this.playing && this.context && this.output) {
      this.output.gain.setTargetAtTime(this.volume * 0.42, this.context.currentTime, 0.08);
    }
  }

  close(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.requestedPlayback = false;
    ++this.generation;
    this.playing = false;
    this.stopScheduler();
    this.cancelSuspend();
    const context = this.context;
    if (context && this.output) {
      this.output.gain.cancelScheduledValues(context.currentTime);
      this.output.gain.setValueAtTime(0, context.currentTime);
    }
    for (const voice of this.voices) {
      for (const source of voice.sources) {
        source.onended = null;
        try { source.stop(); } catch { /* A completed source is already stopped. */ }
      }
      for (const node of voice.nodes) node.disconnect();
    }
    this.voices.clear();
    for (const node of this.graph) node.disconnect();
    this.graph = [];
    context?.removeEventListener("statechange", this.handleContextState);
    if (context && context.state !== "closed") void context.close().catch(() => {});
    this.context = null;
    this.input = null;
    this.output = null;
  }

  private readonly handleContextState = (): void => {
    if (this.playing && this.context?.state !== "running") {
      this.playing = false;
      this.requestedPlayback = false;
      ++this.generation;
      this.stopScheduler();
      this.onPlaybackChange("paused");
    }
  };

  private createGraph(): AudioContext {
    const context = this.createContext();
    this.context = context;
    try {
      const input = context.createBiquadFilter();
      this.graph.push(input);
      input.type = "lowpass";
      input.frequency.value = 2400;
      input.Q.value = 0.5;
      const output = context.createGain();
      this.graph.push(output);
      output.gain.value = 0;
      const delay = context.createDelay(2);
      this.graph.push(delay);
      delay.delayTime.value = AMBIENT_BEAT_SECONDS * 0.5;
      const feedback = context.createGain();
      this.graph.push(feedback);
      feedback.gain.value = 0.19;
      const wet = context.createGain();
      this.graph.push(wet);
      wet.gain.value = 0.18;
      // Each node is recorded immediately so close() also releases a partial graph.
      input.connect(output);
      input.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(output);
      output.connect(context.destination);
      this.input = input;
      this.output = output;
      this.nextPhraseAt = context.currentTime + 0.12;
      context.addEventListener("statechange", this.handleContextState);
      return context;
    } catch (error) {
      this.close();
      throw error;
    }
  }

  private schedule(): void {
    const context = this.context;
    if (!this.playing || !context || !this.input) return;
    // AudioContext time freezes while suspended. A throttled timer never emits a backlog.
    if (this.nextPhraseAt < context.currentTime - 0.2) this.nextPhraseAt = context.currentTime + 0.05;
    while (this.nextPhraseAt < context.currentTime + 0.8) {
      for (const note of ambientPhrase(this.phraseIndex)) this.scheduleNote(note, this.nextPhraseAt);
      this.phraseIndex += 1;
      this.nextPhraseAt += AMBIENT_PHRASE_SECONDS;
    }
  }

  private scheduleNote(note: AmbientNote, phraseAt: number): void {
    const context = this.context!;
    const start = phraseAt + note.offset;
    const end = start + note.duration;
    const envelope = context.createGain();
    const pan = context.createStereoPanner();
    pan.pan.value = note.pan;
    envelope.connect(pan);
    pan.connect(this.input!);
    const peak = note.kind === "bass" ? 0.032 : note.kind === "bell" ? 0.026 : 0.022;
    envelope.gain.setValueAtTime(0, start);
    if (note.kind === "bell") {
      envelope.gain.linearRampToValueAtTime(peak, start + 0.045);
      envelope.gain.exponentialRampToValueAtTime(0.0001, end - 0.05);
    } else {
      envelope.gain.linearRampToValueAtTime(peak, start + 2.3);
      envelope.gain.setValueAtTime(peak, end - 2.5);
      envelope.gain.linearRampToValueAtTime(0.0001, end - 0.05);
    }
    envelope.gain.linearRampToValueAtTime(0, end);
    const source = context.createOscillator();
    source.type = note.kind === "pad" ? "triangle" : "sine";
    source.frequency.value = midiFrequency(note.midi);
    source.detune.value = note.kind === "pad" ? note.pan * 12 : 0;
    source.connect(envelope);
    const voice: Voice = { sources: [source], nodes: [source, envelope, pan] };
    this.voices.add(voice);
    source.onended = () => {
      source.onended = null;
      this.voices.delete(voice);
      for (const node of voice.nodes) node.disconnect();
    };
    source.start(start);
    source.stop(end);
  }

  private stopScheduler(): void {
    if (this.scheduler !== null) clearInterval(this.scheduler);
    this.scheduler = null;
  }

  private cancelSuspend(): void {
    if (this.suspendTimer !== null) clearTimeout(this.suspendTimer);
    this.suspendTimer = null;
  }
}
