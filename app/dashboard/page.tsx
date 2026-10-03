import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { links, pageViews } from "@/lib/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import LandingBackground from "@/components/landing-background";
import Sidebar from "@/components/dashboard/sidebar";
import StatCard from "@/components/dashboard/stat-card";
import ViewsChart from "@/components/dashboard/views-chart";

export const metadata = {
  title: "Dashboard — egirls.lol",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/register");

  const userId = session.id;

  const [totalLinks] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(links)
    .where(eq(links.userId, userId));

  const [totalClicks] = await db
    .select({ count: sql<number>`coalesce(sum(${links.clicks}), 0)::int` })
    .from(links)
    .where(eq(links.userId, userId));

  const [totalViews] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pageViews)
    .where(eq(pageViews.userId, userId));

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const rawViews = await db
    .select({
      date: sql<string>`to_char(${pageViews.createdAt}, 'MM/DD')`,
      views: sql<number>`count(*)::int`,
    })
    .from(pageViews)
    .where(
      and(
        eq(pageViews.userId, userId),
        gte(pageViews.createdAt, fourteenDaysAgo)
      )
    )
    .groupBy(sql`to_char(${pageViews.createdAt}, 'MM/DD')`)
    .orderBy(sql`min(${pageViews.createdAt})`);

  const viewMap = new Map(rawViews.map((r) => [r.date, r.views]));
  const chartData: { date: string; views: number }[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    chartData.push({ date: key, views: viewMap.get(key) ?? 0 });
  }

  return (
    <LandingBackground>
      <div className="relative min-h-screen font-sans text-white">
        <Sidebar />
        <main className="ml-72 px-10 py-10">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-white/50">
            Welcome back,{" "}
            <span className="text-pink-400">{session.username}</span>.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total views"
              value={totalViews?.count ?? 0}
              trend="neutral"
            />
            <StatCard
              label="Total clicks"
              value={totalClicks?.count ?? 0}
              trend="neutral"
            />
            <StatCard
              label="Links"
              value={totalLinks?.count ?? 0}
              trend="neutral"
            />
          </div>

          <div className="mt-6">
            <ViewsChart data={chartData} />
          </div>
        </main>
      </div>
    </LandingBackground>
  );
}
