import { computePose } from "@/lib/cat/gait";
import { routeAt, type RouteLayout } from "@/lib/cat/route";
import { CAMERA_ELEVATION, CAT_SCREEN_UNITS, VIEW_UNITS } from "@/lib/cat/view";
import { CatWalker } from "@/lib/cat/walker";
import type { CatRenderer } from "./catScene";

/**
 * DOM side of the walking cat: measures the page route, follows scrolling and
 * drives the walker. It positions the host with a compositor-only transform and
 * renders only while something is moving, so a still page costs nothing.
 * It works before Three.js arrives, moving the painted fallback along the route.
 */
export type CatDriver = {
  attach: (renderer: CatRenderer) => void;
  detach: () => void;
  dispose: () => void;
};

function cssNumber(style: CSSStyleDeclaration, name: string, fallback: number) {
  const value = Number.parseFloat(style.getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

export function measureRoute(lane: HTMLElement): RouteLayout {
  const scrollY = window.scrollY;
  const style = getComputedStyle(lane);
  const height = cssNumber(style, "--cat-size", 140);
  const pxPerUnit = height / CAT_SCREEN_UNITS;
  const rect = lane.getBoundingClientRect();
  const bands = Array.from(document.querySelectorAll<HTMLElement>("[data-cat-wander]"), (band) => {
    const box = band.getBoundingClientRect();
    return { left: box.left, top: box.top + scrollY, width: box.width, height: box.height, target: Number(band.dataset.catWander) || 0.4 };
  });
  return {
    viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
    anchor: window.innerHeight * cssNumber(style, "--cat-anchor", 0.6),
    lane: { left: rect.left, top: rect.top + scrollY, width: rect.width, height: rect.height },
    bands,
    cat: { width: pxPerUnit * 0.68, height },
    meander: 1100,
  };
}

export function startCatDriver(host: HTMLElement, lane: HTMLElement): CatDriver {
  let layout = measureRoute(lane);
  let pxPerUnit = layout.cat.height / CAT_SCREEN_UNITS;
  let size = pxPerUnit * VIEW_UNITS;
  const walker = new CatWalker({ pxPerUnit, elevation: CAMERA_ELEVATION, snapDistance: layout.viewport.height * 0.9 });
  let renderer: CatRenderer | null = null;
  let frame = 0;
  let last = 0;
  const finePointer = window.matchMedia("(pointer: fine)");
  const look = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let blinkStart = -1;
  let blinkTimer = 0;
  let screen = { x: 0, y: 0 };

  const place = () => {
    const point = routeAt(layout, window.scrollY);
    walker.place(point.x, point.pageY);
    screen = point;
    host.style.transform = `translate3d(${point.x - size / 2}px, ${point.y - size / 2}px, 0)`;
  };

  const measure = () => {
    layout = measureRoute(lane);
    pxPerUnit = layout.cat.height / CAT_SCREEN_UNITS;
    const nextSize = pxPerUnit * VIEW_UNITS;
    if (Math.abs(nextSize - size) > 0.5 || !host.style.width) {
      size = nextSize;
      host.style.width = host.style.height = `${size}px`;
      renderer?.setSize(size);
    }
    walker.setOptions({ pxPerUnit, snapDistance: layout.viewport.height * 0.9 });
    // A new layout repositions the cat without counting it as a walk.
    place();
    wake();
  };

  const tick = (time: number) => {
    frame = 0;
    if (document.hidden) { last = 0; return; }
    const dt = last ? Math.min((time - last) / 1000, 0.1) : 1 / 60;
    last = time;
    const point = routeAt(layout, window.scrollY);
    walker.update(point.x, point.pageY, dt);
    screen = point;
    host.style.transform = `translate3d(${point.x - size / 2}px, ${point.y - size / 2}px, 0)`;

    const ease = 1 - Math.exp(-6 * dt);
    const attention = 1 - walker.walk * 0.75;
    look.x += (look.targetX * attention - look.x) * ease;
    look.y += (look.targetY * attention - look.y) * ease;
    const lookSettled = Math.abs(look.targetX * attention - look.x) < 0.002 && Math.abs(look.targetY * attention - look.y) < 0.002;
    const blinkAge = blinkStart < 0 ? 1 : (time - blinkStart) / 170;
    const blink = blinkAge < 1 ? Math.sin(Math.PI * blinkAge) : 0;
    if (blinkAge >= 1) blinkStart = -1;

    const onScreen = point.y > -size && point.y < layout.viewport.height + size;
    if (renderer && onScreen) renderer.render(computePose(walker.gait(time / 1000, look, blink)), walker.yaw);
    if (walker.moving || !lookSettled || blinkStart >= 0) frame = requestAnimationFrame(tick);
    else last = 0;
  };

  function wake() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }

  const scheduleBlink = () => {
    window.clearTimeout(blinkTimer);
    blinkTimer = window.setTimeout(() => {
      if (!document.hidden && renderer) { blinkStart = performance.now(); wake(); }
      scheduleBlink();
    }, 2600 + Math.random() * 4200);
  };

  const onPointer = (event: PointerEvent) => {
    if (!finePointer.matches || event.pointerType === "touch") return;
    look.targetX = Math.max(-1, Math.min(1, (event.clientX - screen.x) / (layout.viewport.width * 0.45)));
    look.targetY = Math.max(-1, Math.min(1, -(event.clientY - screen.y) / (layout.viewport.height * 0.5)));
    wake();
  };
  const resetLook = () => { look.targetX = 0; look.targetY = 0; wake(); };
  const onVisibility = () => { last = 0; if (!document.hidden) wake(); };
  const resize = new ResizeObserver(() => measure());
  resize.observe(document.body);
  resize.observe(lane);
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetLook);
  window.addEventListener("blur", resetLook);
  document.addEventListener("visibilitychange", onVisibility);
  host.style.width = host.style.height = `${size}px`;
  place();
  wake();

  return {
    attach(next) {
      renderer = next;
      renderer.setSize(size);
        scheduleBlink();
      // Draw the current pose immediately so the fallback can fade without a gap.
      cancelAnimationFrame(frame); frame = 0; last = 0;
      tick(performance.now());
    },
    detach() {
      renderer = null;
      window.clearTimeout(blinkTimer);
    },
    dispose() {
      cancelAnimationFrame(frame); frame = 0;
      window.clearTimeout(blinkTimer);
      resize.disconnect();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", resetLook);
      window.removeEventListener("blur", resetLook);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer = null;
    },
  };
}
