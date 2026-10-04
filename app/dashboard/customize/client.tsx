"use client";

import { useState } from "react";

import LayoutTab from "@/components/dashboard/appearance/layout-tab";
import ColorsTab, {
  ColorPickerField,
} from "@/components/dashboard/appearance/colors-tab";
import MediaTab from "@/components/dashboard/appearance/media-tab";
import CardSettings, {
  Range,
} from "@/components/dashboard/appearance/card-settings";

const tabs = [
  {
    id: "assets",
    label: "Assets",
    icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17a4 4 0 01-4-4v-4",
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

export default function AppearanceClient({
  profile,
  socialLinks,
}: {
  profile: Profile | null;
  socialLinks: {
    platform: string;
    url: string;
    order: number;
  }[];
}) {
  const [active, setActive] = useState("assets");
  const [appearanceSettings, setAppearanceSettings] = useState<any>({});
  const [displayName, setDisplayName] = useState(
    profile?.displayName ?? ""
  );
  const [description, setDescription] = useState(
    profile?.description ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("main");

  async function handleSaveAppearance() {
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
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
        throw new Error("Failed to save appearance");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const toggleSection = (section: string) => {
    setOpenSection((prev) =>
      prev === section ? null : section
    );
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold tracking-tight">
        Customize
      </h1>

      <p className="mt-1 text-sm text-white/50">
        Customize how your profile looks.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              active === t.id
                ? "bg-pink-400/15 text-pink-400 ring-1 ring-pink-400/30"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={t.icon}
              />
            </svg>

            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === "appearance" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-pink-500"
                    >
                      <path d="M12 3v12" />
                      <path d="m17 8-5-5-5 5" />
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">
                    Appearance Settings
                  </h2>

                  <p className="text-zinc-400">
                    Customize how your profile looks and feels.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {/* Main Information */}

              <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <label className="mb-1.5 block text-sm font-semibold text-white/60">
                        Display Name
                      </label>

                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) =>
                          setDisplayName(e.target.value)
                        }
                        className="w-full rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1.5 block text-sm font-semibold text-white/60">
                        Description
                      </label>

                      <textarea
                        value={description}
                        onChange={(e) =>
                          setDescription(e.target.value)
                        }
                        rows={2}
                        className="w-full resize-none rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <ColorPickerField
                      label="Primary Color"
                      description="Main accent color for the profile"
                      value={
                        appearanceSettings.accentColor ??
                        profile?.accentColor ??
                        "#ffffff"
                      }
                      onChange={(v) =>
                        setAppearanceSettings((prev: any) => ({
                          ...prev,
                          accentColor: v,
                        }))
                      }
                    />

                    <ColorPickerField
                      label="Text Color"
                      description="General text color for elements"
                      value={
                        appearanceSettings.linkHoverColor ??
                        profile?.linkHoverColor ??
                        "#ffffff"
                      }
                      onChange={(v) =>
                        setAppearanceSettings((prev: any) => ({
                          ...prev,
                          linkHoverColor: v,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Card Style */}
              <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-4">
                <div className="mb-4">
                  <span className="text-sm font-medium">Card Style</span>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-6">
                    {/* Border Group */}
                    <div className="flex flex-col gap-4 rounded-xl border border-[#1b1b1b] bg-[#080808] p-4">
                      <ColorPickerField
                        label="Border Color"
                        description="Card border color"
                        value={
                          appearanceSettings.socialColor ??
                          profile?.socialColor ??
                          "#ffffff"
                        }
                        onChange={(v) =>
                          setAppearanceSettings((prev: any) => ({
                            ...prev,
                            socialColor: v,
                          }))
                        }
                      />
                      <Range
                        label="Border Opacity"
                        value={
                          appearanceSettings.borderOpacity ??
                          profile?.borderOpacity ??
                          100
                        }
                        unit="%"
                        min={0}
                        max={100}
                        left="Transparent"
                        right="Opaque"
                        onChange={(v) =>
                          setAppearanceSettings((prev: any) => ({
                            ...prev,
                            borderOpacity: v,
                          }))
                        }
                      />
                    </div>

                    <Range
                      label="Border Width"
                      value={
                        appearanceSettings.borderWidth ??
                        profile?.borderWidth ??
                        1
                      }
                      unit="px"
                      min={0}
                      max={10}
                      step={1}
                      left="Thin"
                      right="Thick"
                      onChange={(v) =>
                        setAppearanceSettings((prev: any) => ({
                          ...prev,
                          borderWidth: v,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Background Group */}
                    <div className="flex flex-col gap-4 rounded-xl border border-[#1b1b1b] bg-[#080808] p-4">
                      <ColorPickerField
                        label="Background Color"
                        description="Card background color"
                        value={
                          appearanceSettings.badgeColor ??
                          profile?.badgeColor ??
                          "#ffffff"
                        }
                        onChange={(v) =>
                          setAppearanceSettings((prev: any) => ({
                            ...prev,
                            badgeColor: v,
                          }))
                        }
                      />
                      <Range
                        label="Card Opacity"
                        value={
                          appearanceSettings.cardOpacity ??
                          profile?.cardOpacity ??
                          100
                        }
                        unit="%"
                        min={0}
                        max={100}
                        left="Transparent"
                        right="Opaque"
                        onChange={(v) =>
                          setAppearanceSettings((prev: any) => ({
                            ...prev,
                            cardOpacity: v,
                          }))
                        }
                      />
                    </div>

                    {/* Effects Group */}
                    <div className="flex flex-col gap-4 rounded-xl border border-[#1b1b1b] bg-[#080808] p-4">
                      <Range
                        label="Border Radius"
                        value={
                          appearanceSettings.borderRadius ??
                          profile?.borderRadius ??
                          24
                        }
                        unit="px"
                        min={0}
                        max={50}
                        left="Sharp"
                        right="Rounded"
                        onChange={(v) =>
                          setAppearanceSettings((prev: any) => ({
                            ...prev,
                            borderRadius: v,
                          }))
                        }
                      />
                      <Range
                        label="Background Blur"
                        value={
                          appearanceSettings.blur ??
                          profile?.blur ??
                          0
                        }
                        unit="px"
                        min={0}
                        max={20}
                        left="None"
                        right="Heavy"
                        onChange={(v) =>
                          setAppearanceSettings((prev: any) => ({
                            ...prev,
                            blur: v,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Effects */}
              <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Range
                    label="Border Radius"
                    value={
                      appearanceSettings.borderRadius ??
                      profile?.borderRadius ??
                      24
                    }
                    unit="px"
                    min={0}
                    max={50}
                    left="Sharp"
                    right="Rounded"
                    onChange={(v) =>
                      setAppearanceSettings((prev: any) => ({
                        ...prev,
                        borderRadius: v,
                      }))
                    }
                  />

                  <Range
                    label="Background Blur"
                    value={
                      appearanceSettings.blur ??
                      profile?.blur ??
                      0
                    }
                    unit="px"
                    min={0}
                    max={20}
                    left="None"
                    right="Heavy"
                    onChange={(v) =>
                      setAppearanceSettings((prev: any) => ({
                        ...prev,
                        blur: v,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveAppearance}
                disabled={saving}
                className="rounded-xl bg-pink-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-400 disabled:opacity-50"
              >
                {saved
                  ? "Saved!"
                  : saving
                    ? "Saving..."
                    : "Save Appearance"}
              </button>
            </div>
          </div>
        )}

        {active === "layout" && (
          <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-8">
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
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-pink-500"
                    >
                      <path d="M12 3v12" />
                      <path d="m17 8-5-5-5 5" />
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    </svg>
                  </div>
                </div>

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
