import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getWidgets } from "@/lib/widgets";
import Sidebar from "@/components/dashboard/sidebar";
import WidgetsClient from "./client";

export const metadata = {
  title: "Widgets — egirls.lol",
};

export default async function WidgetsPage() {
  const session = await getSession();
  if (!session) redirect("/register");

  const widgets = await getWidgets(session.id);

  return (
    <div className="relative min-h-screen font-sans text-white flex">
      <Sidebar />
      <main className="flex-1 px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-4xl">
          <WidgetsClient initialWidgets={widgets} />
        </div>
      </main>
    </div>
  );
}
