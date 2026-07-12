import { type FormEvent, useState } from "react";
import type { Tone } from "~/types";
import { TONES } from "~/types";

interface GeneratorFormProps {
  product: string;
  audience: string;
  painPoint: string;
  tone: Tone;
  onProductChange: (v: string) => void;
  onAudienceChange: (v: string) => void;
  onPainPointChange: (v: string) => void;
  onToneChange: (v: Tone) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function GeneratorForm({
  product,
  audience,
  painPoint,
  tone,
  onProductChange,
  onAudienceChange,
  onPainPointChange,
  onToneChange,
  onSubmit,
  isLoading,
}: GeneratorFormProps) {
  const isFormValid = product.trim() && audience.trim() && painPoint.trim();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mb-12 max-w-2xl space-y-5">
      {/* Product name */}
      <div>
        <label htmlFor="product" className="mb-1.5 block text-sm font-medium text-gray-300">
          Product Name
        </label>
        <input
          id="product"
          type="text"
          value={product}
          onChange={(e) => onProductChange(e.target.value)}
          placeholder='e.g. "Ergonomic travel pillow"'
          className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          disabled={isLoading}
        />
      </div>

      {/* Target audience */}
      <div>
        <label htmlFor="audience" className="mb-1.5 block text-sm font-medium text-gray-300">
          Target Audience
        </label>
        <input
          id="audience"
          type="text"
          value={audience}
          onChange={(e) => onAudienceChange(e.target.value)}
          placeholder='e.g. "Frequent flyers"'
          className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          disabled={isLoading}
        />
      </div>

      {/* Main pain point */}
      <div>
        <label htmlFor="painPoint" className="mb-1.5 block text-sm font-medium text-gray-300">
          Main Pain Point
        </label>
        <textarea
          id="painPoint"
          rows={3}
          value={painPoint}
          onChange={(e) => onPainPointChange(e.target.value)}
          placeholder='e.g. "Neck stiffness and discomfort on long flights"'
          className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          disabled={isLoading}
        />
      </div>

      {/* Tone */}
      <div>
        <label htmlFor="tone" className="mb-1.5 block text-sm font-medium text-gray-300">
          Tone
        </label>
        <select
          id="tone"
          value={tone}
          onChange={(e) => onToneChange(e.target.value as Tone)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-gray-100 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          disabled={isLoading}
        >
          {TONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full rounded-lg py-3.5 text-base font-semibold tracking-wide transition-all ${
          !isFormValid || isLoading
            ? "cursor-not-allowed bg-gray-700 text-gray-500"
            : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/30 active:scale-[0.98]"
        }`}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating...
          </span>
        ) : (
          "Generate Scripts"
        )}
      </button>
    </form>
  );
}