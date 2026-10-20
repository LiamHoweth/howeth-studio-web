import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

// Compile the real modules. Bare `three` imports resolve to the installed package.
const threeURL = import.meta.resolve('three');
const utilsURL = import.meta.resolve('three/addons/utils/BufferGeometryUtils.js');
async function load(path, replacements = {}) {
  let source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const [from, to] of Object.entries({ '"three"': JSON.stringify(threeURL), '"three/addons/utils/BufferGeometryUtils.js"': JSON.stringify(utilsURL), ...replacements })) source = source.replaceAll(from, to);
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`;
}
const gaitURL = await load('lib/cat/gait.ts');
const routeURL = await load('lib/cat/route.ts', { '"./gait"': JSON.stringify(gaitURL) });
const walkerURL = await load('lib/cat/walker.ts', { '"./gait"': JSON.stringify(gaitURL) });
const modelURL = await load('components/studio/cat/catModel.ts', { '"@/lib/cat/gait"': JSON.stringify(gaitURL) });
const gait = await import(gaitURL);
const { routeAt } = await import(routeURL);
const { CatWalker } = await import(walkerURL);
const { createCatModel, applyCatPose } = await import(modelURL);
const THREE = await import(threeURL);

const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);

test('two-bone IK reaches its target with the joint pointing back', () => {
  for (const [dz, dy] of [[0, -0.4], [0.14, -0.38], [-0.15, -0.41], [0.2, -0.2]]) {
    const { hip, knee } = gait.solveLeg(dz, dy, 0.25, 0.25, -1);
    const end = gait.legEnd(hip, knee, 0.25, 0.25);
    near(end.z, dz, 1e-6, 'foot z'); near(end.y, dy, 1e-6, 'foot y');
    const joint = { z: 0.25 * Math.sin(hip), y: -0.25 * Math.cos(hip) };
    assert.ok(joint.z < dz * (joint.y / dy), 'joint sits behind the hip-to-foot line');
  }
});

test('lateral-sequence walk lands each foot a quarter cycle apart', () => {
  const offsets = gait.LEGS.map((leg) => gait.WALK_OFFSETS[leg]);
  assert.deepEqual(offsets, [0, 0.25, 0.5, 0.75]);
  // At least two feet are always planted, three at times.
  for (let p = 0; p < 1; p += 0.01) {
    const planted = gait.LEGS.filter((leg) => gait.footTarget(p, gait.WALK_OFFSETS[leg], gait.BASE_STRIDE, 0.08).planted).length;
    assert.ok(planted >= 2 && planted <= 3, `planted feet at phase ${p.toFixed(2)}: ${planted}`);
  }
});

test('planted feet do not slide as the body walks', () => {
  // Advance the body by distance d; a stance foot must move back by d in the body frame.
  const stride = gait.BASE_STRIDE;
  for (let p = 0; p < gait.DUTY - 0.05; p += 0.05) {
    const a = gait.footTarget(p, 0, stride, 0.08);
    const b = gait.footTarget(p + 0.02, 0, stride, 0.08);
    assert.ok(a.planted && b.planted);
    near(a.z - b.z, 0.02 * stride, 1e-9, 'stance travel equals body travel');
    assert.equal(a.y, 0);
  }
  // Swing feet lift and come forward.
  const swing = gait.footTarget(gait.DUTY + (1 - gait.DUTY) / 2, 0, stride, 0.08);
  assert.ok(!swing.planted && swing.y > 0.07);
});

test('full poses keep every foot on or above the ground and within reach', () => {
  const model = createCatModel();
  for (const sit of [0, 0.5, 1]) for (let phase = 0; phase < 1; phase += 0.0625) {
    const pose = gait.computePose({ phase, walk: 1, speed: 1.2, sit, time: phase, look: { x: 0, y: 0 }, blink: 0 });
    applyCatPose(model, pose);
    model.root.updateMatrixWorld(true);
    for (const leg of gait.LEGS) {
      const paw = model.paws[leg].getWorldPosition(new THREE.Vector3());
      assert.ok(paw.y > gait.PAW_RADIUS - 0.012, `${leg} paw above ground (sit ${sit}, phase ${phase}): ${paw.y}`);
      if (pose.legs[leg].planted) near(paw.y, gait.PAW_RADIUS, 0.012, `${leg} planted paw on the ground`);
      assert.ok(Number.isFinite(pose.legs[leg].hip) && Number.isFinite(pose.legs[leg].knee));
    }
  }
  model.dispose();
});

test('route follows the lane, crosses open bands and never leaves the page section', () => {
  const layout = {
    viewport: { width: 1440, height: 900 }, anchor: 540,
    lane: { left: 1220, top: 100, width: 180, height: 6000 },
    bands: [{ left: 40, top: 2000, width: 1360, height: 900, target: 0.35 }],
    cat: { width: 90, height: 150 }, meander: 900,
  };
  for (let scroll = 0; scroll < 6000; scroll += 25) {
    const point = routeAt(layout, scroll);
    if (point.wander === 0) {
      assert.ok(point.x - 45 >= 1220 - 1e-6 && point.x + 45 <= 1400 + 1e-6, `cat body stays inside the lane at ${scroll}`);
    }
    assert.ok(point.pageY >= 175 && point.pageY <= 6025, 'cat stays within the lane ends');
  }
  const crossing = routeAt(layout, 2450 - 540);
  assert.ok(crossing.wander > 0.95 && Math.abs(crossing.x - (40 + 1360 * 0.35)) < 30, 'cat reaches the band target mid-crossing');
  // At the end the cat waits on the page and scrolls away with it.
  const end = routeAt(layout, 7000);
  assert.equal(end.pageY, 6025); assert.equal(end.y, 6025 - 7000);
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

test('procedural model has a full rig within budget and disposes everything', () => {
  const model = createCatModel();
  let triangles = 0, meshes = 0;
  const geometries = new Set(), materials = new Set();
  model.root.traverse((object) => {
    if (!object.isMesh && !object.isLineSegments) return;
    meshes++;
    geometries.add(object.geometry);
    for (const material of [object.material].flat()) materials.add(material);
    const index = object.geometry.index;
    triangles += (index ? index.count : object.geometry.getAttribute('position').count) / 3;
  });
  assert.equal(Object.keys(model.paws).length, 4, 'four legs');
  assert.equal(model.tail.length, gait.TAIL_SEGMENTS, 'segmented tail');
  assert.ok(model.head && model.eyes.length === 2, 'head with two eyes');
  assert.ok(triangles < 60_000, `triangle budget: ${triangles}`);
  assert.ok(meshes < 90, `draw-call budget: ${meshes}`);
  let disposedGeometries = 0, disposedMaterials = 0;
  for (const g of geometries) g.addEventListener('dispose', () => disposedGeometries++);
  for (const m of materials) m.addEventListener('dispose', () => disposedMaterials++);
  model.dispose();
  assert.equal(disposedGeometries, geometries.size, 'all geometries released');
  assert.equal(disposedMaterials, materials.size, 'all materials released');
});
