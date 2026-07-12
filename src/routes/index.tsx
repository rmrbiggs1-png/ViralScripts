import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import type { GenerateRequest, Script, Tone } from "~/types";
import Header from "~/components/Header";
import GeneratorForm from "~/components/GeneratorForm";
import ResultsSection from "~/components/ResultsSection";

export const Route = createFileRoute("/")({
  component: Home,
});

function AuthenticatedHome() {
  // This component is only rendered on the client, so Clerk hooks are safe
  const { isSignedIn } = useAuth();

  // Form state (lifted up so regenerate can reuse it)
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [tone, setTone] = useState<Tone>("Energetic");

  // App state
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!isSignedIn) return;

    const data: GenerateRequest = {
      product: product.trim(),
      audience: audience.trim(),
      painPoint: painPoint.trim(),
      tone,
    };

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Server responded with ${res.status}`);
      }

      const result: Script[] = await res.json();
      setScripts(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto mt-16 max-w-lg text-center">
        <div className="mb-6 text-5xl">🔐</div>
        <h2 className="mb-3 text-2xl font-bold text-gray-100">
          Sign in to generate scripts
        </h2>
        <p className="mb-8 text-gray-400">
          Create viral TikTok & Reels scripts in seconds. Sign in or create
          a free account to get started.
        </p>
        <SignInButton mode="modal">
          <button
            type="button"
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
          >
            Sign In to Get Started
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <>
      <GeneratorForm
        product={product}
        audience={audience}
        painPoint={painPoint}
        tone={tone}
        onProductChange={setProduct}
        onAudienceChange={setAudience}
        onPainPointChange={setPainPoint}
        onToneChange={setTone}
        onSubmit={handleGenerate}
        isLoading={isLoading}
      />

      {/* Error state */}
      {error && (
        <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-800/50 bg-red-900/20 px-5 py-4 text-center">
          <p className="text-sm text-red-400">
            <span className="font-semibold">Error:</span> {error}
          </p>
          <p className="mt-1 text-xs text-red-500">
            Make sure the backend server is running on port 3001.
          </p>
        </div>
      )}

      {/* Results */}
      <ResultsSection
        scripts={scripts}
        onRegenerate={handleGenerate}
        isLoading={isLoading}
      />

      {/* Empty state */}
      {!isLoading && scripts.length === 0 && !error && (
        <div className="mx-auto max-w-md text-center text-gray-500">
          <div className="mb-4 text-4xl">🎬</div>
          <p className="text-sm">
            Enter your product details above and generate 3 ready-to-film
            TikTok & Reels scripts in seconds.
          </p>
        </div>
      )}
    </>
  );
}

function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-dvh bg-gray-950 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Header />

        {isClient ? (
          <AuthenticatedHome />
        ) : (
          /* SSR placeholder — show a loading skeleton */
          <div className="mx-auto mt-16 max-w-lg text-center">
            <div className="mb-4 text-4xl">🎬</div>
            <p className="text-sm text-gray-500">
              Loading ViralScripts...
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-gray-600">
          ViralScripts &mdash; Stop guessing. Start going viral.
        </footer>
      </div>
    </div>
  );
}