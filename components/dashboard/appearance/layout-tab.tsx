"use client";

import { useState } from "react";

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

export default function LayoutTab({
  initialLayout,
  initialBlur,
  initialTiltEnabled,
  initialTiltMode,
  initialBorderRadius,
  initialCardWidth,
  initialCardOpacity,
  initialBorderOpacity,
}: {
  initialLayout: string;
  initialBlur: number;
  initialTiltEnabled: boolean;
  initialTiltMode: string;
  initialBorderRadius: number;
  initialCardWidth: number;
  initialCardOpacity: number;
  initialBorderOpacity: number;
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
      {/* Layout picker */}
      <div>
        <p className="mb-3 text-sm font-medium text-white/70">Profile layout</p>
        <div className="grid grid-cols-2 gap-3">
          {layouts.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelected(l.id)}
              className={`rounded-xl border-2 p-1 transition ${
                selected === l.id
                  ? "border-pink-400 bg-pink-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="aspect-[4/3] rounded-lg bg-black/40">
                {l.preview}
              </div>
              <p className="mt-2 pb-1 text-center text-xs font-medium text-white/70">
                {l.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Card Tilt Mode */}
      <div>
        <p className="mb-3 text-sm font-medium text-white/70">3D card effect</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "none", label: "None", desc: "Flat card" },
            { id: "tilt", label: "Tilt", desc: "Card rotates on hover" },
            { id: "parallax", label: "Parallax", desc: "Layers move with mouse" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setTiltMode(m.id);
                setTiltEnabled(m.id !== "none");
              }}
              className={`rounded-xl border-2 p-3 transition text-left ${
                tiltMode === m.id
                  ? "border-pink-400 bg-pink-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <p className="font-medium text-white/80">{m.label}</p>
              <p className="text-xs text-white/40 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Card width */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/70">Card width</p>
          <span className="text-xs text-white/40">{cardWidth}px</span>
        </div>
        <input
          type="range"
          min={300}
          max={800}
          step={20}
          value={cardWidth}
          onChange={(e) => setCardWidth(Number(e.target.value))}
          className="w-full accent-pink-400"
        />
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>Narrow</span>
          <span>Wide</span>
        </div>
      </div>

      {/* Card opacity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/70">Card background opacity</p>
          <span className="text-xs text-white/40">{cardOpacity}%</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={cardOpacity}
            onChange={(e) => setCardOpacity(Number(e.target.value))}
            className="flex-1 accent-pink-400"
          />
          <button
            type="button"
            onClick={setFullTransparent}
            className="px-3 py-1.5 text-xs font-medium text-white/60 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Full Transparent
          </button>
        </div>
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>Transparent</span>
          <span>Opaque</span>
        </div>
      </div>

      {/* Border opacity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/70">Card border opacity</p>
          <span className="text-xs text-white/40">{borderOpacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={borderOpacity}
          onChange={(e) => setBorderOpacity(Number(e.target.value))}
          className="w-full accent-pink-400"
        />
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>Transparent</span>
          <span>Opaque</span>
        </div>
      </div>

      {/* Border radius */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/70">Card border radius</p>
          <span className="text-xs text-white/40">{borderRadius}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          value={borderRadius}
          onChange={(e) => setBorderRadius(Number(e.target.value))}
          className="w-full accent-pink-400"
        />
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>Sharp</span>
          <span>Rounded</span>
        </div>
      </div>

      {/* Background blur */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/70">Background blur</p>
          <span className="text-xs text-white/40">{blur}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          value={blur}
          onChange={(e) => setBlur(Number(e.target.value))}
          className="w-full accent-pink-400"
        />
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>None</span>
          <span>Heavy</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-pink-400 px-5 py-2 text-sm font-semibold text-pink-950 transition hover:bg-pink-300 disabled:opacity-50"
      >
        {saved ? "Saved!" : saving ? "Saving..." : "Save"}
      </button>
      {saveError && <p role="alert" className="text-sm text-red-400">{saveError}</p>}
    </div>
  );
}