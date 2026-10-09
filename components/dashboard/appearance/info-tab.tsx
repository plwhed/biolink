"use client";

import { useMemo, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { useToastStack } from "@/components/ui/toast-stack";
import { useDashboardDirtyState } from "@/components/dashboard/dashboard-dirty-state";

interface InfoTabProps {
  initialDisplayName: string;
  initialDescription: string;
  initialOverlayText: string;
  initialOverlayEnabled: boolean;
  initialAvatar: string | null;
  initialBackground: string | null;
  initialCursor: string | null;
}

const inputClass =
  "w-full rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 hover:border-white/20 focus:border-white/20";

const labelClass = "mb-2 block text-sm font-semibold text-white/60";

function UploadBox({
  label,
  current,
  type,
  onUpload,
  onDelete,
}: {
  label: string;
  current: string | null;
  type: string;
  onUpload: (url: string) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(current);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setPreview(data.url);
        onUpload(data.url);
      }
    } catch {}
    setUploading(false);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (preview) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: preview }),
      });
    }
    setPreview(null);
    onDelete();
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center gap-4 rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-5 text-left transition-all duration-300 ease-out hover:border-white/20 hover:bg-[#0f0f0f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-pink-500/10 text-pink-500 transition-transform duration-300 group-hover:scale-110">
          {preview ? (
            <img src={preview} alt={label} className="h-full w-full object-cover" />
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex flex-col transition-all duration-300">
          <p className="text-sm font-semibold text-white/60 transition-colors group-hover:text-white/80">{label}</p>
          <p className="truncate text-base font-bold tracking-tight text-white transition-colors group-hover:text-white">
            {uploading ? "Uploading..." : preview ? "Change" : "Click to upload"}
          </p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </button>
      {preview && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={uploading}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#1b1b1b] bg-[#080808] text-white/40 opacity-0 transition-all duration-200 hover:border-red-400/50 hover:text-red-400 group-hover:opacity-100 disabled:opacity-0 hover:scale-110"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function InfoTab({
  initialDisplayName,
  initialDescription,
  initialOverlayText,
  initialOverlayEnabled,
  initialAvatar,
  initialBackground,
  initialCursor,
}: InfoTabProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [description, setDescription] = useState(initialDescription);
  const [overlayText, setOverlayText] = useState(initialOverlayText);
  const [overlayEnabled, setOverlayEnabled] = useState(initialOverlayEnabled);
  const [avatar, setAvatar] = useState(initialAvatar ?? "");
  const [background, setBackground] = useState(initialBackground ?? "");
  const [cursor, setCursor] = useState(initialCursor ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [baseline, setBaseline] = useState({
    displayName: initialDisplayName,
    description: initialDescription,
    overlayText: initialOverlayText,
    overlayEnabled: initialOverlayEnabled,
    avatar,
    background,
    cursor,
  });
  const { pushToast } = useToastStack();

  const dirtyCount = useMemo(() => {
    const current = {
      displayName,
      description,
      overlayText,
      overlayEnabled,
      avatar,
      background,
      cursor,
    };

    return Object.entries(current).filter(
      ([key, value]) => value !== baseline[key as keyof typeof baseline]
    ).length;
  }, [avatar, background, baseline, cursor, description, displayName, overlayEnabled, overlayText]);

  function handleUndo() {
    setDisplayName(baseline.displayName);
    setDescription(baseline.description);
    setOverlayText(baseline.overlayText);
    setOverlayEnabled(baseline.overlayEnabled);
    setAvatar(baseline.avatar);
    setBackground(baseline.background);
    setCursor(baseline.cursor);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          description,
          overlayText,
          overlayEnabled,
          avatarUrl: avatar,
          backgroundUrl: background,
          cursorUrl: cursor,
        }),
      });
      if (!response.ok) throw new Error("Could not save your profile settings.");
      setBaseline({
        displayName,
        description,
        overlayText,
        overlayEnabled,
        avatar,
        background,
        cursor,
      });
      setSaved(true);
      pushToast("Profile Saved!");
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your profile settings.");
    } finally {
      setSaving(false);
    }
  }

  useDashboardDirtyState("profile", {
    count: dirtyCount,
    onSave: handleSave,
    onUndo: handleUndo,
  });

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UploadBox label="Avatar" current={avatar || null} type="avatar" onUpload={setAvatar} onDelete={() => setAvatar("")} />
        <UploadBox label="Background" current={background || null} type="background" onUpload={setBackground} onDelete={() => setBackground("")} />
        <UploadBox label="Cursor" current={cursor || null} type="cursor" onUpload={setCursor} onDelete={() => setCursor("")} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <label className={labelClass}>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className={inputClass}
          />
          <p className="mt-2 text-xs text-white/30">Shown instead of your username on your profile</p>
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell visitors about yourself..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
          <p className="mt-2 text-xs text-white/30">Shown below your name on your profile</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/60">Click-to-show overlay</p>
            <p className="mt-0.5 text-sm text-white/50">Show a screen before your profile opens</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={overlayEnabled}
            onClick={() => setOverlayEnabled(!overlayEnabled)}
            className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
              overlayEnabled ? "border-pink-500/40 bg-pink-500/20" : "border-[#1b1b1b] bg-[#080808]"
            }`}
          >
            <span
              className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all ${
                overlayEnabled ? "left-6 bg-pink-400" : "left-1 bg-white/40"
              }`}
            />
          </button>
        </div>
        {overlayEnabled && (
          <div className="mt-5 border-t border-[#1b1b1b] pt-5">
            <input
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Click to show"
              className={inputClass}
            />
          </div>
        )}
      </div>

      {saveError && <p role="alert" className="text-sm text-red-400">{saveError}</p>}
    </div>
  );
}