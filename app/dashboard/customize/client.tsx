"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import LayoutTab from "@/components/dashboard/appearance/layout-tab";
import { ColorPickerField } from "@/components/dashboard/appearance/colors-tab";
import MediaTab from "@/components/dashboard/appearance/media-tab";

const tabs = [
  {
    id: "assets",
    label: "Assets",
    icon: "M2.25 12h15M3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: "M10.5 6h9.75M10.5 6v11.25m0-11.25l-3 3m3-3l3 3m-3-3v11.25M3 6h18M3 6v11.25m0-11.25l3 3m-3-3l3 3",
  },
  {
    id: "layout",
    label: "Layout",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  },
];

interface Profile {
  layout: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  cursorUrl: string | null;
  blur: number;
  overlayEnabled: number;
  overlayText: string;
  tiltEnabled: number;
  tiltMode: string;
  borderRadius: number;
  cardWidth: number;
  cardOpacity: number;
  borderOpacity: number;
  borderWidth: number;
  description: string | null;
  displayName: string | null;
  accentColor: string;
  badgeColor: string;
  socialColor: string;
  linkHoverColor: string;
}

type SocialLink = {
  platform: string;
  url: string;
  order: number;
};

function Slider({
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const raf = useRef<number | null>(null);
  const pending = useRef<number | null>(null);
  const last = useRef(value);
  const onChangeRef = useRef(onChange);
  const [drag, setDrag] = useState<number | null>(null);

  onChangeRef.current = onChange;
  last.current = dragging.current ? last.current : value;

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    []
  );

  const shown = drag ?? value;
  const pct = ((shown - min) / (max - min)) * 100;

  const emit = (v: number) => {
    pending.current = v;
    if (raf.current !== null) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const n = pending.current;
      pending.current = null;
      if (n !== null && n !== last.current) {
        last.current = n;
        onChangeRef.current(n);
      }
    });
  };

  const handle = (clientX: number) => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    const raw = min + x * (max - min);
    setDrag(raw);
    const stepped = Math.min(Math.max(Math.round(raw / step) * step, min), max);
    emit(stepped);
  };

  const end = () => {
    dragging.current = false;
    setDrag(null);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-white">{label}</p>
        <span className="text-sm font-medium tabular-nums text-white/60">
          {value}
          {unit}
        </span>
      </div>

      <div
        className="cursor-pointer touch-none py-2.5"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          handle(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) handle(e.clientX);
        }}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div ref={track} className="relative mx-2 h-2 rounded-full bg-[#1b1b1b]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-pink-500 transition-[width] duration-200 ease-out will-change-[width]"
            style={{ width: `${pct}%` }}
          />
          <div
            className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-[left,transform] duration-200 ease-out will-change-[left] ${
              drag !== null ? "scale-125" : "scale-100"
            }`}
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
      <div className="flex items-center gap-4 border-b border-[#1b1b1b] p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/20">
          <svg
            className="h-6 w-6 text-pink-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-zinc-400">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-white/60">{label}</label>
      {children}
    </div>
  );
}

export default function AppearanceClient({
  profile,
  socialLinks,
}: {
  profile: Profile | null;
  socialLinks: SocialLink[];
}) {
  const router = useRouter();
  const [active, setActive] = useState("assets");
  const [appearanceSettings, setAppearanceSettings] = useState<any>({});
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorText, setErrorText] = useState("");

  const get = <K extends keyof Profile>(key: K, fallback: Profile[K]) =>
    (appearanceSettings[key] ?? profile?.[key] ?? fallback) as Profile[K];

  const set = (key: keyof Profile) => (v: any) =>
    setAppearanceSettings((prev: any) => ({ ...prev, [key]: v }));

  async function handleSaveAppearance() {
    setSaving(true);
    setFailed(false);
    setErrorText("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          description,
          ...appearanceSettings,
        }),
      });

      if (!response.ok) {
        let detail = `${response.status} ${response.statusText}`;
        try {
          const text = await response.text();
          if (text) detail = `${detail}: ${text.slice(0, 200)}`;
        } catch {}
        throw new Error(detail);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setFailed(true);
      setErrorText(e?.message ?? "Request failed");
      setTimeout(() => setFailed(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const accent = get("accentColor", "#ffffff");
  const textColor = get("linkHoverColor", "#ffffff");
  const borderColor = get("socialColor", "#ffffff");
  const bgColor = get("badgeColor", "#0d0d0d");
  const borderOpacity = get("borderOpacity", 100);
  const cardOpacity = get("cardOpacity", 100);
  const borderWidth = get("borderWidth", 1);
  const borderRadius = get("borderRadius", 24);
  const blur = get("blur", 0);

  const previewBackground = profile?.backgroundUrl
    ? {
        backgroundImage: `url(${profile.backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(236,72,153,0.35), transparent 50%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.3), transparent 50%)",
        backgroundColor: "#050505",
      };

  return (
    <div className="flex flex-col">
      <h1 className="text-4xl font-bold tracking-tight">Customize</h1>

      <p className="mt-1 text-sm text-white/50">
        Customize how your profile looks.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              active === t.id
                ? "bg-pink-400/15 text-pink-400 ring-1 ring-pink-400/30"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === "appearance" && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6 lg:col-span-2">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">
                    Appearance Settings
                  </h2>

                  <p className="text-zinc-400">
                    Customize how your profile looks and feels!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Section
                title="Identity"
                description="Name and bio shown on your profile"
                icon="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              >
                <div className="space-y-5">
                  <Field label="Display Name">
                    <input
                      type="text"
                      name="profile-display-name"
                      value={displayName}
                      maxLength={40}
                      placeholder="Your name"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10"
                    />
                  </Field>

                  <Field label="Description">
                    <textarea
                      name="profile-description"
                      value={description}
                      maxLength={160}
                      rows={3}
                      placeholder="Tell people about yourself"
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full resize-none rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10"
                    />
                    <span className="self-end text-xs text-white/30">
                      {description.length}/160
                    </span>
                  </Field>
                </div>
              </Section>

              <Section
                title="Colors"
                description="Accent and text colors"
                icon="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402a3.75 3.75 0 00-.615-5.77 3.75 3.75 0 00-5.77-.615L3.01 13.516a3.75 3.75 0 001.088 6.386z"
              >
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
                  <ColorPickerField
                    label="Primary Color"
                    description="Main accent color for the profile"
                    value={accent}
                    onChange={set("accentColor")}
                  />

                  <ColorPickerField
                    label="Text Color"
                    description="General text color for elements"
                    value={textColor}
                    onChange={set("linkHoverColor")}
                  />
                </div>
              </Section>

              <Section
                title="Card"
                description="Border, background and shape of your card"
                icon="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
              >
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
                  <ColorPickerField
                    label="Border Color"
                    description="Card border color"
                    value={borderColor}
                    onChange={set("socialColor")}
                    opacity={borderOpacity}
                    onOpacityChange={set("borderOpacity")}
                  />

                  <ColorPickerField
                    label="Background Color"
                    description="Card background color"
                    value={bgColor}
                    onChange={set("badgeColor")}
                    opacity={cardOpacity}
                    onOpacityChange={set("cardOpacity")}
                  />

                  <Slider
                    label="Border Width"
                    value={borderWidth}
                    unit="px"
                    min={0}
                    max={10}
                    onChange={set("borderWidth")}
                  />

                  <Slider
                    label="Border Radius"
                    value={borderRadius}
                    unit="px"
                    min={0}
                    max={50}
                    onChange={set("borderRadius")}
                  />

                  <div className="md:col-span-2">
                    <Slider
                      label="Background Blur"
                      value={blur}
                      unit="px"
                      min={0}
                      max={20}
                      onChange={set("blur")}
                    />
                  </div>
                </div>
              </Section>
            </div>

            <aside className="lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
                <div className="border-b border-[#1b1b1b] px-5 py-3">
                  <span className="text-sm font-semibold text-white">
                    nghh nghh ughhhh 
                  </span>
                </div>

                <div
                  className="flex min-h-[420px] items-center justify-center p-6"
                  style={previewBackground}
                >
                  <span className="text-2xl font-bold text-white">
                    dick
                  </span>
                </div>
              </div>
            </aside>

            <div className="flex flex-col items-end gap-2 lg:col-span-2">
              <button
                type="button"
                onClick={handleSaveAppearance}
                disabled={saving}
                className="rounded-xl bg-pink-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-400 active:scale-95 disabled:opacity-50"
              >
                {failed ? "Failed" : saved ? "Saved!" : saving ? "Saving..." : "Save"}
              </button>

              {errorText && (
                <p className="max-w-full break-words text-xs text-red-400">
                  {errorText}
                </p>
              )}
            </div>
          </div>
        )}

        {active === "layout" && (
          <div>
            <LayoutTab
              initialLayout={profile?.layout ?? "centered"}
              initialBlur={profile?.blur ?? 0}
              initialTiltEnabled={!!profile?.tiltEnabled}
              initialTiltMode={profile?.tiltMode ?? "tilt"}
              initialBorderRadius={profile?.borderRadius ?? 24}
              initialCardWidth={profile?.cardWidth ?? 420}
              initialCardOpacity={profile?.cardOpacity ?? 100}
              initialBorderOpacity={profile?.borderOpacity ?? 100}
            />
          </div>
        )}

        {active === "assets" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">
                    Profile Assets
                  </h2>

                  <p className="text-zinc-400">
                    Manage your profile assets that make your page yours!
                  </p>
                </div>
              </div>
            </div>

            <MediaTab
              initialAvatar={profile?.avatarUrl ?? null}
              initialBackground={profile?.backgroundUrl ?? null}
              initialCursor={profile?.cursorUrl ?? null}
            />
          </div>
        )}
      </div>
    </div>
  );
}