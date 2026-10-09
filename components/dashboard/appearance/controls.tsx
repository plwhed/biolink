"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Slider({
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
  onChange: (value: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!dragging.current) {
      setDisplayValue(value);
    }
  }, [value]);

  const update = (clientX: number) => {
    if (!track.current) return;

    const rect = track.current.getBoundingClientRect();

    const ratio = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width)
    );

    const raw = min + ratio * (max - min);
    const next = Math.round(raw / step) * step;

    setDisplayValue(next);
    onChange(next);
  };

  const percentage =
    max === min
      ? 0
      : ((displayValue - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {label}
        </span>

        <span className="text-xs tabular-nums text-white/40">
          {displayValue}
          {unit}
        </span>
      </div>

      <div
        className="cursor-pointer touch-none py-2"
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          update(event.clientX);
        }}
        onPointerMove={(event) => {
          if (dragging.current) {
            update(event.clientX);
          }
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <div
          ref={track}
          className="relative mx-1 h-1.5 rounded-full bg-[#222]"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-pink-500 transition-[width] duration-75"
            style={{
              width: `${percentage}%`,
            }}
          />

          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg transition-transform duration-100"
            style={{
              left: `${percentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
      <div className="flex items-center gap-4 border-b border-[#1b1b1b] p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10">
          <svg
            className="h-5 w-5 text-pink-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={icon}
            />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-sm text-white/40">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-white/60">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-all duration-300 ${
        enabled
          ? "border-pink-400/40 bg-pink-500"
          : "border-[#292929] bg-[#181818]"
      }`}
    >
      <span
        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-300 ${
          enabled ? "left-[24px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

export function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/40">
          {description}
        </p>
      </div>

      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}
