"use client";

import React from "react";

interface DayData {
  date: string;
  views: number;
}

export default function ViewsChart({ data, range }: { data: DayData[]; range: number }) {
  const max = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="p-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">Page views</h3>
        <span className="text-xs text-white/40">Last {range} days</span>
      </div>

      <div className="flex items-end gap-1.5" style={{ height: 140 }}>
        {data.map((d) => {
          const height = (d.views / max) * 100;
          return (
            <div
              key={d.date}
              className="group relative flex flex-1 items-end"
              style={{ height: "100%" }}
            >
              <div
                className="w-full rounded-t-sm bg-pink-500/60 transition-colors group-hover:bg-pink-400"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              <div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-md border border-white/10 bg-zinc-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-all duration-200 scale-75 group-hover:opacity-100 group-hover:scale-100 shadow-xl origin-bottom"
                style={{
                  bottom: `calc(${Math.max(height, 2)}% + 8px)`,
                }}
              >
                {d.date}: {d.views} views
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-white/30">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
