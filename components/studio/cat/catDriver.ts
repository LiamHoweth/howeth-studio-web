import { CatCompanion, type ViewRect } from "@/lib/cat/companion";
import { computePose } from "@/lib/cat/gait";
import { buildRoute, type RouteLayout, type RouteRect } from "@/lib/cat/route";
import { CAMERA_ELEVATION, VIEW_UNITS, fitCat, type CatFit } from "@/lib/cat/view";
import type { CatRenderer } from "./catScene";

/**
 * DOM side of the walking cat: measures the page (lane, open ground, and every
 * piece of text, media and control the cat must keep clear of), follows
 * scrolling and drives the companion. It positions the host with a
 * compositor-only transform and renders only while something is moving, so a
 * still page costs nothing. It works before Three.js arrives, moving the
 * painted fallback along the route.
 */
export type CatDriver = {
  attach: (renderer: CatRenderer) => void;
  detach: () => void;
  dispose: () => void;
};

/** Optional test hook: browser checks read every frame's state through it. */
export type CatProbe = {
  time: number; scrollY: number; x: number; y: number; pageY: number; opacity: number;
  s: number; v: number; phase: number; cadence: number; yaw: number; sit: number;
  pxPerUnit: number; freeTurn: boolean; jumped: boolean;
};
type ProbeWindow = Window & { __beopityCatProbe?: (state: CatProbe) => void };

const INTERACTIVE = "a[href], button, input, select, textarea, summary, label, [role='button'], [tabindex]:not([tabindex='-1'])";
const MEDIA = "img, svg, video, canvas, iframe, picture";
const DECORATIVE = "[data-cat-lane], .walking-cat, [data-cat-wander]";
/** Focus rings sit 5px outside controls and are 2px wide. */
const FOCUS_MARGIN = 8;

function cssNumber(style: CSSStyleDeclaration, name: string, fallback: number) {
  const value = Number.parseFloat(style.getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

function visible(element: Element) {
  if (element.closest(DECORATIVE)) return false;
  const style = getComputedStyle(element);
  return style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0;
}

/** Page rectangles of the text, media and controls inside `roots`. */
export function collectObstacles(roots: Element[]): RouteRect[] {
  const scrollX = window.scrollX, scrollY = window.scrollY;
  const rects: RouteRect[] = [];
  const add = (rect: DOMRect | DOMRectReadOnly, inflate: number) => {
    if (rect.width < 1 || rect.height < 1) return;
    rects.push({ left: rect.left + scrollX - inflate, top: rect.top + scrollY - inflate, width: rect.width + inflate * 2, height: rect.height + inflate * 2 });
  };
  const range = document.createRange();
  for (const root of roots) {
    const text = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.nodeValue?.trim() && node.parentElement && visible(node.parentElement) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    // Each line box of real text, so wrapped or enlarged copy is measured exactly.
    for (let node = text.nextNode(); node; node = text.nextNode()) {
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) add(rect, 2);
    }
    for (const element of root.querySelectorAll(INTERACTIVE)) if (visible(element)) add(element.getBoundingClientRect(), FOCUS_MARGIN);
    for (const element of root.querySelectorAll(MEDIA)) if (visible(element)) add(element.getBoundingClientRect(), 2);
  }
  range.detach();
  return rects;
}

function viewRect(element: Element | null): ViewRect | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
}

export function measureLayout(lane: HTMLElement): { layout: RouteLayout; fit: CatFit } {
  const scrollY = window.scrollY;
  const style = getComputedStyle(lane);
  const rect = lane.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  // The cat may use the lane and the empty page margin beside it.
  const right = viewportWidth - cssNumber(style, "--cat-edge", 6);
  const fit = fitCat(cssNumber(style, "--cat-size", 140), right - rect.left);
  const bands = Array.from(document.querySelectorAll<HTMLElement>("[data-cat-wander]"), (band) => {
    const box = band.getBoundingClientRect();
    return { left: box.left, top: box.top + scrollY, width: box.width, height: box.height, target: Number(band.dataset.catWander) || 0.4 };
  });
  const roots = [document.querySelector("main"), document.querySelector(".studio-footer")].filter((root): root is Element => !!root);
  return {
    fit,
    layout: {
      viewport: { width: viewportWidth, height: window.innerHeight },
      anchor: window.innerHeight * cssNumber(style, "--cat-anchor", 0.6),
      lane: { left: rect.left, top: rect.top + scrollY, width: rect.width, height: rect.height },
      right,
      bands,
      obstacles: collectObstacles(roots),
      pxPerUnit: fit.pxPerUnit,
      laneSideways: fit.sideways,
      elevation: CAMERA_ELEVATION,
      meander: 1100,
    },
  };
}

