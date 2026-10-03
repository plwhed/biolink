"use client";

import { useState } from "react";
import LinksTab from "@/components/dashboard/appearance/links-tab";
import LayoutTab from "@/components/dashboard/appearance/layout-tab";
import InfoTab from "@/components/dashboard/appearance/info-tab";
import ColorsTab from "@/components/dashboard/appearance/colors-tab";

const tabs = [
  { id: "info", label: "Info", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "colors", label: "Colors", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17a4 4 0 01-4-4v-4" },
  { id: "links", label: "Links", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  { id: "layout", label: "Layout", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
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
  socialLinks: { platform: string; url: string; order: number }[];
}) {
  const [active, setActive] = useState("info");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
      <p className="mt-1 text-sm text-white/50">
        Customize how your profile looks.
      </p>

      <div className="mt-8 flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              active === t.id
                ? "bg-pink-400/15 text-pink-400 ring-1 ring-pink-400/30"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
        {active === "info" && (
          <InfoTab
            initialDisplayName={profile?.displayName ?? ""}
            initialDescription={profile?.description ?? ""}
            initialOverlayText={profile?.overlayText ?? "Click to show"}
            initialOverlayEnabled={!!profile?.overlayEnabled}
            initialAvatar={profile?.avatarUrl ?? null}
            initialBackground={profile?.backgroundUrl ?? null}
            initialCursor={profile?.cursorUrl ?? null}
          />
        )}
        {active === "colors" && (
          <ColorsTab
            initialColors={{
              accentColor: profile?.accentColor ?? "white",
              badgeColor: profile?.badgeColor ?? "white",
              socialColor: profile?.socialColor ?? "white",
              linkHoverColor: profile?.linkHoverColor ?? "white",
            }}
          />
        )}
        {active === "links" && <LinksTab initialLinks={socialLinks} />}
        {active === "layout" && (
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
        )}
      </div>
    </div>
  );
}
