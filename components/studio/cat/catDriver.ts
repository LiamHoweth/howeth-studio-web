import { DEFAULT_GROUND, DEFAULT_TARGET, parseFraction, routeAt, type RouteLayout, type RoutePoint } from "@/lib/cat/route";
import { CAMERA_ELEVATION, CAT_SCREEN_UNITS, FEET_BELOW_CENTRE_UNITS, VIEW_UNITS, fitCatToLane } from "@/lib/cat/view";
import { CatWalker } from "@/lib/cat/walker";
import type { CatRenderer } from "./catScene";

/**
 * DOM side of the walking cat: measures the page route, follows scrolling and
 * drives the walker. It positions the host with a compositor-only transform and
 * renders only while something is moving; a settled cat on screen plays its
 * idle loop at a gentle frame rate, and nothing renders off screen or while the
 * document is hidden. It works before Three.js arrives, moving the painted
 * fallback along the route.
 *
 * Open ground is any element marked `data-wander="<0–1 target x>"` with an
 * optional `data-wander-ground="<0–1 footpath line from the top>"` (default
 * 0.88); the older `data-cat-wander` marker is still accepted. On phones (no
 * lane) the host is hidden except while the cat crosses such a band.
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
  const rect = lane.getBoundingClientRect();
  const cat = fitCatToLane(cssNumber(style, "--cat-size", 140), rect.width);
  const bands = Array.from(document.querySelectorAll<HTMLElement>("[data-wander], [data-cat-wander]"), (band) => {
    const box = band.getBoundingClientRect();
    return {
      left: box.left, top: box.top + scrollY, width: box.width, height: box.height,
      target: parseFraction(band.dataset.wander ?? band.dataset.catWander, DEFAULT_TARGET),
      ground: parseFraction(band.dataset.wanderGround, DEFAULT_GROUND),
    };
  });
  return {
    viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
    anchor: window.innerHeight * cssNumber(style, "--cat-anchor", 0.6),
    lane: { left: rect.left, top: rect.top + scrollY, width: rect.width, height: rect.height },
    bands,
    cat: { width: cat.width, height: cat.height },
    feet: cat.pxPerUnit * FEET_BELOW_CENTRE_UNITS,
    meander: 1100,
  };
}

/** Idle loops (breathing, tail sway) only need a gentle frame rate. */
const IDLE_FRAME_MS = 1000 / 24;

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
  let idleTimer = 0;
  let screen = { x: 0, y: 0 };
  let shownOpacity = "";

  // Transform every frame; visibility and opacity only when they change (phones).
  const position = (point: RoutePoint) => {
    screen = point;
    host.style.transform = `translate3d(${point.x - size / 2}px, ${point.y - size / 2}px, 0)`;
    const opacity = point.opacity >= 0.999 ? "" : point.opacity.toFixed(3);
    if (opacity !== shownOpacity) {
      shownOpacity = opacity;
      host.style.opacity = opacity;
      host.dataset.visible = String(point.visible);
    }
  };

  const place = () => {
    const point = routeAt(layout, window.scrollY);
    walker.place(point.x, point.pageY);
    position(point);
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
    position(point);

    const ease = 1 - Math.exp(-6 * dt);
    const attention = 1 - walker.walk * 0.75;
    look.x += (look.targetX * attention - look.x) * ease;
    look.y += (look.targetY * attention - look.y) * ease;
    const lookSettled = Math.abs(look.targetX * attention - look.x) < 0.002 && Math.abs(look.targetY * attention - look.y) < 0.002;
    const blinkAge = blinkStart < 0 ? 1 : (time - blinkStart) / 170;
    const blink = blinkAge < 1 ? Math.sin(Math.PI * blinkAge) : 0;
    if (blinkAge >= 1) blinkStart = -1;

    const onScreen = point.visible && point.y > -size && point.y < layout.viewport.height + size;
    if (renderer && onScreen) {
      renderer.render({ phase: walker.phase, walk: walker.walk, sit: walker.sit, yaw: walker.yaw, look, blink, time: time / 1000 });
    }
    window.clearTimeout(idleTimer); idleTimer = 0;
    if (walker.moving || !lookSettled || blinkStart >= 0) frame = requestAnimationFrame(tick);
    else if (renderer?.wantsIdleFrames && onScreen) idleTimer = window.setTimeout(wake, IDLE_FRAME_MS);
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
      window.clearTimeout(idleTimer);
    },
    dispose() {
      cancelAnimationFrame(frame); frame = 0;
      window.clearTimeout(blinkTimer);
      window.clearTimeout(idleTimer);
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
