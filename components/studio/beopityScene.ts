import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type SculptureController = { dispose: () => void };

export async function mountSculpture(host: HTMLElement, onUnavailable: () => void): Promise<SculptureController> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.set(0, 0, 8.6);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment);
  environment.dispose();
  scene.environment = environmentMap.texture;
  scene.environmentIntensity = 0.7;
  const key = new THREE.DirectionalLight(0xfff1de, 3);
  key.position.set(-3, 4, 5);
  const rim = new THREE.PointLight(0x82f0c9, 35, 20, 2);
  rim.position.set(3, 0, 2);
  scene.add(key, rim);
  let model: THREE.Group;
  try { model = (await new GLTFLoader().loadAsync("/beopity/logo.glb")).scene; }
  catch (error) { environmentMap.dispose(); pmrem.dispose(); renderer.dispose(); throw error; }
  const pivot = new THREE.Group();
  pivot.add(model);
  scene.add(pivot);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const target = new THREE.Vector2();
  const current = new THREE.Vector2();
  let disposed = false;
  let visible = true;
  let frame = 0;
  let last = 0;

  const render = (time = 0) => {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    if (last && time - last < 32) { frame = requestAnimationFrame(render); return; }
    const delta = last ? Math.min((time - last) / 1000, 0.1) : 1 / 30;
    last = time;
    const easing = 1 - Math.exp(-7 * delta);
    current.lerp(target, easing);
    if (current.distanceToSquared(target) < 0.00001) current.copy(target);
    pivot.rotation.set(-0.08 + current.y * 0.22, -0.35 + current.x * 0.4, -0.075 + current.x * 0.035);
    pivot.position.set(current.x * 0.1, -current.y * 0.06, 0);
    renderer.render(scene, camera);
    // Render only while the cursor response is settling; the sculpture has no idle loop.
    if (!current.equals(target)) frame = requestAnimationFrame(render);
    else last = 0;
  };
  const draw = () => { if (!frame && !disposed) frame = requestAnimationFrame(render); };
  const followPointer = (event: PointerEvent) => {
    if (media.matches || !visible || document.hidden || event.pointerType === "touch") return;
    const bounds = host.closest(".studio-hero")?.getBoundingClientRect() ?? host.getBoundingClientRect();
    target.set(
      THREE.MathUtils.clamp(((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1, -1, 1),
      THREE.MathUtils.clamp(((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1, -1, 1),
    );
    draw();
  };
  const rest = () => { target.set(0, 0); draw(); };
  const changeMotion = () => { if (media.matches) { target.set(0, 0); current.set(0, 0); draw(); } };
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(height, 1);
    camera.position.z = camera.aspect < 0.85 ? 10 : 8.6;
    camera.updateProjectionMatrix(); draw();
  });
  resize.observe(host);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting; last = 0;
    if (visible) draw();
  });
  visibility.observe(host);
  const changeVisibility = () => { last = 0; if (!document.hidden) draw(); };
  const contextLost = (event: Event) => { event.preventDefault(); onUnavailable(); dispose(); };
  document.addEventListener("visibilitychange", changeVisibility);
  document.documentElement.addEventListener("pointerleave", rest);
  window.addEventListener("pointermove", followPointer, { passive: true });
  window.addEventListener("blur", rest);
  media.addEventListener("change", changeMotion);
  canvas.addEventListener("webglcontextlost", contextLost);
  function dispose() {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame);
    resize.disconnect(); visibility.disconnect();
    document.removeEventListener("visibilitychange", changeVisibility);
    document.documentElement.removeEventListener("pointerleave", rest);
    window.removeEventListener("pointermove", followPointer);
    window.removeEventListener("blur", rest);
    media.removeEventListener("change", changeMotion);
    canvas.removeEventListener("webglcontextlost", contextLost);
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
      }
    });
    environmentMap.dispose(); pmrem.dispose(); renderer.dispose(); canvas.remove();
  }
  draw();
  return { dispose };
}
