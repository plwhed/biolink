"use client";

import { useState } from "react";

export function Range({
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  left,
  right,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  left: string;
  right: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="group rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-5 transition-all duration-300 ease-out hover:border-white/20 hover:bg-[#0f0f0f]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white/60 transition-colors group-hover:text-white/80">{label}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white min-w-[60px] text-right font-medium transition-colors group-hover:text-white">
            {value}{unit}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const val = Number(e.target.value);
          onChange(Math.min(Math.max(val, min), max));
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1b1b1b] accent-pink-500 transition-all duration-300 ease-in-out hover:accent-pink-400"
        style={{
          backgroundImage: `linear-gradient(to right, #ec4899 ${ ((value - min) / (max - min)) * 100 }%, #1b1b1b 0%)`,
        }}
      />
    </div>
  );
}

export default function CardSettings({
  initialBlur,
  initialBorderRadius,
  initialCardWidth,
  initialCardOpacity,
  initialBorderOpacity,
  onChange,
}: {
  initialBlur: number;
  initialBorderRadius: number;
  initialCardWidth: number;
  initialCardOpacity: number;
  initialBorderOpacity: number;
  onChange: (settings: any) => void;
}) {
  // This component is now deprecated in favor of using Range directly in AppearanceClient
  return null;
}
