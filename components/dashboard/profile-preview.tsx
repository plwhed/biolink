"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import ProfileCard, {
  type ProfileCardBadge,
  type ProfileCardLink,
  type ProfileCardProfile,
  type ProfileCardSocial,
} from "@/components/profile/profile-card";
import { ProfileWidgets } from "@/components/profile/widgets";
import { cardGlass } from "@/components/profile/widgets/glass";
import type { FeedbackState } from "@/lib/feedback";
import { resolveColor, withAlpha } from "@/lib/color";

export type PreviewDevice = "desktop" | "phone";

/**
 * Live profile preview used across the dashboard. It renders exactly the
 * same card as the public profile page (so new profile features show up
 * automatically) at a **1:1 scale** — same paddings, same vertical
 * centering, no extra chrome — so what people see here is exactly what
 * visitors see on their profile.
 *
 *  - desktop → full-bleed, identical to /username
 *  - phone   → the same page inside a slim phone shell at phone width
 *
 * Includes a Desktop / Phone segmented switch. Links are rendered inert
 * (`preview`) so clicking around never navigates away from the dashboard.
 */
export default function ProfilePreview({
  profile,
  badges = [],
  socials = [],
  links = [],
  viewCount = 0,
  minHeight = 650,
  device,
  onDeviceChange,
  editor = false,
  feedback = null,
  widgets = [],
}: {
  profile: ProfileCardProfile | null;
  badges?: ProfileCardBadge[];
  socials?: ProfileCardSocial[];
  links?: ProfileCardLink[];
  viewCount?: number;
  minHeight?: number;
  device?: PreviewDevice;
  onDeviceChange?: (device: PreviewDevice) => void;
  /** Layout editor mode: hidden elements render dimmed placeholders. */
  editor?: boolean;
  feedback?: FeedbackState | null;
  widgets?: Array<{ type: string; config: Record<string, string> }>;
}) {
  const [internalDevice, setInternalDevice] = useState<PreviewDevice>("desktop");

  const activeDevice = device ?? internalDevice;
  const isPhone = activeDevice === "phone";

  const setDevice = (next: PreviewDevice) => {
    setInternalDevice(next);
    onDeviceChange?.(next);
  };

  const backgroundBlur = profile?.blur ?? 0;
  const backgroundColor = resolveColor(profile?.backgroundColor, "#111111");
  const primaryColor = resolveColor(
    profile?.primaryColor ?? profile?.accentColor,
    "#ffffff"
  );

  /* The profile background layer — identical to the public page. */
  const bgStyle: CSSProperties = profile?.backgroundUrl
    ? {
        backgroundImage: `url(${profile.backgroundUrl})`,
        filter: backgroundBlur > 0 ? `blur(${backgroundBlur}px)` : undefined,
        transform: backgroundBlur > 0 ? "scale(1.03)" : undefined,
      }
    : {
        backgroundColor,
        backgroundImage: `radial-gradient(circle at 20% 20%, ${withAlpha(
          primaryColor,
          0.16
        )}, transparent 50%), radial-gradient(circle at 80% 80%, ${withAlpha(
          primaryColor,
          0.1
        )}, transparent 50%)`,
      };

  // The bg is allowed to bleed a little for the blur, but it lives inside
  // a clipping layer so it can never create phantom scroll space.
  const bgLayer = (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-[-30px] bg-cover bg-center transition-all duration-500"
        style={bgStyle}
      >
        {profile?.backgroundUrl && (
          <div className="absolute inset-0 bg-black/50" />
        )}
      </div>
    </div>
  );

  /* On a phone the card should fit the handset — cap its width. */
  const phoneProfile: ProfileCardProfile | null = profile
    ? { ...profile, cardWidth: Math.min(profile.cardWidth ?? 420, 372) }
    : profile;

  const card = (renderProfile: ProfileCardProfile | null) => (
    <ProfileCard
      user={{ id: 0, username: "Your Name" }}
      profile={renderProfile}
      badges={badges}
      socials={socials}
      links={links}
      viewCount={viewCount}
      preview
      editor={editor}
      feedback={feedback}
    />
  );

  // The public page wraps the card in
  // `relative flex min-h-screen items-center justify-center px-4 py-12`
  // — mirrored here so the preview lines up 1:1 with the real profile.
  const content = (renderProfile: ProfileCardProfile | null, height: number) => (
    <div
      className="relative flex flex-col items-center justify-center gap-6 px-4 py-12"
      style={{ minHeight: `${height}px` }}
    >
      {card(renderProfile)}
      <ProfileWidgets
        widgets={widgets}
        width={renderProfile?.cardWidth ?? 420}
        glass={cardGlass(renderProfile)}
      />
    </div>
  );

  const phoneHeight = Math.max(minHeight - 64, 420);

  return (
    <div
      className="relative overflow-y-auto overflow-x-hidden bg-[#070707]"
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Desktop / Phone segmented switch */}
      <div className="pe-seg absolute right-3 top-3 z-50 flex items-center gap-1 rounded-xl border border-white/10 bg-black/60 p-1 shadow-lg shadow-black/40 backdrop-blur-md" id="devSeg">
        <button
          type="button"
          data-d="desktop"
          onClick={() => setDevice("desktop")}
          className={`pe-on rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            !isPhone
              ? "bg-pink-500 text-white shadow"
              : "text-white/50 hover:text-white"
          }`}
        >
          Desktop
        </button>
        <button
          type="button"
          data-d="phone"
          onClick={() => setDevice("phone")}
          className={`pe-on rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            isPhone
              ? "bg-pink-500 text-white shadow"
              : "text-white/50 hover:text-white"
          }`}
        >
          Phone
        </button>
      </div>

      {isPhone ? (
        /* ------------------------------ phone ------------------------------ */
        <div className="flex justify-center p-4">
          <div className="relative w-full max-w-[414px] rounded-[42px] border border-white/15 bg-[#050505] p-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.85)]">
            <div
              className="relative overflow-hidden rounded-[34px] bg-black"
              style={{ minHeight: `${phoneHeight}px` }}
            >
              {/* notch */}
              <div className="pointer-events-none absolute left-1/2 top-3 z-50 h-6 w-24 -translate-x-1/2 rounded-full bg-black/90 ring-1 ring-white/10" />

              {bgLayer}
              {content(phoneProfile, phoneHeight)}
            </div>
          </div>
        </div>
      ) : (
        /* ----------------------------- desktop ----------------------------- */
        <div className="relative" style={{ minHeight: `${minHeight}px` }}>
          {bgLayer}
          {content(profile, minHeight)}
        </div>
      )}
    </div>
  );
}
