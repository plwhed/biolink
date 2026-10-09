"use client";

import { useEffect, useState } from "react";
import { WidgetTile, WidgetFrost } from "./tile";
import { glassPanelStyle, type WidgetGlass } from "./glass";

const shell =
  "relative flex min-h-[120px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#151517] p-4 text-white";

const TILE = { tileColor: "#5865F2", glyph: "discord", label: "Discord" } as const;

const statusColors: Record<string, string> = {
  online: "bg-emerald-400",
  idle: "bg-amber-400",
  dnd: "bg-red-400",
  offline: "bg-zinc-500",
};

interface LanyardData {
  username: string;
  avatar: string | null;
  status: string;
  activity: { name: string; detail: string | null } | null;
  spotify: { song: string | null; artist: string | null } | null;
}

export function LanyardWidget({
  config,
  glass = null,
}: {
  config: Record<string, string>;
  glass?: WidgetGlass | null;
}) {
  const discordId = (config.discordId ?? "").trim();
  const [data, setData] = useState<LanyardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!discordId) return;
    let cancelled = false;
    setData(null);
    setError("");
    fetch(`/api/widgets/lanyard?discordId=${encodeURIComponent(discordId)}`)
      .then((res) =>
        res.ok ? res.json() : res.json().then((b) => Promise.reject(new Error(b?.error)))
      )
      .then((body) => {
        if (!cancelled) setData(body as LanyardData);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Discord unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [discordId]);

  if (!discordId) {
    return (
      <div className={shell} style={glassPanelStyle(glass)}>
        <WidgetFrost glass={glass} />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <p className="mt-auto text-xs text-white/45">
            Add your Discord ID in the dashboard to turn this on.
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
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div className="h-3.5 w-24 rounded bg-white/10" />
          </div>
          {error && <p className="mt-2 text-xs text-white/40">{error}</p>}
        </div>
      </div>
    );
  }

  const dot = statusColors[data.status] ?? statusColors.offline;
  const sub = data.spotify?.song
    ? `${data.spotify.song}${data.spotify.artist ? ` — ${data.spotify.artist}` : ""}`
    : data.activity
      ? `${data.activity.name}${data.activity.detail ? ` — ${data.activity.detail}` : ""}`
      : data.status.toUpperCase();

  return (
    <div className={shell} style={glassPanelStyle(glass)}>
      <WidgetFrost glass={glass} />
      <div className="absolute right-3 top-3 z-20 opacity-90">
        <WidgetTile template={TILE} size="h-6 w-6" rounded="rounded-lg" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="mt-auto flex items-center gap-2.5">
        {data.avatar ? (
          <img
            src={data.avatar}
            alt={data.username}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/15"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-base font-bold">
            {data.username[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold uppercase tracking-wide">
            {data.username}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-white/45">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            {sub}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
