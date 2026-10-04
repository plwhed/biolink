import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, socialLinks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Sidebar from "@/components/dashboard/sidebar";
import AppearanceClient from "./client";

export const metadata = {
  title: "Customize — egirls.lol",
};

export default async function AppearancePage() {
  const session = await getSession();
  if (!session) redirect("/register");

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.id));

  const links = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.userId, session.id))
    .orderBy(socialLinks.order);

  return (
    <div className="relative min-h-screen font-sans text-white flex">
      <Sidebar />
      <main className="flex-1 px-8 py-10 overflow-y-auto">
        <div className="w-full">
          <AppearanceClient
            profile={profile ?? null}
            socialLinks={links.map((l) => ({
              platform: l.platform,
              url: l.url,
              order: l.order,
            }))}
          />
        </div>
      </main>
    </div>
  );
}