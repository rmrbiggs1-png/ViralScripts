/**
 * Pricing configuration for ViralScripts.
 * Stripe payment links are set by the lead.
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
    stripeLink: "https://buy.stripe.com/3cI9AVfKWfpMgEV2LF5ZC00",
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
    stripeLink: "https://buy.stripe.com/aFa5kF8iuelI88p71V5ZC01",
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