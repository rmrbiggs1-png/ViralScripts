/**
 * Pricing configuration for ViralScripts.
 * Stripe payment links can be set via env vars or defaults below.
 * The lead should replace these with actual Stripe payment links.
 */

export const PRICING = {
  free: {
    name: "Free",
    monthlyGenerations: 3,
    price: 0,
    features: ["3 generations/month", "Basic script templates", "Standard support"],
  },
  starter: {
    name: "Starter",
    monthlyGenerations: 30,
    price: 19,
    stripeLink: import.meta.env.NEXT_PUBLIC_STRIPE_STARTER_LINK as string | undefined,
    features: [
      "30 generations/month",
      "All tone options",
      "Copy to clipboard",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    monthlyGenerations: 100,
    price: 49,
    stripeLink: import.meta.env.NEXT_PUBLIC_STRIPE_PRO_LINK as string | undefined,
    features: [
      "100 generations/month",
      "All tone options",
      "Priority support",
      "Team access (up to 3 seats)",
      "Advanced analytics",
    ],
  },
} as const;

export type PlanTier = keyof typeof PRICING;