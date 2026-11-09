import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CAT_GLB_URL, CLIPS, MORPHS, clipMix, wantsIdleFrames, type ClipDurations, type ClipKey } from "@/lib/cat/clips";
import { CAMERA_ELEVATION, CAMERA_FOCUS_Y, CAT_FULL_TURN_WIDTH_UNITS, VIEW_UNITS } from "@/lib/cat/view";

/**
 * WebGL renderer for the authored beopity cat (`/beopity/cat3d/beopity-cat.glb`).
 * One AnimationMixer blends the GLB's clips from walker state (`lib/cat/clips.ts`):
 * walk is scrubbed by distance, sit/stand transitions by the eased sit value, and
 * idle loops run on their own clock. Blink and pupil dilation are morph targets.
 * The canvas is a bounded square that only renders when the driver asks.
 */
export type CatFrame = {
  phase: number;
  walk: number;
  sit: number;
  yaw: number;
  look: { x: number; y: number };
  blink: number;
  /** Seconds, monotonically increasing. */
  time: number;
};

export type CatRenderer = {
  setSize: (cssPixels: number) => void;
  render: (frame: CatFrame) => void;
  /** True when the idle loops (breathing, tail sway) would like further frames. */
  readonly wantsIdleFrames: boolean;
  dispose: () => void;
};

/** Keep the turning silhouette (tail, whiskers) just inside the lane envelope. */
const TURN_RADIUS = (CAT_FULL_TURN_WIDTH_UNITS / 2) * 0.94;

const groundVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const groundFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform vec2 uStretch;
  uniform float uFalloff;
  varying vec2 vUv;
  void main() {
    float r = length((vUv - 0.5) * 2.0 * uStretch);
    float a = uOpacity * (1.0 - smoothstep(uFalloff * 0.15, uFalloff, r));
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

function groundDisc(color: string, opacity: number, stretch: [number, number], falloff: number, size: number) {
  const material = new THREE.ShaderMaterial({
    vertexShader: groundVertex,
    fragmentShader: groundFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uStretch: { value: new THREE.Vector2(...stretch) },
      uFalloff: { value: falloff },
    },
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/** Largest horizontal distance of the posed model from its ground origin, in metres. */
function turningRadius(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object, true);
  let radius = 0;
  for (const x of [box.min.x, box.max.x]) for (const z of [box.min.z, box.max.z]) radius = Math.max(radius, Math.hypot(x, z));
  return { radius, box };
}

export async function createCatRenderer(host: HTMLElement, onUnavailable: () => void): Promise<CatRenderer> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "default" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  // A soft studio environment gives the dark fur its cool sheen and the eyes
  // their glints. A warm key from the front, cool rims from behind on both
  // sides (the cat turns), and a low fill keep the black coat readable on cream
  // paper and painted meadows.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  scene.environment = environment;
  scene.environmentIntensity = 0.95;
  const hemi = new THREE.HemisphereLight(0xe4ecf7, 0x5d5236, 1.3);
  const key = new THREE.DirectionalLight(0xfff0dc, 2.6);
  key.position.set(1.4, 2.8, 2.6);
  const rim = new THREE.DirectionalLight(0xd2e2ff, 3.2);
  rim.position.set(-2.4, 2.2, -2.8);
  const rimRight = new THREE.DirectionalLight(0xffe6c8, 2.2);
  rimRight.position.set(2.6, 1.8, -2.4);
  const fill = new THREE.DirectionalLight(0xffe2c4, 0.7);
  fill.position.set(-2, 0.8, 2);
  scene.add(hemi, key, rim, rimRight, fill);

  const half = VIEW_UNITS / 2;
  const camera = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 20);
  const focus = new THREE.Vector3(0, CAMERA_FOCUS_Y, 0);
  camera.position.set(0, focus.y + Math.sin(CAMERA_ELEVATION) * 8, Math.cos(CAMERA_ELEVATION) * 8);
  camera.lookAt(focus);

  const gltf = await new GLTFLoader().loadAsync(CAT_GLB_URL);
  const model = gltf.scene;
  const root = new THREE.Group();
  root.add(model);
  scene.add(root);

  const mixer = new THREE.AnimationMixer(model);
  const actions = {} as Record<ClipKey, THREE.AnimationAction>;
  const durations = {} as ClipDurations;
  for (const key of Object.keys(CLIPS) as ClipKey[]) {
    const clip = THREE.AnimationClip.findByName(gltf.animations, CLIPS[key]);
    if (!clip) throw new Error(`beopity cat: missing clip ${CLIPS[key]}`);
    const action = mixer.clipAction(clip);
    action.setLoop(key === "sitDown" || key === "standUp" ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;
    action.enabled = true;
    action.weight = key === "idleStand" ? 1 : 0;
    action.play();
    actions[key] = action;
    durations[key] = clip.duration;
  }

  // Size from the loaded bounds in the standing pose, including tail and whiskers.
  mixer.update(0);
  model.updateMatrixWorld(true);
  const { radius } = turningRadius(model);
  const scale = TURN_RADIUS / Math.max(radius, 1e-3);
  model.scale.setScalar(scale);

  const head = model.getObjectByName("head") ?? null;
  const expressionMeshes: THREE.Mesh[] = [];
  model.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.frustumCulled = false; // skinned bounds lag the pose; the canvas is tiny anyway
      if (mesh.morphTargetDictionary) expressionMeshes.push(mesh);
    }
  });
  const setMorph = (name: string, value: number) => {
    for (const mesh of expressionMeshes) {
      const index = mesh.morphTargetDictionary?.[name];
      if (index !== undefined && mesh.morphTargetInfluences) mesh.morphTargetInfluences[index] = value;
    }
  };

  // Contact shadows sized to the cat's body; they turn with it.
  const body = 0.45 * scale;
  const pool = groundDisc("#1d1c16", 0.2, [1.5, 1], 1, body * 2.6);
  const shadow = groundDisc("#0c0b09", 0.4, [2.1, 1], 0.6, body * 1.7);
  pool.position.y = 0.001; shadow.position.y = 0.002;
  root.add(pool, shadow);

  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  let disposed = false;
  const contextLost = (event: Event) => { event.preventDefault(); onUnavailable(); };
  canvas.addEventListener("webglcontextlost", contextLost);
  // Compile shaders off the main path where the browser supports it.
  await renderer.compileAsync(scene, camera).catch(() => undefined);
  host.appendChild(canvas);

  const lookQuat = new THREE.Quaternion();
  const lookEuler = new THREE.Euler();
  let lastSit = 1;
  let sitting = true;
  let clock = 0;
  let lastTime = -1;
  let idle = true;

  return {
    setSize(cssPixels) {
      const size = Math.max(1, Math.round(cssPixels));
      // Crisp on Retina without an unbounded drawing buffer.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3, Math.sqrt(1_400_000 / (size * size))));
      renderer.setSize(size, size);
    },
    render(frame) {
      if (disposed) return;
      const dt = lastTime < 0 ? 0 : Math.min(Math.max(frame.time - lastTime, 0), 0.1);
      lastTime = frame.time;
      clock += dt;
      if (frame.sit > lastSit + 1e-4) sitting = true;
      else if (frame.sit < lastSit - 1e-4) sitting = false;
      lastSit = frame.sit;

      const mix = clipMix({ phase: frame.phase, walk: frame.walk, sit: frame.sit, sitting, clock, scale }, durations);
      for (const key of Object.keys(actions) as ClipKey[]) {
        actions[key].weight = mix[key].weight;
        actions[key].time = mix[key].time;
      }
      mixer.update(0);
      if (head) {
        // Gaze toward the pointer layers on top of whichever clip is playing.
        lookEuler.set(-frame.look.y * 0.22, frame.look.x * 0.42, 0, "YXZ");
        head.quaternion.multiply(lookQuat.setFromEuler(lookEuler));
      }
      setMorph(MORPHS.blink, frame.blink);
      setMorph(MORPHS.dilate, frame.sit * 0.55);
      root.rotation.y = frame.yaw;
      idle = wantsIdleFrames(frame.walk);
      renderer.render(scene, camera);
    },
    get wantsIdleFrames() { return idle; },
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener("webglcontextlost", contextLost);
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      for (const disc of [pool, shadow]) { disc.geometry.dispose(); disc.material.dispose(); }
      model.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
          material.dispose();
        }
      });
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
