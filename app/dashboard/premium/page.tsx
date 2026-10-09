import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPremiumStatus } from "@/lib/premium";
import Sidebar from "@/components/dashboard/sidebar";
import PremiumClient from "./premium-client";

export const metadata = {
  title: "Premium — egirls.lol",
};

export default async function PremiumPage() {
  const session = await getSession();
  if (!session) redirect("/register");

  const premium = await getPremiumStatus(session.id);

  return (
    <div className="relative min-h-screen font-sans text-white flex">
      <Sidebar />
      <main className="flex-1 px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight">
            Premium{" "}
            <span className="ml-2 inline-block rounded-full bg-amber-400/15 px-3 py-1 align-middle text-xs font-bold uppercase tracking-wide text-amber-300">
              Shop
            </span>
          </h1>
          <p className="mt-2 text-base text-white/50">
            Unlock the{" "}
            <span className="font-medium text-pink-400">Custom layout</span>{" "}
            editor and support egirls.lol.
          </p>

          <div className="mt-8">
            <PremiumClient
              initialIsPremium={premium.isPremium}
              initialPlan={premium.plan}
              initialExpiresAt={
                premium.expiresAt ? premium.expiresAt.toISOString() : null
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
