import type { Script } from "~/types";
import ScriptCard from "./ScriptCard";

interface ResultsSectionProps {
  scripts: Script[];
  onRegenerate: () => void;
  isLoading: boolean;
}

export default function ResultsSection({
  scripts,
  onRegenerate,
  isLoading,
}: ResultsSectionProps) {
  if (scripts.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-6 text-center text-xl font-semibold text-gray-200">
        Your Viral Scripts
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {scripts.map((script, i) => (
          <ScriptCard key={i} script={script} index={i} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
            isLoading
              ? "cursor-not-allowed bg-gray-700 text-gray-500"
              : "border border-gray-600/50 bg-gray-800/40 text-gray-300 hover:border-gray-500/60 hover:bg-gray-800/60 hover:text-gray-100 active:scale-[0.98]"
          }`}
        >
          {isLoading ? "Generating..." : "↻ Regenerate"}
        </button>
      </div>
    </div>
  );
}