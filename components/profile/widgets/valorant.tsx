"use client";

import { useEffect, useState } from "react";
import { WidgetTile, WidgetFrost } from "./tile";
import { glassPanelStyle, type WidgetGlass } from "./glass";

const shell =
  "relative flex min-h-[120px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#151517] p-4 text-white";

const TILE = { tileColor: "#FF4655", glyph: "valorant", label: "Valorant" } as const;

interface ValorantData {
  name: string;
  tag: string;
  level: number | null;
  region: string | null;
}

function splitRiotId(config: Record<string, string>): {
  name: string;
  tag: string;
} {
  const raw = (config.riotId ?? "").trim();
  if (raw.includes("#")) {
    const [name = "", ...rest] = raw.split("#");
    return { name: name.trim(), tag: rest.join("#").trim() };
  }
  const name = (config.name ?? "").trim();
  const tag = (config.tag ?? "").trim();
  if (name && tag) return { name, tag };
  return { name: raw, tag: "" };
}

export function ValorantWidget({
  config,
  glass = null,
}: {
  config: Record<string, string>;
  glass?: WidgetGlass | null;
}) {
  const { name, tag } = splitRiotId(config);
  const [data, setData] = useState<ValorantData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!name || !tag) return;
    let cancelled = false;
    setData(null);
    setError("");
    fetch(
      `/api/widgets/valorant?name=${encodeURIComponent(
        name
      )}&tag=${encodeURIComponent(tag)}`
    )
      .then((res) =>
        res.ok ? res.json() : res.json().then((b) => Promise.reject(new Error(b?.error)))
      )
      .then((body) => {
        if (!cancelled) setData(body as ValorantData);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Valorant unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [name, tag]);

  if (!name || !tag) {
    return (
      <div className={shell} style={glassPanelStyle(glass)}>
        <WidgetFrost glass={glass} />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <p className="mt-auto text-xs text-white/45">
            Add your Riot ID in the dashboard to turn this on.
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={shell} style={glassPanelStyle(glass)}>
        <WidgetFrost glass={glass} />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="mt-auto flex animate-pulse items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white/10" />
            <div className="h-3.5 w-28 rounded bg-white/10" />
          </div>
          {error && <p className="mt-2 text-xs text-white/40">{error}</p>}
        </div>
      </div>
    );
  }

  const meta = [
    data.level != null ? `LVL ${data.level}` : null,
    data.region,
  ].filter(Boolean);

  return (
    <div className={shell} style={glassPanelStyle(glass)}>
      <WidgetFrost glass={glass} />
      <div className="absolute right-3 top-3 z-20 opacity-90">
        <WidgetTile template={TILE} size="h-6 w-6" rounded="rounded-lg" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="mt-auto flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
            style={{ backgroundColor: "#FF4655" }}
          >
            V
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold uppercase tracking-wide">
              {data.name}
              <span className="text-white/35"> #{data.tag}</span>
            </p>
            <p className="mt-0.5 truncate text-[11px] text-white/45">
              {meta.length > 0 ? meta.join(" · ") : "Valorant profile"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
