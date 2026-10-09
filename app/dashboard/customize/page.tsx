import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  db,
  ensureProfileSchema,
  ensureSocialLinksSchema,
  ensureUserBadgeSchema,
  ensureUsersSchema,
} from "@/lib/db";
import { profiles, socialLinks, badges, userBadges, links, pageViews } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import Sidebar from "@/components/dashboard/sidebar";
import AppearanceClient from "./client";
import { getPremiumStatus } from "@/lib/premium";
import { ensureDefaultBadges, ensurePremiumBadge } from "@/lib/badges";
import { getFeedback } from "@/lib/feedback";
import { getEnabledWidgets } from "@/lib/widgets";

export const metadata = {
  title: "Customize — egirls.lol",
};

export default async function AppearancePage() {
  const session = await getSession();
  if (!session) redirect("/register");

  await ensureUserBadgeSchema();
  await ensureSocialLinksSchema();
  await ensureProfileSchema();
  await ensureUsersSchema();
  await ensureDefaultBadges();
  await ensurePremiumBadge(session.id);

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.id));

  const socialLinksList = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.userId, session.id))
    .orderBy(socialLinks.order);

  const contentLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, session.id))
    .orderBy(links.createdAt);

  const [viewRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pageViews)
    .where(eq(pageViews.userId, session.id));

  const userBadgesList = await db
    .select({
      id: badges.id,
      name: badges.name,
      iconPrefix: badges.iconPrefix,
      iconName: badges.iconName,
      iconUrl: badges.iconUrl,
      color: badges.color,
      hidden: userBadges.hidden,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, session.id))
    .orderBy(badges.name);

  const premium = await getPremiumStatus(session.id);
  const feedback = await getFeedback(session.id);
  const widgets = await getEnabledWidgets(session.id);

  return (
    <div className="relative min-h-screen font-sans text-white flex">
      <Sidebar />
      <main className="flex-1 px-8 py-10 overflow-y-auto">
        <div className="w-full">
          <AppearanceClient
            profile={profile ?? null}
            isPremium={premium.isPremium}
            premiumPlan={premium.plan}
            socialLinks={socialLinksList.map((l) => ({
              id: l.id,
              platform: l.platform,
              url: l.url,
              iconUrl: l.iconUrl,
              order: l.order,
            }))}
            links={contentLinks.map((l) => ({
              id: l.id,
              title: l.title,
              url: l.url,
            }))}
            viewCount={viewRow?.count ?? 0}
            initialFeedback={feedback}
            initialWidgets={widgets}
            badges={userBadgesList.map((b) => ({
              id: b.id,
              name: b.name,
              iconPrefix: b.iconPrefix,
              iconName: b.iconName,
              iconUrl: b.iconUrl,
              color: b.color,
              hidden: !!b.hidden,
            }))}
          />
        </div>
      </main>
    </div>
  );
}