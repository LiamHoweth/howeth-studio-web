"use client";

import { useEffect, useState } from "react";

function formatTime(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function StudioClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time className="studio-mono studio-hero__clock" dateTime={now?.toISOString()}>
      {now ? formatTime(now) : "00:00:00"}
    </time>
  );
}
