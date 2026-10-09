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
import LayoutEditor from "@/components/dashboard/layout-editor";
import { getPremiumStatus } from "@/lib/premium";
import { getFeedback } from "@/lib/feedback";

export const metadata = {
  title: "Layout editor — egirls.lol",
};

export default async function LayoutEditorPage() {
  const session = await getSession();
  if (!session) redirect("/register");

  // Custom layout editor is Premium-only.
  const premium = await getPremiumStatus(session.id);
  if (!premium.isPremium) redirect("/dashboard/premium");

  await ensureUserBadgeSchema();
  await ensureSocialLinksSchema();
  await ensureProfileSchema();
  await ensureUsersSchema();

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

  const feedback = await getFeedback(session.id);

  return (
    <div className="flex h-screen font-sans text-white">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-4">
        <LayoutEditor
          profile={profile ?? null}
          socials={socialLinksList.map((l) => ({
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
          feedback={feedback}
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
      </main>
    </div>
  );
}
