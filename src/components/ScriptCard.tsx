import { useState } from "react";
import type { Script } from "~/types";

interface ScriptCardProps {
  script: Script;
  index: number;
}

export default function ScriptCard({ script, index }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);

  const fullText = [
    `🎬 Script ${index + 1}`,
    "",
    `📌 Hook:\n${script.hook}`,
    "",
    `📝 Body:\n${script.body}`,
    "",
    `🔗 CTA:\n${script.cta}`,
    "",
    `💬 On-Screen Text:\n${script.onScreenText}`,
    "",
    `🎵 Audio Style:\n${script.audioStyle}`,
  ].join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available, try fallback
      const textarea = document.createElement("textarea");
      textarea.value = fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="animate-fade-in-up group relative flex flex-col rounded-xl border border-gray-700/50 bg-gray-800/40 p-5 backdrop-blur-sm transition-all hover:border-gray-600/60 hover:bg-gray-800/60"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Card number badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">
          {index + 1}
        </span>
        <span className="rounded-full bg-gray-700/60 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {script.audioStyle}
        </span>
      </div>

      {/* Hook */}
      <div className="mb-3">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-400">
          Hook
        </h3>
        <p className="text-sm leading-relaxed text-gray-200">{script.hook}</p>
      </div>

      {/* Body */}
      <div className="mb-3 flex-1">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-fuchsia-400">
          Body
        </h3>
        <p className="text-sm leading-relaxed text-gray-300">{script.body}</p>
      </div>

      {/* CTA */}
      <div className="mb-3">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          CTA
        </h3>
        <p className="text-sm leading-relaxed text-gray-200">{script.cta}</p>
      </div>

      {/* On-screen text */}
      <div className="mb-4">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
          On-Screen Text
        </h3>
        <p className="text-sm leading-relaxed text-gray-300">
          {script.onScreenText}
        </p>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`mt-auto flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
          copied
            ? "border-emerald-600/50 bg-emerald-600/20 text-emerald-400"
            : "border-gray-600/50 bg-gray-700/40 text-gray-400 hover:border-gray-500/60 hover:bg-gray-700/60 hover:text-gray-200"
        }`}
      >
        {copied ? (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Script
          </>
        )}
      </button>
    </div>
  );
}