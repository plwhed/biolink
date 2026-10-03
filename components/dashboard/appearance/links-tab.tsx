"use client";

import { useState, useRef } from "react";

const platforms = [
  { id: "instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { id: "youtube", icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { id: "tiktok", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
  { id: "discord", icon: "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" },
  { id: "twitter", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { id: "github", icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
];

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  order: number;
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-white/30 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export default function LinksTab({
  initialLinks,
}: {
  initialLinks: SocialLink[];
}) {
  const [links, setLinks] = useState<SocialLink[]>(
    initialLinks.map((l, i) => ({ ...l, order: l.order ?? i }))
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof platforms[0] | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  function openAddModal(platform: typeof platforms[0]) {
    setSelectedPlatform(platform);
    const existing = links.find((l) => l.platform === platform.id);
    setUrlInput(existing?.url ?? "");
    const idx = links.findIndex((l) => l.platform === platform.id);
    setEditingIndex(idx >= 0 ? idx : null);
    setShowPlatformModal(false);
    setShowUrlModal(true);
  }

  function handleSaveUrl() {
    if (!selectedPlatform || !urlInput.trim()) return;
    if (editingIndex !== null && editingIndex >= 0) {
      setLinks((prev) =>
        prev.map((l, i) => (i === editingIndex ? { ...l, url: urlInput } : l))
      );
    } else {
      setLinks((prev) => [
        ...prev,
        { platform: selectedPlatform.id, url: urlInput, order: prev.length },
      ]);
    }
    setShowUrlModal(false);
    setUrlInput("");
    setSelectedPlatform(null);
    setEditingIndex(null);
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const items = [...links];
    const dragged = items.splice(dragItem.current, 1)[0];
    items.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setLinks(items.map((l, i) => ({ ...l, order: i })));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socialLinks: links.map((l, i) => ({ ...l, order: i })) }),
      });
      if (!response.ok) throw new Error("Could not save your social links.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your social links.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, index) => {
            const p = platforms.find((pp) => pp.id === link.platform);
            return (
              <div
                key={`${link.platform}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="group flex cursor-grab items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 active:cursor-grabbing"
              >
                <svg className="h-4 w-4 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 8h16M4 16h16" />
                </svg>
                {p && <svg className="h-4 w-4 shrink-0 fill-current text-white/60" viewBox="0 0 24 24"><path d={p.icon} /></svg>}
                <span className="flex-1 truncate text-sm text-white/70">{link.url}</span>
                <button onClick={() => openAddModal(p ?? platforms[0])} className="text-xs text-white/30 hover:text-pink-400">Edit</button>
                <button onClick={() => removeLink(index)} className="text-xs text-white/30 hover:text-red-400">Remove</button>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowPlatformModal(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 py-3 text-sm font-medium text-white/40 transition hover:border-pink-400/30 hover:text-pink-400"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M12 4v16m8-8H4" />
        </svg>
        Add link
      </button>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-pink-400 px-5 py-2 text-sm font-semibold text-pink-950 transition hover:bg-pink-300 disabled:opacity-50"
      >
        {saved ? "Saved!" : saving ? "Saving..." : "Save"}
      </button>
      {saveError && <p role="alert" className="text-sm text-red-400">{saveError}</p>}

      <Modal open={showPlatformModal} onClose={() => setShowPlatformModal(false)}>
        <p className="mb-4 text-sm font-medium text-white/60">Select platform</p>
        <div className="grid grid-cols-3 gap-2">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => openAddModal(p)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-pink-400/30 hover:bg-pink-400/10"
            >
              <svg className="h-5 w-5 fill-current text-white/50 transition group-hover:text-pink-400" viewBox="0 0 24 24">
                <path d={p.icon} />
              </svg>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={showUrlModal} onClose={() => setShowUrlModal(false)}>
        <div className="mb-5 flex items-center gap-3">
          {selectedPlatform && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <svg className="h-5 w-5 fill-current text-white/60" viewBox="0 0 24 24">
                <path d={selectedPlatform.icon} />
              </svg>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-white/80">
              {editingIndex !== null ? "Edit link" : "Add link"}
            </p>
          </div>
        </div>
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://..."
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSaveUrl()}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setShowUrlModal(false)}
            className="rounded-xl px-4 py-2.5 text-sm text-white/40 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveUrl}
            className="rounded-xl bg-pink-400 px-5 py-2.5 text-sm font-semibold text-pink-950 transition hover:bg-pink-300"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}
