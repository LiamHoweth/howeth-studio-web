import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../lib/scroll/calmWheel.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const calm = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const { CalmScroller, WHEEL_SCALE, MAX_QUEUE, wheelKind, wheelPixels } = calm;

function settle(scroller, max, fps = 60) {
  let position = null, time = 0;
  for (; time < 5 && scroller.active; time += 1 / fps) position = scroller.step(1 / fps, max) ?? position;
  return { position, time };
}

test('a wheel notch covers about 70% of the browser distance and settles quickly', () => {
  const scroller = new CalmScroller();
  scroller.add(100, wheelKind(100, 0), 1000, 10_000, 900);
  const { position, time } = settle(scroller, 10_000);
  assert.equal(position, 1000 + 100 * WHEEL_SCALE);
  assert.ok(WHEEL_SCALE >= 0.6 && WHEEL_SCALE <= 0.8);
  assert.ok(time < 0.6, `settles in ${time.toFixed(2)}s, without a long glide`);
});

test('trackpad deltas follow almost directly, scaled the same', () => {
  const scroller = new CalmScroller();
  let position = 0;
  for (let i = 0; i < 30; i++) {
    scroller.add(12.5, wheelKind(12.5, 0), position, 10_000, 900);
    position = scroller.step(1 / 60, 10_000) ?? position;
  }
  position = settle(scroller, 10_000).position ?? position;
  assert.ok(Math.abs(position - 30 * 12.5 * WHEEL_SCALE) < 1, `trackpad travel ${position}`);
  const lag = new CalmScroller();
  lag.add(12.5, 'precise', 0, 10_000, 900);
  assert.ok(lag.step(1 / 60, 10_000) > 12.5 * WHEEL_SCALE * 0.5, 'more than half of each delta lands within one frame');
});

test('spinning the wheel never builds a long queue, and reversing drops pending travel', () => {
  const scroller = new CalmScroller();
  for (let i = 0; i < 60; i++) scroller.add(120, 'notch', 0, 100_000, 900);
  assert.ok(scroller.target <= 900 * MAX_QUEUE + 1e-9, `queued ${scroller.target}px`);
  scroller.step(1 / 60, 100_000);
  const reached = scroller.step(1 / 60, 100_000);
  scroller.add(-100, 'notch', reached, 100_000, 900);
  assert.ok(scroller.target < reached, 'heads back up at once');
  assert.ok(Math.abs(scroller.target - (reached - 70)) < 1e-6, 'from where the page is, not from the old target');
});

test('targets stay within the page and cancelling stops at once', () => {
  const scroller = new CalmScroller();
  scroller.add(-500, 'notch', 50, 2000, 900);
  assert.equal(scroller.target, 0);
  const end = new CalmScroller();
  end.add(5000, 'notch', 1950, 2000, 900);
  assert.equal(end.target, 2000);
  scroller.cancel();
  assert.equal(scroller.active, false);
  assert.equal(scroller.step(1 / 60, 2000), null);
});

test('wheel deltas are normalised and classified', () => {
  assert.equal(wheelPixels(3, 1, 900), 96);
  assert.equal(wheelPixels(1, 2, 900), 900);
  assert.equal(wheelPixels(53.5, 0, 900), 53.5);
  assert.equal(wheelKind(100, 0), 'notch');
  assert.equal(wheelKind(3, 1), 'notch');
  assert.equal(wheelKind(4.25, 0), 'precise');
  assert.equal(wheelKind(12, 0), 'precise');
});
