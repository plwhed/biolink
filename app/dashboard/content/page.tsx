import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Sidebar from "@/components/dashboard/sidebar";
import LinksTab from "@/components/dashboard/appearance/links-tab";

export const metadata = {
  title: "Links — egirls.lol",
};

export default async function ContentPage() {
  const session = await getSession();
  if (!session) redirect("/register");

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
          <h1 className="text-2xl font-bold tracking-tight mb-6">Links</h1>
          <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-8">
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
