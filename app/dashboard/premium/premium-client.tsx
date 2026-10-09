"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStack } from "@/components/ui/toast-stack";
import { PREMIUM_PLANS, type PremiumPlanId } from "@/lib/premium-plans";

export default function PremiumClient({
  initialIsPremium,
  initialPlan,
  initialExpiresAt,
}: {
  initialIsPremium: boolean;
  initialPlan: string | null;
  initialExpiresAt: string | null;
}) {
  const router = useRouter();
  const { pushToast } = useToastStack();
  const [isPremium, setIsPremium] = useState(initialIsPremium);
  const [plan, setPlan] = useState<string | null>(initialPlan);
  const [expiresAt, setExpiresAt] = useState<string | null>(initialExpiresAt);
  const [pendingPlan, setPendingPlan] = useState<PremiumPlanId | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const subscribe = async (planId: PremiumPlanId) => {
    setPendingPlan(planId);
    setError("");
    try {
      const res = await fetch("/api/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Checkout failed.");
      setIsPremium(true);
      setPlan(body.plan ?? planId);
      setExpiresAt(
        body.expiresAt ? String(body.expiresAt) : expiresAt
      );
      pushToast("Premium activated!");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
    } finally {
      setPendingPlan(null);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    setError("");
    try {
      const res = await fetch("/api/premium", { method: "DELETE" });
      if (!res.ok) throw new Error("Could not cancel Premium.");
      setIsPremium(false);
      setPlan(null);
      setExpiresAt(null);
      pushToast("Premium cancelled.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel Premium.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isPremium ? "Premium active" : "You're on the Free plan"}
            </h2>
            <p className="mt-1 text-sm text-white/40">
              {isPremium ? (
                <>
                  Current plan:{" "}
                  <span className="font-semibold text-pink-400">
                    {plan ?? "premium"}
                  </span>
                  {expiresAt && (
                    <>
                      {" "}
                      · renews{" "}
                      {new Date(expiresAt).toLocaleDateString()}
                    </>
                  )}
                </>
              ) : (
                "Upgrade to unlock the Custom layout editor and more."
              )}
            </p>
          </div>
          {isPremium && (
            <button
              type="button"
              onClick={cancel}
              disabled={cancelling}
              className="rounded-xl border border-[#1b1b1b] bg-[#080808] px-4 py-2.5 text-sm font-medium text-white/40 transition-all hover:border-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {cancelling ? "Cancelling…" : "Cancel Premium"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {PREMIUM_PLANS.map((p) => {
          const active = isPremium && plan === p.id;
          const pending = pendingPlan === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 transition-all duration-300 ${
                active
                  ? "border-pink-500/40 bg-pink-500/10"
                  : "border-[#1b1b1b] bg-[#0d0d0d] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                {active && (
                  <span className="rounded-full bg-pink-500/20 px-2.5 py-1 text-xs font-bold text-pink-300">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-white/40">{p.tagline}</p>
              <p className="mt-4">
                <span className="text-4xl font-black tracking-tight text-white">
                  ${p.price}
                </span>
                <span className="ml-1 text-sm text-white/40">
                  /{p.interval}
                </span>
              </p>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-white/70"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-pink-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => subscribe(p.id)}
                disabled={pending || active}
                className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                  active
                    ? "cursor-default bg-white/5 text-white/40"
                    : "bg-pink-500 text-white hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
                }`}
              >
                {active
                  ? "Current plan"
                  : pending
                    ? "Processing…"
                    : `Get ${p.name} — $${p.price}/${p.interval}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-white/30">
        Demo checkout — no real payment is processed. Subscribing writes a row
        to the <span className="text-white/50">premium_subscriptions</span>{" "}
        table and unlocks Premium-only layouts (Custom) for 30 days.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
