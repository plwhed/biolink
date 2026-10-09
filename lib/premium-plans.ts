/**
 * Premium plan catalog. Pure data — safe to import from client components.
 * (Server helpers live in `./premium`, which pulls in the DB driver and
 * must never be bundled for the browser.)
 */

export const PREMIUM_PLANS = [
  {
    id: "plus",
    name: "Plus",
    price: 5,
    interval: "month",
    tagline: "Unlock the Custom layout editor.",
    features: [
      "Custom (free-move) profile layout",
      "Drag, resize & style every element",
      "Priority support",
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    price: 10,
    interval: "month",
    tagline: "Everything in Plus, with extra flair.",
    features: [
      "Everything in Plus",
      "Ultra badge on your profile",
      "Early access to new layouts",
      "Priority support",
    ],
  },
] as const;

export type PremiumPlanId = (typeof PREMIUM_PLANS)[number]["id"];

export function isPremiumPlanId(value: unknown): value is PremiumPlanId {
  return value === "plus" || value === "ultra";
}
