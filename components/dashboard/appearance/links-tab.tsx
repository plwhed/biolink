"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const platforms = [
  { id: "instagram", name: "Instagram", prefix: "instagram.com/", placeholder: "username", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { id: "youtube", name: "YouTube", prefix: "youtube.com/@", placeholder: "channel", icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { id: "tiktok", name: "TikTok", prefix: "tiktok.com/@", placeholder: "username", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
  { id: "discord", name: "Discord", prefix: "discord.gg/", placeholder: "invite", icon: "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" },
  { id: "twitter", name: "X", prefix: "x.com/", placeholder: "username", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { id: "github", name: "GitHub", prefix: "github.com/", placeholder: "username", icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
];

type Platform = (typeof platforms)[number];

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  order: number;
}

const editPath =
  "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10";

const trashPath =
  "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0";

function stripUrl(url: string) {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");
}

function parseUsername(p: Platform, url: string) {
  const s = stripUrl(url);
  const pre = p.prefix.toLowerCase();

  if (s.toLowerCase().startsWith(pre)) {
    return s
      .slice(pre.length)
      .replace(/[?#].*$/, "")
      .replace(/\/+$/, "");
  }

  const segs = s
    .replace(/[?#].*$/, "")
    .split("/")
    .filter(Boolean);

  return (segs.length > 1 ? segs[segs.length - 1] : "").replace(/^@+/, "");
}

function cleanInput(p: Platform, raw: string) {
  const s = raw.replace(/\s/g, "");
  const host = p.prefix.split("/")[0].toLowerCase();

  if (
    /^(https?:\/\/|www\.)/i.test(s) ||
    s.toLowerCase().startsWith(`${host}/`)
  ) {
    return parseUsername(p, s);
  }

  return s.replace(/^@+/, "");
}

function splitLink(link: SocialLink) {
  const p = platforms.find((x) => x.id === link.platform);

  if (!p) {
    return { prefix: "", username: stripUrl(link.url) };
  }

  const s = stripUrl(link.url);

  if (s.toLowerCase().startsWith(p.prefix.toLowerCase())) {
    return {
      prefix: p.prefix,
      username: s.slice(p.prefix.length),
    };
  }

  return {
    prefix: "",
    username: s,
  };
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
      <div className="border-b border-[#1b1b1b] p-6">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-zinc-400">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function IconButton({
  label,
  onClick,
  path,
  tone,
}: {
  label: string;
  onClick: () => void;
  path: string;
  tone: "pink" | "red";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 transition-[background-color,color,transform] duration-200 active:scale-90 ${
        tone === "pink"
          ? "hover:bg-pink-500/10 hover:text-pink-400"
          : "hover:bg-red-500/10 hover:text-red-400"
      }`}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={path}
        />
      </svg>
    </button>
  );
}

export default function LinksTab({
  initialLinks,
}: {
  initialLinks: SocialLink[];
}) {
  const [links, setLinks] = useState<SocialLink[]>(
    initialLinks.map((l, i) => ({
      ...l,
      order: l.order ?? i,
    }))
  );

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [selected, setSelected] = useState<Platform | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [username, setUsername] = useState("");

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const openModal = (p: Platform, index: number | null) => {
    clearTimeout(timer.current);

    setSelected(p);
    setEditIndex(index);
    setUsername(index !== null ? parseUsername(p, links[index].url) : "");
    setMounted(true);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => setShown(true))
    );
  };

  const closeModal = useCallback(() => {
    setShown(false);
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setMounted(false);
      setSelected(null);
      setEditIndex(null);
      setUsername("");
    }, 250);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, closeModal]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const countFor = (id: string) =>
    links.filter((l) => l.platform === id).length;

  function handleSaveUrl() {
    if (!selected || !username.trim()) return;

    const url = `https://${selected.prefix}${username.trim()}`;

    setLinks((prev) => {
      if (editIndex !== null && editIndex < prev.length) {
        return prev.map((l, i) =>
          i === editIndex ? { ...l, url } : l
        );
      }

      return [
        ...prev,
        {
          platform: selected.id,
          url,
          order: prev.length,
        },
      ];
    });

    closeModal();
  }

  function removeAt(index: number) {
    setLinks((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((l, i) => ({
          ...l,
          order: i,
        }))
    );
  }

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (
      dragItem.current === null ||
      dragOverItem.current === null
    ) {
      return;
    }

    const items = [...links];
    const dragged = items.splice(dragItem.current, 1)[0];

    items.splice(dragOverItem.current, 0, dragged);

    dragItem.current = null;
    dragOverItem.current = null;

    setLinks(
      items.map((l, i) => ({
        ...l,
        order: i,
      }))
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setSaveError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          socialLinks: links.map((l, i) => ({
            platform: l.platform,
            url: l.url,
            order: i,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save your social links.");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save your social links."
      );
    } finally {
      setSaving(false);
    }
  }

  const editing = editIndex !== null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
        <h2 className="text-2xl font-bold text-white">
          Links Settings
        </h2>
        <p className="text-zinc-400">
          Manage your social links!
        </p>
      </div>

      <Section
        title="Platforms"
        description="Pick a platform to add a link!"
      >
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => {
            const count = countFor(p.id);
            const active = count > 0;

            return (
              <button
                key={p.id}
                type="button"
                aria-label={`Add ${p.name} link`}
                title={p.name}
                onClick={() => openModal(p, null)}
                className={`group relative flex h-14 w-14 items-center justify-center rounded-xl border transition-[border-color,background-color,transform] duration-200 active:scale-95 ${
                  active
                    ? "border-pink-500/40 bg-pink-500/10"
                    : "border-[#1b1b1b] bg-[#080808] hover:border-white/20"
                }`}
              >
                {active && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[9px] font-bold text-white">
                    {count}
                  </span>
                )}

                <svg
                  className={`h-6 w-6 fill-current transition-colors duration-200 ${
                    active
                      ? "text-pink-400"
                      : "text-white/50 group-hover:text-white"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d={p.icon} />
                </svg>
              </button>
            );
          })}
        </div>
      </Section>

      {links.length > 0 && (
        <Section
          title="Your Links"
          description="Drag to change the order they appear in"
        >
          <div className="space-y-3">
            {links.map((link, index) => {
              const p = platforms.find(
                (pp) => pp.id === link.platform
              );

              const { prefix, username: name } = splitLink(link);

              return (
                <div
                  key={`${link.platform}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex cursor-grab items-center gap-3 rounded-xl border border-[#1b1b1b] bg-[#080808] p-3 transition-colors duration-200 hover:border-white/20 active:cursor-grabbing"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-white/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M4 8h16M4 16h16" />
                  </svg>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                    {p && (
                      <svg
                        className="h-5 w-5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d={p.icon} />
                      </svg>
                    )}
                  </div>

                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="text-white/35">
                      {prefix}
                    </span>
                    <span className="font-medium text-white">
                      {name}
                    </span>
                  </span>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <IconButton
                      label="Edit"
                      path={editPath}
                      tone="pink"
                      onClick={() =>
                        p && openModal(p, index)
                      }
                    />

                    <IconButton
                      label="Remove"
                      path={trashPath}
                      tone="red"
                      onClick={() => removeAt(index)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-pink-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-400 active:scale-95 disabled:opacity-50"
        >
          {saved ? "Saved!" : saving ? "Saving..." : "Save"}
        </button>

        {saveError && (
          <p
            role="alert"
            className="text-xs text-red-400"
          >
            {saveError}
          </p>
        )}
      </div>

      {mounted &&
        selected &&
        createPortal(
          <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-250 ease-out ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              onClick={closeModal}
              className="absolute inset-0 bg-black/80"
            />

            <div
              className={`${montserrat.className} relative w-full max-w-sm transform-gpu rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-5 transition-[transform,opacity] duration-250 ease-out will-change-transform ${
                shown
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-4 scale-95 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                    <svg
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d={selected.icon} />
                    </svg>
                  </div>

                  <h3 className="text-base font-semibold text-white">
                    {selected.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-5 flex h-10 items-center rounded-lg border border-[#1b1b1b] bg-[#080808] transition-colors hover:border-white/20 focus-within:border-pink-500/40">
                <span className="select-none whitespace-nowrap pl-3 text-sm font-medium text-white/40">
                  {selected.prefix}
                </span>

                <input
                  type="text"
                  name="social-handle-field"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      cleanInput(selected, e.target.value)
                    )
                  }
                  placeholder={selected.placeholder}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSaveUrl()
                  }
                  className="min-w-0 flex-1 !appearance-none !border-0 !bg-transparent py-2 pl-0.5 pr-3 text-sm font-medium text-white !shadow-none !outline-none !ring-0 placeholder:text-white/20 focus:!border-0 focus:!bg-transparent focus:!shadow-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none"
                  style={{
                    backgroundColor: "transparent",
                    WebkitBoxShadow: "none",
                    boxShadow: "none",
                    color: "#ffffff",
                    WebkitTextFillColor: "#ffffff",
                  }}
                />
              </div>

              <div className="mt-5 flex items-center gap-2">
                {editing && (
                  <IconButton
                    label="Remove"
                    path={trashPath}
                    tone="red"
                    onClick={() => {
                      if (editIndex !== null) {
                        removeAt(editIndex);
                      }

                      closeModal();
                    }}
                  />
                )}

                <div className="flex-1" />

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white/40 transition-colors hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveUrl}
                  disabled={!username.trim()}
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