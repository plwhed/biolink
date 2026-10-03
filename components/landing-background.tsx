"use client";

import { useEffect, useRef } from "react";
import { NoiseGradientBackground } from "noise-gradient-bg";

export default function LandingBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const tick = () => {
      const noiseLayers = document.querySelectorAll(
        ".mix-blend-overlay, .mix-blend-soft-light"
      );
      noiseLayers?.forEach((el) => {
        const isMicro = el.classList.contains("mix-blend-soft-light");
        const factor = isMicro ? 20 : 40;
        (el as HTMLElement).style.backgroundPosition = `${pos.current.x * factor}px ${pos.current.y * factor}px`;
      });
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <NoiseGradientBackground
        primaryColor="rgba(244,114,182,0.28)"
        secondaryColor="rgba(232,121,249,0.20)"
        tertiaryColor="rgba(251,207,232,0.16)"
        primaryBlur={100}
        secondaryBlur={100}
        tertiaryBlur={100}
        noiseOpacity={95}
        microNoiseOpacity={10}
        vignetteIntensity="strong"
        className="min-h-screen"
        theme="custom"
      />
      <div className="noise-darken" />
      <div className="relative z-10 min-h-screen">{children}</div>
    </>
  );
}
