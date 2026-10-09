import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db, ensureUserBadgeSchema } from "@/lib/db";
import { badges, profiles, userBadges } from "@/lib/schema";
import { and, eq, inArray } from "drizzle-orm";
import { ensureDefaultBadges } from "@/lib/badges";
import LogoutButton from "./logout-button";
import SidebarClient from "./sidebar-client";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: "grid", category: "Main" },
  { label: "Customize", href: "/dashboard/customize", icon: "palette", category: "Main" },
  { label: "Links", href: "/dashboard/content", icon: "links", category: "Content" },
  { label: "Widgets", href: "/dashboard/content/widgets", icon: "grid", category: "Content" },
  { label: "Premium", href: "/dashboard/premium", icon: "crown", category: "Shop" },
];

const iconMap: Record<string, React.ReactNode> = {
  grid: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  palette: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  links: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  crown: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l4 4 5-6 5 6 4-4-1.5 10.5h-15L3 8z" />
      <path strokeLinecap="round" d="M5 21h14" />
    </svg>
  ),
};

export default async function Sidebar() {
  const session = await getSession();

  let avatarUrl: string | null = null;
  let staffBadges: Array<{
    name: string;
    iconPrefix: string;
    iconName: string;
    iconUrl: string | null;
    color: string | null;
  }> = [];
  if (session?.id) {
    const [profile] = await db
      .select({ avatarUrl: profiles.avatarUrl })
      .from(profiles)
      .where(eq(profiles.userId, session.id));
    avatarUrl = profile?.avatarUrl ?? null;

    await ensureUserBadgeSchema();
    await ensureDefaultBadges();

    staffBadges = await db
      .select({
        name: badges.name,
        iconPrefix: badges.iconPrefix,
        iconName: badges.iconName,
        iconUrl: badges.iconUrl,
        color: badges.color,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(
        and(
          eq(userBadges.userId, session.id),
          eq(userBadges.hidden, 0),
          inArray(badges.name, ["Owner", "Developer"])
        )
      )
      .orderBy(badges.name);
  }

  return (
    <SidebarClient
      session={session}
      avatarUrl={avatarUrl}
      staffBadges={staffBadges}
      showAdminPanel={!!session?.isAdmin || staffBadges.length > 0}
      navItems={navItems}
      iconMap={iconMap}
    />
  );
}
