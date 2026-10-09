"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutTab from "@/components/dashboard/appearance/layout-tab";
import { ColorPickerField } from "@/components/dashboard/appearance/colors-tab";
import {
  Field,
  Section,
  Slider,
  ToggleRow,
} from "@/components/dashboard/appearance/controls";
import MediaTab from "@/components/dashboard/appearance/media-tab";
import ProfilePreview from "@/components/dashboard/profile-preview";
import type { FeedbackState } from "@/lib/feedback";
import type { WidgetState } from "@/lib/widget-types";
import type { ProfileCardProfile } from "@/components/profile/profile-card";
import { useDashboardDirtyState } from "@/components/dashboard/dashboard-dirty-state";
import { useToastStack } from "@/components/ui/toast-stack";
import { parseCustomLayout } from "@/lib/profile-layout";

const tabs = [
  {
    id: "assets",
    label: "Assets",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-9h.01M6 19h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  },
  {
    id: "badges",
    label: "Badges",
    icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
  },
  {
    id: "layout",
    label: "Layout",
    icon: "M4 5a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm8 0a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V5zm-8 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm8 0a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6z",
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
  borderWidth: number;
  description: string | null;
  bio: string | null;
  displayName: string | null;
  cardOpacity: number;
  borderOpacity: number;
  cardWidth: number;
  cardBlurEnabled: number;
  cardBlur: number;
  avatarShape: string;
  location: string | null;
  occupation: string | null;
  showViews: number;
  viewsPosition: string;
  badgesPosition: string;
  customLayout: string | null;
  primaryColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  backgroundColor: string;
  badgeColor: string;
  socialColor: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconUrl?: string | null;
  order: number;
}

interface ProfileLink {
  id: string;
  title: string;
  url?: string | null;
}

interface Badge {
  id: string | number;
  name: string;
  iconPrefix: string;
  iconName: string;
  iconUrl?: string | null;
  color: string | null;
  hidden?: boolean;
}

const colorMap: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  emerald: "#10b981",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  orange: "#f97316",
  red: "#ef4444",
  yellow: "#eab308",
  cyan: "#06b6d4",
};

