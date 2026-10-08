import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

// Compile the real synthesizer for Node; fake nodes below never access audio hardware.
const source = await readFile(new URL('../lib/ambientAudio.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { AmbientAudio, ambientPhrase, AMBIENT_PHRASE_SECONDS, allowsAmbientMusic, midiFrequency } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);

class FakeParam {
  value = 0;
  events = [];
  cancelScheduledValues(at) { this.events.push(['cancel', at]); }
  setValueAtTime(value, at) { this.events.push(['set', value, at]); }
  setTargetAtTime(value, at, timeConstant) { this.events.push(['target', value, at, timeConstant]); }
  linearRampToValueAtTime(value, at) { this.events.push(['linear', value, at]); }
  exponentialRampToValueAtTime(value, at) { this.events.push(['exponential', value, at]); }
}

class FakeNode {
  connections = [];
  disconnected = false;
  gain = new FakeParam();
  frequency = new FakeParam();
  Q = new FakeParam();
  delayTime = new FakeParam();
  pan = new FakeParam();
  detune = new FakeParam();
  onended = null;
  ended = false;
  starts = [];
  stops = [];
  constructor(kind) { this.kind = kind; }
  connect(node) { this.connections.push(node); }
  disconnect() { this.disconnected = true; }
  start(at) { this.starts.push(at); }
  stop(at) { this.stops.push(at); }
}

class FakeContext {
  currentTime = 0;
  state = 'suspended';
  destination = new FakeNode('destination');
  nodes = [];
  listeners = new Set();
  resumeCalls = 0;
  suspendCalls = 0;
  closeCalls = 0;
  node(kind) { const node = new FakeNode(kind); this.nodes.push(node); return node; }
  createBiquadFilter() { return this.node('filter'); }
  createGain() { return this.node('gain'); }
  createDelay() { return this.node('delay'); }
  createStereoPanner() { return this.node('pan'); }
  createOscillator() { return this.node('oscillator'); }
  addEventListener(type, listener) { if (type === 'statechange') this.listeners.add(listener); }
  removeEventListener(type, listener) { if (type === 'statechange') this.listeners.delete(listener); }
  changeState(state) { this.state = state; for (const listener of this.listeners) listener(); }
  async resume() { this.resumeCalls++; this.changeState('running'); }
  async suspend() { this.suspendCalls++; this.changeState('suspended'); }
  async close() { this.closeCalls++; this.changeState('closed'); }
  advance(seconds) {
    this.currentTime = seconds;
    for (const node of this.nodes) {
      if (node.kind === 'oscillator' && !node.ended && node.stops[0] <= seconds) {
        node.ended = true;
        node.onended?.();
      }
    }
  }
  get oscillators() { return this.nodes.filter((node) => node.kind === 'oscillator'); }
  get output() { return this.nodes.find((node) => node.connections.includes(this.destination)); }
}

function harness(t) {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const context = new FakeContext();
  const states = [];
  let created = 0;
  const engine = new AmbientAudio((state) => states.push(state), () => { created++; return context; });
  t.after(() => engine.close());
  return { context, engine, states, created: () => created };
}

test('music is silent until explicitly played and reuses one context', async (t) => {
  const h = harness(t);
  assert.equal(h.created(), 0);
  assert.equal(h.context.nodes.length, 0);
  assert.equal(await h.engine.play(), true);
  assert.equal(h.created(), 1);
  assert.deepEqual(h.states, ['playing']);
  assert.equal(h.context.oscillators.length, 7);
  assert.ok(h.context.oscillators.every((node) => node.starts[0] >= 0.12));
  assert.ok(h.context.oscillators.every((node) => node.frequency.value > 45 && node.frequency.value < 1000));
  h.engine.pause();
  t.mock.timers.tick(180);
  assert.equal(h.context.state, 'suspended');
  assert.equal(await h.engine.play(), true);
  assert.equal(h.created(), 1);
  assert.equal(h.context.oscillators.length, 7, 'resume does not duplicate the current phrase');
});

test('pause fades, suspends hardware, and never automatically resumes', async (t) => {
  const h = harness(t);
  await h.engine.play();
  h.engine.pause();
  assert.equal(h.context.output.gain.events.at(-1)[1], 0);
  t.mock.timers.tick(179);
  assert.equal(h.context.suspendCalls, 0);
  t.mock.timers.tick(1);
  assert.equal(h.context.suspendCalls, 1);
  t.mock.timers.tick(20_000);
  assert.equal(h.context.resumeCalls, 1);
  assert.deepEqual(h.states, ['playing', 'paused']);
  assert.equal(h.context.oscillators.length, 7);
});

test('a pause cancels playback while context resume is pending', async (t) => {
  const h = harness(t);
  let finishResume;
  h.context.resume = () => new Promise((resolve) => {
    finishResume = () => { h.context.changeState('running'); resolve(); };
  });
  const started = h.engine.play();
  h.engine.pause();
  t.mock.timers.tick(180);
  finishResume();
  assert.equal(await started, false);
  assert.equal(h.context.oscillators.length, 0);
  assert.equal(h.context.output.gain.value, 0);
  assert.equal(h.context.state, 'suspended');
  assert.ok(!h.states.includes('playing'));
});

test('closing during resume prevents notes and releases resources once', async (t) => {
  const h = harness(t);
  let finishResume;
  h.context.resume = () => new Promise((resolve) => { finishResume = resolve; });
  const started = h.engine.play();
  h.engine.close();
  finishResume();
  assert.equal(await started, false);
  assert.equal(await h.engine.play(), false);
  h.engine.close();
  assert.equal(h.context.closeCalls, 1);
  assert.equal(h.context.listeners.size, 0);
  assert.ok(h.context.nodes.every((node) => node.disconnected));
  t.mock.timers.tick(20_000);
  assert.equal(h.context.oscillators.length, 0);
});

test('scheduler bounds active voices and skips a throttled timer backlog', async (t) => {
  const h = harness(t);
  await h.engine.play();
  let maxActive = 0;
  for (let quarter = 1; quarter < 500; quarter++) {
    h.context.advance(quarter / 4);
    t.mock.timers.tick(250);
    maxActive = Math.max(maxActive, h.context.oscillators.filter((node) => !node.disconnected).length);
  }
  assert.ok(maxActive <= 14, `active voices remain bounded: ${maxActive}`);
  assert.ok(h.context.oscillators.length > 80, 'composition continues across several loops');
  const before = h.context.oscillators.length;
  h.context.advance(10_000);
  t.mock.timers.tick(250);
  assert.equal(h.context.oscillators.length - before, 7, 'delayed timer schedules one new phrase');
  assert.ok(h.context.oscillators.slice(before).every((node) => node.starts[0] > 10_000));
  h.engine.close();
  assert.ok(h.context.nodes.every((node) => node.disconnected));
  assert.ok(h.context.oscillators.every((node) => node.onended === null));
});

test('volume stays bounded and zero volume is a real mute', async (t) => {
  const h = harness(t);
  h.engine.setVolume(5);
  await h.engine.play();
  assert.equal(h.context.output.gain.events.at(-1)[1], 0.42);
  h.engine.setVolume(0);
  assert.equal(h.context.output.gain.events.at(-1)[1], 0);
  h.engine.setVolume(-1);
  assert.equal(h.context.output.gain.events.at(-1)[1], 0);
  h.engine.setVolume(Number.NaN);
  assert.equal(h.context.output.gain.events.at(-1)[1], 0);
});

test('system interruption pauses scheduling until another explicit play', async (t) => {
  const h = harness(t);
  await h.engine.play();
  h.context.changeState('suspended');
  h.context.advance(100);
  t.mock.timers.tick(1000);
  assert.deepEqual(h.states, ['playing', 'paused']);
  assert.equal(h.context.oscillators.length, 7);
  assert.equal(h.context.resumeCalls, 1);
});

test('composition is finite, spacious, and alternates its melody register', () => {
  assert.equal(midiFrequency(69), 440);
  assert.ok(AMBIENT_PHRASE_SECONDS > 8 && AMBIENT_PHRASE_SECONDS < 9);
  for (let index = 0; index < 16; index++) {
    const notes = ambientPhrase(index);
    assert.equal(notes.length, 7);
    assert.equal(notes.filter((note) => note.kind === 'bell').length, 2);
    assert.ok(notes.every((note) => Number.isFinite(note.midi) && note.offset >= 0 && note.duration > 3));
    assert.ok(notes.every((note) => Math.abs(note.pan) <= 0.3));
  }
  assert.equal(ambientPhrase(0).find((note) => note.kind === 'bell').midi - ambientPhrase(4).find((note) => note.kind === 'bell').midi, 12);
});

test('private and personal routes exclude music without excluding product pages', () => {
  for (const route of ['/for-ameliante', '/for-ameliante/', '/for-ameliante/note/', '/elevenward/admin', '/elevenward/admin/', '/elevenward/admin/account/']) {
    assert.equal(allowsAmbientMusic(route), false, route);
  }
  for (const route of ['/', '/work/', '/noctara/', '/elevenward/', '/elevenward/privacy/es/', '/for-ameliante-extra/']) {
    assert.equal(allowsAmbientMusic(route), true, route);
  }
});
