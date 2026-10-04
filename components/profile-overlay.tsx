"use client";

import { useState } from "react";

export default function ProfileOverlay({
  overlayText,
  children,
}: {
  overlayText: string;
  children: React.ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) return <>{children}</>;

  return (
    <button
      onClick={() => setRevealed(true)}
      className="group relative flex min-h-screen w-full items-center justify-center bg-zinc-950 font-sans text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-950/20 via-zinc-950 to-zinc-950" />
      <div className="relative flex flex-col items-center gap-4 px-32 py-20 backdrop-blur-sm transition ">
        <p className="text-2xl font-medium text-white/60 hover:text-pink-400">
          {overlayText}
        </p>
      </div>
    </button>
  );
}
