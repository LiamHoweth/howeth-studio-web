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
const viewURL = await load('lib/cat/view.ts');
const local = { '"./gait"': JSON.stringify(gaitURL), '"./view"': JSON.stringify(viewURL) };
const routeURL = await load('lib/cat/route.ts', local);
const walkerURL = await load('lib/cat/walker.ts', local);
const motionURL = await load('lib/cat/motion.ts', local);
const companionURL = await load('lib/cat/companion.ts', { ...local, '"./route"': JSON.stringify(routeURL), '"./walker"': JSON.stringify(walkerURL), '"./motion"': JSON.stringify(motionURL) });
const modelURL = await load('components/studio/cat/catModel.ts', { '"@/lib/cat/gait"': JSON.stringify(gaitURL) });
const gait = await import(gaitURL);
const view = await import(viewURL);
const route = await import(routeURL);
const { CatWalker } = await import(walkerURL);
const { CatMotion, WALK_LIMITS } = await import(motionURL);
const { CatCompanion, MAX_CATCH_UP } = await import(companionURL);
const { createCatModel, applyCatPose } = await import(modelURL);
const THREE = await import(threeURL);

const { CAT_ENVELOPE, CAMERA_ELEVATION } = view;
const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);
const wrap = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

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
    const pose = gait.computePose({ phase, walk: 1, speed: gait.MAX_WALK_SPEED, sit, time: phase, look: { x: 0, y: 0 }, blink: 0 });
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

test('the cadence cap bounds the fastest walk and stride grows with speed', () => {
  near(gait.MAX_WALK_SPEED, gait.MAX_CADENCE * gait.strideFor(gait.MAX_WALK_SPEED), 1e-9, 'top speed walks at the cadence cap');
  assert.ok(gait.MAX_CADENCE <= 1.2, 'about one gait cycle per second');
  for (let speed = 0.02; speed <= gait.MAX_WALK_SPEED; speed += 0.02) {
    assert.ok(speed / gait.strideFor(speed) <= gait.MAX_CADENCE + 1e-9, `cadence at ${speed}`);
    assert.ok(gait.strideFor(speed) >= gait.strideFor(speed - 0.02), 'stride never shortens as speed rises');
  }
});

