"use client";

import { useEffect, useState } from "react";
import { WidgetTile, WidgetFrost } from "./tile";
import { glassPanelStyle, type WidgetGlass } from "./glass";

const shell =
  "relative flex min-h-[120px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#151517] p-4 text-white";

const TILE = { tileColor: "#F59E0B", glyph: "weather", label: "Weather" } as const;

function Skeleton({ glass = null }: { glass?: WidgetGlass | null }) {
  return (
    <div className={shell} style={glassPanelStyle(glass)}>
      <WidgetFrost glass={glass} />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="mt-auto animate-pulse space-y-2">
          <div className="h-7 w-20 rounded-lg bg-white/10" />
          <div className="h-3.5 w-28 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function describe(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return "Rainy";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return "Snowy";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  code: number;
  high: number;
  low: number;
  units: string;
}

export function WeatherWidget({
  config,
  glass = null,
}: {
  config: Record<string, string>;
  glass?: WidgetGlass | null;
}) {
  const city = (config.city ?? "").trim();
  const units = config.units === "fahrenheit" ? "fahrenheit" : "celsius";
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setData(null);
    setError("");
    fetch(
      `/api/widgets/weather?city=${encodeURIComponent(city)}&units=${units}`
    )
      .then((res) =>
        res.ok ? res.json() : res.json().then((b) => Promise.reject(new Error(b?.error)))
      )
      .then((body) => {
        if (!cancelled) setData(body as WeatherData);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Weather unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [city, units]);

  if (!city) {
    return (
      <div className={shell} style={glassPanelStyle(glass)}>
        <WidgetFrost glass={glass} />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <p className="mt-auto text-xs text-white/45">
            Set a city in the dashboard to turn this on.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={shell} style={glassPanelStyle(glass)}>
        <WidgetFrost glass={glass} />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <p className="mt-auto text-xs text-white/45">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return <Skeleton glass={glass} />;

  const unitSymbol = units === "fahrenheit" ? "°F" : "°C";

  return (
    <div className={shell} style={glassPanelStyle(glass)}>
      <WidgetFrost glass={glass} />
      <div className="absolute right-3 top-3 z-20 opacity-90">
        <WidgetTile template={TILE} size="h-6 w-6" rounded="rounded-lg" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <p className="mt-auto text-2xl font-bold tabular-nums tracking-tight">
          {data.temp}
          {unitSymbol}
        </p>
        <p className="mt-0.5 truncate text-xs text-white/45">
          {describe(data.code)} · {data.city}
          {data.country ? `, ${data.country}` : ""} · H:{data.high}° L:
          {data.low}°
        </p>
      </div>
    </div>
  );
}