export function startCatDriver(host: HTMLElement, lane: HTMLElement): CatDriver {
  let { layout, fit } = measureLayout(lane);
  let size = fit.pxPerUnit * VIEW_UNITS;
  const companion = new CatCompanion(buildRoute(layout), { pxPerUnit: fit.pxPerUnit, elevation: CAMERA_ELEVATION });
  let renderer: CatRenderer | null = null;
  let frame = 0;
  let measureFrame = 0;
  let last = 0;
  let lastScrollY = window.scrollY;
  let scrolledAt = performance.now();
  let chrome: ViewRect[] = [];
  const finePointer = window.matchMedia("(pointer: fine)");
  const look = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let blinkStart = -1;
  let blinkTimer = 0;
  let screen = { x: 0, y: 0 };
  let disposed = false;
  const probe = () => (window as ProbeWindow).__beopityCatProbe;

  const measureChrome = () => {
    chrome = [viewRect(document.querySelector(".studio-header")), viewRect(document.querySelector(".ambient-music"))].filter((rect): rect is ViewRect => !!rect);
  };

  const measure = () => {
    measureFrame = 0;
    if (disposed) return;
    ({ layout, fit } = measureLayout(lane));
    const nextSize = fit.pxPerUnit * VIEW_UNITS;
    if (Math.abs(nextSize - size) > 0.5 || !host.style.width) {
      size = nextSize;
      host.style.width = host.style.height = `${size}px`;
      renderer?.setSize(size);
    }
    host.dataset.turn = fit.freeTurn ? "standing" : "seated";
    // A new layout keeps the cat where it stands on the page, without counting it as a walk.
    companion.setRoute(buildRoute(layout), { pxPerUnit: fit.pxPerUnit });
    measureChrome();
    wake();
  };
  const scheduleMeasure = () => {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  };

  const tick = (time: number) => {
    frame = 0;
    if (document.hidden) { last = 0; return; }
    const dt = last ? (time - last) / 1000 : 1 / 60;
    last = time;
    const scrollY = window.scrollY;
    if (scrollY !== lastScrollY) { lastScrollY = scrollY; scrolledAt = time; }
    const sinceScroll = Math.max(0, (time - scrolledAt) / 1000);
    const state = companion.update({ scrollY, dt, sinceScroll, chrome });
    screen = { x: state.x, y: state.y };
    host.style.transform = `translate3d(${state.x - size / 2}px, ${state.y - size / 2}px, 0)`;
    host.style.opacity = state.opacity.toFixed(3);

    const walker = companion.walker;
    const ease = 1 - Math.exp(-6 * Math.min(dt, 0.1));
    const attention = 1 - walker.walk * 0.75;
    look.x += (look.targetX * attention - look.x) * ease;
    look.y += (look.targetY * attention - look.y) * ease;
    const lookSettled = Math.abs(look.targetX * attention - look.x) < 0.002 && Math.abs(look.targetY * attention - look.y) < 0.002;
    const blinkAge = blinkStart < 0 ? 1 : (time - blinkStart) / 170;
    const blink = blinkAge < 1 ? Math.sin(Math.PI * blinkAge) : 0;
    if (blinkAge >= 1) blinkStart = -1;

    const onScreen = state.y > -size && state.y < layout.viewport.height + size;
    if (renderer && onScreen && state.opacity > 0) renderer.render(computePose(walker.gait(time / 1000, look, blink)), walker.yaw);
    probe()?.({
      time, scrollY, x: state.x, y: state.y, pageY: state.pageY, opacity: state.opacity,
      s: companion.motion.s, v: companion.motion.v, phase: walker.phase, cadence: walker.cadence, yaw: walker.yaw, sit: walker.sit,
      pxPerUnit: fit.pxPerUnit, freeTurn: fit.freeTurn, jumped: state.jumped,
    });
    // Keep ticking briefly after scrolling so a settled scroll can trigger a discreet reposition.
    if (state.active || !lookSettled || blinkStart >= 0 || sinceScroll < 0.5) frame = requestAnimationFrame(tick);
    else last = 0;
  };

  function wake() {
    if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(tick);
  }

  const scheduleBlink = () => {
    window.clearTimeout(blinkTimer);
    blinkTimer = window.setTimeout(() => {
      if (!document.hidden && renderer) { blinkStart = performance.now(); wake(); }
      scheduleBlink();
    }, 2600 + Math.random() * 4200);
  };

  const onScroll = () => { scrolledAt = performance.now(); wake(); };
  const onPointer = (event: PointerEvent) => {
    if (!finePointer.matches || event.pointerType === "touch") return;
    look.targetX = Math.max(-1, Math.min(1, (event.clientX - screen.x) / (layout.viewport.width * 0.45)));
    look.targetY = Math.max(-1, Math.min(1, -(event.clientY - screen.y) / (layout.viewport.height * 0.5)));
    wake();
  };
  const resetLook = () => { look.targetX = 0; look.targetY = 0; wake(); };
  // A restored or re-shown tab is a discontinuity: the long frame gap lets the companion reposition.
  const onVisibility = () => { if (!document.hidden) { measureChrome(); wake(); } };
  const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) scheduleMeasure(); };
  const resize = new ResizeObserver(scheduleMeasure);
  resize.observe(document.body);
  resize.observe(lane);
  for (const element of document.querySelectorAll(".studio-header, .ambient-music")) resize.observe(element);
  // Filtering the collection or late content changes what the cat must avoid.
  const mutations = new MutationObserver(scheduleMeasure);
  const main = document.querySelector("main");
  if (main) mutations.observe(main, { childList: true, subtree: true, characterData: true });
  const fonts = document.fonts;
  fonts?.addEventListener?.("loadingdone", scheduleMeasure);
  void fonts?.ready.then(scheduleMeasure);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", scheduleMeasure, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pageshow", onPageShow);
  document.documentElement.addEventListener("pointerleave", resetLook);
  window.addEventListener("blur", resetLook);
  document.addEventListener("visibilitychange", onVisibility);
  host.style.width = host.style.height = `${size}px`;
  host.style.opacity = "0";
  host.dataset.turn = fit.freeTurn ? "standing" : "seated";
  measureChrome();
  companion.place(window.scrollY);
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
      disposed = true;
      cancelAnimationFrame(frame); frame = 0;
      cancelAnimationFrame(measureFrame); measureFrame = 0;
      window.clearTimeout(blinkTimer);
      resize.disconnect();
      mutations.disconnect();
      fonts?.removeEventListener?.("loadingdone", scheduleMeasure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pageshow", onPageShow);
      document.documentElement.removeEventListener("pointerleave", resetLook);
      window.removeEventListener("blur", resetLook);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer = null;
    },
  };
}
