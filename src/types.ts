export interface Script {
  hook: string;
  body: string;
  cta: string;
  onScreenText: string;
  audioStyle: string;
}

export type Tone = "Energetic" | "Relatable" | "Satisfying" | "Shocking" | "Emotional";

export const TONES: Tone[] = [
  "Energetic",
  "Relatable",
  "Satisfying",
  "Shocking",
  "Emotional",
];

export interface GenerateRequest {
  product: string;
  audience: string;
  painPoint: string;
  tone: Tone;
  userId?: string;
}