import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { ToneOption } from "~/components/HostReplyForm";
import HostReplyHeader from "~/components/HostReplyHeader";
import HostReplyForm from "~/components/HostReplyForm";
import MessageCard from "~/components/MessageCard";

interface GuestMessage {
  label: string;
  text: string;
}

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [situation, setSituation] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<ToneOption>("Warm");

  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3002/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situation.trim(),
          tone,
          details: details.trim(),
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Server responded with ${res.status}`);
      }

      const result: GuestMessage[] = await res.json();
      setMessages(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <HostReplyHeader />

        <HostReplyForm
          situation={situation}
          details={details}
          tone={tone}
          onSituationChange={setSituation}
          onDetailsChange={setDetails}
          onToneChange={setTone}
          onSubmit={handleGenerate}
          isLoading={isLoading}
        />

        {/* Error state */}
        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-center">
            <p className="text-sm text-red-600">
              <span className="font-semibold">Error:</span> {error}
            </p>
            <p className="mt-1 text-xs text-red-400">
              Make sure the backend server is running on port 3002.
            </p>
          </div>
        )}

        {/* Results */}
        {messages.length > 0 && (
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-lg font-semibold text-gray-800">
              Your Guest Messages
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {messages.map((msg, i) => (
                <MessageCard key={i} message={msg.text} label={msg.label} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
              >
                {isLoading ? "Generating..." : "↻ Regenerate"}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && !error && (
          <div className="mx-auto max-w-md text-center text-gray-400">
            <div className="mb-4 text-4xl">✉️</div>
            <p className="text-sm">
              Describe the situation and any details — we'll write 2 warm,
              professional guest messages you can send in seconds.
            </p>
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-gray-400">
          HostReply &mdash; Professional guest messages, written in seconds.
        </footer>
      </div>
    </div>
  );
}