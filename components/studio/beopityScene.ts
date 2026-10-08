import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type SculptureController = {
  dispose: () => void;
  setPointer: (x: number, y: number) => void;
  setReducedMotion: (reduced: boolean) => void;
};

type SculptureOptions = {
  signal: AbortSignal;
  motion: () => { x: number; y: number; reduced: boolean };
  onUnavailable: () => void;
};

export async function mountSculpture(host: HTMLElement, options: SculptureOptions): Promise<SculptureController> {
  // Navigation can abort the asset request before acquiring a WebGL context.
  const response = await fetch("/beopity/logo.glb", { signal: options.signal });
  if (!response.ok) throw new Error("The sculpture could not load.");
  const model = (await new GLTFLoader().parseAsync(await response.arrayBuffer(), "/beopity/")).scene;
  const releaseModel = () => model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
    }
  });
  let renderer: THREE.WebGLRenderer;
  try {
    options.signal.throwIfAborted();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (error) { releaseModel(); throw error; }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  let environmentMap: THREE.WebGLRenderTarget;
  try { environmentMap = pmrem.fromScene(environment); }
  catch (error) { pmrem.dispose(); renderer.dispose(); releaseModel(); throw error; }
  finally { environment.dispose(); }
  scene.environment = environmentMap.texture;
  scene.environmentIntensity = 0.7;
  const key = new THREE.DirectionalLight(0xfff1de, 3);
  key.position.set(-3, 4, 5);
  const rim = new THREE.PointLight(0x82f0c9, 35, 20, 2);
  rim.position.set(3, 0, 2);
  scene.add(key, rim);
  const pivot = new THREE.Group();
  pivot.add(model);
  scene.add(pivot);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  const motion = options.motion();
  const target = new THREE.Vector2(motion.reduced ? 0 : motion.x, motion.reduced ? 0 : motion.y);
  const current = target.clone();
  let reduced = motion.reduced;
  let disposed = false;
  let visible = true;
  let frame = 0;
  let last = 0;

  const render = (time = 0) => {
    frame = 0;
    if (disposed || !visible || document.hidden) { last = 0; return; }
    const delta = last ? Math.min((time - last) / 1000, 0.1) : 1 / 60;
    last = time;
    current.lerp(target, 1 - Math.exp(-10 * delta));
    if (current.distanceToSquared(target) < 0.00001) current.copy(target);
    pivot.rotation.set(-0.08 + current.y * 0.22, -0.22 + current.x * 0.38, -0.075 + current.x * 0.035);
    pivot.position.set(current.x * 0.1, -current.y * 0.06, 0);
    renderer.render(scene, camera);
    // Follow at display refresh rate, then sleep once movement settles.
    if (!current.equals(target)) frame = requestAnimationFrame(render);
    else last = 0;
  };
  const draw = () => {
    if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(render);
  };
  const setPointer = (x: number, y: number) => {
    if (disposed || reduced) return;
    target.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1));
    draw();
  };
  const setReducedMotion = (value: boolean) => {
    reduced = value;
    if (reduced) { target.set(0, 0); current.set(0, 0); draw(); }
  };
  const fit = () => {
    const { width, height } = host.getBoundingClientRect();
    // Retina edges stay crisp without an unbounded drawing buffer.
    const pixelBudget = 2_000_000;
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 2), 2.5, Math.sqrt(pixelBudget / Math.max(width * height, 1))));
    renderer.setSize(Math.max(width, 1), Math.max(height, 1));
    camera.aspect = Math.max(width, 1) / Math.max(height, 1);
    camera.position.set(0, 0, camera.aspect < 0.85 ? 10 : 8.6);
    camera.updateProjectionMatrix();
    draw();
  };
  const resize = new ResizeObserver(fit);
  resize.observe(host);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting; last = 0;
    if (visible) draw();
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  visibility.observe(host);
  const changeVisibility = () => {
    last = 0;
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else fit();
  };
  const contextLost = (event: Event) => { event.preventDefault(); options.onUnavailable(); dispose(); };
  document.addEventListener("visibilitychange", changeVisibility);
  canvas.addEventListener("webglcontextlost", contextLost);
  options.signal.addEventListener("abort", dispose, { once: true });
  function dispose() {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame);
    resize.disconnect(); visibility.disconnect();
    document.removeEventListener("visibilitychange", changeVisibility);
    canvas.removeEventListener("webglcontextlost", contextLost);
    options.signal.removeEventListener("abort", dispose);
    releaseModel();
    environmentMap.dispose(); pmrem.dispose(); renderer.dispose(); canvas.remove();
  }
  try {
    fit();
    // Draw before fading the fallback, using the latest cursor position.
    cancelAnimationFrame(frame); frame = 0; render();
  } catch (error) { dispose(); throw error; }
  return { dispose, setPointer, setReducedMotion };
}
