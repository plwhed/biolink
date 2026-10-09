"use client";

import { useEffect, useState } from "react";
import { WidgetTile, WidgetFrost } from "./tile";
import { glassPanelStyle, type WidgetGlass } from "./glass";

const shell =
  "relative flex min-h-[120px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#151517] p-4 text-white";

const TILE = { tileColor: "#3B82F6", glyph: "clock", label: "Clock" } as const;

export function ClockWidget({
  config,
  glass = null,
}: {
  config: Record<string, string>;
  glass?: WidgetGlass | null;
}) {
  const use12Hour = (config.format ?? "24") !== "24";
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    ...(use12Hour ? { hour12: true } : { hour12: false }),
  });
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const date = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={shell} style={glassPanelStyle(glass)}>
      <WidgetFrost glass={glass} />
      <div className="absolute right-3 top-3 opacity-90">
        <WidgetTile template={TILE} size="h-6 w-6" rounded="rounded-lg" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <p className="mt-auto text-3xl font-bold tabular-nums tracking-tight">
          {time}
          <span className="ml-1 align-middle text-xs font-semibold text-white/35">
            :{seconds}
          </span>
        </p>
        <p className="mt-0.5 truncate text-xs text-white/45">{date}</p>
      </div>
    </div>
  );
}
