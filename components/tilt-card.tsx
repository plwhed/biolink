"use client";

import { useEffect, useRef } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  enabled: boolean;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  /** Lerp factor per frame (0-1). Higher = snappier, lower = floatier. */
  speed?: number;
}

/**
 * Hover tilt for the profile card.
 *
 * - Only reacts while the pointer is over the card itself.
 * - Rotation eases toward the target (lerp) instead of snapping, and
 *   glides back to flat on leave, with a subtle scale-up while hovered.
 * - Perspective lives on the wrapper so the rotation gets real 3D
 *   foreshortening; the animation loop sleeps while the card is idle.
 * - Disabled entirely on touch devices.
 */
export default function TiltCard({
  children,
  enabled,
  maxTilt = 12,
  perspective = 1200,
  scale = 1.02,
  speed = 0.14,
}: TiltCardProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    cs: 1,
    hovering: false,
  });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const wrap = wrapRef.current;
    const tiltEl = tiltRef.current;
    if (!wrap || !tiltEl) return;

    const state = stateRef.current;

    const render = () => {
      state.cx += (state.tx - state.cx) * speed;
      state.cy += (state.ty - state.cy) * speed;
      state.cs += ((state.hovering ? scale : 1) - state.cs) * speed;

      const settled =
        !state.hovering &&
        Math.abs(state.tx - state.cx) < 0.02 &&
        Math.abs(state.ty - state.cy) < 0.02 &&
        Math.abs(state.cs - 1) < 0.001;

      if (settled) {
        state.cx = 0;
        state.cy = 0;
        state.cs = 1;
        tiltEl.style.transform = "";
        frameRef.current = null;
        return;
      }

      tiltEl.style.transform =
        `rotateX(${state.cx.toFixed(3)}deg) ` +
        `rotateY(${state.cy.toFixed(3)}deg) ` +
        `scale(${state.cs.toFixed(4)})`;
      frameRef.current = requestAnimationFrame(render);
    };

    const kick = () => {
      if (frameRef.current == null) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      state.ty = Math.max(-maxTilt, Math.min(maxTilt, -px * maxTilt * 2));
      state.tx = Math.max(-maxTilt, Math.min(maxTilt, py * maxTilt * 2));
      state.hovering = true;
      kick();
    };

    const onLeave = () => {
      state.hovering = false;
      state.tx = 0;
      state.ty = 0;
      kick();
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      tiltEl.style.transform = "";
    };
  }, [enabled, maxTilt, scale, speed]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ perspective: `${perspective}px` }}
    >
      <div
        ref={tiltRef}
        className="will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </div>
  );
}
