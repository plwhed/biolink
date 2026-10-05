  import { redirect } from "next/navigation";
  import { getSession } from "@/lib/auth";
  import { db } from "@/lib/db";
  import { pageViews } from "@/lib/schema";
  import { eq, sql, and, gte } from "drizzle-orm";
  import Sidebar from "@/components/dashboard/sidebar";
  import StatCard from "@/components/dashboard/stat-card";
  import ViewsChart from "@/components/dashboard/views-chart";

  export const metadata = {
    title: "Dashboard — egirls.lol",
  };

  const MAX_DAYS = 180;
  const RANGES = [7, 30, 90];

  export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/register");

    const userId = session.id;

    const [totalViews] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pageViews)
      .where(eq(pageViews.userId, userId));

    const rangeDate = new Date();
    rangeDate.setDate(rangeDate.getDate() - MAX_DAYS);

    const rawViews = await db
      .select({
        date: sql<string>`to_char(${pageViews.createdAt}, 'MM/DD')`,
        views: sql<number>`count(*)::int`,
      })
      .from(pageViews)
      .where(
        and(
          eq(pageViews.userId, userId),
          gte(pageViews.createdAt, rangeDate)
        )
      )
      .groupBy(sql`to_char(${pageViews.createdAt}, 'MM/DD')`)
      .orderBy(sql`min(${pageViews.createdAt})`);

    const viewMap = new Map(rawViews.map((r) => [r.date, r.views]));
    const chartData: { date: string; views: number }[] = [];

    for (let i = MAX_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
      chartData.push({ date: key, views: viewMap.get(key) ?? 0 });
    }

    const ranges = RANGES.map((days) => {
      const data = chartData.slice(-days);
      const prev = chartData.slice(-days * 2, -days);
      const total = data.reduce((s, p) => s + p.views, 0);
      const prevTotal = prev.reduce((s, p) => s + p.views, 0);
      const pct =
        prevTotal === 0
          ? total > 0
            ? 100
            : 0
          : Math.round(((total - prevTotal) / prevTotal) * 100);
      return { days, data, total, pct, avg: Math.round(total / days) };
    });

    return (
      <div className="relative min-h-screen font-sans text-white flex">
        <Sidebar />
        <main className="flex-1 px-8 py-10 overflow-y-auto">
          <div className="w-full">
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-base text-white/50">
              Welcome back,{" "}
              <span className="text-pink-400 font-medium">{session.username}</span>
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="User ID"
                value={userId}
                trend="neutral"
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>}
              />
              <StatCard
                label="Total views"
                value={totalViews?.count ?? 0}
                trend="neutral"
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>}
              />
              <StatCard
                label="Username"
                value={session.username}
                trend="neutral"
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
              />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[4fr_1fr]">
              <div className="rounded-3xl border border-[#1b1b1b] bg-[#0d0d0d] p-8 [&:has(#o7:checked)_.r7]:block [&:has(#o30:checked)_.r30]:block [&:has(#o90:checked)_.r90]:block">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="text-base font-semibold tracking-wider text-white/50">
                      Profile Visitors
                    </div>
                    {ranges.map((r) => (
                      <div key={r.days} className={`hidden r${r.days}`}>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-4xl font-black tracking-tighter text-white">
                            {r.total}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              r.pct >= 0
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {r.pct >= 0 ? "▲" : "▼"} {Math.abs(r.pct)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    <select
                      defaultValue="30"
                      className="appearance-none cursor-pointer rounded-xl border border-[#1b1b1b] bg-[#080808] py-2.5 pl-4 pr-10 text-sm font-semibold text-white outline-none transition-colors hover:border-white/20 focus:border-white/20"
                    >
                      {RANGES.map((r) => (
                        <option key={r} id={`o${r}`} value={r}>
                          Last {r} Days
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {ranges.map((r) => (
                  <div
                    key={r.days}
                    className={`hidden w-full [&_[style*='height:140px']]:h-[240px]! r${r.days}`}
                  >
                    <ViewsChart data={r.data} range={r.days} />
                  </div>
                ))}

                {ranges.map((r) => (
                  <div
                    key={r.days}
                    className={`hidden mt-6 border-t border-[#1b1b1b] pt-5 text-sm text-white/40 r${r.days}`}
                  >
                    Daily average: <strong className="text-white">{r.avg}</strong>{" "}
                    visitors/day over the last {r.days} days
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-6">
                <div className="rounded-3xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
                  <div className="flex items-center gap-3 mb-5 text-white">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l2-2h12l2 2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Updates</h3>
                  </div>
                  <div className="text-sm text-white/60 leading-relaxed">
                    papapaste
                  </div>
                  <div className="mt-6 pt-5 border-t border-[#1b1b1b] flex justify-between items-center text-xs text-white/40">
                    <span>Edited by <span className="text-pink-500 font-bold">f9ed</span></span>
                    <span>date</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }