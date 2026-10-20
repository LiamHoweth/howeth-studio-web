import * as THREE from "three";
import type { CatPose } from "@/lib/cat/gait";
import { CAMERA_ELEVATION, VIEW_UNITS } from "@/lib/cat/view";
import { applyCatPose, createCatModel } from "./catModel";

export type CatRenderer = {
  setSize: (cssPixels: number) => void;
  render: (pose: CatPose, yaw: number) => void;
  dispose: () => void;
};

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

export function createCatRenderer(host: HTMLElement, onUnavailable: () => void): CatRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "default" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const half = VIEW_UNITS / 2;
  const camera = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 20);
  const focus = new THREE.Vector3(0, 0.55, 0);
  camera.position.set(0, focus.y + Math.sin(CAMERA_ELEVATION) * 8, Math.cos(CAMERA_ELEVATION) * 8);
  camera.lookAt(focus);

  const model = createCatModel();
  // A soft lantern glow keeps the black cat legible on charcoal; the contact
  // shadow grounds it on the mint paper sections.
  const glow = groundDisc("#bbefcb", 0.2, [1, 1], 1, 2.6);
  const shadow = groundDisc("#050403", 0.5, [1.9, 1], 0.62, 1.4);
  glow.position.y = 0.001; shadow.position.y = 0.002;
  scene.add(glow);
  model.root.add(shadow);
  scene.add(model.root);

  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  let disposed = false;
  const contextLost = (event: Event) => { event.preventDefault(); onUnavailable(); };
  canvas.addEventListener("webglcontextlost", contextLost);

  return {
    setSize(cssPixels) {
      const size = Math.max(1, Math.round(cssPixels));
      // Crisp on Retina without an unbounded drawing buffer.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3, Math.sqrt(1_400_000 / (size * size))));
      renderer.setSize(size, size);
    },
    render(pose, yaw) {
      if (disposed) return;
      applyCatPose(model, pose);
      model.root.rotation.y = yaw;
      renderer.render(scene, camera);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener("webglcontextlost", contextLost);
      for (const disc of [glow, shadow]) { disc.geometry.dispose(); disc.material.dispose(); }
      model.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
