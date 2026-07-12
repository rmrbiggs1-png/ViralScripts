import { useState, type FormEvent } from "react";

interface WaitlistFormProps {
  /** Optional class name for styling */
  className?: string;
  /** Called after successful signup */
  onSuccess?: () => void;
}

export default function WaitlistForm({ className = "", onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You're on the list!");
        onSuccess?.();
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection.");
    }
  }

  if (status === "success") {
    return (
      <div className={`rounded-xl border border-emerald-800/40 bg-emerald-900/20 px-6 py-5 text-center ${className}`}>
        <div className="mb-2 text-2xl">🎉</div>
        <p className="font-semibold text-emerald-400">{message}</p>
        <p className="mt-1 text-sm text-emerald-600/80">
          We'll keep you posted on ViralScripts updates!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div>
        <label htmlFor="waitlist-name" className="mb-1 block text-xs font-medium text-gray-400">
          Name <span className="text-gray-600">(optional)</span>
        </label>
        <input
          id="waitlist-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          disabled={status === "loading"}
        />
      </div>

      <div>
        <label htmlFor="waitlist-email" className="mb-1 block text-xs font-medium text-gray-400">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          disabled={status === "loading"}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all ${
          status === "loading" || !email.trim()
            ? "cursor-not-allowed bg-gray-700 text-gray-500"
            : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
        }`}
      >
        {status === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Joining...
          </span>
        ) : (
          "Join the Waitlist"
        )}
      </button>

      {/* Error message */}
      {status === "error" && (
        <p className="text-center text-sm text-red-400">{message}</p>
      )}
    </form>
  );
}