// Convex hull of (x, z) points: its support function gives the exact half-width at any yaw.
function hull(points) {
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of points) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop(); lower.push(p); }
  for (let i = points.length - 1; i >= 0; i--) { const p = points[i]; while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop(); upper.push(p); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

test('the complete rendered silhouette stays inside the envelope the route reserves', () => {
  const model = createCatModel();
  const vertex = new THREE.Vector3(), scale = new THREE.Vector3();
  const focus = 0.55, cos = Math.cos(CAMERA_ELEVATION), sin = Math.sin(CAMERA_ELEVATION);
  const yaws = Array.from({ length: 72 }, (_, i) => (i / 72) * Math.PI * 2);
  try {
    for (const sit of [0, 0.02, 0.5, 0.8, 0.92, view.SIT_TURN, 1]) for (const walk of [0, 1]) for (const speed of [gait.MAX_WALK_SPEED]) for (const phase of [0, 0.25, 0.5, 0.75]) for (const look of [-1, 1]) {
      applyCatPose(model, gait.computePose({ phase, walk, speed, sit, time: phase * 9 + look, look: { x: look, y: -look }, blink: 0 }));
      model.root.updateMatrixWorld(true);
      const points = [], solid = [];
      model.root.traverse((object) => {
        if (!object.isMesh && !object.isLineSegments) return;
        const positions = object.geometry.getAttribute('position');
        object.getWorldScale(scale);
        // The outline shader pushes normalized (possibly skinned) normals out
        // before the world transform; its maximum displacement bounds all normals.
        const outline = (object.material.uniforms?.uThickness?.value || 0) * Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z));
        for (let index = 0; index < positions.count; index++) {
          vertex.fromBufferAttribute(positions, index);
          if (object.isSkinnedMesh) object.applyBoneTransform(index, vertex);
          vertex.applyMatrix4(object.matrixWorld);
          points.push([vertex.x + outline, vertex.z], [vertex.x - outline, vertex.z], [vertex.x, vertex.z + outline], [vertex.x, vertex.z - outline]);
          solid.push([vertex.x, vertex.y, vertex.z, outline]);
        }
      });
      // Contact shadow (turns with the cat) and lantern glow (fixed) on the ground.
      const shadow = { x: (view.CAT_SHADOW.size / 2) * view.CAT_SHADOW.falloff / view.CAT_SHADOW.stretch[0], z: (view.CAT_SHADOW.size / 2) * view.CAT_SHADOW.falloff / view.CAT_SHADOW.stretch[1] };
      for (const [x, z] of [[shadow.x, 0], [-shadow.x, 0], [0, shadow.z], [0, -shadow.z]]) { points.push([x, z]); solid.push([x, 0, z, 0]); }
      const outline = hull(points);
      for (const yaw of yaws) {
        const c = Math.cos(yaw), s = Math.sin(yaw);
        let half = view.CAT_GLOW.radius;
        for (const [x, z] of outline) half = Math.max(half, Math.abs(x * c + z * s));
        const sideways = Math.abs(s);
        const label = `sit ${sit} walk ${walk} yaw ${(yaw * 180 / Math.PI).toFixed(0)}°: ${half.toFixed(3)}`;
        if (sit <= 0.02) assert.ok(half <= view.catHalfWidth(sideways) + 1e-9, `standing ${label}`);
        else if (sit >= view.SIT_TURN) assert.ok(half <= CAT_ENVELOPE.seated + 1e-9, `seated pivot ${label}`);
        // The walker only sits down or stands up square-on.
        else if (sideways <= view.FACING_SIDEWAYS) assert.ok(half <= view.catHalfWidth(sideways) + 1e-9, `sitting down ${label}`);
      }
      for (const yaw of yaws.filter((_, i) => i % 6 === 0)) {
        const c = Math.cos(yaw), s = Math.sin(yaw);
        for (const [x, y, z, outlineWidth] of solid) {
          const screenY = (y - focus) * cos - (-x * s + z * c) * sin;
          assert.ok(screenY + outlineWidth <= CAT_ENVELOPE.above && screenY - outlineWidth >= -CAT_ENVELOPE.below, `vertical extent at sit ${sit}: ${screenY}`);
        }
      }
      // The glow disc's far edge, foreshortened.
      assert.ok((0 - focus) * cos - view.CAT_GLOW.radius * sin >= -CAT_ENVELOPE.below, 'glow stays inside the envelope');
    }
  } finally { model.dispose(); }
});

// Lanes as the stylesheet lays them out: [viewport, lane width, right page margin, edge, desired height],
// then the previous lane width and desired height at that viewport.
const LANES = {
  compact: [320, 88, 0, 2, 100, 84, 78],
  phone: [390, 88, 0, 2, 100, 84, 78],
  tablet: [820, 190, 33, 8, 170, 180, 140],
  desktop: [1440, 245, 48, 8, 196, 216, 188],
};
function oldPxPerUnit(laneWidth, desiredHeight) {
  // The previous fit: a fixed 2.2-unit turning width inside the lane only.
  return Math.min(desiredHeight / 1.22, (laneWidth - 8) / 2.2);
}
function laneLayout(name, overrides = {}) {
  const [width, lane, margin, edge, desired] = LANES[name];
  const left = width - margin - lane;
  const right = width - edge;
  const fit = view.fitCat(desired, right - left);
  return {
    fit,
    layout: {
      viewport: { width, height: 844 }, anchor: 500,
      lane: { left, top: 100, width: lane, height: 6000 }, right,
      bands: [], obstacles: [], pxPerUnit: fit.pxPerUnit, laneSideways: fit.sideways,
      elevation: CAMERA_ELEVATION, meander: 1100, ...overrides,
    },
  };
}

test('the cat is at least 1.5x its previous size at every width while its silhouette fits the lane', () => {
  for (const name of Object.keys(LANES)) {
    const [, , , , , oldLane, oldDesired] = LANES[name];
    const { fit, layout } = laneLayout(name);
    const growth = fit.pxPerUnit / oldPxPerUnit(oldLane, oldDesired);
    assert.ok(growth >= 1.5 && growth <= 2.05, `${name} grows ${growth.toFixed(2)}x`);
    const built = route.buildRoute(layout);
    for (let i = 0; i < built.pageY.length; i++) {
      assert.equal(built.clear[i], 1, `${name} lane sample ${i} is clear`);
      const half = fit.freeTurn ? CAT_ENVELOPE.turning : Math.max(view.catHalfWidth(fit.sideways), CAT_ENVELOPE.seated);
      const box = route.catBox(layout, built.x[i], built.pageY[i], half, 0);
      assert.ok(box.left >= layout.lane.left + view.CONTENT_EDGE + view.catClearance(fit.pxPerUnit) - 1e-6, `${name} keeps clear of the content column and its focus rings`);
      assert.ok(box.right <= layout.right + 1e-6, `${name} stays inside the viewport`);
    }
  }
  assert.equal(laneLayout('desktop').fit.freeTurn, true, 'desktop has room to turn standing');
  assert.equal(laneLayout('phone').fit.freeTurn, false, 'phones sit to turn round');
});

