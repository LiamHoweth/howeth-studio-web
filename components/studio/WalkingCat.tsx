"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { startCatDriver, type CatDriver } from "./cat/catDriver";
import type { CatRenderer } from "./cat/catScene";
import "@/styles/walking-cat.css";

type CatState = "static" | "poster" | "live";

/** Resolves once the main thread is idle (or after a short cap). */
function whenIdle(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => resolve(), { timeout: 2500 });
    else window.setTimeout(resolve, 600);
  });
}

/**
 * The studio cat that walks down the page as you scroll. Decorative only: it is
 * hidden from assistive technology, ignores pointer input and never takes focus.
 * Reduced motion keeps the seated cat in the trail lane without animation.
 * The 3D model (an authored GLB) loads when the browser is idle, so it never
 * competes with first paint; the painted cat walks the route until then.
 */
export function WalkingCat() {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CatState>("static");

  useEffect(() => {
    const element = host.current;
    const lane = element?.parentElement?.querySelector<HTMLElement>("[data-cat-lane]");
    if (!element || !lane) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let driver: CatDriver | null = null;
    let renderer: CatRenderer | null = null;
    let run = 0;

    const stop = () => {
      run++;
      driver?.dispose(); driver = null;
      renderer?.dispose(); renderer = null;
    };
    const start = async () => {
      stop();
      if (media.matches) { setState("static"); return; }
      const current = run;
      driver = startCatDriver(element, lane);
      setState("poster");
      try {
        await whenIdle();
        if (current !== run || !driver) return;
        const { createCatRenderer } = await import("./cat/catScene");
        if (current !== run || !driver) return;
        const next = await createCatRenderer(element, () => {
          // WebGL context lost: the painted cat continues along the route.
          if (current !== run) return;
          driver?.detach();
          renderer?.dispose(); renderer = null;
          setState("poster");
        });
        if (current !== run || !driver) { next.dispose(); return; }
        renderer = next;
        driver.attach(renderer);
        setState("live");
      } catch {
        // Without WebGL the painted cat still follows the route.
      }
    };

    void start();
    const changeMotion = () => void start();
    media.addEventListener("change", changeMotion);
    return () => {
      media.removeEventListener("change", changeMotion);
      stop();
    };
  }, []);

  return (
    <div ref={host} className="walking-cat" data-state={state} aria-hidden="true">
      <Image className="walking-cat__poster" src="/beopity/cat-sitting.webp" alt="" width={540} height={640} priority />
    </div>
  );
}
