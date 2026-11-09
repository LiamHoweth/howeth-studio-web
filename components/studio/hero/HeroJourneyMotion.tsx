"use client";

import { useEffect, useRef } from "react";

/**
 * Tiny companion for HeroJourney. Renders nothing visible. It pauses every hero
 * animation while the hero is off-screen, and (motion allowed only) adds a gentle
 * depth parallax: layers lag on scroll by depth, and shift with a fine pointer.
 * Layers declare their depth with `data-depth` (0 = sky, 1 = foreground).
 */
export function HeroJourneyMotion() {
  const probe = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = probe.current?.closest<HTMLElement>(".hero-journey");
    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) => {
      hero.dataset.paused = entry.isIntersecting ? "false" : "true";
    }, { rootMargin: "80px 0px" });
    observer.observe(hero);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    const layers = Array.from(hero.querySelectorAll<HTMLElement>("[data-depth]")).map((element) => ({ element, depth: Number(element.dataset.depth) || 0 }));
    let frame = 0;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };
    let scrolled = 0;

    const apply = () => {
      frame = 0;
      current = { x: current.x + (target.x - current.x) * 0.08, y: current.y + (target.y - current.y) * 0.08 };
      for (const { element, depth } of layers) {
        const x = current.x * depth * 18;
        const y = current.y * depth * 8 + scrolled * (1 - depth) * 0.32;
        element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      }
      if (Math.abs(target.x - current.x) > 0.002 || Math.abs(target.y - current.y) > 0.002) frame = requestAnimationFrame(apply);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(apply); };

    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      const next = Math.min(Math.max(-rect.top, 0), rect.height);
      if (next === scrolled) return;
      scrolled = next;
      schedule();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = hero.getBoundingClientRect();
      target = { x: ((event.clientX - rect.left) / rect.width - 0.5) * -2, y: ((event.clientY - rect.top) / rect.height - 0.5) * -2 };
      schedule();
    };
    const onLeave = () => { target = { x: 0, y: 0 }; schedule(); };

    let active = false;
    const sync = () => {
      const allow = !reduced.matches;
      if (allow && !active) {
        active = true;
        window.addEventListener("scroll", onScroll, { passive: true });
        if (fine.matches) {
          hero.addEventListener("pointermove", onPointer, { passive: true });
          hero.addEventListener("pointerleave", onLeave);
        }
        onScroll();
      } else if (!allow && active) {
        active = false;
        window.removeEventListener("scroll", onScroll);
        hero.removeEventListener("pointermove", onPointer);
        hero.removeEventListener("pointerleave", onLeave);
        cancelAnimationFrame(frame);
        frame = 0;
        for (const { element } of layers) element.style.transform = "";
      }
    };
    sync();
    reduced.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      window.removeEventListener("scroll", onScroll);
      hero.removeEventListener("pointermove", onPointer);
      hero.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
      for (const { element } of layers) element.style.transform = "";
      delete hero.dataset.paused;
    };
  }, []);

  return <span ref={probe} className="hj-probe" hidden />;
}