function boxHits(box, rect) {
  return box.left < rect.left + rect.width && box.right > rect.left && box.top < rect.top + rect.height && box.bottom > rect.top;
}
/** Every clear sample (and the swept path between them) misses every obstacle. */
function assertRouteClear(built, label) {
  const { layout } = built;
  assert.ok(route.ROUTE_STEP <= view.catClearance(layout.pxPerUnit), 'samples are closer together than the clearance, so the sweep between them is covered');
  for (let i = 0; i < built.pageY.length; i++) {
    if (!built.clear[i]) continue;
    const allowance = built.allowance[i];
    const half = Math.max(view.catHalfWidth(Math.abs(Math.sin(built.heading[i]))), allowance >= 0.999 ? CAT_ENVELOPE.turning : Math.max(view.catHalfWidth(allowance), CAT_ENVELOPE.seated));
    const box = route.catBox(layout, built.x[i], built.pageY[i], half, 0);
    for (const rect of layout.obstacles) assert.ok(!boxHits(box, rect), `${label}: sample ${i} at y ${built.pageY[i].toFixed(0)} touches content`);
  }
}

test('cards and links that end at the lane edge, focus rings included, leave the lane walkable', () => {
  for (const name of Object.keys(LANES)) {
    const { layout } = laneLayout(name);
    const ring = 7;
    const cards = Array.from({ length: 12 }, (_, i) => ({ left: 16 - ring, top: 300 + i * 420, width: layout.lane.left - 16 + 2 * ring, height: 330 + 2 * ring }));
    const built = route.buildRoute({ ...layout, obstacles: cards });
    assert.equal(built.blockedBefore.at(-1), 0, `${name}: nothing blocked beside a column of cards`);
    assertRouteClear(built, `${name} cards`);
  }
});

test('crossings of open ground are taken only when the whole way is clear of content', () => {
  const { layout } = laneLayout('desktop');
  const content = layout.lane.left;
  // An interlude: statement on the left, open ground on the right.
  const statement = { left: 48, top: 2000, width: 520, height: 300 };
  const ground = { left: 600, top: 1900, width: content - 600, height: 900, target: 0.4 };
  // Copy above the interlude ends before its full-bleed section begins.
  const paragraphs = Array.from({ length: 28 }, (_, i) => ({ left: 48, top: 200 + i * 60, width: content - 60, height: 24 }));
  const open = route.buildRoute({ ...layout, bands: [ground], obstacles: [statement, ...paragraphs] });
  assert.equal(open.crossings.length, 1, 'clear ground is crossed');
  assert.ok(Math.max(...open.wander) > 0.95, 'the crossing reaches its target');
  assertRouteClear(open, 'open ground');
  assert.equal(open.blockedBefore.at(-1), 0, 'nothing blocked');

  // Enlarged text spills a line into the ground: the crossing is dropped.
  const spill = { left: 48, top: 2350, width: 720, height: 70 };
  const crowded = route.buildRoute({ ...layout, bands: [ground], obstacles: [statement, spill, ...paragraphs] });
  assert.equal(crowded.crossings.length, 0, 'a crossing that would touch text is not taken');
  assert.equal(Math.max(...crowded.wander), 0);
  assertRouteClear(crowded, 'crowded ground');
});

test('beside a slightly intruding card a wide lane narrows to square-on walking instead of blocking', () => {
  const { layout } = laneLayout('desktop');
  // A tilted card's corner pokes past the content column, beyond the focus-ring inset.
  const card = { left: 660, top: 120, width: layout.lane.left - 660 + 16, height: 500 };
  const built = route.buildRoute({ ...layout, obstacles: [card] });
  assertRouteClear(built, 'tilted card');
  assert.equal(built.blockedBefore.at(-1), 0, 'nothing blocked');
  const beside = route.indexAtY(built, 400), below = route.indexAtY(built, 1500);
  assert.ok(built.allowance[beside] < 1, 'beside the card it sits to turn round');
  assert.equal(built.allowance[below], 1, 'and turns standing once past it');
});

