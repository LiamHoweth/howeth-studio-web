"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { SculptureController } from "./beopityScene";
import "@/styles/beopity-sculpture.css";

export function BeopitySculpture() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SculptureController | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const { mountSculpture } = await import("./beopityScene");
        if (disposed) return;
        controller.current = await mountSculpture(element, () => { if (!disposed) setReady(false); });
        if (disposed) { controller.current.dispose(); return; }
        setReady(true);
      } catch { /* The original mark remains visible if WebGL is unavailable. */ }
    }, { rootMargin: "100px" });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); controller.current?.dispose(); };
  }, []);

  return <div className="beopity-sculpture" aria-hidden="true" data-state={ready ? "ready" : "poster"}>
    <div className="beopity-sculpture__orbit" />
    <div ref={host} className="beopity-sculpture__stage">
      <Image className="beopity-sculpture__poster" src="/beopity/icon.webp" alt="" width={512} height={512} priority />
    </div>
  </div>;
}
