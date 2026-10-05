"use client";

import { useState, useRef } from "react";

const layouts = [
  {
    id: "centered",
    label: "Centered",
    preview: (
      <div className="flex h-full items-center justify-center">
        <div className="w-2/3 space-y-2">
          <div className="mx-auto h-3 w-6 rounded-full bg-pink-400/40" />
          <div className="mx-auto h-2.5 w-16 rounded-full bg-white/20" />
          <div className="mt-4 space-y-1.5">
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "left",
    label: "Left aligned",
    preview: (
      <div className="flex h-full items-center justify-center">
        <div className="w-2/3 space-y-2 pl-2">
          <div className="h-6 w-6 rounded-full bg-pink-400/40" />
          <div className="h-2.5 w-16 rounded-full bg-white/20" />
          <div className="mt-4 space-y-1.5">
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
          </div>
        </div>
      </div>
    ),
  },
];

const tiltModes = [
  { id: "none", label: "None", desc: "Flat card" },
  { id: "tilt", label: "Tilt", desc: "Card rotates on hover" },
  { id: "parallax", label: "Parallax", desc: "Layers move with mouse" },
];

function Range({
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  left,
  right,
  onChange,
  action,
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
  action?: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-5 transition-all duration-300 ease-out hover:border-white/20 hover:bg-[#0f0f0f]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white/60 transition-colors group-hover:text-white/80">{label}</p>
        <div className="flex items-center gap-3">
          {action}
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
      <div className="mt-2 flex justify-between text-[10px] text-white/30 transition-colors group-hover:text-white/50">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

export default function LayoutTab({
  initialLayout,
  initialBlur,
  initialTiltEnabled,
  initialTiltMode,
  initialBorderRadius,
  initialCardWidth,
  initialCardOpacity,
  initialBorderOpacity,
  hideLayoutControls = false,
}: {
  initialLayout: string;
  initialBlur: number;
  initialTiltEnabled: boolean;
  initialTiltMode: string;
  initialBorderRadius: number;
  initialCardWidth: number;
  initialCardOpacity: number;
  initialBorderOpacity: number;
  hideLayoutControls?: boolean;
}) {
  const [selected, setSelected] = useState(initialLayout);
  const [blur, setBlur] = useState(initialBlur);
  const [tiltEnabled, setTiltEnabled] = useState(initialTiltEnabled);
  const [tiltMode, setTiltMode] = useState(initialTiltMode);
  const [borderRadius, setBorderRadius] = useState(initialBorderRadius);
  const [cardWidth, setCardWidth] = useState(initialCardWidth);
  const [cardOpacity, setCardOpacity] = useState(initialCardOpacity);
  const [borderOpacity, setBorderOpacity] = useState(initialBorderOpacity);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layout: selected,
          blur,
          tiltEnabled,
          tiltMode,
          borderRadius,
          cardWidth,
          cardOpacity,
          borderOpacity,
        }),
      });
      if (!response.ok) throw new Error("Could not save your layout settings.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your layout settings.");
    } finally {
      setSaving(false);
    }
  }

  function setFullTransparent() {
    setCardOpacity(0);
    setBorderOpacity(0);
  }

  return (
    <div className="space-y-8">
      {!hideLayoutControls && (
        <>
          <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">Layout Settings</h2>
                <p className="text-zinc-400">Adjust how your profile is arranged and displayed!</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6 space-y-4">
            <p className="text-sm font-semibold text-white/60">Profile layout</p>
            <div className="grid max-w-2xl grid-cols-2 gap-4">
              {layouts.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelected(l.id)}
                  className={`group rounded-2xl border p-2 transition-all duration-300 ease-out ${
                    selected === l.id
                      ? "border-pink-500/40 bg-pink-500/10 scale-[1.02]"
                      : "border-[#1b1b1b] bg-[#0d0d0d] hover:border-white/20 hover:bg-[#111] hover:scale-[1.01]"
                  }`}
                >
                  <div className="aspect-[4/3] rounded-xl bg-[#080808] overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">{l.preview}</div>
                  <p className={`mt-2 pb-1 text-center text-xs font-semibold transition-colors duration-300 ${
                    selected === l.id ? "text-pink-400" : "text-white/70 group-hover:text-white"
                  }`}>{l.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6 space-y-4">
            <p className="text-sm font-semibold text-white/60">Card effects</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {tiltModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setTiltMode(m.id);
                    setTiltEnabled(m.id !== "none");
                  }}
                  className={`group rounded-2xl border p-5 text-left transition-all duration-300 ease-out ${
                    tiltMode === m.id
                      ? "border-pink-500/40 bg-pink-500/10 scale-[1.02]"
                      : "border-[#1b1b1b] bg-[#0d0d0d] hover:border-white/20 hover:bg-[#111] hover:scale-[1.01]"
                  }`}
                >
                  <p className={`text-base font-bold tracking-tight transition-colors duration-300 ${
                    tiltMode === m.id ? "text-pink-400" : "text-white group-hover:text-white"
                  }`}>{m.label}</p>
                  <p className="mt-0.5 text-xs text-white/40 group-hover:text-white/60 transition-colors duration-300">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-400 disabled:opacity-50"
            >
              {saved ? "Saved!" : saving ? "Saving..." : "Save"}
            </button>
            {saveError && <p role="alert" className="text-sm text-red-400">{saveError}</p>}
          </div>
        </>
      )}
    </div>
  );
}