test('content that intrudes on the lane blocks it; the cat waits beside it and never walks through', () => {
  const { layout } = laneLayout('phone');
  // A long unbreakable word overflowing into the lane at enlarged text sizes.
  const overflow = { left: layout.lane.left - 40, top: 3000, width: 70, height: 60 };
  const built = route.buildRoute({ ...layout, obstacles: [overflow] });
  assertRouteClear(built, 'overflow');
  const blockedYs = Array.from(built.pageY).filter((_, i) => !built.clear[i]);
  assert.ok(blockedYs.length > 0, 'the overflow blocks part of the lane');
  const above = route.sAtY(built, 2000);
  const plan = route.destination(built, 4500, above);
  assert.ok(plan.beyond !== null, 'the wanted spot lies beyond the block');
  assert.ok(route.pathClear(built, above, plan.walk), 'it only walks where the path is clear');
  assert.ok(route.pointAt(built, plan.walk).pageY < Math.min(...blockedYs), 'and waits short of the block');
  assert.ok(route.isClearAt(built, plan.beyond), 'its reappearance spot is clear');
});

test('motion is bounded in speed and acceleration and stops at its destination without overshoot', () => {
  const motion = new CatMotion();
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let target = 0, previousV = 0;
  for (let frame = 0; frame < 6000; frame++) {
    if (frame % 17 === 0) target = (random() - 0.3) * 40; // violent, frequent reversals
    const dt = random() < 0.05 ? 0.25 + random() : 1 / 60 + random() * 0.02; // dropped frames
    const before = motion.s;
    motion.step(target, dt, WALK_LIMITS);
    const step = Math.min(dt, 0.1);
    assert.ok(Math.abs(motion.v) <= WALK_LIMITS.maxSpeed + 1e-9, `speed ${motion.v}`);
    assert.ok(Math.abs(motion.v - previousV) <= WALK_LIMITS.accel * step + 1e-9, 'acceleration bounded');
    assert.ok(Math.abs(motion.s - before) <= WALK_LIMITS.maxSpeed * step + 1e-9, 'position change bounded by elapsed time');
    previousV = motion.v;
  }
  const settle = new CatMotion();
  for (let i = 0; i < 600; i++) {
    settle.step(1, 1 / 60, WALK_LIMITS);
    assert.ok(settle.s <= 1 + 1e-9, 'never passes the destination');
  }
  near(settle.s, 1, 0.005, 'arrives'); assert.equal(settle.v, 0, 'and stops');
});

const options = { pxPerUnit: 110, elevation: CAMERA_ELEVATION };
function walkTo(walker, from, to, steps, intent = { allowance: 1, face: null }, x = 0) {
  for (let i = 1; i <= steps; i++) walker.update(x, from + ((to - from) * i) / steps, 1 / 60, intent);
}

test('gait phase follows distance walked and never exceeds the cadence cap', () => {
  const walker = new CatWalker(options);
  walker.place(0, 0); walker.sit = 0;
  walkTo(walker, 0, 300, 600);
  const ground = 300 / (110 * Math.sin(CAMERA_ELEVATION));
  assert.ok(walker.phase > ground / (gait.BASE_STRIDE * gait.MAX_STRIDE_SCALE) - 1e-6 && walker.phase < ground / gait.BASE_STRIDE + 1e-6, 'phase follows distance / stride');
  // Even if fed an impossible jump per frame, the legs never scurry.
  walker.update(0, 900, 1 / 60, { allowance: 1, face: null });
  assert.ok(walker.cadence <= gait.MAX_CADENCE + 1e-9, `cadence ${walker.cadence}`);
});

function assertPosture(walker, allowance, label) {
  const sideways = Math.abs(Math.sin(walker.yaw));
  if (walker.sit <= 0.02) assert.ok(sideways <= allowance + 1e-6, `${label}: standing sideways ${sideways.toFixed(3)} in allowance ${allowance}`);
  else if (walker.sit < view.SIT_TURN) assert.ok(sideways <= view.FACING_SIDEWAYS + 1e-6, `${label}: sat down or stood up while sideways (${sideways.toFixed(3)})`);
}

