"use client";

import { useEffect } from "react";
import { CalmScroller, wheelKind, wheelPixels } from "@/lib/scroll/calmWheel";

const EDITABLE = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

/** True when an element between the target and the page can still scroll this way itself. */
function nestedCanScroll(target: EventTarget | null, deltaY: number) {
  for (let element = target instanceof Element ? target : null; element && element !== document.body && element !== document.documentElement; element = element.parentElement) {
    const overflow = getComputedStyle(element).overflowY;
    if (!/(auto|scroll|overlay)/.test(overflow) || element.scrollHeight <= element.clientHeight + 1) continue;
    if (deltaY > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 1 : element.scrollTop > 0) return true;
  }
  return false;
}

/**
 * Makes wheel and trackpad scrolling on the studio pages calmer (see
 * `lib/scroll/calmWheel.ts`). Only plain vertical wheel gestures over the page
 * are eased; zoom (Ctrl/Cmd-wheel), horizontal and back/forward swipes, nested
 * scroll areas, form controls, touch, keyboard, scrollbar dragging and anchors
 * stay native, and any of them cancels easing at once. With reduced motion
 * the browser's own scrolling is left untouched.
 */
export function CalmScroll() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scroller = new CalmScroller();
    let frame = 0;
    let last = 0;
    let expected = window.scrollY;
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    const tick = (time: number) => {
      frame = 0;
      // Anything else that moved the page wins.
      if (Math.abs(window.scrollY - expected) > 2) { scroller.cancel(); last = 0; return; }
      const dt = last ? (time - last) / 1000 : 1 / 60;
      last = time;
      const next = scroller.step(dt, maxScroll());
      if (next === null) { last = 0; return; }
      window.scrollTo({ top: next, behavior: "instant" });
      expected = window.scrollY;
      if (scroller.active) frame = requestAnimationFrame(tick);
      else last = 0;
    };

    const onWheel = (event: WheelEvent) => {
      if (media.matches || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (event.deltaY === 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.target instanceof Element && event.target.closest(EDITABLE)) return;
      if (nestedCanScroll(event.target, event.deltaY)) return;
      const max = maxScroll();
      const from = scroller.target ?? window.scrollY;
      // At either end let the browser handle overscroll and its own feedback.
      if ((event.deltaY < 0 && from <= 0) || (event.deltaY > 0 && from >= max)) return;
      event.preventDefault();
      if (!scroller.active) expected = window.scrollY;
      scroller.add(wheelPixels(event.deltaY, event.deltaMode, window.innerHeight), wheelKind(event.deltaY, event.deltaMode), window.scrollY, max, window.innerHeight);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const stop = () => { scroller.cancel(); cancelAnimationFrame(frame); frame = 0; last = 0; };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", stop);
    window.addEventListener("pointerdown", stop);
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("blur", stop);
    media.addEventListener("change", stop);
    return () => {
      stop();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("blur", stop);
      media.removeEventListener("change", stop);
    };
  }, []);

  return null;
}
