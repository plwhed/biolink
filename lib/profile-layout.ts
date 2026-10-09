import type { CSSProperties } from "react";

/* ------------------------------------------------------------------ */
/* Element keys                                                        */
/* ------------------------------------------------------------------ */

export const ELEMENT_KEYS = [
  "avatar",
  "username",
  "badges",
  "bio",
  "description",
  "meta",
  "socials",
  "links",
  "views",
] as const;

export type ElementKey = (typeof ELEMENT_KEYS)[number];

export type Anchor =
  | "auto"
  | "flow"
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type TooltipPlacement = "auto" | "top" | "bottom";

export const VIEWS_POSITIONS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export type ViewsPosition = (typeof VIEWS_POSITIONS)[number];

export const BADGES_POSITIONS = ["auto", "next", "below"] as const;

export type BadgesPosition = (typeof BADGES_POSITIONS)[number];

/* ------------------------------------------------------------------ */
/* Custom layout model                                                 */
/* ------------------------------------------------------------------ */

export interface TooltipStyle {
  background: string;
  text: string;
  border: string;
}

export interface ElementLayout {
  visible: boolean;
  anchor: Anchor;
  /** horizontal offset (px) from the anchor edge */
  x: number;
  /** vertical offset (px) from the anchor edge */
  y: number;
  /** box width in px, null = auto */
  width: number | null;
  /** font size in px, null = element default */
  fontSize: number | null;
  /** icon / avatar box size in px, null = element default */
  size: number | null;
  /** text/icon color, null = element default */
  color: string | null;
  /** background color, null = element default */
  backgroundColor: string | null;
  /** border color, null = element default */
  borderColor: string | null;
  /** border width in px, null = element default */
  borderWidth: number | null;
  /** border radius in px, null = element default */
  borderRadius: number | null;
  /** 0-100, null = 100 */
  opacity: number | null;
  tooltip: TooltipStyle;
  tooltipPlacement: TooltipPlacement;
}

export interface CardLayout {
  /** free-position offset of the card itself (custom mode only) */
  x: number | null;
  y: number | null;
  width: number | null;
  minHeight: number | null;
  radius: number | null;
  borderWidth: number | null;
  borderColor: string | null;
  backgroundColor: string | null;
  opacity: number | null;
  paddingX: number | null;
  paddingY: number | null;
}

export interface TooltipGlobal extends TooltipStyle {
  /** when true every tooltip uses the global colors */
  sameForAll: boolean;
}

export interface CustomLayout {
  enabled: boolean;
  card: CardLayout;
  tooltips: TooltipGlobal;
  elements: Record<ElementKey, ElementLayout>;
}

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

export const DEFAULT_TOOLTIP_THEME: TooltipStyle = {
  background: "#18181b",
  border: "#2e2e31",
  text: "#747476",
};

export function defaultElement(key?: ElementKey): ElementLayout {
  return {
    visible: true,
    anchor: key === "views" ? "auto" : "flow",
    x: 0,
    y: 0,
    width: null,
    fontSize: null,
    size: null,
    color: null,
    backgroundColor: null,
    borderColor: null,
    borderWidth: null,
    borderRadius: null,
    opacity: null,
    tooltip: { ...DEFAULT_TOOLTIP_THEME },
    tooltipPlacement: key === "views" ? "auto" : "top",
  };
}

export function defaultCustomLayout(): CustomLayout {
  return {
    enabled: false,
    card: {
      x: null,
      y: null,
      width: null,
      minHeight: null,
      radius: null,
      borderWidth: null,
      borderColor: null,
      backgroundColor: null,
      opacity: null,
      paddingX: null,
      paddingY: null,
    },
    tooltips: {
      sameForAll: true,
      ...DEFAULT_TOOLTIP_THEME,
    },
    elements: Object.fromEntries(
      ELEMENT_KEYS.map((key) => [key, defaultElement(key)])
    ) as Record<ElementKey, ElementLayout>,
  };
}

/* ------------------------------------------------------------------ */
/* Parsing / serializing                                               */
/* ------------------------------------------------------------------ */

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Parses stored custom layout JSON and merges it over the defaults so
 * partially stored / outdated payloads always produce a full layout.
 * Returns null when there is nothing usable stored.
 */