test('in a narrow lane the cat sits, pivots and stands to turn round, never turning standing', () => {
  const allowance = view.NARROW_SIDEWAYS;
  const walker = new CatWalker(options);
  walker.place(0, 0); walker.sit = 0; walker.yaw = 0;
  walkTo(walker, 0, 200, 120, { allowance, face: null });
  let sawPivot = false;
  for (let i = 0; i < 400 && !walker.ready(Math.PI); i++) {
    walker.update(0, 200, 1 / 60, { allowance, face: Math.PI });
    assertPosture(walker, allowance, 'narrow reversal');
    if (walker.sit >= view.SIT_TURN && Math.abs(Math.sin(walker.yaw)) > allowance) sawPivot = true;
  }
  assert.ok(sawPivot, 'turned while seated');
  assert.ok(walker.ready(Math.PI), 'stands facing up the page, ready to walk');
  walkTo(walker, 200, 50, 120, { allowance, face: null });
  near(Math.abs(wrap(walker.yaw)), Math.PI, 0.1, 'walks up the page');
  // Idle: sits and turns to face the visitor, still within the narrow lane.
  for (let i = 0; i < 600; i++) { walker.update(0, 50, 1 / 60, { allowance, face: null }); assertPosture(walker, allowance, 'narrow settle'); }
  assert.equal(walker.sit, 1); near(walker.yaw, 0, 0.01, 'faces the visitor');
  assert.equal(walker.moving, false, 'settled, so rendering can sleep');
});

test('with room, the cat turns round standing and stepping, then sits only once square-on', () => {
  const walker = new CatWalker(options);
  walker.place(0, 0); walker.sit = 0; walker.yaw = 0;
  walkTo(walker, 0, 200, 120);
  const phase = walker.phase;
  for (let i = 0; i < 200 && !walker.ready(Math.PI); i++) {
    walker.update(0, 200, 1 / 60, { allowance: 1, face: Math.PI });
    assert.ok(walker.sit <= 0.02, 'stays on its feet');
  }
  assert.ok(walker.ready(Math.PI), 'turned round');
  assert.ok(walker.phase !== phase, 'paws step round during the turn');
  // Stop while walking sideways across open ground: it squares up before sitting.
  walker.yaw = Math.PI / 2;
  for (let i = 0; i < 600; i++) { walker.update(0, 200, 1 / 60, { allowance: 1, face: null }); assertPosture(walker, 1, 'open-ground settle'); }
  assert.equal(walker.sit, 1); near(walker.yaw, 0, 0.01, 'faces the visitor');
});

// A synthetic page: a phone-width lane with one band of open ground and paragraphs beside it.
function pageRoute(name = 'phone') {
  const { layout, fit } = laneLayout(name);
  layout.anchor = 500;
  const content = layout.lane.left;
  const obstacles = Array.from({ length: 80 }, (_, i) => ({ left: 16, top: 150 + i * 70, width: content - 16 - 4, height: 28 })).filter((rect) => rect.top < 2600 || rect.top > 3500);
  const bands = [{ left: 16, top: 2700, width: content - 16, height: 700, target: 0.4 }];
  const full = { ...layout, bands, obstacles };
  return { built: route.buildRoute(full), fit };
}

function simulate(scrollAt, seconds, { name = 'phone', fps = 60, chrome = [] } = {}) {
  const { built, fit } = pageRoute(name);
  const companion = new CatCompanion(built, { pxPerUnit: fit.pxPerUnit, elevation: CAMERA_ELEVATION });
  const frames = [];
  let scrollY = scrollAt(0), lastScroll = scrollY, scrolledAt = 0;
  for (let t = 0; t <= seconds; t += 1 / fps) {
    const dt = scrollAt.dt?.(t) ?? 1 / fps;
    scrollY = scrollAt(t);
    if (scrollY !== lastScroll) { scrolledAt = t; lastScroll = scrollY; }
    const before = { s: companion.motion.s, phase: companion.walker.phase };
    const state = companion.update({ scrollY, dt, sinceScroll: t - scrolledAt, chrome });
    frames.push({ t, dt, scrollY, state, before, s: companion.motion.s, v: companion.motion.v, phase: companion.walker.phase, cadence: companion.walker.cadence, sit: companion.walker.sit, yaw: companion.walker.yaw, walk: companion.walker.walk });
  }
  return { frames, built, companion };
}

