import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

// Compile the real modules (pure TypeScript; no GPU or DOM needed).
async function load(path, replacements = {}) {
  let source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(from, to);
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`;
}
const gaitURL = await load('lib/cat/gait.ts');
const viewURL = await load('lib/cat/view.ts');
const routeURL = await load('lib/cat/route.ts', { '"./gait"': JSON.stringify(gaitURL), '"./view"': JSON.stringify(viewURL) });
const walkerURL = await load('lib/cat/walker.ts', { '"./gait"': JSON.stringify(gaitURL) });
const clipsURL = await load('lib/cat/clips.ts', { '"./gait"': JSON.stringify(gaitURL) });
const gait = await import(gaitURL);
const { CAT_SCREEN_UNITS, CAT_FULL_TURN_WIDTH_UNITS, CAT_LANE_INSET, CAMERA_ELEVATION, CAMERA_FOCUS_Y, FEET_BELOW_CENTRE_UNITS, VIEW_UNITS, fitCatToLane } = await import(viewURL);
const route = await import(routeURL);
const { routeAt } = route;
const { CatWalker } = await import(walkerURL);
const clips = await import(clipsURL);

/** Reads the JSON chunk of the shipped GLB (binary glTF 2.0). */
async function readGlb() {
  const bytes = await readFile(new URL('../public/beopity/cat3d/beopity-cat.glb', import.meta.url));
  assert.equal(bytes.readUInt32LE(0), 0x46546c67, 'glTF magic');
  assert.equal(bytes.readUInt32LE(4), 2, 'glTF 2.0');
  const jsonLength = bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(16), 0x4e4f534a, 'JSON chunk first');
  return { bytes, json: JSON.parse(bytes.subarray(20, 20 + jsonLength).toString('utf8')) };
}

const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);

const laneLayout = (overrides = {}) => ({
  viewport: { width: 1440, height: 900 }, anchor: 540,
  lane: { left: 1220, top: 100, width: 180, height: 6000 },
  bands: [{ left: 0, top: 2000, width: 1440, height: 700, target: 0.35, ground: 0.88 }],
  cat: { width: 160, height: 90 }, feet: 40, meander: 900,
  ...overrides,
});

test('band markup fractions parse with defaults for missing or invalid values', () => {
  assert.equal(route.parseFraction('0.3', 0.4), 0.3);
  assert.equal(route.parseFraction('1.7', 0.4), 1, 'clamped into the band');
  assert.equal(route.parseFraction('', 0.88), 0.88);
  assert.equal(route.parseFraction(undefined, 0.88), 0.88);
  assert.equal(route.parseFraction('soon', 0.4), 0.4);
  assert.equal(route.DEFAULT_GROUND, 0.88);
});

test('lane route follows the lane, crosses bands with the paws on the footpath line', () => {
  const layout = laneLayout();
  const band = layout.bands[0];
  const ground = band.top + band.height * band.ground;
  let reachedTarget = false, crossed = 0;
  for (let scroll = 0; scroll < 6000; scroll += 5) {
    const point = routeAt(layout, scroll);
    assert.equal(point.mode, 'lane');
    const overBand = route.bandCover(layout, point.pageY) > 0;
    if (!overBand) assert.ok(point.visible && point.opacity === 1, `visible beside the content at ${scroll}`);
    // Over a band's painted sky and hills the cat only shows out on the footpath.
    if (overBand && point.wander === 0) assert.ok(point.opacity < 1 - route.bandCover(layout, point.pageY) + 1e-9, `hidden over the band scene at ${scroll}`);
    if (point.wander > 0.5) assert.equal(point.opacity, 1, 'fully visible on the footpath');
    if (point.ground === 0) {
      assert.ok(point.x - 80 >= 1220 - 1e-6 && point.x + 80 <= 1400 + 1e-6, `cat stays inside the lane at ${scroll}`);
      assert.ok(point.pageY >= 145 && point.pageY <= 6055, 'cat stays within the lane ends');
    }
    if (point.wander > 0) {
      crossed++;
      // While it walks across the band its paws stay exactly on the painted footpath.
      near(point.pageY + layout.feet, ground, 1e-6, 'paws on the ground line');
      near(point.y + layout.feet, ground - scroll, 1e-6, 'screen paws on the ground line');
      assert.equal(point.ground, 1);
    }
    if (point.wander > 0.999) {
      reachedTarget = true;
      near(point.x, 1440 * 0.35, 1e-6, 'band target x');
    }
  }
  assert.ok(crossed > 20 && reachedTarget, 'crosses to the band target and back');
  // After the band it rejoins the lane and walks on.
  const after = routeAt(layout, ground + 900);
  assert.equal(after.wander, 0); assert.equal(after.ground, 0);
  // At the end the cat waits on the page and scrolls away with it.
  const end = routeAt(layout, 7000);
  assert.equal(end.pageY, 6055); assert.equal(end.y, 6055 - 7000);
});

test('band ground line defaults to 0.88 and targets stay clear of the band edges', () => {
  const layout = laneLayout({ bands: [{ left: 0, top: 2000, width: 1440, height: 600, target: 0, ground: route.DEFAULT_GROUND }] });
  const band = layout.bands[0];
  near(route.groundY(band), 2000 + 600 * 0.88, 1e-9, 'footpath line');
  assert.ok(route.bandTargetX(layout, band) >= layout.cat.width / 2, 'target keeps the whole cat on the band');
  const narrow = { ...band, width: 100 };
  near(route.bandTargetX(layout, narrow), 50, 1e-9, 'narrow bands use their centre');
});

test('phone mode has no lane: the cat waits off-screen and only appears to cross bands', () => {
  const viewport = { width: 390, height: 844 };
  const cat = fitCatToLane(124, 0);
  assert.ok(Math.abs(cat.height - 124) < 1e-9, 'phones keep the requested size without a lane');
  const layout = {
    viewport, anchor: 844 * 0.6,
    lane: { left: 390 - 16, top: 600, width: 0, height: 7000 },
    bands: [{ left: 0, top: 2400, width: 390, height: 560, target: 0.45, ground: 0.88 }],
    cat: { width: cat.width, height: cat.height }, feet: cat.pxPerUnit * FEET_BELOW_CENTRE_UNITS, meander: 1100,
  };
  assert.equal(route.routeMode(layout), 'phone');
  const ground = route.groundY(layout.bands[0]);
  let entered = null, shown = 0, maxWander = 0;
  for (let scroll = 0; scroll < 7000; scroll += 4) {
    const point = routeAt(layout, scroll);
    assert.equal(point.mode, 'phone');
    if (point.wander === 0) {
      assert.equal(point.visible, false, `hidden away from bands at ${scroll}`);
      assert.equal(point.opacity, 0);
      assert.ok(point.x - cat.width / 2 > viewport.width, 'waits past the right edge');
    } else {
      shown++;
      near(point.pageY + layout.feet, ground, 1e-6, 'paws on the band footpath');
      if (!entered) entered = point;
      maxWander = Math.max(maxWander, point.wander);
    }
  }
  assert.ok(shown > 20 && maxWander > 0.999, 'walks all the way to the band target');
  assert.ok(entered.x > viewport.width - 10 && entered.opacity < 1, 'walks in from the right edge, fading in');
  const mid = routeAt(layout, ground - layout.feet - layout.anchor + 0.2 * route.crossingSpan(layout));
  assert.ok(mid.visible && mid.opacity === 1, 'fully visible on the band');
  near(mid.x, route.bandTargetX(layout, layout.bands[0]), 1e-6, 'at the band target');
});

test('the DOM driver reads the new band markup, phones hide the host and the lane collapses', async () => {
  const driver = await readFile(new URL('../components/studio/cat/catDriver.ts', import.meta.url), 'utf8');
  assert.match(driver, /querySelectorAll<HTMLElement>\("\[data-wander\], \[data-cat-wander\]"\)/, 'reads data-wander and legacy data-cat-wander');
  assert.match(driver, /dataset\.wanderGround/, 'reads data-wander-ground');
  assert.match(driver, /dataset\.visible/, 'marks the host hidden off-screen');
  const trail = await readFile(new URL('../components/studio/StudioTrail.tsx', import.meta.url), 'utf8');
  assert.match(trail, /className="trail trail--cat"/);
  const css = await readFile(new URL('../styles/walking-cat.css', import.meta.url), 'utf8');
  const phone = css.slice(css.indexOf('@media (max-width: 760px)'));
  assert.match(phone, /\.trail\.trail--cat \{ --lane: 0px;/, 'no reserved lane on phones');
  assert.match(phone, /\.trail__static-cat \{ display: none; \}/, 'no static lane cat on phones');
  assert.match(css, /\.walking-cat\[data-visible="false"\] \{ visibility: hidden; \}/);
});

const options = { pxPerUnit: 110, elevation: 0.42, snapDistance: 700 };
function walkTo(walker, from, to, steps, x = 0) {
  for (let i = 1; i <= steps; i++) walker.update(x, from + ((to - from) * i) / steps, 1 / 60);
}

test('scrolling down walks toward the visitor and the gait advances with distance', () => {
  const walker = new CatWalker(options);
  walker.place(0, 0);
  walkTo(walker, 0, 600, 60);
  assert.ok(walker.walk > 0.9, 'walking');
  assert.ok(walker.sit < 0.05, 'stood up');
  near(walker.yaw, 0, 0.05, 'facing down the page');
  const ground = 600 / (110 * Math.sin(0.42));
  assert.ok(walker.phase > ground / (gait.BASE_STRIDE * gait.MAX_STRIDE_SCALE) && walker.phase < ground / gait.BASE_STRIDE + 1e-6, 'phase follows distance / stride');
});

test('reversing backs up briefly, then turns round to walk up the page', () => {
  const walker = new CatWalker(options);
  walker.place(0, 0);
  walkTo(walker, 0, 400, 40);
  const phase = walker.phase;
  walkTo(walker, 400, 395, 2);
  assert.ok(walker.phase < phase, 'a small reversal steps backwards');
  near(walker.yaw, 0, 0.1, 'without turning');
  walkTo(walker, 395, 100, 40);
  near(Math.abs(walker.yaw), Math.PI, 0.15, 'turns to walk up the page');
  assert.ok(walker.phase > phase - 1, 'then walks forwards again');
});

test('stopping stands, then sits facing the visitor, then rendering can sleep', () => {
  const walker = new CatWalker(options);
  walker.place(0, 0);
  walkTo(walker, 0, 300, 30, 0);
  walkTo(walker, 300, 0, 30, 0);
  for (let i = 0; i < 20; i++) walker.update(0, 0, 1 / 60);
  assert.ok(walker.walk < 0.3, 'legs settle when scrolling stops');
  assert.ok(walker.sit < 0.1, 'not seated straight away');
  for (let i = 0; i < 400; i++) walker.update(0, 0, 1 / 60);
  assert.equal(walker.sit, 1);
  near(walker.yaw, 0, 0.01, 'faces the visitor when seated');
  assert.equal(walker.moving, false, 'settled');
});

test('long jumps reposition instead of sprinting across the page', () => {
  const walker = new CatWalker(options);
  walker.place(0, 0);
  walker.update(0, 5000, 1 / 60);
  assert.equal(walker.phase, 0);
  assert.equal(walker.speed, 0);
});

const BONES = ['root', 'hips', 'spine_01', 'spine_02', 'spine_03', 'neck', 'head', 'jaw', 'ear_L', 'ear_R',
  'upperarm_L', 'forearm_L', 'hand_L', 'upperarm_R', 'forearm_R', 'hand_R', 'thigh_L', 'shin_L', 'foot_L',
  'thigh_R', 'shin_R', 'foot_R', 'tail_01', 'tail_02', 'tail_03', 'tail_04', 'tail_05', 'tail_06', 'tail_07', 'tail_08'];

test('the shipped GLB has the authored rig, clips and expression morphs the renderer expects', async () => {
  const { bytes, json } = await readGlb();
  assert.ok(bytes.length < 2_500_000, `asset size ${bytes.length}`);
  assert.equal(json.skins.length, 1, 'one skin');
  assert.deepEqual(json.skins[0].joints.map((index) => json.nodes[index].name).sort(), [...BONES].sort(), 'exact bone names');
  const names = json.animations.map((animation) => animation.name);
  for (const clip of Object.values(clips.CLIPS)) assert.ok(names.includes(clip), `clip ${clip}`);
  const targets = json.meshes.flatMap((mesh) => mesh.extras?.targetNames ?? []);
  for (const morph of Object.values(clips.MORPHS)) assert.ok(targets.includes(morph), `morph ${morph}`);
  assert.ok(!(json.extensionsUsed ?? []).some((name) => /draco|meshopt/i.test(name)), 'no extra decoders needed');
  let triangles = 0;
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) triangles += json.accessors[primitive.indices].count / 3;
  assert.ok(triangles < 30_000, `triangle budget: ${triangles}`);
});

test('fitted from its bounds, the cat turns inside the lane and the square canvas', async () => {
  const { json } = await readGlb();
  // Bind-pose bounds of every mesh primitive (metres, +Y up, +Z forward, ground origin).
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) {
    const accessor = json.accessors[primitive.attributes.POSITION];
    for (let axis = 0; axis < 3; axis++) { min[axis] = Math.min(min[axis], accessor.min[axis]); max[axis] = Math.max(max[axis], accessor.max[axis]); }
  }
  let radius = 0;
  for (const x of [min[0], max[0]]) for (const z of [min[2], max[2]]) radius = Math.max(radius, Math.hypot(x, z));
  assert.ok(radius > 0.25 && radius < 0.5, `model radius ${radius} m`);
  // Same rule as catScene.ts: the turning radius fills 94% of the lane envelope.
  const scale = (CAT_FULL_TURN_WIDTH_UNITS / 2) * 0.94 / radius;
  const r = radius * scale;
  const reach = Math.max(...[min[1], max[1]].map((y) => Math.abs((y * scale - CAMERA_FOCUS_Y) * Math.cos(CAMERA_ELEVATION)))) + r * Math.sin(CAMERA_ELEVATION);
  assert.ok(r <= VIEW_UNITS / 2, 'canvas width holds every heading');
  assert.ok(reach <= VIEW_UNITS / 2, `canvas height holds the standing cat: ${reach}`);
  for (const [laneWidth, desiredHeight, viewportWidth] of [[84, 78, 320], [140, 188, 1024], [180, 188, 1024], [240, 190, 1440]]) {
    const cat = fitCatToLane(desiredHeight, laneWidth);
    const pxPerUnit = cat.height / CAT_SCREEN_UNITS;
    const layout = {
      viewport: { width: viewportWidth, height: 900 }, anchor: 540,
      lane: { left: viewportWidth - laneWidth, top: 0, width: laneWidth, height: 6000 },
      bands: [], cat: { width: cat.width, height: cat.height }, feet: pxPerUnit * FEET_BELOW_CENTRE_UNITS, meander: 1100,
    };
    for (let scroll = 0; scroll <= 6000; scroll += 50) {
      const point = routeAt(layout, scroll);
      assert.ok(point.x - r * pxPerUnit >= layout.lane.left && point.x + r * pxPerUnit <= viewportWidth, 'every heading stays in the lane');
    }
    assert.ok(cat.width <= laneWidth - CAT_LANE_INSET * 2);
  }
});

const durations = { walk: 1, idleStand: 4, sitDown: 1.2, idleSit: 5, standUp: 1.2 };
const sum = (mix) => Object.values(mix).reduce((total, clip) => total + clip.weight, 0);

test('clip weights always sum to one and pick walk, stand, sit or a transition', () => {
  const base = { phase: 0, clock: 0, scale: 2.5, sitting: true };
  for (const walk of [0, 0.3, 1]) for (const sit of [0, 0.2, 0.5, 0.95, 1]) for (const sitting of [true, false]) {
    near(sum(clips.clipMix({ ...base, walk, sit, sitting }, durations)), 1, 1e-9, `weights at walk ${walk} sit ${sit}`);
  }
  assert.equal(clips.clipMix({ ...base, walk: 1, sit: 0 }, durations).walk.weight, 1, 'walking');
  assert.equal(clips.clipMix({ ...base, walk: 0, sit: 0 }, durations).idleStand.weight, 1, 'standing idle');
  assert.equal(clips.clipMix({ ...base, walk: 0, sit: 1 }, durations).idleSit.weight, 1, 'seated idle');
  const down = clips.clipMix({ ...base, walk: 0, sit: 0.5, sitting: true }, durations);
  assert.ok(down.sitDown.weight > 0.9 && down.standUp.weight === 0, 'sitting down plays sit_down');
  near(down.sitDown.time, (0.5 / 0.9) * 1.2, 1e-9, 'sit_down is scrubbed by the eased sit value');
  const up = clips.clipMix({ ...base, walk: 0, sit: 0.5, sitting: false }, durations);
  assert.ok(up.standUp.weight > 0.9 && up.sitDown.weight === 0, 'standing up plays stand_up');
  near(clips.clipMix({ ...base, walk: 0, sit: 0.95, sitting: true }, durations).sitDown.time, 1.2, 1e-9, 'clamped at the end of the transition');
});

test('the walk clip is scrubbed by distance so paws keep pace with the page', () => {
  const scale = 2.46;
  const perPhase = clips.walkCyclesPerPhase(scale);
  near(perPhase, gait.BASE_STRIDE / (clips.WALK_STRIDE_METERS * scale), 1e-12, 'authored stride in world units');
  const at = (phase) => clips.clipMix({ phase, walk: 1, sit: 0, sitting: false, clock: 0, scale }, durations).walk.time;
  const step = 0.01;
  near(at(step) - at(0), step * perPhase * durations.walk, 1e-9, 'walk time advances with travelled distance');
  assert.ok(at(-step) > at(0) || at(-step) < durations.walk, 'backing up scrubs backwards and wraps');
  for (let phase = -3; phase < 3; phase += 0.37) { const t = at(phase); assert.ok(t >= 0 && t < durations.walk); }
  assert.equal(clips.wantsIdleFrames(1), false, 'walking frames come from the walker');
  assert.equal(clips.wantsIdleFrames(0), true, 'a settled cat breathes and sways its tail');
});

test('the renderer and shell load the GLB lazily and keep the fallbacks', async () => {
  const scene = await readFile(new URL('../components/studio/cat/catScene.ts', import.meta.url), 'utf8');
  assert.match(scene, /GLTFLoader\(\)\.loadAsync\(CAT_GLB_URL\)/);
  assert.match(scene, /AnimationMixer/);
  assert.match(scene, /setFromObject\(object, true\)/, 'fits from the posed, skinned bounds');
  assert.match(scene, /webglcontextlost/);
  assert.equal(clips.CAT_GLB_URL, '/beopity/cat3d/beopity-cat.glb');
  const shell = await readFile(new URL('../components/studio/WalkingCat.tsx', import.meta.url), 'utf8');
  assert.match(shell, /await whenIdle\(\)/, 'waits for an idle main thread');
  assert.match(shell, /await import\("\.\/cat\/catScene"\)/, 'Three.js stays out of the initial bundle');
  assert.match(shell, /prefers-reduced-motion: reduce/, 'reduced motion keeps the painted cat');
  const driver = await readFile(new URL('../components/studio/cat/catDriver.ts', import.meta.url), 'utf8');
  assert.match(driver, /wantsIdleFrames && onScreen/, 'idle frames only on screen');
});