export function parseCustomLayout(
  raw: string | null | undefined | CustomLayout | object
): CustomLayout | null {
  if (!raw) return null;

  let parsed: unknown = raw;

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!isObject(parsed)) return null;

  const base = defaultCustomLayout();

  const card: CardLayout = isObject(parsed.card)
    ? { ...base.card, ...(parsed.card as Partial<CardLayout>) }
    : base.card;

  const tooltips: TooltipGlobal = isObject(parsed.tooltips)
    ? {
        ...base.tooltips,
        ...(parsed.tooltips as Partial<TooltipGlobal>),
      }
    : base.tooltips;

  const elements = { ...base.elements };

  if (isObject(parsed.elements)) {
    for (const key of ELEMENT_KEYS) {
      const value = (parsed.elements as Record<string, unknown>)[key];
      if (!isObject(value)) continue;

      const tooltip = isObject(value.tooltip)
        ? { ...base.tooltips, ...(value.tooltip as Partial<TooltipStyle>) }
        : { ...base.elements[key].tooltip };

      elements[key] = {
        ...base.elements[key],
        ...(value as Partial<ElementLayout>),
        tooltip: tooltip as TooltipStyle,
      };
    }
  }

  return {
    enabled: Boolean(parsed.enabled),
    card,
    tooltips,
    elements,
  };
}

export function serializeCustomLayout(layout: CustomLayout): string {
  return JSON.stringify(layout);
}

/* ------------------------------------------------------------------ */
/* Styling helpers                                                     */
/* ------------------------------------------------------------------ */

export function avatarStyle(shape: string | null | undefined): CSSProperties {
  switch (shape) {
    case "circle":
      return { borderRadius: "9999px" };
    case "soft":
      return { borderRadius: "10px" };
    case "squircle":
      return { borderRadius: "22px" };
    case "square":
      return { borderRadius: "0px" };
    default:
      return { borderRadius: "9999px" };
  }
}

export function anchorStyle(anchor: Anchor, x = 0, y = 0): CSSProperties {
  switch (anchor) {
    case "top-left":
      return { top: y, left: x };
    case "top-center":
      return { top: y, left: `calc(50% + ${x}px)`, transform: "translateX(-50%)" };
    case "top-right":
      return { top: y, right: x };
    case "middle-left":
      return { top: `calc(50% + ${y}px)`, left: x, transform: "translateY(-50%)" };
    case "middle-center":
      return {
        top: `calc(50% + ${y}px)`,
        left: `calc(50% + ${x}px)`,
        transform: "translate(-50%, -50%)",
      };
    case "middle-right":
      return { top: `calc(50% + ${y}px)`, right: x, transform: "translateY(-50%)" };
    case "bottom-left":
      return { bottom: y, left: x };
    case "bottom-center":
      return { bottom: y, left: `calc(50% + ${x}px)`, transform: "translateX(-50%)" };
    case "bottom-right":
      return { bottom: y, right: x };
    default:
      return {};
  }
}

export const CORNER_OFFSET = 14;

export function viewsCornerStyle(
  position: string | null | undefined
): CSSProperties {
  const offset = CORNER_OFFSET;

  switch (position) {
    case "top-left":
      return { top: offset, left: offset };
    case "bottom-left":
      return { bottom: offset, left: offset };
    case "bottom-right":
      return { bottom: offset, right: offset };
    case "top-right":
    default:
      return { top: offset, right: offset };
  }
}

/** Box styles shared by every custom layout element wrapper. */
export function elementBoxStyle(el: ElementLayout | null): CSSProperties {
  if (!el) return {};

  const style: CSSProperties = {};

  if (el.width != null && el.width > 0) style.width = `${el.width}px`;
  if (el.opacity != null) style.opacity = Math.min(Math.max(el.opacity, 0), 100) / 100;

  return style;
}

export function tooltipThemeFor(
  layout: CustomLayout | null,
  key: ElementKey
): TooltipStyle {
  if (!layout) return { ...DEFAULT_TOOLTIP_THEME };

  const global: TooltipStyle = {
    background: layout.tooltips.background || DEFAULT_TOOLTIP_THEME.background,
    text: layout.tooltips.text || DEFAULT_TOOLTIP_THEME.text,
    border: layout.tooltips.border || DEFAULT_TOOLTIP_THEME.border,
  };

  if (layout.tooltips.sameForAll) return global;

  const local = layout.elements[key]?.tooltip;

  if (!local) return global;

  return {
    background: local.background || global.background,
    text: local.text || global.text,
    border: local.border || global.border,
  };
}