function assertCalm(frames, built, label) {
  const ppu = built.layout.pxPerUnit, height = built.layout.viewport.height;
  const offscreen = (y) => y + CAT_ENVELOPE.below * ppu < 0 || y - CAT_ENVELOPE.above * ppu > height;
  let previous = null;
  for (const frame of frames) {
    const step = Math.min(frame.dt, 0.1);
    assert.ok(route.isClearAt(built, frame.s), `${label}: cat on a clear stretch at t=${frame.t.toFixed(2)}`);
    if (frame.state.jumped) {
      assert.ok(previous === null || previous.state.opacity <= 0.01 || offscreen(previous.state.y), `${label}: repositioned only while invisible (t=${frame.t.toFixed(2)})`);
      assert.equal(frame.phase, frame.before.phase, `${label}: a reposition is not walked`);
    } else {
      assert.ok(Math.abs(frame.s - frame.before.s) <= WALK_LIMITS.maxSpeed * step + 1e-9, `${label}: no sprint at t=${frame.t.toFixed(2)}`);
      assert.ok(frame.cadence <= gait.MAX_CADENCE + 1e-9, `${label}: cadence ${frame.cadence.toFixed(2)} at t=${frame.t.toFixed(2)}`);
      if (previous && !previous.state.jumped) assert.ok(Math.abs(frame.v - previous.v) <= WALK_LIMITS.accel * step + 1e-9, `${label}: no jolt at t=${frame.t.toFixed(2)}`);
    }
    previous = frame;
  }
}

test('slow reading-pace scrolling is walked calmly and the cat stops when scrolling stops', () => {
  const scroll = (t) => Math.min(t, 20) * 30;
  const { frames, built } = simulate(scroll, 32, { name: 'desktop' });
  assertCalm(frames, built, 'slow');
  assert.ok(!frames.slice(1).some((frame) => frame.state.jumped), 'never needs to reposition');
  // On a phone the smaller cat walks fewer px per second; it falls behind and
  // only reappears near the visitor once scrolling has settled.
  const phone = simulate(scroll, 32);
  assertCalm(phone.frames, phone.built, 'slow phone');
  for (const frame of phone.frames.slice(1)) if (frame.state.jumped) assert.ok(frame.t > 20.3, `phone repositions only after scrolling stops (t=${frame.t.toFixed(2)})`);
  assert.ok(frames.some((frame) => frame.walk > 0.9), 'it walks');
  const end = frames.at(-1);
  assert.equal(end.v, 0, 'stopped');
  assert.equal(end.sit, 1, 'sat down');
  assert.equal(end.state.active, false, 'rendering can sleep');
});

test('aggressive scrolling, reversals, page jumps and dropped frames never make it sprint or queue a long catch-up', () => {
  const patterns = {
    fling: (t) => (t < 2 ? t * 2500 : 5000),
    reversals: (t) => 2000 + Math.sin(Math.min(t, 6) * 9) * 600 + Math.min(t, 6) * 40,
    pageDown: (t) => Math.min(6, Math.floor(t * 2)) * 760,
    endThenHome: (t) => (t < 1 ? 0 : t < 4 ? 5600 : 0),
  };
  const dropped = Object.assign((t) => (t < 3 ? t * 900 : 2700), { dt: (t) => (Math.floor(t * 60) % 40 === 0 ? 0.5 : 1 / 60) });
  for (const [label, scroll] of [...Object.entries(patterns), ['dropped', dropped]]) {
    const { frames, built } = simulate(scroll, 14);
    assertCalm(frames, built, label);
    const end = frames.at(-1);
    const stillSince = frames.findLastIndex((frame) => frame.scrollY !== end.scrollY) + 1;
    const settledAt = frames.findIndex((frame, i) => i >= stillSince && frame.v === 0 && Math.abs(frame.state.pageY - (end.scrollY + 500)) < 844 * 0.1);
    assert.ok(settledAt >= 0, `${label}: the cat comes back to the visitor`);
    assert.ok(frames[settledAt].t - frames[stillSince].t <= MAX_CATCH_UP + 1.5, `${label}: catches up within ${(frames[settledAt].t - frames[stillSince].t).toFixed(2)}s`);
  }
});

