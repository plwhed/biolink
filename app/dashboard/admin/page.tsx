import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db, ensureUsersSchema } from "@/lib/db";
import { users, badges } from "@/lib/schema";
import { ensureDefaultBadges, canAccessAdminPanel } from "@/lib/badges";
import Sidebar from "@/components/dashboard/sidebar";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const session = await getSession();

  if (!(await canAccessAdminPanel(session))) {
    redirect("/dashboard");
  }

  await ensureDefaultBadges();
  await ensureUsersSchema();

  const allUsers = (await db.select().from(users)).map((user) => ({
    ...user,
    isAdmin: !!user.isAdmin,
    premium: !!user.premium,
  }));
  const allBadges = await db.select().from(badges);

  return (
    <div className="relative min-h-screen font-sans text-white flex">
      <Sidebar />
      <main className="flex-1 px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-6xl">
          <AdminClient allUsers={allUsers} allBadges={allBadges} />
        </div>
      </main>
    </div>
  );
}
