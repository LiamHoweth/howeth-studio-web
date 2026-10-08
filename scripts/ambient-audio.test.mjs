import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

// Compile the real service and manifest. Fake media never touches audio hardware.
function moduleURL(source) {
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`;
}
const tracksURL = moduleURL(await readFile(new URL('../lib/ambientTracks.ts', import.meta.url), 'utf8'));
const service = (await readFile(new URL('../lib/ambientAudio.ts', import.meta.url), 'utf8'))
  .replaceAll('"./ambientTracks"', JSON.stringify(tracksURL));
const { AmbientAudio, AMBIENT_TRACKS, allowsAmbientMusic } = await import(moduleURL(service));

class FakeAudio {
  preload = '';
  loop = true;
  volume = 1;
  muted = false;
  paused = true;
  ended = false;
  error = null;
  duration = Number.NaN;
  _currentTime = 0;
  _src = '';
  rejectEarlySeek = false;
  listeners = new Map();
  sources = [];
  playCalls = 0;
  pauseCalls = 0;
  loadCalls = 0;
  plans = [];

  set src(value) {
    this._src = value;
    this.sources.push(value);
    this.ended = false;
    this.error = null;
    this.duration = Number.NaN;
    this._currentTime = 0;
    this.paused = true;
  }
  get src() { return this._src; }
  set currentTime(value) {
    if (this.rejectEarlySeek && !Number.isFinite(this.duration)) throw new Error('Metadata unavailable');
    this._currentTime = value;
  }
  get currentTime() { return this._currentTime; }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  emit(type) { for (const listener of this.listeners.get(type) ?? []) listener({ type }); }
  load() {
    this.loadCalls++;
    this.error = null;
    this.duration = Number.NaN;
    this._currentTime = 0;
    this.ended = false;
    this.paused = true;
  }
  removeAttribute(name) { if (name === 'src') this._src = ''; }
  pause() {
    this.pauseCalls++;
    const wasPlaying = !this.paused;
    this.paused = true;
    if (wasPlaying) this.emit('pause');
  }
  play() {
    this.playCalls++;
    if (this.error) return Promise.reject(Object.assign(new Error('Media error requires reload'), { name: 'NotSupportedError' }));
    const plan = this.plans.shift();
    if (plan) return plan();
    this.start();
    return Promise.resolve();
  }
  start() { this.paused = false; this.ended = false; this.emit('playing'); }
  deferPlay() {
    let resolve;
    let reject;
    const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
    this.plans.push(() => promise);
    return { resolve: () => { this.start(); resolve(); }, reject };
  }
  failPlay(name) { this.plans.push(() => Promise.reject(Object.assign(new Error(name), { name }))); }
  metadata(duration) { this.duration = duration; this.emit('loadedmetadata'); }
  time(seconds) { this._currentTime = seconds; this.emit('timeupdate'); }
  finish() {
    this.ended = true;
    this.paused = true;
    this.emit('pause');
    this.emit('ended');
  }
  failSource() { this.error = { code: 2 }; this.emit('error'); }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}

function harness(t) {
  const audio = new FakeAudio();
  const snapshots = [];
  let created = 0;
  const engine = new AmbientAudio((snapshot) => snapshots.push(snapshot), () => { created++; return audio; });
  t.after(() => engine.close());
  return { audio, engine, snapshots, created: () => created };
}

test('creates one metadata-only element on first play and reuses it across tracks', async (t) => {
  const h = harness(t);
  assert.equal(h.created(), 0);
  assert.deepEqual(h.engine.getSnapshot(), {
    status: 'idle', trackIndex: 0, currentTime: 0, duration: AMBIENT_TRACKS[0].duration, volume: 0.2,
  });
  assert.equal(await h.engine.play(), true);
  assert.equal(h.created(), 1);
  assert.equal(h.audio.preload, 'metadata');
  assert.equal(h.audio.loop, false);
  assert.equal(h.audio.volume, 0.2);
  assert.deepEqual(h.audio.sources, [AMBIENT_TRACKS[0].src]);
  assert.equal(await h.engine.next(), true);
  h.engine.pause();
  assert.equal(await h.engine.play(), true);
  assert.equal(h.created(), 1);
  assert.deepEqual(h.audio.sources, [AMBIENT_TRACKS[0].src, AMBIENT_TRACKS[1].src]);
});

test('snapshot copies cannot mutate engine state or earlier notifications', async (t) => {
  const h = harness(t);
  const snapshot = h.engine.getSnapshot();
  snapshot.trackIndex = 99;
  await h.engine.play();
  h.snapshots[0].status = 'blocked';
  assert.equal(h.engine.getSnapshot().trackIndex, 0);
  assert.equal(h.engine.getSnapshot().status, 'playing');
});

test('autoplay rejection is blocked and a later gesture can retry the same source', async (t) => {
  const h = harness(t);
  h.audio.failPlay('NotAllowedError');
  assert.equal(await h.engine.play(), false);
  assert.equal(h.engine.getSnapshot().status, 'blocked');
  assert.equal(await h.engine.play(), true);
  assert.equal(h.engine.getSnapshot().status, 'playing');
  assert.equal(h.audio.sources.length, 1);
});

test('network rejection and native source errors are unavailable and recoverable', async (t) => {
  const h = harness(t);
  h.audio.failPlay('NetworkError');
  assert.equal(await h.engine.play(), false);
  assert.equal(h.engine.getSnapshot().status, 'unavailable');
  await h.engine.play();
  h.audio.failSource();
  assert.equal(h.engine.getSnapshot().status, 'unavailable');
  assert.equal(h.audio.paused, true);
  assert.equal(await h.engine.next(), false);
  assert.equal(h.engine.getSnapshot().trackIndex, 1);
  assert.equal(await h.engine.play(), true);
});

test('a missing audio implementation reports unavailable without throwing', async (t) => {
  const engine = new AmbientAudio(() => {}, () => { throw new Error('No media support'); });
  t.after(() => engine.close());
  assert.equal(await engine.play(), false);
  assert.equal(engine.getSnapshot().status, 'unavailable');
});

test('retry after a source error reloads the recording and restores its position after metadata', async (t) => {
  const h = harness(t);
  h.audio.rejectEarlySeek = true;
  await h.engine.play();
  h.audio.metadata(120);
  h.audio.time(22);
  h.audio.failSource();
  assert.equal(h.engine.getSnapshot().status, 'unavailable');
  assert.equal(h.audio.loadCalls, 1);
  assert.equal(await h.engine.play(), true, 'errored media must reload before it can play');
  assert.equal(h.audio.loadCalls, 2);
  assert.equal(h.audio.error, null);
  assert.equal(h.engine.getSnapshot().currentTime, 22);
  assert.equal(h.audio.currentTime, 0, 'early seek waits for native metadata');
  h.audio.metadata(120);
  assert.equal(h.audio.currentTime, 22);
  assert.equal(h.engine.getSnapshot().currentTime, 22);
  assert.deepEqual(h.audio.sources, [AMBIENT_TRACKS[0].src]);
});

test('next and previous wrap while paused without preloading the playlist', async (t) => {
  const h = harness(t);
  assert.equal(await h.engine.previous(), false);
  assert.equal(h.engine.getSnapshot().trackIndex, 9);
  assert.equal(h.created(), 0);
  assert.equal(await h.engine.next(), false);
  assert.equal(h.engine.getSnapshot().trackIndex, 0);
  await h.engine.play();
  h.engine.pause();
  assert.equal(await h.engine.previous(), false);
  assert.equal(h.engine.getSnapshot().trackIndex, 9);
  assert.equal(h.engine.getSnapshot().status, 'paused');
  assert.equal(h.audio.playCalls, 1);
  assert.equal(await h.engine.next(), false);
  assert.equal(h.engine.getSnapshot().trackIndex, 0);
});

test('previous restarts after three seconds and otherwise selects the previous song', async (t) => {
  const h = harness(t);
  await h.engine.play();
  await h.engine.next();
  h.audio.time(3.01);
  assert.equal(await h.engine.previous(), true);
  assert.equal(h.engine.getSnapshot().trackIndex, 1);
  assert.equal(h.audio.currentTime, 0);
  assert.equal(h.audio.playCalls, 2);
  h.audio.time(3);
  assert.equal(await h.engine.previous(), true);
  assert.equal(h.engine.getSnapshot().trackIndex, 0);
  h.engine.pause();
  h.audio.time(10);
  assert.equal(await h.engine.previous(), false);
  assert.equal(h.engine.getSnapshot().trackIndex, 0);
  assert.equal(h.engine.getSnapshot().status, 'paused');
  assert.equal(h.audio.currentTime, 0);
});

test('ended advances once, wraps, and ignores an ended event after pause', async (t) => {
  const h = harness(t);
  await h.engine.previous();
  await h.engine.play();
  h.audio.finish();
  await Promise.resolve();
  assert.equal(h.engine.getSnapshot().trackIndex, 0);
  assert.equal(h.engine.getSnapshot().status, 'playing');
  assert.equal(h.audio.playCalls, 2);
  h.audio.emit('ended');
  assert.equal(h.engine.getSnapshot().trackIndex, 0, 'queued old-source ended is ignored');
  h.engine.pause();
  h.audio.finish();
  assert.equal(h.engine.getSnapshot().trackIndex, 0);
  assert.equal(h.audio.playCalls, 2);
});

test('pause cannot be undone by a late play resolution or playing event', async (t) => {
  const h = harness(t);
  const pending = h.audio.deferPlay();
  const started = h.engine.play();
  assert.equal(h.engine.getSnapshot().status, 'starting');
  h.engine.pause();
  pending.resolve();
  assert.equal(await started, false);
  assert.equal(h.engine.getSnapshot().status, 'paused');
  assert.equal(h.audio.paused, true);
  h.audio.start();
  assert.equal(h.audio.paused, true);
  assert.equal(h.engine.getSnapshot().status, 'paused');
});

test('source changes cancel old rejected play promises without blocking the newer request', async (t) => {
  const h = harness(t);
  const old = h.audio.deferPlay();
  const initial = h.engine.play();
  const current = h.audio.deferPlay();
  const next = h.engine.next();
  old.reject(Object.assign(new Error('Old autoplay policy'), { name: 'NotAllowedError' }));
  assert.equal(await initial, false);
  assert.equal(h.engine.getSnapshot().status, 'starting');
  current.resolve();
  assert.equal(await next, true);
  assert.equal(h.engine.getSnapshot().trackIndex, 1);
  assert.equal(h.engine.getSnapshot().status, 'playing');
  assert.equal(h.audio.paused, false);
});

test('a stale successful play does not pause the newer playing source', async (t) => {
  const h = harness(t);
  const old = h.audio.deferPlay();
  const initial = h.engine.play();
  assert.equal(await h.engine.next(), true);
  old.resolve();
  assert.equal(await initial, false);
  assert.equal(h.engine.getSnapshot().trackIndex, 1);
  assert.equal(h.engine.getSnapshot().status, 'playing');
  assert.equal(h.audio.paused, false);
});

test('two track transitions followed by pause reject all stale playback completions', async (t) => {
  const h = harness(t);
  const first = h.audio.deferPlay();
  const a = h.engine.play();
  const second = h.audio.deferPlay();
  const b = h.engine.next();
  const third = h.audio.deferPlay();
  const c = h.engine.previous();
  h.engine.pause();
  second.resolve();
  first.resolve();
  third.resolve();
  assert.deepEqual(await Promise.all([a, b, c]), [false, false, false]);
  assert.equal(h.engine.getSnapshot().trackIndex, 0);
  assert.equal(h.engine.getSnapshot().status, 'paused');
  assert.equal(h.audio.paused, true);
});

test('queued source replacement pause events do not cancel pending playback', async (t) => {
  const h = harness(t);
  await h.engine.play();
  h.audio.time(15);
  const pending = h.audio.deferPlay();
  const next = h.engine.next();
  h.audio.emit('pause');
  assert.equal(h.engine.getSnapshot().status, 'starting');
  assert.equal(h.engine.getSnapshot().currentTime, 0);
  pending.resolve();
  assert.equal(await next, true);
  assert.equal(h.engine.getSnapshot().status, 'playing');
});

test('waiting reflects buffering and native pause stops playback intent', async (t) => {
  const h = harness(t);
  await h.engine.play();
  h.audio.emit('waiting');
  assert.equal(h.engine.getSnapshot().status, 'starting');
  h.audio.start();
  assert.equal(h.engine.getSnapshot().status, 'playing');
  h.audio.emit('waiting');
  h.audio.pause();
  assert.equal(h.engine.getSnapshot().status, 'paused');
  assert.equal(await h.engine.next(), false);
  assert.equal(h.audio.playCalls, 1);
});

test('zero volume mutes and volume remains bounded before and during playback', async (t) => {
  const h = harness(t);
  h.engine.setVolume(0);
  await h.engine.play();
  assert.equal(h.audio.volume, 0);
  assert.equal(h.audio.muted, true);
  assert.equal(h.engine.getSnapshot().volume, 0);
  h.engine.setVolume(4);
  assert.equal(h.audio.volume, 1);
  assert.equal(h.audio.muted, false);
  h.engine.setVolume(-1);
  assert.equal(h.audio.volume, 0);
  h.engine.setVolume(Number.NaN);
  assert.equal(h.engine.getSnapshot().volume, 0);
});

test('metadata replaces fallback duration and seek clamps to a valid position', async (t) => {
  const h = harness(t);
  h.engine.seek(12);
  await h.engine.play();
  assert.equal(h.audio.currentTime, 12);
  h.audio.metadata(150);
  assert.equal(h.engine.getSnapshot().duration, 150);
  h.engine.seek(999);
  assert.equal(h.audio.currentTime, 150);
  h.engine.seek(-5);
  assert.equal(h.audio.currentTime, 0);
  h.engine.seek(Number.NaN);
  assert.equal(h.audio.currentTime, 0);
  h.audio.time(24);
  assert.equal(h.engine.getSnapshot().currentTime, 24);
  h.audio.duration = Number.POSITIVE_INFINITY;
  h.audio.emit('durationchange');
  assert.equal(h.engine.getSnapshot().duration, AMBIENT_TRACKS[0].duration);
});

test('an early seek retries after metadata and source selection clears it', async (t) => {
  const h = harness(t);
  h.audio.rejectEarlySeek = true;
  h.engine.seek(18);
  await h.engine.play();
  assert.equal(h.engine.getSnapshot().currentTime, 18);
  assert.equal(h.audio.currentTime, 0);
  h.audio.metadata(200);
  assert.equal(h.audio.currentTime, 18);
  h.audio.duration = Number.NaN;
  h.engine.seek(30);
  await h.engine.next();
  h.audio.metadata(180);
  assert.equal(h.audio.currentTime, 0);
  assert.equal(h.engine.getSnapshot().currentTime, 0);
});

test('close cancels pending play, releases source and listeners, and is idempotent', async (t) => {
  const h = harness(t);
  const pending = h.audio.deferPlay();
  const started = h.engine.play();
  assert.ok(h.audio.listenerCount > 0);
  h.engine.close();
  const notificationCount = h.snapshots.length;
  pending.resolve();
  assert.equal(await started, false);
  assert.equal(h.audio.paused, true);
  assert.equal(h.audio.src, '');
  assert.equal(h.audio.listenerCount, 0);
  assert.equal(h.snapshots.length, notificationCount);
  h.audio.emit('error');
  h.engine.setVolume(1);
  h.engine.seek(15);
  h.engine.close();
  assert.equal(await h.engine.play(), false);
  assert.equal(await h.engine.next(), false);
  assert.equal(await h.engine.previous(), false);
  assert.equal(h.snapshots.length, notificationCount);
  assert.equal(h.audio.loadCalls, 2);
});

test('optional Media Session metadata updates and cleans up without installing intent handlers', async (t) => {
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const metadataDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'MediaMetadata');
  const mediaSession = {
    metadata: null, playbackState: 'none', position: null,
    setActionHandler() { assert.fail('The UI owns user playback intent'); },
    setPositionState(position) { this.position = position; },
  };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaSession } });
  Object.defineProperty(globalThis, 'MediaMetadata', { configurable: true, value: class {
    constructor(init) { Object.assign(this, init); }
  } });
  t.after(() => {
    if (navigatorDescriptor) Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
    else delete globalThis.navigator;
    if (metadataDescriptor) Object.defineProperty(globalThis, 'MediaMetadata', metadataDescriptor);
    else delete globalThis.MediaMetadata;
  });
  const h = harness(t);
  await h.engine.play();
  assert.equal(mediaSession.metadata.title, AMBIENT_TRACKS[0].title);
  assert.equal(mediaSession.metadata.artist, 'Beopity');
  assert.equal(mediaSession.playbackState, 'playing');
  h.audio.time(9);
  assert.equal(mediaSession.position.position, 9);
  await h.engine.next();
  assert.equal(mediaSession.metadata.title, AMBIENT_TRACKS[1].title);
  h.engine.pause();
  assert.equal(mediaSession.playbackState, 'paused');
  h.engine.close();
  assert.equal(mediaSession.metadata, null);
  assert.equal(mediaSession.playbackState, 'none');
});

test('private and personal routes exclude music without excluding product pages', () => {
  for (const route of ['/for-ameliante', '/for-ameliante/', '/for-ameliante/note/', '/elevenward/admin', '/elevenward/admin/', '/elevenward/admin/account/']) {
    assert.equal(allowsAmbientMusic(route), false, route);
  }
  for (const route of ['/', '/work/', '/noctara/', '/elevenward/', '/elevenward/privacy/es/', '/for-ameliante-extra/']) {
    assert.equal(allowsAmbientMusic(route), true, route);
  }
});