test('on a short viewport the cat rests in the open stage above the music player', () => {
  const { layout, fit } = laneLayout('phone');
  // A phone zoomed to 200%: 195 x 422 CSS px with the player across the bottom.
  const small = { ...layout, viewport: { width: 195, height: 422 }, anchor: 422 * 0.58, lane: { ...layout.lane, left: 107 }, right: 193 };
  const companion = new CatCompanion(route.buildRoute(small), { pxPerUnit: fit.pxPerUnit, elevation: CAMERA_ELEVATION });
  const player = { left: 22, right: 173, top: 295, bottom: 400 };
  const header = { left: 0, right: 195, top: 0, bottom: 60 };
  let state;
  for (let t = 0; t < 8; t += 1 / 60) state = companion.update({ scrollY: 600, dt: 1 / 60, sinceScroll: 5, chrome: [header, player] });
  const ppu = fit.pxPerUnit;
  assert.ok(state.y + CAT_ENVELOPE.below * ppu <= player.top, 'clear of the player');
  assert.ok(state.y - CAT_ENVELOPE.above * ppu >= header.bottom, 'clear of the header');
  assert.equal(state.opacity, 1, 'and visible');
  // Even shorter (a compact phone at 200%): no room between header and player, so it stays hidden.
  const tiny = new CatCompanion(route.buildRoute({ ...small, viewport: { width: 160, height: 320 }, anchor: 320 * 0.58 }), { pxPerUnit: fit.pxPerUnit, elevation: CAMERA_ELEVATION });
  for (let t = 0; t < 4; t += 1 / 60) state = tiny.update({ scrollY: 600, dt: 1 / 60, sinceScroll: 5, chrome: [header, { left: 22, right: 138, top: 193, bottom: 298 }] });
  assert.equal(state.opacity, 0, 'no room: out of sight');
});

test('a re-measure mid-walk (fonts, filtering, resize) keeps the cat in place and at pace', () => {
  const { layout, fit } = laneLayout('phone');
  const companion = new CatCompanion(route.buildRoute(layout), { pxPerUnit: fit.pxPerUnit, elevation: CAMERA_ELEVATION });
  let t = 0;
  for (; t < 5; t += 1 / 60) companion.update({ scrollY: t * 30, dt: 1 / 60, sinceScroll: 0, chrome: [] });
  const before = { v: companion.motion.v, pageY: companion.point.pageY };
  assert.ok(before.v > 0.1, 'walking when the layout changes');
  // Text grows above the lane, pushing the whole route down by 40px.
  companion.setRoute(route.buildRoute({ ...layout, lane: { ...layout.lane, top: layout.lane.top + 40 } }));
  near(companion.point.pageY, before.pageY, 1e-6, 'the cat stays exactly where it stands on the page');
  const state = companion.update({ scrollY: t * 30, dt: 1 / 60, sinceScroll: 0, chrome: [] });
  assert.equal(state.jumped, false);
  assert.ok(Math.abs(companion.motion.v - before.v) <= WALK_LIMITS.accel / 60 + 1e-9, 'no jolt');
});

test('notched reading-pace scrolling does not make a visible cat blink in and out', () => {
  // A wheel notch every 380ms: the page pauses briefly between notches.
  const notched = (t) => Math.min(Math.floor(t / 0.38), 14) * 70 + Math.min(1, (t % 0.38) / 0.25) * (t < 14 * 0.38 ? 70 : 0);
  const { frames, built } = simulate(notched, 12, { name: 'desktop' });
  assertCalm(frames, built, 'notched');
  const reading = frames.filter((frame) => frame.t > 0.1 && frame.t < 14 * 0.38);
  assert.ok(!reading.some((frame) => frame.state.jumped && frame.before && frame.state.opacity > 0), 'no visible reposition while the visitor keeps scrolling');
});

test('the cat fades rather than sitting under the header or the music player', () => {
  // Scrolling up quickly leaves the cat behind, lower down the screen, until it reaches the player.
  const player = { left: 30, right: 380, top: 640, bottom: 822 };
  const { frames, built } = simulate((t) => (t < 3 ? 3000 - t * 200 : 2400), 10, { chrome: [player] });
  const ppu = built.layout.pxPerUnit;
  let hidden = 0;
  for (const frame of frames) {
    const { x, y, opacity } = frame.state;
    const under = x + CAT_ENVELOPE.turning * ppu > player.left && x - CAT_ENVELOPE.turning * ppu < player.right && y + CAT_ENVELOPE.below * ppu > player.top && y - CAT_ENVELOPE.above * ppu < player.bottom;
    if (under) {
      assert.ok(opacity < 1, `fading under the player at t=${frame.t.toFixed(2)}`);
      if (opacity === 0) hidden++;
    }
  }
  assert.ok(hidden > 0, 'the scenario does take the cat under the player');
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
