"use client";

import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BadgeIcon, {
  BRAND_BADGE_ICONS,
  SOLID_BADGE_ICONS,
  resolveBadgeIcon,
} from "@/components/badge-icon";
import { useToastStack } from "@/components/ui/toast-stack";
import { useDashboardDirtyState } from "@/components/dashboard/dashboard-dirty-state";

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean | number;
  premium: boolean | number;
  createdAt: Date;
}

interface Badge {
  id: string;
  name: string;
  color: string | null;
  iconUrl?: string | null;
  iconName?: string | null;
  iconPrefix?: string | null;
}

interface AdminClientProps {
  allUsers: User[];
  allBadges: Badge[];
}

const inputClass =
  "w-full rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 hover:border-white/20 focus:border-white/20";

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
      <div className="flex items-center gap-4 border-b border-[#1b1b1b] p-6">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-white/40">{description}</p>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="mb-2 block text-sm font-semibold text-white/60">{label}</label>
      {children}
    </div>
  );
}

function BadgeThumb({ badge }: { badge: Badge }) {
  const prefix = badge.iconPrefix ?? "solid";
  const name = badge.iconName ?? "";
  const fa = resolveBadgeIcon(prefix, name);

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
      {fa ? (
        <span style={{ color: badge.color ?? "#fff" }}>
          <BadgeIcon
            prefix={prefix}
            name={name}
            style={{ width: 16, height: 16, color: badge.color ?? "#fff" }}
          />
        </span>
      ) : badge.iconUrl ? (
        <img
          src={badge.iconUrl}
          alt={badge.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[10px] font-bold text-white/80">
          {badge.name[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
  locked,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => !locked && onChange(!enabled)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-all duration-300 ${
        enabled
          ? "border-pink-400/40 bg-pink-500"
          : "border-[#292929] bg-[#181818]"
      } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span
        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-300 ${
          enabled ? "left-[24px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function UploadBox({
  label,
  icon,
  current,
  variant = "avatar",
  type,
  onUpload,
}: {
  label: string;
  icon: React.ReactNode;
  current: string | null;
  variant?: "avatar" | "cover";
  type: "avatar" | "background";
  onUpload: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
      if (data.url) onUpload(data.url);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="group rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-2 transition-all duration-300 ease-out hover:border-white/20 hover:bg-[#111] hover:scale-[1.01]">
      <div className="relative p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-pink-500/20 text-pink-500 transition-all duration-300">
                <div className="relative z-10">{icon}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">{label}</h3>
            </div>
          </div>
          <button
            type="button"
            disabled={!current}
            onClick={() => onUpload("")}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-400 opacity-0 transition-all duration-300 hover:scale-110 hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 disabled:opacity-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative px-4 pb-4">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-700/30 bg-[#080808]">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="group/upload absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-400 transition-all duration-500 hover:text-white disabled:opacity-50"
          >
            {current && variant === "avatar" ? (
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <div className="relative h-24 w-24 overflow-hidden rounded-full">
                  <img
                    alt={label}
                    className="h-full w-full object-cover"
                    src={current}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-300">
                    {uploading ? "Uploading..." : "Drag and drop or click to upload"}
                  </p>
                </div>
              </div>
            ) : current && variant === "cover" ? (
              <div className="relative h-full w-full">
                <img
                  alt={label}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={current}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <div className="relative"></div>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-300">
                    {uploading ? "Uploading..." : "Drag and drop or click to upload"}
                  </p>
                </div>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

type Phase = "idle" | "in" | "out";

const STAGGER = 320;

function animStyle(index: number, phase: Phase): React.CSSProperties {
  const isHeader = index === 0;

  if (phase === "out") {
    if (isHeader) {
      return {
        animation: `headerLeave 0.32s cubic-bezier(0.4, 0, 0.8, 0.4) forwards`,
        transformOrigin: "center top",
      };
    }
    return {
      animation: `tiltBackOut 0.5s cubic-bezier(0.55, 0, 0.85, 0.4) forwards`,
      animationDelay: `${(index - 1) * STAGGER}ms`,
      transformOrigin: "top center",
      willChange: "transform, opacity",
    };
  }

  if (phase === "in") {
    if (isHeader) {
      return {
        opacity: 0,
        animation: `headerEnter 0.36s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
        transformOrigin: "center top",
      };
    }
    return {
      opacity: 0,
      animation: `tiltBackIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
      animationDelay: `${120 + (index - 1) * STAGGER}ms`,
      transformOrigin: "top center",
      willChange: "transform, opacity",
    };
  }

  return {};
}

export default function AdminClient({ allUsers, allBadges }: AdminClientProps) {
  const router = useRouter();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const { pushToast } = useToastStack();

  const [badgeCatalog, setBadgeCatalog] = useState<Badge[]>(allBadges);
  const [badgeName, setBadgeName] = useState("");
  const [badgeColor, setBadgeColor] = useState("#f472b6");
  const [badgeIconUrl, setBadgeIconUrl] = useState("");
  const [badgeIconName, setBadgeIconName] = useState("fa-star");
  const [badgeIconPrefix, setBadgeIconPrefix] = useState("solid");
  const [isCreatingBadge, setIsCreatingBadge] = useState(false);
  const [isUploadingBadge, setIsUploadingBadge] = useState(false);
  const badgeUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [loadingUserBadges, setLoadingUserBadges] = useState(false);

  const [userBadges, setUserBadges] = useState<Array<{ badgeId: string; hidden: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const itemsPerPage = 10;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [bio, setBio] = useState("");
  const [description, setDescription] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [adminBaseline, setAdminBaseline] = useState({
    username: "",
    password: "",
    isAdmin: false,
    isPremium: false,
    avatarUrl: "",
    backgroundUrl: "",
    bio: "",
    description: "",
    displayName: "",
  });

  const adminLocked = Boolean(selectedUser?.isAdmin);
  const adminDirtyCount = useMemo(() => {
    const current = {
      username,
      password,
      isAdmin,
      isPremium,
      avatarUrl,
      backgroundUrl,
      bio,
      description,
      displayName,
    };

    return Object.entries(current).filter(([key, value]) => {
      const currentValue = value as string | boolean;
      const baselineValue = adminBaseline[key as keyof typeof adminBaseline];
      if (key === "password") {
        return Boolean(currentValue) && currentValue !== baselineValue;
      }
      return String(currentValue) !== String(baselineValue ?? "");
    }).length;
  }, [adminBaseline, avatarUrl, backgroundUrl, bio, description, displayName, isAdmin, isPremium, password, username]);

  function handleAdminUndo() {
    setUsername(adminBaseline.username);
    setPassword("");
    setIsAdmin(adminBaseline.isAdmin);
    setIsPremium(adminBaseline.isPremium);
    setAvatarUrl(adminBaseline.avatarUrl);
    setBackgroundUrl(adminBaseline.backgroundUrl);
    setBio(adminBaseline.bio);
    setDescription(adminBaseline.description);
    setDisplayName(adminBaseline.displayName);
  }

  async function loadUserData(user: User) {
    setLoadingUserBadges(true);
    setUserBadges([]);

    try {
      const res = await fetch(`/api/admin/users/${user.id}/profile`);
      const data = await res.json();
      if (data.profile) {
        const profileData = {
          avatarUrl: data.profile.avatarUrl || "",
          backgroundUrl: data.profile.backgroundUrl || "",
          bio: data.profile.bio || "",
          description: data.profile.description || "",
          displayName: data.profile.displayName || "",
        };
        setAvatarUrl(profileData.avatarUrl);
        setBackgroundUrl(profileData.backgroundUrl);
        setBio(profileData.bio);
        setDescription(profileData.description);
        setDisplayName(profileData.displayName);

        setAdminBaseline((prev) => ({
          ...prev,
          ...profileData,
        }));
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}/badges`);
      const data = await res.json();
      const badgeEntries = Array.isArray(data.badges)
        ? data.badges
            .map((entry: { badgeId?: number | string; id?: number | string; hidden?: boolean | number | string }) => ({
              badgeId: String(entry.badgeId ?? entry.id ?? "").trim(),
              hidden: entry.hidden === true || entry.hidden === 1 || entry.hidden === "true" || entry.hidden === "1",
            }))
            .filter((entry: { badgeId: string; hidden: boolean }) => Boolean(entry.badgeId))
        : [];
      setUserBadges(badgeEntries);
    } catch (e) {
      console.error(e);
      setUserBadges([]);
    } finally {
      setLoadingUserBadges(false);
    }
  }

  function openUser(user: User) {
    if (selectedUser?.id === user.id) {
      closeUser();
      return;
    }

    setUsername(user.username);
    setIsAdmin(Boolean(user.isAdmin));
    setIsPremium(Boolean(user.premium));
    setPassword("");
    setAvatarUrl("");
    setBackgroundUrl("");
    setBio("");
    setDescription("");
    setDisplayName("");
    setAdminBaseline({
      username: user.username,
      password: "",
      isAdmin: Boolean(user.isAdmin),
      isPremium: Boolean(user.premium),
      avatarUrl: "",
      backgroundUrl: "",
      bio: "",
      description: "",
      displayName: "",
    });
    setUserBadges([]);

    if (selectedUser) {
      setPhase("out");
      setTimeout(() => {
        setSelectedUser(user);
        setPhase("in");
        loadUserData(user);
      }, 1750);
    } else {
      setSelectedUser(user);
      setPhase("in");
      loadUserData(user);
    }
  }

  function closeUser() {
    if (!selectedUser) return;
    setPhase("out");
    setTimeout(() => {
      setSelectedUser(null);
      setPhase("idle");
    }, 1750);
  }

  async function handleSave() {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          isAdmin,
          premium: isPremium,
          avatarUrl,
          backgroundUrl,
          bio,
          description,
          displayName,
        }),
      });
      if (!response.ok) throw new Error("Failed to update user");
      setAdminBaseline({
        username,
        password,
        isAdmin,
        isPremium,
        avatarUrl,
        backgroundUrl,
        bio,
        description,
        displayName,
      });
      pushToast("Account Saved!");
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save user";
      pushToast(message);
    } finally {
      setIsLoading(false);
    }
  }

  useDashboardDirtyState("admin", {
    count: adminDirtyCount,
    onSave: handleSave,
    onUndo: handleAdminUndo,
  });

  async function createBadge() {
    const trimmedName = badgeName.trim();

    if (!trimmedName) {
      pushToast("Badge name is required.");
      return;
    }

    setIsCreatingBadge(true);

    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          color: badgeColor,
          iconName: badgeIconName.trim() || "fa-star",
          iconPrefix: badgeIconPrefix,
          iconUrl: badgeIconUrl.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create badge");
      }

      const nextBadge = {
        id: String(data.badge?.id ?? crypto.randomUUID()),
        name: String(data.badge?.name ?? trimmedName),
        color: data.badge?.color ?? badgeColor,
        iconUrl: data.badge?.iconUrl ?? (badgeIconUrl.trim() || null),
        iconName: data.badge?.iconName ?? (badgeIconName.trim() || "fa-star"),
        iconPrefix: data.badge?.iconPrefix ?? badgeIconPrefix,
      };

      setBadgeCatalog((prev) => [nextBadge, ...prev]);
      setBadgeName("");
      setBadgeColor("#f472b6");
      setBadgeIconUrl("");
      setBadgeIconName("fa-star");
      setBadgeIconPrefix("solid");
      pushToast("Badge Created!");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create badge";
      pushToast(message);
    } finally {
      setIsCreatingBadge(false);
    }
  }

  async function handleBadgeIconUpload(file: File | null) {
    if (!file) return;

    setIsUploadingBadge(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "avatar");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Badge upload failed");
      }

      setBadgeIconUrl(String(data.url));
      pushToast("Badge icon uploaded!");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Badge upload failed";
      pushToast(message);
    } finally {
      setIsUploadingBadge(false);
    }
  }

  async function assignBadge(badgeId: string) {
    if (!selectedUser) return;
    const normalizedBadgeId = String(badgeId).trim();

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId: normalizedBadgeId }),
      });
      if (!res.ok) throw new Error("Failed to assign badge");
      const data = await res.json();
      if (!data.alreadyExists) {
        setUserBadges((prev) => [...prev, { badgeId: normalizedBadgeId, hidden: false }]);
        pushToast("Badge Added!");
      } else {
        pushToast("Badge already assigned");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to assign badge";
      pushToast(message);
    }
  }

  async function updateBadgeVisibility(badgeId: string, hidden: boolean) {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/badges`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId, hidden }),
      });
      if (!res.ok) throw new Error("Failed to update badge visibility");
      setUserBadges((prev) =>
        prev.map((entry) =>
          entry.badgeId === badgeId ? { ...entry, hidden } : entry
        )
      );
      pushToast(hidden ? "Badge Hidden" : "Badge Shown");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update badge visibility";
      pushToast(message);
    }
  }

  async function removeBadge(badgeId: string) {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/badges?badgeId=${encodeURIComponent(badgeId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove badge");
      setUserBadges((prev) => prev.filter((entry) => entry.badgeId !== badgeId));
      pushToast("Badge Removed");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to remove badge";
      pushToast(message);
    }
  }

  const searchQuery = userSearch.trim().toLowerCase();
  const filteredUsers = searchQuery
    ? allUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery) ||
          user.email.toLowerCase().includes(searchQuery)
      )
    : allUsers;
  const filteredPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, filteredPages);
  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  return (
    <div className="space-y-7" style={{ fontFamily: '"Montserrat", sans-serif' }}>
      <style>{`
        @keyframes headerEnter {
          0% { opacity: 0; transform: translateY(-14px) scale(0.88); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes headerLeave {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-14px) scale(0.88); }
        }
        @keyframes tiltBackOut {
          0% {
            opacity: 1;
            transform: perspective(1400px) rotateX(0deg) translateY(0) scale(1);
          }
          60% {
            opacity: 0.65;
          }
          100% {
            opacity: 0;
            transform: perspective(1400px) rotateX(78deg) translateY(-16px) scale(0.55);
          }
        }
        @keyframes tiltBackIn {
          0% {
            opacity: 0;
            transform: perspective(1400px) rotateX(78deg) translateY(-16px) scale(0.55);
          }
          55% {
            opacity: 1;
            transform: perspective(1400px) rotateX(-4deg) translateY(4px) scale(1.012);
          }
          100% {
            opacity: 1;
            transform: perspective(1400px) rotateX(0deg) translateY(0) scale(1);
          }
        }
      `}</style>

      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Admin Panel
        </h1>
        <p className="text-sm text-white/40">
          Manage users and site permissions.
        </p>
      </div>

      <Section
        title="Global Badge Creator"
        description="Create badges available to all users"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3-3 3-3-3M9 13h6" />
          </svg>
        }
      >
        <div className="space-y-4">
          <Field label="Badge name">
            <input
              value={badgeName}
              onChange={(e) => setBadgeName(e.target.value)}
              placeholder="Verified creator"
              className={inputClass}
            />
          </Field>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white/60">Badge image</label>
            <div className="rounded-xl border border-[#1b1b1b] bg-[#080808] p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <button
                  type="button"
                  onClick={() => badgeUploadInputRef.current?.click()}
                  disabled={isUploadingBadge}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1b1b1b] bg-[#111] px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/20 hover:text-white disabled:opacity-60"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 17.5V18a2 2 0 002 2h12a2 2 0 002-2v-.5" />
                  </svg>
                  {isUploadingBadge ? "Uploading..." : "Upload image"}
                </button>
                <input
                  ref={badgeUploadInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    event.target.value = "";
                    void handleBadgeIconUpload(file);
                  }}
                />

                <div className="flex-1">
                  <input
                    value={badgeIconUrl}
                    onChange={(e) => setBadgeIconUrl(e.target.value)}
                    placeholder="https://example.com/badge.png"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white/60">
              Icon <span className="font-normal text-white/30">(FontAwesome)</span>
            </label>
            <div className="rounded-xl border border-[#1b1b1b] bg-[#080808] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Solid
              </p>
              <div className="grid max-h-32 grid-cols-8 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-10">
                {SOLID_BADGE_ICONS.map((key) => {
                  const selected =
                    badgeIconPrefix === "solid" && badgeIconName === key;
                  const def = resolveBadgeIcon("solid", key);
                  if (!def) return null;
                  return (
                    <button
                      key={key}
                      type="button"
                      title={key}
                      onClick={() => {
                        setBadgeIconPrefix("solid");
                        setBadgeIconName(key);
                      }}
                      className={`flex aspect-square items-center justify-center rounded-lg border transition-all hover:scale-105 ${
                        selected
                          ? "border-pink-400/50 bg-pink-500/15 text-pink-300"
                          : "border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <FontAwesomeIcon icon={def} className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
              <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Brands
              </p>
              <div className="grid max-h-24 grid-cols-8 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-10">
                {BRAND_BADGE_ICONS.map((key) => {
                  const selected =
                    badgeIconPrefix === "brand" && badgeIconName === key;
                  const def = resolveBadgeIcon("brand", key);
                  if (!def) return null;
                  return (
                    <button
                      key={key}
                      type="button"
                      title={key}
                      onClick={() => {
                        setBadgeIconPrefix("brand");
                        setBadgeIconName(key);
                      }}
                      className={`flex aspect-square items-center justify-center rounded-lg border transition-all hover:scale-105 ${
                        selected
                          ? "border-pink-400/50 bg-pink-500/15 text-pink-300"
                          : "border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <FontAwesomeIcon icon={def} className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-sm text-white/60">
              {badgeName.trim() || "coded by the goat @f9ed"}
            </div>

            <button
              type="button"
              onClick={createBadge}
              disabled={isCreatingBadge}
              className="rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingBadge ? "Creating..." : "Create badge"}
            </button>
          </div>
        </div>
      </Section>

      <div className="relative z-30 overflow-hidden rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d]">
        <div className="border-b border-[#1b1b1b] p-4">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M10 18a8 8 0 110-16 8 8 0 010 16z"
              />
            </svg>
            <input
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by username or email..."
              className="w-full rounded-xl border border-[#1b1b1b] bg-[#080808] py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 hover:border-white/20 focus:border-white/20"
            />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#111] text-white/40">
            <tr className="border-b border-[#1b1b1b]">
              <th className="px-6 py-3 font-semibold">Username</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Joined</th>
              <th className="px-6 py-3 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b1b1b]">
            {paginatedUsers.map((user) => {
              const active = user.id === selectedUser?.id;
              return (
                <tr
                  key={user.id}
                  onClick={() => openUser(user)}
                  className={`cursor-pointer transition-colors ${
                    active ? "bg-pink-500/[0.06]" : "hover:bg-white/[0.01]"
                  }`}
                >
                  <td
                    className={`px-6 py-3 font-medium ${
                      active ? "text-pink-400" : "text-white"
                    }`}
                  >
                    {user.username}
                  </td>
                  <td className="px-6 py-3 text-white/50">{user.email}</td>
                  <td className="px-6 py-3 text-white/50">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        user.isAdmin
                          ? "bg-pink-500/10 text-pink-400"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {user.isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-[#1b1b1b] bg-[#111]">
            <tr>
              <td
                colSpan={4}
                className="flex items-center justify-between px-6 py-3"
              >
                <span className="text-xs text-white/40">
                  Showing {paginatedUsers.length} of {filteredUsers.length} users
                  {searchQuery && ` for "${userSearch.trim()}"`}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:bg-white/10 disabled:opacity-30"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(filteredPages, p + 1))
                    }
                    disabled={safePage === filteredPages}
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:bg-white/10 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {selectedUser && (
        <div
          key={selectedUser.id}
          className="relative z-10 space-y-6"
          style={{ perspective: "1400px" }}
        >
          <div
            style={animStyle(0, phase)}
            className="relative z-40 flex items-center justify-between rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] px-6 py-5"
          >
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-white">
                Editing {selectedUser.username}
              </h2>
              <p className="mt-1 text-sm text-white/40">
                Update account, profile, and permissions.
              </p>
            </div>
            <button
              type="button"
              onClick={closeUser}
              className="shrink-0 rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-2 text-xs font-semibold text-white/60 transition-all hover:border-white/10 hover:text-white"
            >
              Close
            </button>
          </div>

          <form
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
            className="relative z-10 space-y-6"
          >
            <input
              type="text"
              name="fakeusernameremembered"
              tabIndex={-1}
              style={{ display: "none" }}
            />
            <input
              type="password"
              name="fakepasswordremembered"
              tabIndex={-1}
              style={{ display: "none" }}
            />

            <div style={animStyle(1, phase)} className="relative z-10">
              <Section
                title="Account"
                description="Login credentials and role"
                icon={
                  <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.7c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
              >
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field label="Username">
                      <input
                        autoComplete="off"
                        name="admin-edit-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Password">
                      <input
                        autoComplete="new-password"
                        name="admin-edit-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="flex items-center justify-between gap-5 rounded-xl border border-[#1b1b1b] bg-[#080808] p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Administrator Access
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/40">
                        {adminLocked
                          ? "This user is an administrator — admin access cannot be removed."
                          : "Grant this user full admin privileges"}
                      </p>
                    </div>
                    <Toggle
                      enabled={isAdmin}
                      onChange={setIsAdmin}
                      locked={adminLocked}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-5 rounded-xl border border-[#1b1b1b] bg-[#080808] p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Premium status
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/40">
                        Grants Premium features for life and auto-awards the Premium badge
                      </p>
                    </div>
                    <Toggle
                      enabled={isPremium}
                      onChange={setIsPremium}
                    />
                  </div>
                </div>
              </Section>
            </div>

            <div style={animStyle(2, phase)} className="relative z-10">
              <Section
                title="Profile"
                description="Public information shown on this user's page"
                icon={
                  <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0l7.35-7.35m0 0A5.25 5.25 0 0118 3.75l3.75-3.75M16.88 8.77l4.39 4.39" />
                  </svg>
                }
              >
                <div className="space-y-5">
                  <Field label="Display Name">
                    <input
                      autoComplete="off"
                      name="admin-edit-displayname"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Description">
                    <textarea
                      autoComplete="off"
                      name="admin-edit-description"
                      value={description}
                      rows={3}
                      placeholder="A longer description shown on the profile"
                      onChange={(e) => setDescription(e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <UploadBox
                      label="Avatar"
                      type="avatar"
                      variant="avatar"
                      current={avatarUrl || null}
                      onUpload={setAvatarUrl}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6 text-pink-500"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      }
                    />

                    <UploadBox
                      label="Background"
                      type="background"
                      variant="cover"
                      current={backgroundUrl || null}
                      onUpload={setBackgroundUrl}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6 text-pink-500"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </Section>
            </div>

            <div style={animStyle(3, phase)} className="relative z-10">
              <Section
                title="Badges"
                description="Assign badges to the selected user"
                icon={
                  <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                }
              >
                {loadingUserBadges ? (
                  <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] px-4 py-6 text-sm text-white/60">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500/30 border-t-pink-500" />
                    Loading badges...
                  </div>
                ) : badgeCatalog.length === 0 ? (
                  <p className="py-6 text-center text-sm text-white/40">
                    No badges available.
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-white/60">
                        Badges they do not have
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {badgeCatalog
                          .filter((badge) => !userBadges.some((entry) => entry.badgeId === badge.id))
                          .map((badge) => (
                            <button
                              key={badge.id}
                              type="button"
                              onClick={() => assignBadge(badge.id)}
                              className="group rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-3 text-left transition-all duration-300 ease-out hover:border-white/20 hover:bg-[#111] hover:scale-[1.01]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <BadgeThumb badge={badge} />
                                  <span className="truncate text-sm font-medium text-white/80">
                                    {badge.name}
                                  </span>
                                </div>
                                <span className="text-[10px] font-medium text-pink-400">Add</span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-sm font-medium text-white/60">
                        Badges they have
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {badgeCatalog
                          .filter((badge) => userBadges.some((entry) => entry.badgeId === badge.id))
                          .map((badge) => {
                            const ownedEntry = userBadges.find((entry) => entry.badgeId === badge.id);
                            const hidden = ownedEntry?.hidden ?? false;

                            return (
                              <div
                                key={badge.id}
                                className={`group rounded-2xl border p-3 transition-all duration-300 ease-out ${
                                  hidden
                                    ? "border-[#1b1b1b] bg-[#0d0d0d] text-white/60 hover:border-white/20 hover:bg-[#111]"
                                    : "border-pink-400/30 bg-pink-500/10 text-pink-400 hover:border-pink-400/50 hover:bg-pink-500/15"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <BadgeThumb badge={badge} />
                                    <span className="truncate text-sm font-medium">{badge.name}</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <label className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-white/10 p-1">
                                      <input
                                        type="checkbox"
                                        checked={!hidden}
                                        onChange={() => updateBadgeVisibility(badge.id, !hidden)}
                                        className="peer sr-only"
                                      />
                                      <span className="absolute inset-0 rounded-full bg-white/10 transition-colors peer-checked:bg-pink-500" />
                                      <span className="absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => removeBadge(badge.id)}
                                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-300 transition-all hover:bg-red-500/20"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </Section>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}