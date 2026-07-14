import { type FormEvent, useState } from "react";

export type ToneOption = "Warm" | "Professional" | "Friendly" | "Appreciative" | "Clear";

const TONES: ToneOption[] = ["Warm", "Professional", "Friendly", "Appreciative", "Clear"];

interface HostReplyFormProps {
  situation: string;
  details: string;
  tone: ToneOption;
  onSituationChange: (v: string) => void;
  onDetailsChange: (v: string) => void;
  onToneChange: (v: ToneOption) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function HostReplyForm({
  situation,
  details,
  tone,
  onSituationChange,
  onDetailsChange,
  onToneChange,
  onSubmit,
  isLoading,
}: HostReplyFormProps) {
  const isFormValid = situation.trim() && details.trim();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mb-12 max-w-2xl space-y-5">
      {/* Situation */}
      <div>
        <label htmlFor="situation" className="mb-1.5 block text-sm font-medium text-gray-700">
          Situation
        </label>
        <input
          id="situation"
          type="text"
          value={situation}
          onChange={(e) => onSituationChange(e.target.value)}
          placeholder='e.g. "Guest asking about late checkout"'
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          disabled={isLoading}
        />
      </div>

      {/* Tone */}
      <div>
        <label htmlFor="tone" className="mb-1.5 block text-sm font-medium text-gray-700">
          Tone
        </label>
        <select
          id="tone"
          value={tone}
          onChange={(e) => onToneChange(e.target.value as ToneOption)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          disabled={isLoading}
        >
          {TONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Specific Details */}
      <div>
        <label htmlFor="details" className="mb-1.5 block text-sm font-medium text-gray-700">
          Specific Details
        </label>
        <textarea
          id="details"
          rows={4}
          value={details}
          onChange={(e) => onDetailsChange(e.target.value)}
          placeholder='e.g. "Checkout is at 11am, but we can allow 1pm for $30. The guest has been polite and communicative."'
          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          disabled={isLoading}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full rounded-lg py-3.5 text-base font-semibold tracking-wide transition-all ${
          !isFormValid || isLoading
            ? "cursor-not-allowed bg-gray-200 text-gray-400"
            : "bg-indigo-600 text-white shadow-md hover:bg-indigo-500 active:scale-[0.98]"
        }`}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </span>
        ) : (
          "Generate Messages"
        )}
      </button>
    </form>
  );
}