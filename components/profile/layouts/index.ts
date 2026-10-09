import type { ComponentType } from "react";
import {
  HaloCard,
  haloMeta,
  HaloPreview,
  type HaloCardProps,
} from "./halo";
import { CustomPreview } from "./custom-preview";

export interface ProfileLayoutMeta {
  id: string;
  label: string;
  description: string;
  /** Source file inside `components/profile/layouts/`. */
  file: string;
  align: "center" | "left";
  /** When true the template requires an active Premium subscription. */
  premium?: boolean;
}

export interface ProfileLayoutTemplate extends ProfileLayoutMeta {
  /** Full-card component. Null for the built-in custom (free-move) editor. */
  Component: ComponentType<HaloCardProps> | null;
  Preview: ComponentType;
}

/**
 * Registry of every profile layout: one template file (`halo.tsx`) plus
 * the Premium-only custom editor.
 *
 * To add a new template card, create a file next to `halo.tsx` with the
 * same shape (`*Meta` + full-card component + `*Preview`) and append an
 * entry below — the dashboard "Layout" tab renders this array directly.
 */
export const PROFILE_LAYOUTS: ProfileLayoutTemplate[] = [
  { ...haloMeta, align: "left", Component: HaloCard, Preview: HaloPreview },
  {
    id: "custom",
    label: "Custom",
    description: "Free-move canvas — drag, resize and style everything.",
    file: "(built-in custom editor)",
    align: "left",
    premium: true,
    Component: null,
    Preview: CustomPreview,
  },
];

export const PREMIUM_LAYOUT_IDS = PROFILE_LAYOUTS.filter((l) => l.premium).map(
  (l) => l.id
);

export function getLayoutTemplate(id: string | null | undefined) {
  const direct = PROFILE_LAYOUTS.find((l) => l.id === id);
  if (direct?.Component) return direct;
  // Unknown or stored legacy ids ("centered", "left", …) fall back to Halo.
  return PROFILE_LAYOUTS.find((l) => l.Component)!;
}

export function isPremiumLayoutId(id: string | null | undefined) {
  return PREMIUM_LAYOUT_IDS.includes(id ?? "");
}
