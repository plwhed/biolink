"use client";

import { useState, useRef, useEffect } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  enabled: boolean;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
}

export default function TiltCard({
  children,
  enabled,
  maxTilt = 15,
  perspective = 1000,
  scale = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const el = cardRef.current;
    if (!el) return;

    function updateTransform() {
      el.style.transform = `rotateX(${tiltRef.current.x}deg) rotateY(${tiltRef.current.y}deg) scale3d(${scale}, ${scale}, ${scale})`;
      frameRef.current = requestAnimationFrame(updateTransform);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      tiltRef.current = {
        x: Math.max(-maxTilt, Math.min(maxTilt, deltaY * maxTilt)),
        y: Math.max(-maxTilt, Math.min(maxTilt, -deltaX * maxTilt)),
      };
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
  }, [enabled, maxTilt, scale]);

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
    >
      <div
        className="transform transition-transform duration-300 ease-out will-change-transform"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
}