function resolveColor(
  value: string | null | undefined,
  fallback: string
) {
  if (!value) return fallback;

  const normalized = value.trim().toLowerCase();

  if (colorMap[normalized]) return colorMap[normalized];
  if (/^#[0-9a-f]{3}$/i.test(normalized)) return normalized;
  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized;
  if (/^#[0-9a-f]{8}$/i.test(normalized)) return normalized;
  if (/^(rgb|rgba|hsl|hsla)\(/i.test(normalized)) return value;

  return fallback;
}

export default function CustomizeClient({
  profile,
  socialLinks,
  links = [],
  badges = [],
  viewCount = 0,
  isPremium = false,
  premiumPlan = null,
  initialFeedback = null,
  initialWidgets = [],
}: {
  profile: Profile | null;
  socialLinks: SocialLink[];
  links?: ProfileLink[];
  badges?: Badge[];
  viewCount?: number;
  isPremium?: boolean;
  premiumPlan?: string | null;
  initialFeedback?: FeedbackState | null;
  initialWidgets?: WidgetState[];
}) {
  const router = useRouter();

  const [active, setActive] = useState("assets");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { pushToast } = useToastStack();

  const badgeMapFromProp = (list: Badge[]) =>
    Object.fromEntries(
      list.map((badge) => [String(badge.id), Boolean(badge.hidden)])
    );

  const [badgeVisibility, setBadgeVisibility] = useState<Record<string, boolean>>(() =>
    badgeMapFromProp(badges ?? [])
  );
  const [badgeBaseline, setBadgeBaseline] = useState<Record<string, boolean>>(() =>
    badgeMapFromProp(badges ?? [])
  );

  // Re-sync badge state when the badges prop changes. Done during render
  // (React's "adjust state when a prop changes" pattern) instead of an effect.
  const [prevBadges, setPrevBadges] = useState(badges);

  if (prevBadges !== badges) {
    setPrevBadges(badges);
    const next = badgeMapFromProp(badges ?? []);
    setBadgeBaseline(next);
    setBadgeVisibility(next);
  }

  const [displayName, setDisplayName] = useState(
    profile?.displayName ?? ""
  );

  const [description, setDescription] = useState(
    profile?.description ?? ""
  );

  const [bio, setBio] = useState(profile?.bio ?? "");

  const [location, setLocation] = useState(
    profile?.location ?? ""
  );

  const [occupation, setOccupation] = useState(
    profile?.occupation ?? ""
  );

  const [overlayEnabled, setOverlayEnabled] = useState(
    profile?.overlayEnabled === 1
  );

  const [overlayText, setOverlayText] = useState(
    profile?.overlayText ?? "Click to show"
  );

  const [cardBlurEnabled, setCardBlurEnabled] = useState(
    profile?.cardBlurEnabled !== 0
  );

  const [avatarShape, setAvatarShape] = useState(
    profile?.avatarShape ?? "circle"
  );

  const [settings, setSettings] = useState<Partial<Profile>>({});

  const get = useCallback(
    <K extends keyof Profile>(key: K, fallback: Profile[K]) => {
      return (settings[key] ?? profile?.[key] ?? fallback) as Profile[K];
    },
    [profile, settings]
  );

  const set = useCallback(
    (key: keyof Profile) => (value: unknown) => {
      setSettings((current) => ({
        ...current,
        [key]: value,
      }));
    },
    []
  );

  const cardOpacity = Number(get("cardOpacity", 100));
  const borderOpacity = Number(get("borderOpacity", 100));
  const borderWidth = Number(get("borderWidth", 1));
  const borderRadius = Number(get("borderRadius", 24));
  const cardWidth = Number(get("cardWidth", 420));
  const backgroundBlur = Number(get("blur", 0));
  const cardBlur = Number(get("cardBlur", 20));

  const defaultAppearanceState = useMemo(
    () => ({
      displayName: profile?.displayName ?? "",
      description: profile?.description ?? "",
      bio: profile?.bio ?? "",
      location: profile?.location ?? "",
      occupation: profile?.occupation ?? "",
      overlayEnabled: profile?.overlayEnabled === 1,
      overlayText: profile?.overlayText ?? "Click to show",
      avatarShape: profile?.avatarShape ?? "circle",
      cardBlurEnabled: profile?.cardBlurEnabled !== 0,
      primaryColor: profile?.primaryColor ?? "#ffffff",
      textColor: profile?.textColor ?? "#ffffff",
      accentColor: profile?.accentColor ?? "#ffffff",
      borderColor: profile?.borderColor ?? "#ffffff",
      backgroundColor: profile?.backgroundColor ?? "#111111",
      badgeColor: profile?.badgeColor ?? "#ffffff",
      socialColor: profile?.socialColor ?? "#ffffff",
    }),
    [profile]
  );

  const [savedAppearanceState, setSavedAppearanceState] = useState(defaultAppearanceState);

  const dirtyCount = useMemo(() => {
    const fields = [
      { value: displayName, initial: savedAppearanceState.displayName },
      { value: description, initial: savedAppearanceState.description },
      { value: bio, initial: savedAppearanceState.bio },
      { value: location, initial: savedAppearanceState.location },
      { value: occupation, initial: savedAppearanceState.occupation },
      { value: overlayEnabled, initial: savedAppearanceState.overlayEnabled },
      { value: overlayText, initial: savedAppearanceState.overlayText },
      { value: avatarShape, initial: savedAppearanceState.avatarShape },
      { value: cardBlurEnabled, initial: savedAppearanceState.cardBlurEnabled },
      { value: get("primaryColor", "#ffffff"), initial: savedAppearanceState.primaryColor },
      { value: get("textColor", "#ffffff"), initial: savedAppearanceState.textColor },
      { value: get("accentColor", "#ffffff"), initial: savedAppearanceState.accentColor },
      { value: get("borderColor", "#ffffff"), initial: savedAppearanceState.borderColor },
      { value: get("backgroundColor", "#111111"), initial: savedAppearanceState.backgroundColor },
      { value: get("badgeColor", "#ffffff"), initial: savedAppearanceState.badgeColor },
      { value: get("socialColor", "#ffffff"), initial: savedAppearanceState.socialColor },
    ];

    const settingsDirty = Object.entries(settings).filter(([key, value]) => {
      const initialValue = savedAppearanceState[key as keyof typeof savedAppearanceState];
      return String(value) !== String(initialValue ?? "");
    }).length;

    return fields.filter((field) => String(field.value) !== String(field.initial)).length + settingsDirty;
  }, [displayName, description, bio, location, occupation, overlayEnabled, overlayText, avatarShape, cardBlurEnabled, settings, savedAppearanceState, get]);

  const saveLabel = dirtyCount > 0 ? `Save Changes (${dirtyCount})` : "Save Changes";

  const resetAppearanceChanges = useCallback(() => {
    setSettings({});
    setDisplayName(savedAppearanceState.displayName);
    setDescription(savedAppearanceState.description);
    setBio(savedAppearanceState.bio);
    setLocation(savedAppearanceState.location);
    setOccupation(savedAppearanceState.occupation);
    setOverlayEnabled(savedAppearanceState.overlayEnabled);
    setOverlayText(savedAppearanceState.overlayText);
    setAvatarShape(savedAppearanceState.avatarShape);
    setCardBlurEnabled(savedAppearanceState.cardBlurEnabled);
  }, [savedAppearanceState, setSettings]);

  const save = useCallback(async () => {
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          description,
          bio,
          location,
          occupation,
          overlayEnabled,
          overlayText,
          avatarShape,
          cardBlurEnabled,
          ...settings,
        }),
      });

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          body || `${response.status} ${response.statusText}`
        );
      }

      const sectionLabel =
        active === "badges"
          ? "Badges"
          : active === "appearance"
            ? "Appearance"
            : "Profile";

      setSettings({});
      setSavedAppearanceState({
        displayName,
        description,
        bio,
        location,
        occupation,
        overlayEnabled,
        overlayText,
        avatarShape,
        cardBlurEnabled,
        primaryColor: get("primaryColor", "#ffffff"),
        textColor: get("textColor", "#ffffff"),
        accentColor: get("accentColor", "#ffffff"),
        borderColor: get("borderColor", "#ffffff"),
        backgroundColor: get("backgroundColor", "#111111"),
        badgeColor: get("badgeColor", "#ffffff"),
        socialColor: get("socialColor", "#ffffff"),
      });
      pushToast(`${sectionLabel} Saved!`);

      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save changes.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }, [active, avatarShape, cardBlurEnabled, bio, description, displayName, get, location, occupation, overlayEnabled, overlayText, pushToast, router, settings]);

  useDashboardDirtyState("appearance", {
    count: dirtyCount,
    onSave: save,
    onUndo: resetAppearanceChanges,
  });

  const badgeDirtyCount = useMemo(
    () => Object.entries(badgeVisibility).filter(([id, hidden]) => hidden !== badgeBaseline[id]).length,
    [badgeBaseline, badgeVisibility]
  );

  const resetBadgeVisibility = useCallback(() => {
    setBadgeVisibility({ ...badgeBaseline });
  }, [badgeBaseline]);

  const saveBadges = useCallback(async () => {
    const updates = Object.entries(badgeVisibility)
      .filter(([id, hidden]) => hidden !== badgeBaseline[id])
      .map(([id, hidden]) => ({ badgeId: id, hidden }));

    if (updates.length === 0) {
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/profile/badges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Failed to save badge visibility");
      }

      const nextBaseline = { ...badgeVisibility };
      setBadgeBaseline(nextBaseline);
      pushToast("Badges Saved!");
      router.refresh();
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : "Failed to save badge visibility");
    } finally {
      setSaving(false);
    }
  }, [badgeBaseline, badgeVisibility, pushToast, router]);

  useDashboardDirtyState("badges", {
    count: badgeDirtyCount,
    onSave: saveBadges,
    onUndo: resetBadgeVisibility,
  });

  /** Live profile snapshot — drives both the appearance and custom layout previews. */
  const previewProfile: ProfileCardProfile = {
    ...profile,
    ...settings,
    displayName: displayName || null,
    description: description || null,
    bio: bio || null,
    location: location || null,
    occupation: occupation || null,
    overlayText,
    avatarShape,
    overlayEnabled: overlayEnabled ? 1 : 0,
    cardBlurEnabled: cardBlurEnabled ? 1 : 0,
    // Non-premium users never preview the Custom canvas, even if a
    // legacy custom layout is still stored.
    ...(!isPremium &&
    parseCustomLayout(
      (settings.customLayout as string | null | undefined) ??
        profile?.customLayout ??
        null
    )?.enabled
      ? { customLayout: null }
      : {}),
  };

  const visibleBadges = badges.filter(
    (badge) => !badgeVisibility[String(badge.id)]
  );

  /** Whether the user has the custom layout editor turned on. */
  const customLayoutEnabled =
    (isPremium &&
      (parseCustomLayout(
        (settings.customLayout as string | null | undefined) ??
          profile?.customLayout ??
          null
      )?.enabled ??
        false)) ||
    false;

  return (
    <>
      <style>{`
        @keyframes toast-stack-in {
          0% {
            opacity: 0;
            transform: translate3d(0, 12px, 0) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes toast-stack-out {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate3d(0, 12px, 0) scale(0.9);
          }
        }
      `}</style>

      <div>
      <h1 className="text-4xl font-bold tracking-tight text-white">
        Customize
      </h1>

      <p className="mt-1 text-sm text-white/40">
        Customize how your profile looks.
      </p>

      <div className="mt-7 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              active === tab.id
                ? "bg-pink-500/10 text-pink-400 ring-1 ring-pink-400/20"
                : "text-white/40 hover:bg-white/[0.035] hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "appearance" && (
        <>
          <div className="mt-6 rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
            <h2 className="text-2xl font-bold text-white">Appearance</h2>
            <p className="mt-1 text-sm text-white/40">
              Customize the look and feel of your profile.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <Section
              title="Profile"
              description="Information shown on your profile"
              icon="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            >
              <div className="space-y-5">
                <Field label="Display Name">
                  <input
                    value={displayName}
                    maxLength={40}
                    placeholder="Your name"
                    onChange={(event) =>
                      setDisplayName(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={description}
                    maxLength={160}
                    rows={3}
                    placeholder="Tell people about yourself"
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    className="w-full resize-none rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10"
                  />
                </Field>

                <Field label="Bio">
                  <textarea
                    value={bio}
                    maxLength={200}
                    rows={2}
                    placeholder="A short bio shown under your name"
                    onChange={(event) => setBio(event.target.value)}
                    className="w-full resize-none rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10"
                  />
                  <p className="text-right text-xs text-white/30">
                    {bio.length}/200
                  </p>
                </Field>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="Location">
                    <input
                      value={location}
                      maxLength={60}
                      placeholder="Your location"
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      className="w-full rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10"
                    />
                  </Field>

                  <Field label="Occupation">
                    <input
                      value={occupation}
                      maxLength={60}
                      placeholder="What you do"
                      onChange={(event) =>
                        setOccupation(event.target.value)
                      }
                      className="w-full rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10"
                    />
                  </Field>
                </div>

                <Field label="Avatar Shape">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      ["circle", "Circle"],
                      ["squircle", "Squircle"],
                      ["soft", "Soft"],
                      ["square", "Square"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAvatarShape(value)}
                        className={`flex items-center justify-center rounded-xl border px-3 py-3 text-sm transition-all duration-200 ${
                          avatarShape === value
                            ? "border-pink-400/40 bg-pink-500/10 text-pink-400"
                            : "border-[#1b1b1b] bg-[#080808] text-white/40 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </Section>

            <Section
              title="Colors"
              description="Customize the colors used across your profile"
              icon="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0l7.35-7.35m0 0A5.25 5.25 0 0118 3.75l3.75-3.75M16.88 8.77l4.39 4.39"
            >
              <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
                <ColorPickerField
                  label="Primary"
                  description="Main profile color"
                  value={get("primaryColor", "#ffffff")}
                  onChange={set("primaryColor")}
                />

                <ColorPickerField
                  label="Text"
                  description="Profile text"
                  value={get("textColor", "#ffffff")}
                  onChange={set("textColor")}
                />

                <ColorPickerField
                  label="Accent"
                  description="Secondary highlights"
                  value={get("accentColor", "#ffffff")}
                  onChange={set("accentColor")}
                />

                <ColorPickerField
                  label="Border"
                  description="Card and link borders"
                  value={get("borderColor", "#ffffff")}
                  onChange={set("borderColor")}
                />

                <ColorPickerField
                  label="Background"
                  description="Profile and card background"
                  value={get("backgroundColor", "#111111")}
                  onChange={set("backgroundColor")}
                />

                <ColorPickerField
                  label="Badge"
                  description="Profile badge color"
                  value={get("badgeColor", "#ffffff")}
                  onChange={set("badgeColor")}
                />

                <ColorPickerField
                  label="Social"
                  description="Social icons"
                  value={get("socialColor", "#ffffff")}
                  onChange={set("socialColor")}
                />
              </div>
            </Section>

            <Section
              title="Card"
              description="Customize the profile card"
              icon="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
                  <Slider
                    label="Width"
                    value={cardWidth}
                    unit="px"
                    min={280}
                    max={700}
                    step={10}
                    onChange={set("cardWidth")}
                  />

                  <Slider
                    label="Radius"
                    value={borderRadius}
                    unit="px"
                    min={0}
                    max={50}
                    onChange={set("borderRadius")}
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
                    label="Opacity"
                    value={cardOpacity}
                    unit="%"
                    min={0}
                    max={100}
                    onChange={set("cardOpacity")}
                  />

                  <Slider
                    label="Border Opacity"
                    value={borderOpacity}
                    unit="%"
                    min={0}
                    max={100}
                    onChange={set("borderOpacity")}
                  />

                  <Slider
                    label="Background Blur"
                    value={backgroundBlur}
                    unit="px"
                    min={0}
                    max={30}
                    onChange={set("blur")}
                  />
                </div>

                <div className="rounded-xl border border-[#1b1b1b] bg-[#080808] p-4">
                  <ToggleRow
                    title="Card Blur"
                    description="Add a blurred glass effect behind the card"
                    enabled={cardBlurEnabled}
                    onChange={setCardBlurEnabled}
                  />

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
                      cardBlurEnabled
                        ? "mt-5 grid-rows-[1fr] opacity-100"
                        : "mt-0 grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <Slider
                        label="Blur"
                        value={cardBlur}
                        unit="px"
                        min={0}
                        max={60}
                        onChange={set("cardBlur")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="Overlay"
              description="Control the overlay shown above your profile"
              icon="M3 7h18M3 12h18M3 17h18"
            >
              <div className="rounded-xl border border-[#1b1b1b] bg-[#080808] p-4">
                <ToggleRow
                  title="Overlay"
                  description="Show an overlay when visitors open your profile"
                  enabled={overlayEnabled}
                  onChange={setOverlayEnabled}
                />

                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-out ${
                    overlayEnabled
                      ? "mt-5 grid-rows-[1fr] opacity-100"
                      : "mt-0 grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <Field label="Overlay Text">
                      <input
                        value={overlayText}
                        maxLength={80}
                        placeholder="Click to show"
                        onChange={(event) =>
                          setOverlayText(event.target.value)
                        }
                        className="w-full rounded-xl border border-[#1b1b1b] bg-[#0d0d0d] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </Section>

            {saveError && (
              <p className="max-w-full text-xs text-red-400">
                {saveError}
              </p>
            )}
          </div>

          <div className="xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
              <div className="flex items-center justify-between border-b border-[#1b1b1b] px-5 py-3.5">
                <span className="text-sm font-semibold text-white">
                  Live Preview
                </span>

                <span className="text-xs text-white/30">
                  Live
                </span>
              </div>

              <ProfilePreview
                profile={previewProfile}
                badges={visibleBadges}
                socials={socialLinks}
                links={links}
                viewCount={viewCount}
                minHeight={650}
                feedback={initialFeedback}
                widgets={initialWidgets}
              />
            </div>
          </div>
        </div>
        </>
      )}

      {active === "badges" && (
        <>
          <div className="mt-6 rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
            <h2 className="text-2xl font-bold text-white">Badges</h2>
            <p className="mt-1 text-sm text-white/40">
              Manage the badges you want to show on your profile.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
              <h3 className="mb-4 text-sm font-medium text-white/60">Badges you have</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {badges.length > 0 ? (
                  badges.map((badge) => {
                    const badgeColor = resolveColor(
                      badge.color,
                      resolveColor(get("badgeColor", "#ffffff"), "#ffffff")
                    );
                    const hidden = Boolean(badgeVisibility[String(badge.id)] ?? Boolean(badge.hidden));

                    return (
                      <div
                        key={badge.id}
                        className={`group rounded-2xl border p-4 text-left transition-all duration-300 ease-out ${
                          hidden
                            ? "border-[#1b1b1b] bg-[#0d0d0d] text-white/60 hover:border-white/20 hover:bg-[#111]"
                            : "border-pink-400/30 bg-pink-500/10 text-pink-400 hover:border-pink-400/50 hover:bg-pink-500/15"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-lg font-bold"
                              style={{ color: badgeColor }}
                            >
                              {badge.iconUrl ? (
                                <img
                                  src={badge.iconUrl ?? undefined}
                                  alt={badge.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="font-bold">
                                  {badge.name.slice(0, 1).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-base font-bold tracking-tight transition-colors duration-300 group-hover:text-white">
                                {badge.name}
                              </p>
                            </div>
                          </div>

                          <label className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-white/10 p-1">
                            <input
                              type="checkbox"
                              checked={!hidden}
                              onChange={() =>
                                setBadgeVisibility((current) => ({
                                  ...current,
                                  [String(badge.id)]: !hidden,
                                }))
                              }
                              className="peer sr-only"
                            />
                            <span className="absolute inset-0 rounded-full bg-white/10 transition-colors peer-checked:bg-pink-500" />
                            <span className="absolute h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                          </label>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="col-span-full py-10 text-center text-sm text-white/40">
                    You haven&apos;t earned any badges yet.
                  </p>
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {active === "layout" && (
        <div className="mt-6">
          <LayoutTab
            initialLayout={profile?.layout ?? "centered"}
            initialBlur={profile?.blur ?? 0}
            initialTiltEnabled={!!profile?.tiltEnabled}
            initialTiltMode={profile?.tiltMode ?? "tilt"}
            initialBadgesPosition={profile?.badgesPosition ?? "auto"}
            initialShowViews={
              profile?.showViews == null || Number(profile.showViews) !== 0
            }
            initialViewsPosition={profile?.viewsPosition ?? "top-right"}
            customLayoutEnabled={customLayoutEnabled}
            customLayout={profile?.customLayout ?? null}
            isPremium={isPremium}
          />
        </div>
      )}

      {active === "assets" && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
            <h2 className="text-2xl font-bold text-white">
              Profile Assets
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Manage the assets used by your profile.
            </p>
          </div>

          <MediaTab
            initialAvatar={profile?.avatarUrl ?? null}
            initialBackground={
              profile?.backgroundUrl ?? null
            }
            initialCursor={profile?.cursorUrl ?? null}
          />
        </div>
      )}
    </div>
    </>
  );
}
