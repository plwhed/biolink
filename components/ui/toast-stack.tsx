"use client";

import { useEffect, useState } from "react";

export type ToastItem = { id: number; title: string; leaving?: boolean };

const toastStackLimit = 3;
const toastDurationMs = 10000;
let globalToasts: ToastItem[] = [];
const listeners = new Set<(next: ToastItem[]) => void>();

function emit() {
  listeners.forEach((listener) => listener([...globalToasts]));
}

export function showToast(title: string) {
  if (typeof window === "undefined") return;

  const nextToast = { id: Date.now() + Math.random(), title };
  globalToasts = [...globalToasts.slice(-(toastStackLimit - 1)), nextToast];
  emit();

  window.setTimeout(() => {
    globalToasts = globalToasts.map((toast) =>
      toast.id === nextToast.id ? { ...toast, leaving: true } : toast
    );
    emit();
  }, toastDurationMs - 500);

  window.setTimeout(() => {
    globalToasts = globalToasts.filter((toast) => toast.id !== nextToast.id);
    emit();
  }, toastDurationMs);
}

export function useToastStack() {
  const [hoveredToastId, setHoveredToastId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>(globalToasts);

  useEffect(() => {
    const listener = (next: ToastItem[]) => setToasts(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    toasts,
    hoveredToastId,
    setHoveredToastId,
    pushToast: showToast,
  };
}

export function ToastStack() {
  const { toasts, hoveredToastId, setHoveredToastId } = useToastStack();

  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-auto fixed right-6 top-6 z-[70]"
      onMouseLeave={() => setHoveredToastId(null)}
    >
      <div
        className="relative"
        style={{
          width: 260,
          height: Math.min(toasts.length, toastStackLimit) * 58,
        }}
      >
        {toasts.slice(-toastStackLimit).map((toast, index, array) => {
          const depth = array.length - 1 - index;
          const offsetY = depth * 12;
          const scale = 1 - depth * 0.04;
          const isLeaving = Boolean(toast.leaving);
          const isFront = depth === 0;
          const isHovered = isFront && hoveredToastId === toast.id;

          return (
            <div
              key={toast.id}
              className="absolute right-0 top-0 flex items-center gap-3 rounded-xl border border-[#d9d9d9] bg-white px-3.5 py-2.5"
              onMouseEnter={() => setHoveredToastId(toast.id)}
              onMouseLeave={() =>
                setHoveredToastId((current) =>
                  current === toast.id ? null : current
                )
              }
              style={{
                width: 260,
                height: 53,
                transform: `translate3d(${isFront ? 0 : -1}px, ${isLeaving ? 10 : offsetY}px, 0) scale(${isLeaving ? 0.92 : isHovered ? 1.04 : scale})`,
                transformOrigin: "center bottom",
                zIndex: index + 1,
                opacity: isLeaving ? 0 : isFront ? 1 : 0.96,
                transition: "transform 260ms cubic-bezier(0.2, 0.75, 0.2, 1), opacity 220ms ease, height 220ms ease",
                boxShadow: "none",
                animation: isLeaving
                  ? "toast-stack-out 200ms cubic-bezier(0.2, 0.75, 0.2, 1)"
                  : isFront
                    ? "toast-stack-in 220ms cubic-bezier(0.2, 0.75, 0.2, 1)"
                    : undefined,
              }}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.296a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0l-3.25-3.25a.75.75 0 1 1 1.06-1.06l2.72 2.72 6.72-6.72a.75.75 0 0 1 1.06 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-sm font-semibold text-[#111111]">{toast.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
