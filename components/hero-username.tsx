"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroUsernameInput() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = username.trim().replace(/^@/, "");
    if (!u) {
      setError(true);
      return;
    }
    router.push(`/register?username=${encodeURIComponent(u)}`);
  }

  return (
    <div className="mx-auto mt-10 flex w-full max-w-md flex-col items-center gap-2">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center rounded-full border border-white/20 bg-white/10 p-1.5 shadow-inner backdrop-blur-md focus-within:border-pink-300/50 focus-within:ring-4 focus-within:ring-pink-300/20"
      >
        <span className="pl-4 text-pink-200/70">egirls.lol/</span>
        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(false);
          }}
          placeholder="yourusername"
          aria-label="Username"
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-pink-100/40"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-pink-400 px-6 py-2.5 text-sm font-semibold text-pink-950 transition hover:bg-pink-300"
        >
          Start
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-300">Enter a username to continue.</p>
      )}
    </div>
  );
}