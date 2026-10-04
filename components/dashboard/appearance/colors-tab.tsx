"use client";

import { useEffect, useRef, useState } from "react";
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

const checker: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg,#222 25%,transparent 25%),linear-gradient(-45deg,#222 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#222 75%),linear-gradient(-45deg,transparent 75%,#222 75%)",
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0,0 4px,4px -4px,-4px 0",
  backgroundColor: "#0d0d0d",
};

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

function resolve(v: string) {
  if (legacy[v]) return legacy[v];
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  return "#ffffff";
}

function swatch(hex: string): React.CSSProperties {
  return hex === "transparent"
    ? checker
    : { backgroundColor: hex };
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

    return (
      v -
      v * s * Math.max(Math.min(k, 4 - k, 1), 0)
    );
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

  const handle = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
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

function Picker({
  value,
  onChange,
  closing,
}: {
  value: string;
  onChange: (stored: string) => void;
  closing: boolean;
}) {
  const initial = resolve(value);

  const [hsv, setHsv] = useState(() =>
    hexToHsv(initial)
  );

  const [text, setText] = useState(
    initial === "transparent" ? "" : initial
  );

  const [clear, setClear] = useState(
    initial === "transparent"
  );

  const hex = hsvToHex(
    hsv.h,
    hsv.s,
    hsv.v
  );

  const apply = (n: {
    h: number;
    s: number;
    v: number;
  }) => {
    const h = hsvToHex(
      n.h,
      n.s,
      n.v
    );

    setHsv(n);
    setText(h);
    setClear(false);
    onChange(h);
  };

  return (
    <div
      className={`picker-pop absolute right-0 top-full z-20 mt-2 w-60 origin-top-right rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-3 shadow-2xl ${
        closing
          ? "picker-pop-close"
          : "picker-pop-open"
      }`}
    >
      <Drag
        onMove={(x, y) =>
          apply({
            h: hsv.h,
            s: x,
            v: 1 - y,
          })
        }
        className="relative h-28 w-full cursor-crosshair touch-none overflow-hidden rounded-xl"
        style={{
          backgroundColor: `hsl(${hsv.h},100%,50%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: hex,
          }}
        />
      </Drag>

      <Drag
        onMove={(x) =>
          apply({
            h: x * 360,
            s: hsv.s,
            v: hsv.v,
          })
        }
        className="relative mt-3 h-2.5 w-full cursor-pointer touch-none rounded-full"
        style={{
          background:
            "linear-gradient(to right,#f00 0%,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
          style={{
            left: `${(hsv.h / 360) * 100}%`,
            backgroundColor: `hsl(${hsv.h},100%,50%)`,
          }}
        />
      </Drag>

      <div className="mt-3 flex items-center gap-2">
        <div
          className="h-9 w-9 shrink-0 rounded-lg border border-white/10"
          style={swatch(
            clear ? "transparent" : hex
          )}
        />

        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);

            const n = parseHex(
              e.target.value
            );

            if (n) {
              setHsv(hexToHsv(n));
              setClear(false);
              onChange(n);
            }
          }}
          placeholder="#ffffff"
          spellCheck={false}
          maxLength={7}
          className="w-full rounded-lg border border-[#1b1b1b] bg-[#080808] px-3 py-2 text-xs font-medium text-white outline-none transition-colors placeholder:text-white/20 hover:border-white/20 focus:border-pink-500/40"
        />
      </div>
    </div>
  );
}

export function ColorPickerField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const hex = resolve(value);

  return (
    <div className="relative flex items-center gap-4 rounded-xl border bg-[#0d0d0d] p-3 transition-all duration-200 border-[#1b1b1b] hover:border-white/20">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-white/40">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs text-white/50">
          {description}
        </p>
      </div >

      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-lg border border-[#1b1b1b] bg-[#080808] py-1 pl-1.5 pr-3 transition-all duration-200 hover:border-white/20 cursor-pointer"
      >
        <span
          className="h-6 w-6 rounded-md border border-white/10"
          style={swatch(hex)}
        />
        <span className="text-xs font-medium text-white/70">
          {hex}
        </span>
      </div>

      {open && (
        <div ref={pickerRef} className="absolute right-0 top-full z-20 mt-2">
          <Picker value={value} onChange={onChange} closing={false} />
        </div>
      )}
    </div >
  );
}

export default function ColorsTab({
  initialColors,
}: {
  initialColors: Record<ColorKey, string>;
}) {
  return null;
}