"use client";

import { useState } from "react";
import { useToastStack } from "@/components/ui/toast-stack";

/**
 * Quick bio editor for the dashboard overview. Saves straight to
 * /api/profile so the bio shows up on the public profile card.
 */
export default function BioEditor({
  initialBio = "",
}: {
  initialBio?: string;
}) {
  const [bio, setBio] = useState(initialBio);
  const [baseline, setBaseline] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { pushToast } = useToastStack();

  const dirty = bio !== baseline;

  async function handleSave() {
    if (!dirty || saving) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) throw new Error("Could not save your bio.");

      setBaseline(bio);
      pushToast("Bio saved!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your bio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
      <div className="flex items-center gap-3 mb-4 text-white">
        <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h10M4 18h7"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider">Bio</h3>
          <p className="text-xs text-white/40">
            Shown under your name on your profile
          </p>
        </div>
      </div>

      <textarea
        value={bio}
        maxLength={200}
        rows={3}
        placeholder="A short bio about you..."
        onChange={(event) => setBio(event.target.value)}
        className="w-full resize-none rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-pink-400/40 focus:ring-2 focus:ring-pink-400/10"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-white/30">{bio.length}/200</span>

        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            dirty && !saving
              ? "bg-pink-500 text-white hover:bg-pink-400"
              : "cursor-not-allowed bg-white/5 text-white/30"
          }`}
        >
          {saving ? "Saving..." : "Save bio"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
