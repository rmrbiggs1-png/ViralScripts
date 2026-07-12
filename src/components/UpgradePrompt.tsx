import { PRICING } from "~/lib/pricing";

interface UpgradePromptProps {
  /** Optional message to show above the plans */
  message?: string;
  /** Whether to show the free tier card too */
  showFree?: boolean;
}

function PricingCard({
  plan,
  highlighted,
}: {
  plan: (typeof PRICING)["starter" | "pro"];
  highlighted: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-6 transition-all ${
        highlighted
          ? "border-violet-500/50 bg-violet-900/10 shadow-lg shadow-violet-900/20"
          : "border-gray-700/50 bg-gray-800/40"
      }`}
    >
      <h3 className="text-lg font-bold text-gray-100">{plan.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-gray-100">
          ${plan.price}
        </span>
        <span className="text-sm text-gray-400">/month</span>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {plan.monthlyGenerations} generations/month
      </p>

      <ul className="mt-4 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
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

      <a
        href={plan.stripeLink || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
          plan.stripeLink
            ? highlighted
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-fuchsia-500"
              : "border border-gray-600/50 bg-gray-700/40 text-gray-200 hover:bg-gray-700/60"
            : "cursor-not-allowed bg-gray-700/30 text-gray-500"
        }`}
        onClick={(e) => {
          if (!plan.stripeLink) {
            e.preventDefault();
          }
        }}
      >
        {plan.stripeLink ? "Subscribe" : "Coming soon"}
      </a>
    </div>
  );
}

export default function UpgradePrompt({
  message,
  showFree,
}: UpgradePromptProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <div className="mb-3 text-4xl">⚡</div>
        <h2 className="text-2xl font-bold text-gray-100">
          Upgrade your plan
        </h2>
        <p className="mt-2 text-gray-400">
          {message ||
            "You've reached the free tier limit. Upgrade to keep generating viral scripts."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {showFree && (
          <div className="flex flex-col rounded-xl border border-gray-700/50 bg-gray-800/40 p-6">
            <h3 className="text-lg font-bold text-gray-100">Free</h3>
            <p className="mt-1 text-sm text-gray-400">
              {PRICING.free.monthlyGenerations} generations/month
            </p>
            <ul className="mt-4 flex-1 space-y-2.5">
              {PRICING.free.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-gray-400"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
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
            <div className="mt-6 rounded-lg bg-gray-700/30 py-2.5 text-center text-sm text-gray-500">
              Current plan
            </div>
          </div>
        )}

        <PricingCard plan={PRICING.starter} highlighted={!showFree} />
        <PricingCard plan={PRICING.pro} highlighted={false} />
      </div>
    </div>
  );
}