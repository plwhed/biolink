import { useState } from "react";

type ColorKey = "accentColor" | "badgeColor" | "socialColor" | "linkHoverColor";

const colorOptions = [
  { id: "transparent", label: "Transparent", hex: "transparent" },
  { id: "white", label: "White", hex: "#ffffff" },
  { id: "emerald", label: "Emerald", hex: "#10b981" },
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "purple", label: "Purple", hex: "#a855f7" },
  { id: "pink", label: "Pink", hex: "#ec4899" },
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "red", label: "Red", hex: "#ef4444" },
  { id: "yellow", label: "Yellow", hex: "#eab308" },
  { id: "cyan", label: "Cyan", hex: "#06b6d4" },
];

const colorCategories: { key: ColorKey; label: string; desc: string }[] = [
  { key: "accentColor", label: "Accent Color", desc: "Link hover, buttons, highlights" },
  { key: "badgeColor", label: "Badge Color", desc: "Badge icons color" },
  { key: "socialColor", label: "Social Links Color", desc: "Social media icons color" },
  { key: "linkHoverColor", label: "Link Hover Color", desc: "Link buttons hover state" },
];

export default function ColorsTab({
  initialColors,
}: {
  initialColors: Record<ColorKey, string>;
}) {
  const [colors, setColors] = useState<Record<ColorKey, string>>(initialColors);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(colors),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8">
      {colorCategories.map((cat) => (
        <div key={cat.key}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-white/70">{cat.label}</p>
              <p className="text-xs text-white/40">{cat.desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {colorOptions.map((c) => (
              <button
                key={`${cat.key}-${c.id}`}
                type="button"
                onClick={() => setColors((prev) => ({ ...prev, [cat.key]: c.id }))}
                className={`relative h-10 w-10 rounded-xl border-2 transition ${
                  colors[cat.key] === c.id
                    ? "border-white scale-105"
                    : "border-white/10 hover:border-white/30"
                }`}
                style={c.id === "transparent" ? { background: "linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a2e 75%), linear-gradient(-45deg, transparent 75%, #1a1a2e 75%)", backgroundSize: "20px 20px", backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px" } : { backgroundColor: c.hex }}
              >
                {colors[cat.key] === c.id && (
                  <svg className="absolute inset-0 m-auto h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-pink-400 px-5 py-2 text-sm font-semibold text-pink-950 transition hover:bg-pink-300 disabled:opacity-50"
      >
        {saved ? "Saved!" : saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}