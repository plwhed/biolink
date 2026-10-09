import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db, ensureSocialLinksSchema, ensureUsersSchema } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Sidebar from "@/components/dashboard/sidebar";
import LinksTab from "@/components/dashboard/appearance/links-tab";

export const metadata = {
  title: "Extra Settings — egirls.lol",
};

export default async function ContentPage() {
  const session = await getSession();
  if (!session) redirect("/register");

  await ensureSocialLinksSchema();
  await ensureUsersSchema();

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
          <h1 className="text-4xl font-bold tracking-tight mb-1">Content</h1>
          <p className="mt-1 text-sm text-white/50 mb-6">
            Additional options for your profile.
          </p>
          <div className="grid grid-cols-1 gap-6">
            <LinksTab
              initialLinks={links.map((l) => ({
                platform: l.platform,
                url: l.url,
                order: l.order,
              }))}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
