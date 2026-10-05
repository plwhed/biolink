"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type ColorKey =
  | "accentColor"
  | "badgeColor"
  | "socialColor"
  | "linkHoverColor";

const legacy: Record<string, string> = {
  transparent: "transparent",
  white: "#ffffff",
  emerald: "#10b981",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  orange: "#f97316",
  red: "#ef4444",
  yellow: "#eab308",
  cyan: "#06b6d4",
};

const checkerImage =
  "linear-gradient(45deg,#222 25%,transparent 25%),linear-gradient(-45deg,#222 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#222 75%),linear-gradient(-45deg,transparent 75%,#222 75%)";

const checkerSize = "8px 8px,8px 8px,8px 8px,8px 8px";
const checkerPosition = "0 0,0 4px,4px -4px,-4px 0";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

function resolve(v: string) {
  if (legacy[v]) return legacy[v];
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  return "#ffffff";
}

function toRgba(hex: string, alpha: number) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return "rgba(0,0,0,0)";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexToHsv(hex: string) {
  const b = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#ffffff";

  const r = parseInt(b.slice(1, 3), 16) / 255;
  const g = parseInt(b.slice(3, 5), 16) / 255;
  const bl = parseInt(b.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, bl);
  const d = max - Math.min(r, g, bl);

  let h = 0;

  if (d) {
    if (max === r) h = ((g - bl) / d) % 6;
    else if (max === g) h = (bl - r) / d + 2;
    else h = (r - g) / d + 4;

    h *= 60;

    if (h < 0) h += 360;
  }

  return {
    h,
    s: max ? d / max : 0,
    v: max,
  };
}

function hsvToHex(h: number, s: number, v: number) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  };

  const to = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${to(f(5))}${to(f(3))}${to(f(1))}`;
}

function parseHex(v: string) {
  const s = v.trim().toLowerCase();
  const w = s.startsWith("#") ? s : `#${s}`;

  if (/^#[0-9a-f]{6}$/.test(w)) {
    return w;
  }

  if (/^#[0-9a-f]{3}$/.test(w)) {
    return `#${w[1]}${w[1]}${w[2]}${w[2]}${w[3]}${w[3]}`;
  }

  return null;
}

function useFrameThrottle<T>(fn: (v: T) => void) {
  const fnRef = useRef(fn);
  const raf = useRef<number | null>(null);
  const pending = useRef<{ v: T } | null>(null);

  fnRef.current = fn;

  const flush = useCallback(() => {
    raf.current = null;
    if (pending.current) {
      const { v } = pending.current;
      pending.current = null;
      fnRef.current(v);
    }
  }, []);

  const push = useCallback(
    (v: T) => {
      pending.current = { v };
      if (raf.current === null) {
        raf.current = requestAnimationFrame(flush);
      }
    },
    [flush]
  );

  useEffect(
    () => () => {
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
      if (pending.current) {
        const { v } = pending.current;
        pending.current = null;
        fnRef.current(v);
      }
    },
    []
  );

  return push;
}

function Swatch({
  hex,
  opacity = 100,
  className,
}: {
  hex: string;
  opacity?: number;
  className?: string;
}) {
  const fill = toRgba(hex, opacity / 100);

  return (
    <span
      className={`block ring-1 ring-inset ring-white/10 ${className ?? ""}`}
      style={{
        backgroundImage: `linear-gradient(${fill},${fill}),${checkerImage}`,
        backgroundSize: `100% 100%,${checkerSize}`,
        backgroundPosition: `0 0,${checkerPosition}`,
        backgroundColor: "#0d0d0d",
      }}
    />
  );
}

