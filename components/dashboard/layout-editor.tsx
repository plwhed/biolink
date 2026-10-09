"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import ProfilePreview, {
  type PreviewDevice,
} from "@/components/dashboard/profile-preview";
import { useDashboardDirtyState } from "@/components/dashboard/dashboard-dirty-state";
import { useToastStack } from "@/components/ui/toast-stack";
import type {
  ProfileCardBadge,
  ProfileCardLink,
  ProfileCardProfile,
  ProfileCardSocial,
} from "@/components/profile/profile-card";
import type { FeedbackState } from "@/lib/feedback";
import {
  ELEMENT_KEYS,
  ELEMENT_META,
  defaultCustomLayout,
  defaultElement,
  parseCustomLayout,
  serializeCustomLayout,
  type Anchor,
  type CardLayout,
  type CustomLayout,
  type ElementKey,
  type ElementLayout,
} from "@/lib/profile-layout";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const DEFAULT_FONT_SIZE: Partial<Record<ElementKey, number>> = {
  username: 24,
  bio: 15,
  description: 16,
  meta: 14,
  links: 16,
  views: 12,
};

const DEFAULT_BOX_SIZE: Partial<Record<ElementKey, number>> = {
  avatar: 80,
  badges: 28,
  socials: 24,
};

const DEFAULT_RADIUS: Partial<Record<ElementKey, number>> = {
  avatar: 0,
  username: 0,
  badges: 40,
  bio: 0,
  description: 0,
  meta: 0,
  socials: 6,
  links: 12,
  views: 8,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Overlay box, in stage-relative pixels. */
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const boxEqual = (a: Box | null | undefined, b: Box | null | undefined) => {
  if (!a || !b) return a === b;
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
};

interface DragState {
  key: ElementKey;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  anchor: Anchor;
  x: number;
  y: number;
  startWidth: number;
  startFont: number;
  startSize: number;
  /** pointer totals already applied (to compute the per-step delta) */
  appliedDx: number;
  appliedDy: number;
  /** card inner width at drag start (locks the width resize) */
  maxWidth: number;
}

interface CardDragState {
  mode: "move" | "w-left" | "w-right" | "h";
  startX: number;
  startY: number;
  /** card offsets at pointer-down */
  x: number;
  y: number;
  /** rendered card width at pointer-down */
  width: number;
  minHeight: number;
  /** pointer travel allowed before the card would leave the stage */
  minDx: number;
  maxDx: number;
  minDy: number;
  maxDy: number;
  /** stage size at pointer-down */
  stageW: number;
  stageH: number;
}

type MenuState =
  | { type: "element"; key: ElementKey; x: number; y: number }
  | { type: "card"; x: number; y: number };

/**
 * Resolves the element's anchor at drag start. Positioned elements keep
 * their anchor; flow / views-corner elements are converted to the
 * corner quadrant they currently sit in so x/y stay small and true.
 */
function resolveStartAnchor(
  element: ElementLayout,
  rect: DOMRect,
  cardRect: DOMRect,
  card: HTMLElement
): { anchor: Anchor; x: number; y: number } {
  if (element.anchor !== "flow" && element.anchor !== "auto") {
    return { anchor: element.anchor, x: element.x, y: element.y };
  }

  const styles = getComputedStyle(card);
  const borderLeft = parseFloat(styles.borderLeftWidth) || 0;
  const borderTop = parseFloat(styles.borderTopWidth) || 0;
  const borderRight = parseFloat(styles.borderRightWidth) || 0;
  const borderBottom = parseFloat(styles.borderBottomWidth) || 0;

  const innerLeft = cardRect.left + borderLeft;
  const innerTop = cardRect.top + borderTop;
  const innerRight = cardRect.right - borderRight;
  const innerBottom = cardRect.bottom - borderBottom;

  const relX =
    (rect.left + rect.width / 2 - innerLeft) /
    Math.max(1, innerRight - innerLeft);
  const relY =
    (rect.top + rect.height / 2 - innerTop) /
    Math.max(1, innerBottom - innerTop);

  const horizontal = relX < 0.5 ? "left" : "right";
  const vertical = relY < 0.5 ? "top" : "bottom";

  const x =
    horizontal === "left" ? rect.left - innerLeft : innerRight - rect.right;
  const y = vertical === "top" ? rect.top - innerTop : innerBottom - rect.bottom;

  return {
    anchor: `${vertical}-${horizontal}` as Anchor,
    x: Math.round(x),
    y: Math.round(y),
  };
}

function toHex(value: string | null | undefined, fallback: string): string {
  if (value && /^#[0-9a-f]{6}$/i.test(value)) return value;
  if (value && /^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return fallback;
}

/** Inner content rect of the card (border box minus its borders). */
function cardInnerRect(card: HTMLElement) {
  const rect = card.getBoundingClientRect();
  const styles = getComputedStyle(card);
  const bl = parseFloat(styles.borderLeftWidth) || 0;
  const bt = parseFloat(styles.borderTopWidth) || 0;
  const br = parseFloat(styles.borderRightWidth) || 0;
  const bb = parseFloat(styles.borderBottomWidth) || 0;

  return {
    left: rect.left + bl,
    top: rect.top + bt,
    right: rect.right - br,
    bottom: rect.bottom - bb,
  };
}

/* ------------------------------------------------------------------ */
/* Context-menu primitives                                             */
/* ------------------------------------------------------------------ */

/** The standard dashboard button look (matches the preset buttons). */
const TOOL_BTN =
  "flex items-center justify-center rounded-xl border px-3 py-3 text-sm transition-all duration-200 border-[#1b1b1b] bg-[#080808] text-white/40 hover:border-white/10 hover:text-white";

const MENU_BTN =
  "flex items-center justify-center rounded-xl border px-3 py-3 text-sm transition-all duration-200 border-[#1b1b1b] bg-[#080808] text-white/40 hover:border-white/10 hover:text-white";

const MENU_BTN_ON =
  "flex items-center justify-center rounded-xl border px-3 py-3 text-sm transition-all duration-200 border-pink-500/40 bg-pink-500/10 text-pink-400 hover:border-pink-400/60";

function MenuSlider({
  label,
  value,
  min,
  max,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="px-4 py-1.5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-medium text-white">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#1b1b1b] accent-pink-500"
        style={{
          backgroundImage: `linear-gradient(to right, #ec4899 ${pct}%, #1b1b1b 0%)`,
        }}
      />
    </div>
  );
}

function MenuColor({
  label,
  value,
  fallback,
  onPick,
  onReset,
}: {
  label: string;
  value: string | null | undefined;
  fallback: string;
  onPick: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-1.5">
      <span className="text-xs text-white/50">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={toHex(value, fallback)}
          onChange={(event) => onPick(event.target.value)}
          className="h-6 w-9 cursor-pointer rounded border border-white/10 bg-transparent p-0"
        />
        <button
          type="button"
          onClick={onReset}
          className="rounded border border-[#1b1b1b] px-1.5 py-0.5 text-[10px] text-white/30 transition-colors hover:text-pink-400"
        >
          auto
        </button>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

export default function LayoutEditor({
  profile,
  badges = [],
  socials = [],
  links = [],
  viewCount = 0,
  feedback = null,
}: {
  profile: ProfileCardProfile | null;
  badges?: ProfileCardBadge[];
  socials?: ProfileCardSocial[];
  links?: ProfileCardLink[];
  viewCount?: number;
  feedback?: FeedbackState | null;
}) {
  const router = useRouter();
  const { pushToast } = useToastStack();

  const initial = useMemo(() => {
    const parsed = parseCustomLayout(profile?.customLayout) ?? defaultCustomLayout();
    // Opening the editor means you want custom layout — turn it on for
    // this session even if it was never saved as enabled.
    return parsed.enabled ? parsed : { ...parsed, enabled: true };
  }, [profile?.customLayout]);

  const [layout, setLayout] = useState<CustomLayout>(initial);
  const [baseline, setBaseline] = useState<CustomLayout>(initial);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [selected, setSelected] = useState<ElementKey | "card" | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  /** color rows live in a collapsed “Colors” group so the menu stays simple */
  const [colorsOpen, setColorsOpen] = useState(false);

  const dirty = useMemo(
    () => serializeCustomLayout(layout) !== serializeCustomLayout(baseline),
    [layout, baseline]
  );

  /* ---------------- mutations ---------------- */

  const patchCard = useCallback((patch: Partial<CardLayout>) => {
    setLayout((current) => ({ ...current, card: { ...current.card, ...patch } }));
  }, []);

  const patchElement = useCallback(
    (key: ElementKey, patch: Partial<ElementLayout>) => {
      setLayout((current) => ({
        ...current,
        elements: {
          ...current.elements,
          [key]: { ...current.elements[key], ...patch },
        },
      }));
    },
    []
  );

  const resetElement = useCallback((key: ElementKey) => {
    setLayout((current) => ({
      ...current,
      elements: { ...current.elements, [key]: defaultElement(key) },
    }));
  }, []);

  const resetCard = useCallback(() => {
    setLayout((current) => ({
      ...current,
      card: { ...defaultCustomLayout().card },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setLayout({ ...defaultCustomLayout(), enabled: true });
    setMenu(null);
    setSelected(null);
  }, []);

  /* ---------------- persistence ---------------- */

  const save = useCallback(async () => {
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customLayout: serializeCustomLayout(layout),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `${response.status} ${response.statusText}`);
      }

      setBaseline(layout);
      pushToast("Custom Layout Saved!");
      router.refresh();
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save your custom layout."
      );
    } finally {
      setSaving(false);
    }
  }, [layout, pushToast, router]);

  const undo = useCallback(() => {
    setLayout(baseline);
    setSaveError("");
    setMenu(null);
  }, [baseline]);

  useDashboardDirtyState("custom", {
    count: dirty ? 1 : 0,
    isSaving: saving,
    onSave: save,
    onUndo: undo,
  });

  /* ---------------- measurement ---------------- */

  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const cardDragRef = useRef<CardDragState | null>(null);
  const [boxes, setBoxes] = useState<Partial<Record<ElementKey, Box>>>({});
  const [cardBox, setCardBox] = useState<Box | null>(null);
  const [stageH, setStageH] = useState(650);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // clientHeight (not the rect) so the preview fills the stage exactly
    // without making it 2px scrollable via its borders
    setStageH((prev) => {
      const h = Math.round(stage.clientHeight);
      return h > 120 && Math.abs(prev - h) > 1 ? h : prev;
    });

    const stageRect = stage.getBoundingClientRect();

    // Absolutely positioned overlay children scroll with the stage's
    // content, so box coordinates must include the scroll offset —
    // otherwise the handles drift above the card by exactly the number
    // of pixels the stage has been scrolled down.
    const scrollL = stage.scrollLeft;
    const scrollT = stage.scrollTop;

    const next: Partial<Record<ElementKey, Box>> = {};

    for (const key of ELEMENT_KEYS) {
      const node = stage.querySelector<HTMLElement>(`[data-ekey="${key}"]`);
      if (!node) continue;

      const rect = node.getBoundingClientRect();
      next[key] = {
        x: Math.round((rect.left - stageRect.left + scrollL) * 2) / 2,
        y: Math.round((rect.top - stageRect.top + scrollT) * 2) / 2,
        w: Math.round(rect.width * 2) / 2,
        h: Math.round(rect.height * 2) / 2,
      };
    }

    setBoxes((prev) => {
      const prevKeys = Object.keys(prev) as ElementKey[];
      if (prevKeys.length === Object.keys(next).length) {
        const unchanged = prevKeys.every((key) => boxEqual(prev[key], next[key]));
        if (unchanged) return prev;
      }
      return next;
    });

    const cardNode = stage.querySelector<HTMLElement>("[data-card-root]");
    const cardRect = cardNode?.getBoundingClientRect();
    const nextCard: Box | null = cardRect
      ? {
          x: Math.round((cardRect.left - stageRect.left + scrollL) * 2) / 2,
          y: Math.round((cardRect.top - stageRect.top + scrollT) * 2) / 2,
          w: Math.round(cardRect.width * 2) / 2,
          h: Math.round(cardRect.height * 2) / 2,
        }
      : null;

    setCardBox((prev) => (boxEqual(prev, nextCard) ? prev : nextCard));
  }, []);

  // re-measure after every render so the overlay always tracks the card
  useLayoutEffect(() => {
    measure();
  });

  // re-measure on every frame so the overlay handles always track the
  // card exactly — even while the preview is scrolling, fonts are still
  // loading or parallax layers animate under the mouse
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      measure();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [measure]);

  // a freshly opened menu always starts with its colors collapsed
  // (state is adjusted during render — the React-recommended pattern)
  const menuId = menu
    ? `${menu.type}:${menu.type === "element" ? menu.key : ""}`
    : "";
  const [lastMenuId, setLastMenuId] = useState(menuId);
  if (lastMenuId !== menuId) {
    setLastMenuId(menuId);
    setColorsOpen(false);
  }

  // close the context menu on Escape
  useEffect(() => {
    if (!menu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  /* ---------------- element drag / resize ---------------- */

  const beginDrag = (
    event: React.PointerEvent,
    key: ElementKey,
    mode: "move" | "resize"
  ) => {
    if (!layout.enabled || event.button !== 0) return;

    const stage = stageRef.current;
    if (!stage) return;

    const card = stage.querySelector<HTMLElement>("[data-card-root]");
    const node = stage.querySelector<HTMLElement>(`[data-ekey="${key}"]`);
    if (!card || !node) return;

    event.preventDefault();
    event.stopPropagation();

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture is best effort */
    }

    const element = layout.elements[key];
    const rect = node.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const resolved = resolveStartAnchor(element, rect, cardRect, card);
    const inner = cardInnerRect(card);

    // how wide this element may get without crossing the card edges
    let maxWidth: number;
    if (resolved.anchor.endsWith("right")) {
      maxWidth = rect.right - inner.left;
    } else if (resolved.anchor.endsWith("left")) {
      maxWidth = inner.right - rect.left;
    } else {
      maxWidth =
        rect.width +
        2 * Math.max(0, Math.min(rect.left - inner.left, inner.right - rect.right));
    }

    // Pulling an element out of the flow would normally make the card
    // shrink — freeze its current height first.
    const anchorNow = layout.elements[key].anchor;
    const inFlow =
      anchorNow === "flow" || (anchorNow === "auto" && key !== "views");
    if (mode === "move" && inFlow) {
      const rendered = Math.round(cardRect.height);
      if (rendered > (layout.card.minHeight ?? 0)) {
        patchCard({ minHeight: rendered });
      }
    }

    dragRef.current = {
      key,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      ...resolved,
      startWidth: element.width ?? Math.round(rect.width),
      startFont: element.fontSize ?? DEFAULT_FONT_SIZE[key] ?? 16,
      startSize: element.size ?? DEFAULT_BOX_SIZE[key] ?? 40,
      appliedDx: 0,
      appliedDy: 0,
      maxWidth: clamp(Math.round(maxWidth), 40, 900),
    };

    setSelected(key);
    setMenu(null);
  };

  const dragMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (drag.mode === "move") {
      const fromRight = drag.anchor.endsWith("right");
      const fromBottom = drag.anchor.startsWith("bottom");

      // pointer delta since the last event
      const stepDx = dx - drag.appliedDx;
      const stepDy = dy - drag.appliedDy;
      drag.appliedDx = dx;
      drag.appliedDy = dy;

      // Lock the element inside the card: every step is clamped by how
      // much room the element currently has on each side, so it can
      // never be dragged out — even when it shrink-wraps after leaving
      // the flow. While the element is still in the flow its box fills
      // the whole card, so clamping is skipped until the first patch has
      // converted it to a free position.
      let allowX = stepDx;
      let allowY = stepDy;

      const stillInFlow = (() => {
        const current = layout.elements[drag.key];
        return (
          current.anchor === "flow" ||
          (current.anchor === "auto" && drag.key !== "views")
        );
      })();

      const stage = stageRef.current;
      const card = stage?.querySelector<HTMLElement>("[data-card-root]");
      const node = stage?.querySelector<HTMLElement>(`[data-ekey="${drag.key}"]`);

      if (card && node && !stillInFlow) {
        const inner = cardInnerRect(card);
        const rect = node.getBoundingClientRect();

        allowX = clamp(stepDx, inner.left - rect.left, inner.right - rect.right);
        allowY = clamp(stepDy, inner.top - rect.top, inner.bottom - rect.bottom);
      }

      if (allowX === 0 && allowY === 0) return;

      drag.x = fromRight ? drag.x - allowX : drag.x + allowX;
      drag.y = fromBottom ? drag.y - allowY : drag.y + allowY;

      patchElement(drag.key, {
        anchor: drag.anchor,
        x: clamp(Math.round(drag.x), -600, 600),
        y: clamp(Math.round(drag.y), -600, 600),
      });
      return;
    }

    const meta = ELEMENT_META[drag.key];
    const patch: Partial<ElementLayout> = {};

    if (meta.hasWidth && dx !== 0) {
      patch.width = clamp(
        Math.round(drag.startWidth + dx),
        40,
        Math.min(900, drag.maxWidth)
      );
    }

    if (meta.sizeKind === "text" && dy !== 0) {
      patch.fontSize = clamp(Math.round(drag.startFont + dy), 8, 64);
    } else if (meta.sizeKind === "box") {
      const min = drag.key === "avatar" ? 32 : 12;
      const max = drag.key === "avatar" ? 220 : 72;
      const delta = meta.hasWidth ? dy : (dx + dy) / 2;
      if (delta !== 0) {
        patch.size = clamp(Math.round(drag.startSize + delta), min, max);
      }
    }

    patchElement(drag.key, patch);
  };

  const endDrag = (event: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  };

  /* ---------------- card drag / resize ---------------- */

  const beginCardDrag = (
    event: React.PointerEvent,
    mode: CardDragState["mode"],
    target: HTMLElement
  ) => {
    if (!layout.enabled || event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture is best effort */
    }

    const stage = stageRef.current;
    const card = stage?.querySelector<HTMLElement>("[data-card-root]");
    const stageRect = stage?.getBoundingClientRect();
    const cardRect = card?.getBoundingClientRect();

    const renderedWidth = cardRect
      ? Math.round(cardRect.width)
      : layout.card.width ?? 420;

    // Lock the card inside the stage: allowed pointer travel before any
    // edge of the card would poke outside the preview page.
    const PAD = 6;
    const minDx =
      stageRect && cardRect ? PAD - (cardRect.left - stageRect.left) : -1500;
    const maxDx =
      stageRect && cardRect
        ? stageRect.width - PAD - (cardRect.right - stageRect.left)
        : 1500;
    const minDy =
      stageRect && cardRect ? PAD - (cardRect.top - stageRect.top) : -1500;
    const maxDy =
      stageRect && cardRect
        ? stageRect.height - PAD - (cardRect.bottom - stageRect.top)
        : 1500;

    cardDragRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      x: layout.card.x ?? 0,
      y: layout.card.y ?? 0,
      width: layout.card.width ?? renderedWidth,
      minHeight: layout.card.minHeight ?? 320,
      minDx,
      maxDx,
      minDy,
      maxDy,
      stageW: Math.round(stageRect?.width ?? 900),
      stageH: Math.round(stageRect?.height ?? 650),
    };

    setSelected("card");
    setMenu(null);
  };

  const cardMove = (event: React.PointerEvent) => {
    const drag = cardDragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (drag.mode === "move") {
      if (dx === 0 && dy === 0) return;
      // clamped so the card can never be dragged outside the page
      patchCard({
        x: clamp(Math.round(drag.x + clamp(dx, drag.minDx, drag.maxDx)), -1500, 1500),
        y: clamp(Math.round(drag.y + clamp(dy, drag.minDy, drag.maxDy)), -1500, 1500),
      });
      return;
    }

    if (drag.mode === "h") {
      if (dy === 0) return;
      // the card + the page padding must stay inside the stage
      const maxH = Math.max(240, drag.stageH - 104);
      patchCard({ minHeight: clamp(Math.round(drag.minHeight + dy), 160, maxH) });
      return;
    }

    if (dx === 0) return;

    const widthDelta = drag.mode === "w-right" ? dx : -dx;
    const maxW = Math.max(240, Math.min(960, drag.stageW - 16));
    const width = clamp(Math.round(drag.width + widthDelta), 240, maxW);

    // keep the grabbed edge under the cursor (origin is centered) and
    // the card inside the page
    const xBound = Math.max(0, (drag.stageW - 32 - width) / 2);
    patchCard({
      width,
      x: clamp(Math.round(drag.x + dx / 2), -xBound, xBound),
    });
  };

  const endCardDrag = (event: React.PointerEvent) => {
    if (!cardDragRef.current) return;
    cardDragRef.current = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  };

  /* ---------------- stage-level pointer / context menu ---------------- */

  const onStagePointerDown = (event: React.PointerEvent) => {
    if (!layout.enabled || event.button !== 0) return;
    if (dragRef.current || cardDragRef.current) return;

    const target = event.target as HTMLElement;
    if (target.closest("[data-ekey]")) return;
    if (target.closest("button, a, input, select, textarea, label")) return;

    const stage = stageRef.current;
    if (!stage || !cardBox) return;

    const stageRect = stage.getBoundingClientRect();
    const px = event.clientX - stageRect.left + stage.scrollLeft;
    const py = event.clientY - stageRect.top + stage.scrollTop;

    if (
      px < cardBox.x ||
      px > cardBox.x + cardBox.w ||
      py < cardBox.y ||
      py > cardBox.y + cardBox.h
    ) {
      return;
    }

    beginCardDrag(event, "move", event.currentTarget as HTMLElement);
  };

  const onStageContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!layout.enabled) {
      setMenu(null);
      return;
    }

    const target = event.target as HTMLElement;
    const ekey = target
      .closest<HTMLElement>("[data-ekey]")
      ?.dataset.ekey as ElementKey | undefined;

    if (ekey && (ELEMENT_KEYS as readonly string[]).includes(ekey)) {
      setMenu({ type: "element", key: ekey, x: event.clientX, y: event.clientY });
      setSelected(ekey);
      return;
    }

    const stage = stageRef.current;
    if (stage && cardBox) {
      const stageRect = stage.getBoundingClientRect();
      const px = event.clientX - stageRect.left + stage.scrollLeft;
      const py = event.clientY - stageRect.top + stage.scrollTop;

      if (
        px >= cardBox.x &&
        px <= cardBox.x + cardBox.w &&
        py >= cardBox.y &&
        py <= cardBox.y + cardBox.h
      ) {
        setMenu({ type: "card", x: event.clientX, y: event.clientY });
        setSelected("card");
        return;
      }
    }

    setMenu(null);
  };

  /* ---------------- render ---------------- */

  const previewProfile: ProfileCardProfile = {
    ...profile,
    customLayout: serializeCustomLayout(layout),
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/customize");
    }
  };

  // The menu is clamped into the viewport and given a dynamic max height,
  // so right-clicking near the bottom never pushes it off the page.
  const menuLeft =
    menu != null && typeof window !== "undefined"
      ? Math.max(8, Math.min(menu.x, window.innerWidth - 264))
      : 0;
  const menuTop =
    menu != null && typeof window !== "undefined"
      ? Math.max(8, Math.min(menu.y, window.innerHeight - 80))
      : 0;
  const menuMaxHeight =
    menu != null && typeof window !== "undefined"
      ? Math.max(160, window.innerHeight - menuTop - 16)
      : 0;

  const renderElementMenu = (key: ElementKey) => {
    const meta = ELEMENT_META[key];
    const element = layout.elements[key];

    return (
      <>
        <div className="border-b border-[#1b1b1b] px-4 py-3">
          <p className="text-sm font-bold text-white">{meta.label}</p>
          <p className="mt-0.5 text-[11px] text-white/40">{meta.hint}</p>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <span className="text-xs text-white/50">Visibility</span>
          <button
            type="button"
            onClick={() => patchElement(key, { visible: !element.visible })}
            className={element.visible ? MENU_BTN_ON : MENU_BTN}
          >
            {element.visible ? "Visible" : "Hidden"}
          </button>
        </div>

        {meta.sizeKind === "text" && (
          <MenuSlider
            label="Font size"
            value={element.fontSize ?? DEFAULT_FONT_SIZE[key] ?? 16}
            min={8}
            max={64}
            unit="px"
            onChange={(value) => patchElement(key, { fontSize: value })}
          />
        )}

        {meta.sizeKind === "box" && (
          <MenuSlider
            label="Size"
            value={element.size ?? DEFAULT_BOX_SIZE[key] ?? 40}
            min={key === "avatar" ? 32 : 12}
            max={key === "avatar" ? 220 : 72}
            unit="px"
            onChange={(value) => patchElement(key, { size: value })}
          />
        )}

        {meta.hasWidth && (
          <MenuSlider
            label={`Width${element.width == null ? " (auto)" : ""}`}
            value={element.width ?? 0}
            min={0}
            max={900}
            unit="px"
            onChange={(value) => patchElement(key, { width: value || null })}
          />
        )}

        {meta.hasBorder && (
          <MenuSlider
            label="Border width"
            value={element.borderWidth ?? 1}
            min={0}
            max={8}
            unit="px"
            onChange={(value) => patchElement(key, { borderWidth: value })}
          />
        )}

        <MenuSlider
          label="Corner radius"
          value={element.borderRadius ?? DEFAULT_RADIUS[key] ?? 0}
          min={0}
          max={48}
          unit="px"
          onChange={(value) => patchElement(key, { borderRadius: value })}
        />

        <MenuSlider
          label="Opacity"
          value={element.opacity ?? 100}
          min={0}
          max={100}
          unit="%"
          onChange={(value) => patchElement(key, { opacity: value })}
        />

        {(meta.hasColor || meta.hasBackground || meta.hasBorder) && (
          <div className="border-t border-[#1b1b1b]">
            <button
              type="button"
              onClick={() => setColorsOpen((value) => !value)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30 transition-colors duration-200 hover:text-white/60"
            >
              <span>Colors</span>
              <span aria-hidden="true">{colorsOpen ? "▾" : "▸"}</span>
            </button>

            {colorsOpen && (
              <div className="pb-1">
                {meta.hasColor && (
                  <MenuColor
                    label="Text color"
                    value={element.color}
                    fallback="#ffffff"
                    onPick={(value) => patchElement(key, { color: value })}
                    onReset={() => patchElement(key, { color: null })}
                  />
                )}

                {meta.hasBackground && (
                  <MenuColor
                    label="Background"
                    value={element.backgroundColor}
                    fallback="#111111"
                    onPick={(value) => patchElement(key, { backgroundColor: value })}
                    onReset={() => patchElement(key, { backgroundColor: null })}
                  />
                )}

                {meta.hasBorder && (
                  <MenuColor
                    label="Border color"
                    value={element.borderColor}
                    fallback="#ffffff"
                    onPick={(value) => patchElement(key, { borderColor: value })}
                    onReset={() => patchElement(key, { borderColor: null })}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div className="border-t border-[#1b1b1b] px-4 py-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
            Position
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {element.anchor !== "flow" && element.anchor !== "auto" && (
              <button
                type="button"
                onClick={() => patchElement(key, { anchor: "flow" })}
                className={MENU_BTN}
              >
                Back in sequence
              </button>
            )}
            {key === "views" && element.anchor === "flow" && (
              <button
                type="button"
                onClick={() => patchElement(key, { anchor: "auto" })}
                className={MENU_BTN}
              >
                Use views corner
              </button>
            )}
            {element.anchor === "flow" && key !== "views" && (
              <span className="text-[11px] text-white/30">
                In sequence — drag on the card to free it
              </span>
            )}
            {element.anchor === "auto" && key === "views" && (
              <span className="text-[11px] text-white/30">
                Follows the views corner setting
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-[#1b1b1b] p-3">
          <button
            type="button"
            onClick={() => resetElement(key)}
            className="w-full rounded-lg border border-[#1b1b1b] bg-[#080808] py-2 text-xs font-semibold text-white/40 transition-colors hover:border-red-400/30 hover:text-red-400"
          >
            Reset element
          </button>
        </div>
      </>
    );
  };

  const renderCardMenu = () => (
    <>
      <div className="border-b border-[#1b1b1b] px-4 py-3">
        <p className="text-sm font-bold text-white">Card</p>
        <p className="mt-0.5 text-[11px] text-white/40">
          Drag empty card space to move it
        </p>
      </div>

      <MenuSlider
        label="Width"
        value={layout.card.width ?? profile?.cardWidth ?? 420}
        min={240}
        max={960}
        unit="px"
        onChange={(value) => patchCard({ width: value })}
      />
      <MenuSlider
        label="Min height"
        value={layout.card.minHeight ?? 320}
        min={160}
        max={1600}
        unit="px"
        onChange={(value) => patchCard({ minHeight: value })}
      />
      <MenuSlider
        label="Corner radius"
        value={layout.card.radius ?? profile?.borderRadius ?? 24}
        min={0}
        max={48}
        unit="px"
        onChange={(value) => patchCard({ radius: value })}
      />
      <MenuSlider
        label="Opacity"
        value={layout.card.opacity ?? 100}
        min={0}
        max={100}
        unit="%"
        onChange={(value) => patchCard({ opacity: value })}
      />
      <MenuSlider
        label="Padding X"
        value={layout.card.paddingX ?? 32}
        min={0}
        max={64}
        unit="px"
        onChange={(value) => patchCard({ paddingX: value })}
      />
      <MenuSlider
        label="Padding Y"
        value={layout.card.paddingY ?? 40}
        min={0}
        max={64}
        unit="px"
        onChange={(value) => patchCard({ paddingY: value })}
      />
      <MenuSlider
        label="Border width"
        value={layout.card.borderWidth ?? 1}
        min={0}
        max={8}
        unit="px"
        onChange={(value) => patchCard({ borderWidth: value })}
      />

      <div className="border-t border-[#1b1b1b]">
        <button
          type="button"
          onClick={() => setColorsOpen((value) => !value)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30 transition-colors duration-200 hover:text-white/60"
        >
          <span>Colors</span>
          <span aria-hidden="true">{colorsOpen ? "▾" : "▸"}</span>
        </button>

        {colorsOpen && (
          <div className="pb-1">
            <MenuColor
              label="Background"
              value={layout.card.backgroundColor}
              fallback="#111111"
              onPick={(value) => patchCard({ backgroundColor: value })}
              onReset={() => patchCard({ backgroundColor: null })}
            />
            <MenuColor
              label="Border color"
              value={layout.card.borderColor}
              fallback="#ffffff"
              onPick={(value) => patchCard({ borderColor: value })}
              onReset={() => patchCard({ borderColor: null })}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <span className="text-xs text-white/50">
          Offset {Math.round(layout.card.x ?? 0)}, {Math.round(layout.card.y ?? 0)}
        </span>
        <button
          type="button"
          onClick={() => patchCard({ x: 0, y: 0 })}
          className={MENU_BTN}
        >
          Recenter
        </button>
      </div>

      <div className="border-t border-[#1b1b1b] p-3">
        <button
          type="button"
          onClick={resetCard}
          className="w-full rounded-lg border border-[#1b1b1b] bg-[#080808] py-2 text-xs font-semibold text-white/40 transition-colors hover:border-red-400/30 hover:text-red-400"
        >
          Reset card
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* ---------------- toolbar ---------------- */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] px-4 py-3">
        <button type="button" onClick={goBack} className={TOOL_BTN}>
          ← Back
        </button>

        <div className="min-w-0">
          <h1 className="text-base font-bold text-white">Layout editor</h1>
          <p className="text-[11px] text-white/40">
            Drag anything to move it · corner handle to resize · right-click to edit
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" onClick={resetAll} className={TOOL_BTN}>
            Reset all
          </button>

          <button
            type="button"
            onClick={undo}
            disabled={!dirty}
            className={`${TOOL_BTN} disabled:cursor-not-allowed disabled:opacity-30`}
          >
            Undo
          </button>
        </div>
      </div>

      {saveError && <p className="text-xs text-red-400">{saveError}</p>}

      {/* ---------------- stage ---------------- */}
      <div
        ref={stageRef}
        className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]"
        onPointerDown={onStagePointerDown}
        onPointerMove={(event) => {
          if (cardDragRef.current) cardMove(event);
        }}
        onPointerUp={(event) => {
          if (cardDragRef.current) endCardDrag(event);
        }}
        onPointerCancel={(event) => {
          if (cardDragRef.current) endCardDrag(event);
        }}
        onContextMenu={onStageContextMenu}
      >
        <ProfilePreview
          profile={previewProfile}
          badges={badges}
          socials={socials}
          links={links}
          viewCount={viewCount}
          minHeight={stageH}
          device={device}
          onDeviceChange={setDevice}
          editor
          feedback={feedback}
        />

        {layout.enabled && cardBox && (
          <>
            {/* selection chip for the card */}
            {selected === "card" && (
              <span
                className="pointer-events-none absolute z-30 rounded-br-md bg-pink-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                style={{ left: cardBox.x, top: cardBox.y }}
              >
                Card
              </span>
            )}

            {/* card resize handles */}
            <div
              title="Drag to resize width"
              onPointerDown={(event) =>
                beginCardDrag(event, "w-left", event.currentTarget as HTMLElement)
              }
              onPointerMove={cardMove}
              onPointerUp={endCardDrag}
              onPointerCancel={endCardDrag}
              className="absolute z-[57] w-2.5 cursor-ew-resize touch-none rounded-full border border-[#0d0d0d] bg-pink-400/30 transition-colors hover:bg-pink-400"
              style={{
                left: cardBox.x - 5,
                top: cardBox.y,
                height: cardBox.h,
              }}
            />
            <div
              title="Drag to resize width"
              onPointerDown={(event) =>
                beginCardDrag(event, "w-right", event.currentTarget as HTMLElement)
              }
              onPointerMove={cardMove}
              onPointerUp={endCardDrag}
              onPointerCancel={endCardDrag}
              className="absolute z-[57] w-2.5 cursor-ew-resize touch-none rounded-full border border-[#0d0d0d] bg-pink-400/30 transition-colors hover:bg-pink-400"
              style={{
                left: cardBox.x + cardBox.w - 5,
                top: cardBox.y,
                height: cardBox.h,
              }}
            />
            <div
              title="Drag to resize height"
              onPointerDown={(event) =>
                beginCardDrag(event, "h", event.currentTarget as HTMLElement)
              }
              onPointerMove={cardMove}
              onPointerUp={endCardDrag}
              onPointerCancel={endCardDrag}
              className="absolute z-[57] h-2.5 cursor-ns-resize touch-none rounded-full border border-[#0d0d0d] bg-pink-400/30 transition-colors hover:bg-pink-400"
              style={{
                left: cardBox.x + 16,
                top: cardBox.y + cardBox.h - 5,
                width: Math.max(0, cardBox.w - 32),
              }}
            />
          </>
        )}

        {layout.enabled && (
          <div className="pointer-events-none absolute inset-0 z-[55]">
            {ELEMENT_KEYS.map((key) => {
              const box = boxes[key];
              if (!box) return null;

              const isSelected = selected === key;

              return (
                <div
                  key={key}
                  data-ekey={key}
                  onPointerDown={(event) => beginDrag(event, key, "move")}
                  onPointerMove={dragMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  className={`group pointer-events-auto absolute touch-none cursor-move rounded-md border transition-colors ${
                    isSelected
                      ? "border-pink-400 bg-pink-400/5"
                      : "border-transparent hover:border-pink-400/50"
                  }`}
                  style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                >
                  <span
                    className={`absolute left-0 top-0 rounded-br-md bg-pink-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white ${
                      isSelected ? "" : "hidden"
                    }`}
                  >
                    {ELEMENT_META[key].label}
                  </span>

                  {/* resize handle: only shows when hovered / selected */}
                  <span
                    title="Drag to resize"
                    onPointerDown={(event) =>
                      beginDrag(event, key, "resize")
                    }
                    onPointerMove={dragMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 cursor-nwse-resize touch-none rounded-sm border border-[#0d0d0d] bg-pink-400 shadow transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------- context menu ---------------- */}
      {menu && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onPointerDown={() => setMenu(null)}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setMenu(null);
            }}
          />
          <div
            className="menu-pop fixed z-[95] w-60 overflow-y-auto rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] py-1 shadow-2xl shadow-black/70"
            style={{
              left: menuLeft,
              top: menuTop,
              maxHeight: menuMaxHeight,
            }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {menu.type === "element"
              ? renderElementMenu(menu.key)
              : renderCardMenu()}
          </div>
        </>
      )}
    </div>
  );
}
