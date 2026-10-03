"use client";

import { useState, useRef } from "react";

interface MediaTabProps {
  initialAvatar?: string | null;
  initialBackground?: string | null;
  initialCursor?: string | null;
}

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
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-pink-400/30 hover:bg-white/[0.07]"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
          {preview ? (
            <img src={preview} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
          )}
          {preview && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
              <span className="text-[10px] font-medium text-white">Change</span>
            </div>
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="text-xs text-white/30">
            {uploading ? "Uploading..." : preview ? "Click to change" : "Click to upload"}
          </p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </button>
      {preview && (
        <button
          onClick={handleDelete}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-zinc-800 text-white/40 opacity-0 transition hover:border-red-400/50 hover:bg-red-400/20 hover:text-red-400 group-hover:opacity-100"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function MediaTab({
  initialAvatar,
  initialBackground,
  initialCursor,
}: MediaTabProps) {
  const [avatar, setAvatar] = useState(initialAvatar ?? "");
  const [background, setBackground] = useState(initialBackground ?? "");
  const [cursor, setCursor] = useState(initialCursor ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: avatar, backgroundUrl: background, cursorUrl: cursor }),
      });
      if (!response.ok) throw new Error("Could not save your media settings.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your media settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <UploadBox label="Avatar" current={avatar || null} type="avatar" onUpload={setAvatar} onDelete={() => setAvatar("")} />
        <UploadBox label="Background" current={background || null} type="background" onUpload={setBackground} onDelete={() => setBackground("")} />
        <UploadBox label="Cursor" current={cursor || null} type="cursor" onUpload={setCursor} onDelete={() => setCursor("")} />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-pink-400 px-5 py-2 text-sm font-semibold text-pink-950 transition hover:bg-pink-300 disabled:opacity-50"
      >
        {saved ? "Saved!" : saving ? "Saving..." : "Save"}
      </button>
      {saveError && <p role="alert" className="text-sm text-red-400">{saveError}</p>}
    </div>
  );
}