/** Default top/bottom placement for a tooltip so it never leaves the card. */
export function tooltipPlacementFor(
  layout: CustomLayout | null,
  key: ElementKey,
  fallback: TooltipPlacement = "top"
): TooltipPlacement {
  if (!layout) return fallback;
  return layout.elements[key]?.tooltipPlacement ?? fallback;
}

/* ------------------------------------------------------------------ */
/* Editor metadata                                                     */
/* ------------------------------------------------------------------ */

export type SizeKind = "text" | "box" | "none";

export interface ElementMeta {
  label: string;
  hint: string;
  sizeKind: SizeKind;
  hasColor: boolean;
  hasBackground: boolean;
  hasBorder: boolean;
  hasWidth: boolean;
  hasTooltip: boolean;
  tooltipHint?: string;
  /** where the per-element background/border is drawn */
  boxTarget: "wrapper" | "node";
}

export const ELEMENT_META: Record<ElementKey, ElementMeta> = {
  avatar: {
    label: "Avatar",
    hint: "Profile picture / fallback letter",
    sizeKind: "box",
    hasColor: false,
    hasBackground: false,
    hasBorder: true,
    hasWidth: false,
    hasTooltip: true,
    tooltipHint: "Shows your username",
    boxTarget: "node",
  },
  username: {
    label: "Username",
    hint: "Display name on your profile",
    sizeKind: "text",
    hasColor: true,
    hasBackground: true,
    hasBorder: true,
    hasWidth: true,
    hasTooltip: true,
    tooltipHint: "UID tooltip",
    boxTarget: "wrapper",
  },
  badges: {
    label: "Badges",
    hint: "Badge row next to or below your name",
    sizeKind: "box",
    hasColor: true,
    hasBackground: true,
    hasBorder: true,
    hasWidth: true,
    hasTooltip: true,
    tooltipHint: "Shows the badge name",
    boxTarget: "node",
  },
  bio: {
    label: "Bio",
    hint: "Short intro shown on your profile",
    sizeKind: "text",
    hasColor: true,
    hasBackground: true,
    hasBorder: true,
    hasWidth: true,
    hasTooltip: false,
    boxTarget: "wrapper",
  },
  description: {
    label: "Description",
    hint: "Longer description text",
    sizeKind: "text",
    hasColor: true,
    hasBackground: true,
    hasBorder: true,
    hasWidth: true,
    hasTooltip: false,
    boxTarget: "wrapper",
  },
  meta: {
    label: "Occupation & Location",
    hint: "The small meta lines",
    sizeKind: "text",
    hasColor: true,
    hasBackground: true,
    hasBorder: true,
    hasWidth: true,
    hasTooltip: false,
    boxTarget: "wrapper",
  },
  socials: {
    label: "Social links",
    hint: "Social icon row",
    sizeKind: "box",
    hasColor: true,
    hasBackground: true,
    hasBorder: true,
    hasWidth: true,
    hasTooltip: true,
    tooltipHint: "Shows the platform name",
    boxTarget: "node",
  },
  links: {
    label: "Link buttons",
    hint: "Your link buttons",
    sizeKind: "text",
    hasColor: true,
    hasBackground: true,
    hasBorder: true,
    hasWidth: true,
    hasTooltip: true,
    tooltipHint: "Shows the link URL",
    boxTarget: "node",
  },
  views: {
    label: "Views counter",
    hint: "Profile views pill",
    sizeKind: "text",
    hasColor: true,
    hasBackground: true,
    hasBorder: true,
    hasWidth: true,
    hasTooltip: true,
    tooltipHint: "Shows view info",
    boxTarget: "node",
  },
};

export const ANCHOR_OPTIONS: { id: Anchor; label: string }[] = [
  { id: "flow", label: "In sequence" },
  { id: "top-left", label: "Top left" },
  { id: "top-center", label: "Top center" },
  { id: "top-right", label: "Top right" },
  { id: "middle-left", label: "Middle left" },
  { id: "middle-center", label: "Middle center" },
  { id: "middle-right", label: "Middle right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-center", label: "Bottom center" },
  { id: "bottom-right", label: "Bottom right" },
];
