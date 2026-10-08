"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SculptureController } from "./beopityScene";
import "@/styles/beopity-sculpture.css";

export function BeopitySculpture() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SculptureController | null>(null);
  const [ready, setReady] = useState(false);
  const paint = useId();

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let visible = true;
    const abort = new AbortController();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0, y: 0 };
    const setPointer = (x: number, y: number) => {
      pointer.x = x; pointer.y = y;
      // Only the vector fallback gets a CSS transform. The canvas rotates its mesh.
      element.style.setProperty("--sculpture-x", `${x * 8}px`);
      element.style.setProperty("--sculpture-y", `${-y * 5}px`);
      element.style.setProperty("--sculpture-rx", `${-4.6 + y * 12.6}deg`);
      element.style.setProperty("--sculpture-ry", `${-12.6 + x * 21.8}deg`);
      element.style.setProperty("--sculpture-rz", `${-4.3 + x * 2}deg`);
      controller.current?.setPointer(x, y);
    };
    const rest = () => setPointer(0, 0);
    const followPointer = (event: PointerEvent) => {
      if (media.matches || !visible || document.hidden || event.pointerType === "touch") return;
      const bounds = element.closest(".studio-hero")?.getBoundingClientRect() ?? element.getBoundingClientRect();
      setPointer(
        Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1)),
        Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1)),
      );
    };
    const changeMotion = () => {
      controller.current?.setReducedMotion(media.matches);
      if (media.matches) rest();
    };
    const changeVisibility = () => { if (document.hidden) rest(); };
    // Input is ready before the Three.js import, even on slow connections.
    window.addEventListener("pointermove", followPointer, { passive: true });
    window.addEventListener("blur", rest);
    document.documentElement.addEventListener("pointerleave", rest);
    document.addEventListener("visibilitychange", changeVisibility);
    media.addEventListener("change", changeMotion);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) rest();
    });
    visibility.observe(element);
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const { mountSculpture } = await import("./beopityScene");
        if (disposed) return;
        const scene = await mountSculpture(element, {
          signal: abort.signal,
          motion: () => ({ ...pointer, reduced: media.matches }),
          onUnavailable: () => {
            controller.current = null;
            if (!disposed) setReady(false);
          },
        });
        if (disposed) { scene.dispose(); return; }
        controller.current = scene;
        setReady(true);
      } catch { /* The vector mark remains responsive if 3D is unavailable. */ }
    }, { rootMargin: "100px" });
    observer.observe(element);
    return () => {
      disposed = true; abort.abort();
      observer.disconnect(); visibility.disconnect();
      window.removeEventListener("pointermove", followPointer);
      window.removeEventListener("blur", rest);
      document.documentElement.removeEventListener("pointerleave", rest);
      document.removeEventListener("visibilitychange", changeVisibility);
      media.removeEventListener("change", changeMotion);
      controller.current?.dispose(); controller.current = null;
    };
  }, []);

  return <div className="beopity-sculpture" aria-hidden="true" data-state={ready ? "ready" : "poster"}>
    <div className="beopity-sculpture__orbit" />
    <div ref={host} className="beopity-sculpture__stage">
      <svg className="beopity-sculpture__poster" viewBox="16 -1 75 121" focusable="false">
        <defs>
          <linearGradient id={`${paint}-ivory`} x1="24" y1="16" x2="82" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fffdf3" /><stop offset=".48" stopColor="#eeece1" />
            <stop offset=".8" stopColor="#d8ded2" /><stop offset="1" stopColor="#9fbaac" />
          </linearGradient>
          <linearGradient id={`${paint}-bevel`} x1="24" y1="12" x2="82" y2="110" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fffef6" /><stop offset=".52" stopColor="#e4e8dc" /><stop offset="1" stopColor="#81bba7" />
          </linearGradient>
        </defs>
        {/* The same tall stem and open bowls used by the sculpted model. */}
        <path fillRule="evenodd" fill={`url(#${paint}-ivory)`} stroke={`url(#${paint}-bevel)`} strokeWidth="5.4" strokeLinejoin="round"
          d="M24 90V16C24 3 42 3 42 16V36C48 31 52 30 58 30C85 30 91 59 73 73C93 86 81 112 56 112C36 112 24 104 24 90Z M67.5 56A11.5 11.5 0 1 0 44.5 56A11.5 11.5 0 1 0 67.5 56Z M68.5 87A12.5 12.5 0 1 0 43.5 87A12.5 12.5 0 1 0 68.5 87Z" />
      </svg>
    </div>
  </div>;
}
