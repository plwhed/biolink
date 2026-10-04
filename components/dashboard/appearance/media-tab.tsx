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

  const getIcon = () => {
    const iconClass = "w-6 h-6 text-pink-500";
    if (type === "avatar") return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
                <div className="relative z-10">
                  {getIcon()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-100 text-sm">{label}</h3>
            </div>
          </div>
          {preview && (
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 bg-zinc-800/50 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-0"
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
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-white transition-all duration-500 group/upload disabled:opacity-50"
          >
            {type === "background" ? (
              <div className="relative w-full h-full">
                {preview ? (
                  <img
                    src={preview}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full gap-4 p-8">
                    <div className="text-center">
                      <p className="text-zinc-300 text-sm font-medium">
                        {uploading ? "Uploading..." : "Drag and drop or click to upload"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                {preview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <img src={preview} alt={label} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="relative" />
                )}
                <div className="text-center">
                  <p className="text-zinc-300 text-sm font-medium">
                    {uploading ? "Uploading..." : "Drag and drop or click to upload"}
                  </p>
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
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
  const [avatar, setAvatar] = useState(initialAvatar ?? "");
  const [background, setBackground] = useState(initialBackground ?? "");
  const [cursor, setCursor] = useState(initialCursor ?? "");

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <UploadBox label="Avatar" current={avatar || null} type="avatar" onUpload={setAvatar} onDelete={() => setAvatar("")} />
          <UploadBox label="Background" current={background || null} type="background" onUpload={setBackground} onDelete={() => setBackground("")} />
          <UploadBox label="Custom Cursor" current={cursor || null} type="cursor" onUpload={setCursor} onDelete={() => setCursor("")} />
        </div>
      </div>
    </div>
  );
}
