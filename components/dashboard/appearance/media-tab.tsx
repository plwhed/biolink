"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useToastStack } from "@/components/ui/toast-stack";
import { useDashboardDirtyState } from "@/components/dashboard/dashboard-dirty-state";

interface MediaTabProps {
  initialAvatar?: string | null;
  initialBackground?: string | null;
  initialCursor?: string | null;
}

type AssetKey = "avatar" | "background" | "cursor";

type UploadModalState = {
  open: boolean;
  type: AssetKey | null;
  draftUrl: string;
  uploading: boolean;
  dragOver: boolean;
};

function UploadBox({
  label,
  current,
  type,
  onOpen,
  onDelete,
}: {
  label: string;
  current: string | null;
  type: AssetKey;
  onOpen: (type: AssetKey) => void;
  onDelete: () => void;
}) {
  const preview = current || "";

  const getIcon = () => {
    const iconClass = "w-6 h-6 text-pink-500";
    if (type === "avatar") return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy={7} r="4"></circle></svg>
    );
    if (type === "background") return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
    );
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="M12.586 12.586 19 19"></path><path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z"></path></svg>
    );
  };

  return (
    <div className="group rounded-2xl border p-2 transition-all duration-300 ease-out border-[#1b1b1b] bg-[#0d0d0d] hover:border-white/20 hover:bg-[#111] hover:scale-[1.01]">
      <div className="relative p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="relative w-full h-full rounded-xl flex items-center justify-center transition-all duration-300 bg-pink-500/20 text-pink-500">
                <div className="relative z-10">{getIcon()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-100 text-sm">{label}</h3>
            </div>
          </div>
          {preview && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 bg-zinc-800/50 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          )}
        </div>
      </div>
      <div className="relative px-4 pb-4">
        <div className="relative aspect-video bg-[#080808] rounded-xl overflow-hidden border border-zinc-700/30">
          <button
            type="button"
            onClick={() => {
              if (!preview) onOpen(type);
            }}
            disabled={Boolean(preview)}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-white transition-all duration-500 group/upload disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {type === "background" ? (
              <div className="relative w-full h-full">
                {preview ? (
                  <Image src={preview} alt={label} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full gap-4 p-8">
                    <div className="text-center">
                      <p className="text-zinc-300 text-sm font-medium">Click to upload</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                {preview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <Image src={preview} alt={label} fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="relative" />
                )}
                <div className="text-center">
                  <p className="text-zinc-300 text-sm font-medium">Click to upload</p>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MediaTab({
  initialAvatar,
  initialBackground,
  initialCursor,
}: MediaTabProps) {
  const { pushToast } = useToastStack();
  const [avatar, setAvatar] = useState(initialAvatar ?? "");
  const [background, setBackground] = useState(initialBackground ?? "");
  const [cursor, setCursor] = useState(initialCursor ?? "");
  const [modalState, setModalState] = useState<UploadModalState>({
    open: false,
    type: null,
    draftUrl: "",
    uploading: false,
    dragOver: false,
  });
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentAssetValue =
    modalState.type === "avatar"
      ? avatar
      : modalState.type === "background"
        ? background
        : modalState.type === "cursor"
          ? cursor
          : "";
  const hasCurrentAssetValue = Boolean(currentAssetValue && currentAssetValue.trim());

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !modalState.open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeUploadModal();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mounted, modalState.open]);

  const [baseline, setBaseline] = useState({
    avatar: initialAvatar ?? "",
    background: initialBackground ?? "",
    cursor: initialCursor ?? "",
  });

  const dirtyCount = useMemo(() => {
    const current = { avatar, background, cursor };
    return Object.entries(current).filter(
      ([key, value]) => value !== baseline[key as keyof typeof baseline]
    ).length;
  }, [avatar, background, baseline, cursor]);

  function handleUndo() {
    setAvatar(baseline.avatar);
    setBackground(baseline.background);
    setCursor(baseline.cursor);
  }

  async function handleSave() {
    const payload = {
      avatarUrl: avatar,
      backgroundUrl: background,
      cursorUrl: cursor,
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not save your assets.");
      }

      setBaseline({ avatar, background, cursor });
      pushToast("Assets Saved!");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Could not save your assets.");
    }
  }

  useDashboardDirtyState("assets", {
    count: dirtyCount,
    onSave: handleSave,
    onUndo: handleUndo,
  });

  function openUploadModal(type: AssetKey) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setModalState({
      open: true,
      type,
      draftUrl: "",
      uploading: false,
      dragOver: false,
    });
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }

  function closeUploadModal() {
    setShown(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setMounted(false);
      setModalState({ open: false, type: null, draftUrl: "", uploading: false, dragOver: false });
    }, 250);
  }

  function updateAsset(key: AssetKey, value: string) {
    if (key === "avatar") setAvatar(value);
    if (key === "background") setBackground(value);
    if (key === "cursor") setCursor(value);
  }

  async function handleLocalFile(file: File | null) {
    if (!file || !modalState.type) return;

    setModalState((prev) => ({ ...prev, uploading: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", modalState.type ?? "avatar");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.url) {
        updateAsset(modalState.type, data.url);
        closeUploadModal();
      } else {
        pushToast("Upload failed. Please try another file.");
      }
    } catch {
      pushToast("Upload failed. Please try again.");
    } finally {
      setModalState((prev) => ({ ...prev, uploading: false }));
    }
  }

  function handleUrlSave() {
    if (!modalState.type) return;

    const url = modalState.draftUrl.trim();
    if (!url) {
      pushToast("Paste a valid URL first.");
      return;
    }

    if (hasCurrentAssetValue) {
      pushToast("Remove the current asset before using a URL.");
      return;
    }

    updateAsset(modalState.type, url);
    closeUploadModal();
  }

  function removeCurrentAsset() {
    if (!modalState.type) return;
    updateAsset(modalState.type, "");
    setModalState((prev) => ({ ...prev, draftUrl: "" }));
  }

  const activeTypeLabel =
    modalState.type === "avatar"
      ? "Avatar"
      : modalState.type === "background"
        ? "Background"
        : modalState.type === "cursor"
          ? "Custom Cursor"
          : "Asset";

  const modalTypeIcon =
    modalState.type === "avatar" ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-pink-500" aria-hidden="true">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ) : modalState.type === "background" ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-pink-500" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-pink-500" aria-hidden="true">
        <path d="M12.586 12.586 19 19" />
        <path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z" />
      </svg>
    );

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <UploadBox label="Avatar" current={avatar || null} type="avatar" onOpen={openUploadModal} onDelete={() => setAvatar("")} />
          <UploadBox label="Background" current={background || null} type="background" onOpen={openUploadModal} onDelete={() => setBackground("")} />
          <UploadBox label="Custom Cursor" current={cursor || null} type="cursor" onOpen={openUploadModal} onDelete={() => setCursor("")} />
        </div>
      </div>

      {mounted && modalState.open && modalState.type && createPortal(
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-250 ease-out ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        >
          <div onClick={closeUploadModal} className="absolute inset-0 bg-black/80" />

          <div
            className={`relative w-full max-w-sm transform-gpu rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-5 transition-[transform,opacity] duration-250 ease-out will-change-transform ${
              shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    {modalState.type === "avatar" ? (
                      <>
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </>
                    ) : modalState.type === "background" ? (
                      <>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </>
                    ) : (
                      <>
                        <path d="M12.586 12.586 19 19" />
                        <path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z" />
                      </>
                    )}
                  </svg>
                </div>

                <h3 className="text-base font-semibold text-white">{activeTypeLabel}</h3>
              </div>

              <button
                type="button"
                onClick={closeUploadModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5">
              <div
                className={`relative aspect-video overflow-hidden rounded-xl border bg-[#080808] transition-all duration-300 ${
                  modalState.dragOver ? "border-pink-500/40 bg-pink-500/5" : "border-zinc-700/30"
                }`}
                onDragOver={(event) => {
                  if (hasCurrentAssetValue || modalState.draftUrl.trim()) return;
                  event.preventDefault();
                  setModalState((prev) => ({ ...prev, dragOver: true }));
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setModalState((prev) => ({ ...prev, dragOver: false }));
                }}
                onDrop={(event) => {
                  if (hasCurrentAssetValue || modalState.draftUrl.trim()) return;
                  event.preventDefault();
                  setModalState((prev) => ({ ...prev, dragOver: false }));
                  const file = event.dataTransfer.files?.[0] ?? null;
                  void handleLocalFile(file);
                }}
              >
                {hasCurrentAssetValue && (
                  <button
                    type="button"
                    onClick={removeCurrentAsset}
                    className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-xl border border-[#1b1b1b] bg-[#080808]/80 text-zinc-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-500 hover:scale-110"
                    aria-label="Remove current asset"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!hasCurrentAssetValue && !modalState.draftUrl.trim()) fileInputRef.current?.click();
                  }}
                  disabled={modalState.uploading || hasCurrentAssetValue || Boolean(modalState.draftUrl.trim())}
                  className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-400 transition-all duration-500 hover:text-white group/upload disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalState.uploading ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-6">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-500/30 border-t-pink-500" />
                      <p className="text-sm font-medium text-zinc-300">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 p-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/15 text-pink-500 ring-1 ring-pink-500/20">
                        {modalTypeIcon}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-300">Drag and drop or click to upload</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      event.target.value = "";
                      void handleLocalFile(file);
                    }}
                  />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-white/70">Or paste a URL</p>
              <div className="flex h-10 items-center rounded-lg border border-[#1b1b1b] bg-[#080808] transition-colors hover:border-white/20 focus-within:border-pink-500/40">
                <input
                  type="text"
                  value={modalState.draftUrl}
                  disabled={hasCurrentAssetValue}
                  onChange={(event) =>
                    setModalState((prev) => ({ ...prev, draftUrl: event.target.value }))
                  }
                  placeholder="URL here"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  className="min-w-0 flex-1 !appearance-none !border-0 !bg-transparent py-2 pl-3 pr-3 text-sm font-medium text-white !shadow-none !outline-none !ring-0 placeholder:text-white/20 focus:!border-0 focus:!bg-transparent focus:!shadow-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none disabled:cursor-not-allowed disabled:text-white/40"
                  style={{
                    backgroundColor: "transparent",
                    WebkitBoxShadow: "none",
                    boxShadow: "none",
                    color: "#ffffff",
                    WebkitTextFillColor: "#ffffff",
                  }}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <div className="flex-1" />
              <button
                type="button"
                onClick={closeUploadModal}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white/40 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUrlSave}
                disabled={!modalState.draftUrl.trim()}
                className="rounded-lg bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-400 active:scale-[0.98] disabled:opacity-40"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
