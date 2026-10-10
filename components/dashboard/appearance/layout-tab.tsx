"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStack } from "@/components/ui/toast-stack";
import { useDashboardDirtyState } from "@/components/dashboard/dashboard-dirty-state";
import {
  defaultCustomLayout,
  parseCustomLayout,
  serializeCustomLayout,
} from "@/lib/profile-layout";
import { PROFILE_LAYOUTS, getLayoutTemplate } from "@/components/profile/layouts";

const badgeOptions = [
  { id: "auto", label: "Auto", desc: "Follows your layout" },
  { id: "next", label: "Next to user", desc: "Beside your name" },
  { id: "below", label: "Below user", desc: "Under your name" },
];

const viewCorners = [
  { id: "top-left", label: "Top left" },
  { id: "top-right", label: "Top right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-right", label: "Bottom right" },
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
  initialBadgesPosition = "auto",
  initialShowViews = true,
  initialViewsPosition = "top-right",
  hideLayoutControls = false,
  customLayoutEnabled = false,
  customLayout = null,
  isPremium = false,
}: {
  initialLayout: string;
  initialBlur: number;
  initialTiltEnabled: boolean;
  initialTiltMode: string;
  initialBadgesPosition?: string;
  initialShowViews?: boolean;
  initialViewsPosition?: string;
  initialBorderRadius?: number;
  initialCardWidth?: number;
  initialCardOpacity?: number;
  initialBorderOpacity?: number;
  hideLayoutControls?: boolean;
  /** whether the custom layout (drag editor) is currently enabled */
  customLayoutEnabled?: boolean;
  /** the raw stored custom layout JSON (used to turn it off) */
  customLayout?: string | null;
  /** whether the viewer has an active Premium subscription */
  isPremium?: boolean;
}) {
  const router = useRouter();
  // Legacy stored ids ("centered", "left", …) resolve to Halo.
  const [selected, setSelected] = useState(
    () => getLayoutTemplate(initialLayout).id
  );
  const [blur, setBlur] = useState(initialBlur);
  const [tilt, setTilt] = useState(
    initialTiltEnabled && initialTiltMode !== "none"
  );
  const [badgesPosition, setBadgesPosition] = useState(initialBadgesPosition);
  const [showViews, setShowViews] = useState(initialShowViews);
  const [viewsPosition, setViewsPosition] = useState(initialViewsPosition);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [baseline, setBaseline] = useState({
    selected: getLayoutTemplate(initialLayout).id,
    blur: initialBlur,
    tilt: initialTiltEnabled && initialTiltMode !== "none",
    badgesPosition: initialBadgesPosition,
    showViews: initialShowViews,
    viewsPosition: initialViewsPosition,
  });
  const { pushToast } = useToastStack();

  const dirtyCount = useMemo(() => {
    const current = {
      selected,
      blur,
      tilt,
      badgesPosition,
      showViews,
      viewsPosition,
    };

    return Object.entries(current).filter(
      ([key, value]) => value !== baseline[key as keyof typeof baseline]
    ).length;
  }, [baseline, blur, selected, tilt, badgesPosition, showViews, viewsPosition]);

  const handleUndo = useCallback(() => {
    setSelected(baseline.selected);
    setBlur(baseline.blur);
    setTilt(baseline.tilt);
    setBadgesPosition(baseline.badgesPosition);
    setShowViews(baseline.showViews);
    setViewsPosition(baseline.viewsPosition);
  }, [baseline]);

  const handleSave = useCallback(async () => {
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
          tiltEnabled: tilt,
          tiltMode: tilt ? "tilt" : "none",
          badgesPosition,
          showViews,
          viewsPosition,
        }),
      });
      if (!response.ok) throw new Error("Could not save your layout settings.");
      setBaseline({
        selected,
        blur,
        tilt,
        badgesPosition,
        showViews,
        viewsPosition,
      });
      setSaved(true);
      pushToast("Layout Saved!");
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your layout settings.");
    } finally {
      setSaving(false);
    }
  }, [
    badgesPosition,
    blur,
    pushToast,
    selected,
    showViews,
    tilt,
    viewsPosition,
  ]);

  useDashboardDirtyState("layout", {
    count: dirtyCount,
    onSave: handleSave,
    onUndo: handleUndo,
  });

  const [turningOff, setTurningOff] = useState(false);

  /** Turn the custom (drag editor) layout off while keeping its settings. */
  const disableCustomLayout = useCallback(async () => {
    setTurningOff(true);
    setSaveError("");
    try {
      const parsed = parseCustomLayout(customLayout) ?? defaultCustomLayout();
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customLayout: serializeCustomLayout({ ...parsed, enabled: false }),
        }),
      });
      if (!response.ok) throw new Error("Could not turn off the custom layout.");
      pushToast("Custom layout turned off.");
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not turn off the custom layout."
      );
    } finally {
      setTurningOff(false);
    }
  }, [customLayout, pushToast, router]);

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
            <div className="flex max-w-3xl flex-row gap-4 overflow-x-auto pb-1">
              {PROFILE_LAYOUTS.map((l) => {
                const isPremiumLayout = !!l.premium;
                const premiumLocked = isPremiumLayout && !isPremium;
                const isActive =
                  l.id === "custom" ? customLayoutEnabled : selected === l.id;
                // While the custom layout is on it overrides the flow
                // layout — so those buttons must not trigger.
                const locked = l.id !== "custom" && customLayoutEnabled;
                const Preview = l.Preview;

                return (
                <button
                  key={l.id}
                  type="button"
                  disabled={locked}
                  title={l.description}
                  onClick={() => {
                    if (l.id === "custom") {
                      if (premiumLocked) {
                        router.push("/dashboard/premium");
                      } else {
                        router.push("/dashboard/customize/edit");
                      }
                      return;
                    }
                    setSelected(l.id);
                  }}
                  className={`group relative min-w-[150px] flex-1 rounded-2xl border p-2 transition-colors duration-200 ${
                    isActive
                      ? "border-pink-500/40 bg-pink-500/10"
                      : "border-[#1b1b1b] bg-[#0d0d0d] hover:border-white/20 hover:bg-[#111]"
                  } ${locked ? "cursor-not-allowed opacity-40 hover:border-[#1b1b1b] hover:bg-[#0d0d0d]" : ""}`}
                >
                  <div className="aspect-[4/3] rounded-xl bg-[#080808] overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                    <Preview />
                  </div>
                  <p className={`mt-2 pb-1 text-center text-xs font-semibold transition-colors duration-300 ${
                    isActive ? "text-pink-400" : "text-white/70 group-hover:text-white"
                  }`}>
                    {l.label}
                    {isPremiumLayout && (
                      <span
                        className={`ml-1.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          premiumLocked
                            ? "bg-amber-400/15 text-amber-300"
                            : "bg-pink-500/15 text-pink-300"
                        }`}
                      >
                        {premiumLocked ? "Premium" : isPremium ? "Premium ✓" : "Premium"}
                      </span>
                    )}
                  </p>
                  {premiumLocked && (
                    <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-300/30">
                      Locked
                    </span>
                  )}
                </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-white/35">
                {customLayoutEnabled ? (
                  <>
                    <span className="text-pink-400">Custom layout is on</span> —
                    template cards are ignored until you turn it off.
                  </>
                ) : !isPremium ? (
                  <>
                    Pick <span className="text-pink-400">Custom</span> to open the
                    full-screen editor —{" "}
                    <span className="text-amber-300">Premium only</span>.{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/premium")}
                      className="underline decoration-amber-300/50 underline-offset-2 hover:text-amber-200"
                    >
                      Get Premium
                    </button>{" "}
                    to unlock it. Templates in{" "}
                    <span className="text-white/60">components/profile/layouts/</span>{" "}
                    are free — add a file there and it shows up here.
                  </>
                ) : (
                  <>
                    Pick <span className="text-pink-400">Custom</span> to open the
                    full-screen editor — drag, resize and right-click anything on
                    your profile.
                  </>
                )}
              </p>

              {customLayoutEnabled && (
                <button
                  type="button"
                  onClick={disableCustomLayout}
                  disabled={turningOff}
                  className="flex items-center justify-center rounded-xl border px-3 py-3 text-sm transition-all duration-200 border-[#1b1b1b] bg-[#080808] text-white/40 hover:border-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {turningOff ? "Turning off…" : "Turn off custom layout"}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/60">Card tilt</p>
                <p className="text-xs text-white/40">Card rotates to follow the cursor.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={tilt}
                onClick={() => setTilt((value) => !value)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                  tilt ? "bg-pink-500" : "bg-[#1b1b1b]"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
                    tilt ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-white/60">Badges placement</p>
              <p className="text-xs text-white/40">Choose where badges appear relative to your name.</p>
            </div>
            <div className="grid max-w-2xl grid-cols-3 gap-4">
              {badgeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBadgesPosition(option.id)}
                  className={`group rounded-2xl border p-4 text-left transition-all duration-300 ease-out ${
                    badgesPosition === option.id
                      ? "border-pink-500/40 bg-pink-500/10 scale-[1.02]"
                      : "border-[#1b1b1b] bg-[#0d0d0d] hover:border-white/20 hover:bg-[#111] hover:scale-[1.01]"
                  }`}
                >
                  <p className={`text-sm font-bold transition-colors duration-300 ${
                    badgesPosition === option.id ? "text-pink-400" : "text-white"
                  }`}>{option.label}</p>
                  <p className="mt-0.5 text-xs text-white/40 transition-colors duration-300 group-hover:text-white/60">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/60">Profile views</p>
                <p className="text-xs text-white/40">Show a view counter on your profile.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showViews}
                onClick={() => setShowViews((value) => !value)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                  showViews ? "bg-pink-500" : "bg-[#1b1b1b]"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
                    showViews ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div
              className={`transition-opacity duration-200 ${
                showViews ? "opacity-100" : "pointer-events-none opacity-40"
              }`}
            >
              <p className="text-xs font-semibold text-white/50">
                Position inside the card
              </p>
              <div className="mt-3 grid max-w-xs grid-cols-2 gap-3">
                {viewCorners.map((corner) => (
                  <button
                    key={corner.id}
                    type="button"
                    disabled={!showViews}
                    onClick={() => setViewsPosition(corner.id)}
                    className={`group rounded-xl border p-3 text-left transition-all duration-300 ease-out ${
                      viewsPosition === corner.id
                        ? "border-pink-500/40 bg-pink-500/10"
                        : "border-[#1b1b1b] bg-[#080808] hover:border-white/20 hover:bg-[#111]"
                    }`}
                  >
                    <div className="relative h-8 w-full rounded-md bg-[#111]">
                      <span
                        className={`absolute h-2 w-4 rounded-sm ${
                          viewsPosition === corner.id ? "bg-pink-400" : "bg-white/30"
                        } ${
                          corner.id === "top-left"
                            ? "left-1 top-1"
                            : corner.id === "top-right"
                              ? "right-1 top-1"
                              : corner.id === "bottom-left"
                                ? "left-1 bottom-1"
                                : "right-1 bottom-1"
                        }`}
                      />
                    </div>
                    <p
                      className={`mt-2 text-xs font-semibold ${
                        viewsPosition === corner.id
                          ? "text-pink-400"
                          : "text-white/60 group-hover:text-white"
                      }`}
                    >
                      {corner.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {saveError && <p role="alert" className="text-sm text-red-400">{saveError}</p>}
        </>
      )}
    </div>
  );
}