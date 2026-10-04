"use client";

import React, { useRef, useEffect } from "react";

interface ParallaxCardProps {
  children: React.ReactNode;
  enabled: boolean;
  maxTilt?: number;
  perspective?: number;
}

export default function ParallaxCard({
  children,
  enabled,
  maxTilt = 10,
  perspective = 1000,
}: ParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const el = cardRef.current;
    if (!el) return;

    function updateTransform() {
      el.style.setProperty("--tilt-x", `${tiltRef.current.x}`);
      el.style.setProperty("--tilt-y", `${tiltRef.current.y}`);

      const inner = el.querySelector(".parallax-inner");
      if (inner) {
        inner.style.transform = `
          perspective(${perspective}px)
          rotateY(${tiltRef.current.x * maxTilt}deg)
          rotateX(${-tiltRef.current.y * maxTilt}deg)
        `;
      }

      frameRef.current = requestAnimationFrame(updateTransform);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      tiltRef.current = { x, y };
    }

    function handleMouseLeave() {
      tiltRef.current = { x: 0, y: 0 };
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    frameRef.current = requestAnimationFrame(updateTransform);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled, maxTilt, perspective]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={cardRef}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
      }}
      className="relative"
    >
      <div className="parallax-inner transform transition-transform duration-70 ease-out will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}

export function ParallaxLayer({
  children,
  depth = 20,
  z = 30,
}: {
  children: React.ReactNode;
  depth?: number;
  z?: number;
}) {
  return (
    <div
      className="parallax-layer will-change-transform"
      style={{
        transform: `
          translateX(calc(var(--tilt-x, 0) * ${depth}px))
          translateY(calc(var(--tilt-y, 0) * ${depth}px))
          translateZ(${z}px)
        `,
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out",
      }}
    >
      {children}
    </div>
  );
}