function Drag({
  onMove,
  className,
  style,
  children,
}: {
  onMove: (x: number, y: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const active = useRef(false);

  const handle = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();

    onMove(
      clamp((e.clientX - r.left) / r.width),
      clamp((e.clientY - r.top) / r.height)
    );
  };

  return (
    <div
      className={className}
      style={style}
      onPointerDown={(e) => {
        active.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        handle(e);
      }}
      onPointerMove={(e) => {
        if (active.current) {
          handle(e);
        }
      }}
      onPointerUp={() => {
        active.current = false;
      }}
      onPointerCancel={() => {
        active.current = false;
      }}
    >
      {children}
    </div>
  );
}

function PickerBody({
  label,
  description,
  value,
  onChange,
  opacity,
  onOpacityChange,
  onClose,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (stored: string) => void;
  opacity?: number;
  onOpacityChange?: (v: number) => void;
  onClose: () => void;
}) {
  const initial = resolve(value);
  const hasOpacity = opacity !== undefined && !!onOpacityChange;

  const [hsv, setHsv] = useState(() => hexToHsv(initial));
  const [text, setText] = useState(initial === "transparent" ? "" : initial);
  const [localOpacity, setLocalOpacity] = useState(opacity ?? 100);
  const [opText, setOpText] = useState(String(opacity ?? 100));

  const emitColor = useFrameThrottle<string>(onChange);
  const emitOpacity = useFrameThrottle<number>((v) => onOpacityChange?.(v));

  const hex = hsvToHex(hsv.h, hsv.s, hsv.v);

  const apply = (n: { h: number; s: number; v: number }) => {
    const h = hsvToHex(n.h, n.s, n.v);
    setHsv(n);
    setText(h);
    emitColor(h);
  };

  const applyOpacity = (n: number) => {
    const v = Math.round(Math.min(Math.max(n, 0), 100));
    setLocalOpacity(v);
    setOpText(String(v));
    emitOpacity(v);
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">{label}</h3>
          <p className="mt-0.5 text-xs text-white/40">{description}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <Drag
        onMove={(x, y) => apply({ h: hsv.h, s: x, v: 1 - y })}
        className="relative mt-5 h-52 w-full cursor-crosshair touch-none rounded-xl"
        style={{
          backgroundColor: `hsl(${hsv.h},100%,50%)`,
          backgroundImage:
            "linear-gradient(to top,#000,rgba(0,0,0,0)),linear-gradient(to right,#fff,rgba(255,255,255,0))",
        }}
      >
        <div
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: hex,
          }}
        />
      </Drag>

      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Hue
          </p>
          <Drag
            onMove={(x) => apply({ h: x * 360, s: hsv.s, v: hsv.v })}
            className="relative h-3 w-full cursor-pointer touch-none rounded-full"
            style={{
              background:
                "linear-gradient(to right,#f00 0%,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
              style={{
                left: `${(hsv.h / 360) * 100}%`,
                backgroundColor: `hsl(${hsv.h},100%,50%)`,
              }}
            />
          </Drag>
        </div>

        {hasOpacity && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Opacity
              </p>
              <span className="text-xs font-medium text-white/60">{localOpacity}%</span>
            </div>
            <Drag
              onMove={(x) => applyOpacity(x * 100)}
              className="relative h-3 w-full cursor-pointer touch-none rounded-full"
              style={{
                backgroundImage: `linear-gradient(to right,${toRgba(hex, 0)},${toRgba(hex, 1)}),${checkerImage}`,
                backgroundSize: `100% 100%,${checkerSize}`,
                backgroundPosition: `0 0,${checkerPosition}`,
                backgroundColor: "#0d0d0d",
              }}
            >
              <div
                className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
                style={{
                  left: `${localOpacity}%`,
                  backgroundColor: toRgba(hex, Math.max(localOpacity / 100, 0.35)),
                }}
              />
            </Drag>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Swatch hex={hex} opacity={localOpacity} className="h-10 w-10 shrink-0 rounded-lg" />

        <input
          value={text}
          autoComplete="off"
          onChange={(e) => {
            setText(e.target.value);
            const n = parseHex(e.target.value);
            if (n) {
              setHsv(hexToHsv(n));
              emitColor(n);
            }
          }}
          placeholder="#ffffff"
          spellCheck={false}
          maxLength={7}
          className="w-full rounded-lg border border-[#1b1b1b] bg-[#080808] px-3 py-2.5 text-sm font-medium text-white outline-none transition-colors placeholder:text-white/20 hover:border-white/20 focus:border-pink-500/40"
        />

        {hasOpacity && (
          <div className="relative w-24 shrink-0">
            <input
              value={opText}
              inputMode="numeric"
              autoComplete="off"
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 3);
                setOpText(d);
                if (d !== "") {
                  const n = Math.min(parseInt(d, 10), 100);
                  setLocalOpacity(n);
                  emitOpacity(n);
                }
              }}
              onBlur={() => setOpText(String(localOpacity))}
              className="w-full rounded-lg border border-[#1b1b1b] bg-[#080808] py-2.5 pl-3 pr-7 text-sm font-medium text-white outline-none transition-colors hover:border-white/20 focus:border-pink-500/40"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
              %
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-lg bg-pink-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-400 active:scale-[0.98]"
      >
        Done
      </button>
    </>
  );
}

export function ColorPickerField({
  label,
  description,
  value,
  onChange,
  opacity,
  onOpacityChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  opacity?: number;
  onOpacityChange?: (v: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const openPicker = () => {
    clearTimeout(timer.current);
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };

  const closePicker = useCallback(() => {
    setShown(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMounted(false), 250);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePicker();
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, closePicker]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const hex = resolve(value);
  const hasOpacity = opacity !== undefined && !!onOpacityChange;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-white">{label}</p>
        <p className="truncate text-sm text-white/40">{description}</p>
      </div>

      <button
        type="button"
        onClick={openPicker}
        className="flex shrink-0 items-center gap-3 rounded-xl border border-[#1b1b1b] bg-[#080808] py-2 pl-2 pr-4 transition-[border-color,transform] duration-200 hover:border-white/20 active:scale-95"
      >
        <Swatch hex={hex} opacity={opacity ?? 100} className="h-8 w-8 rounded-lg" />
        <span className="text-sm font-medium text-white">{hex}</span>
        {hasOpacity && (
          <span className="border-l border-white/10 pl-3 text-sm font-medium text-white/50">
            {opacity}%
          </span>
        )}
      </button>

      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-250 ease-out ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              onClick={closePicker}
              className="absolute inset-0 bg-black/80"
            />

            <div
              className={`${montserrat.className} relative w-full max-w-sm transform-gpu rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-5 transition-[transform,opacity] duration-250 ease-out will-change-transform ${
                shown
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-4 scale-95 opacity-0"
              }`}
            >
              <PickerBody
                label={label}
                description={description}
                value={value}
                onChange={onChange}
                opacity={opacity}
                onOpacityChange={onOpacityChange}
                onClose={closePicker}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default function ColorsTab({
  initialColors,
}: {
  initialColors: Record<ColorKey, string>;
}) {
  return null;
}