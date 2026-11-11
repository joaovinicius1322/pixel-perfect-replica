// Deterministic, explainable scoring. The AI extracts what the job asks for and
// assesses qualitative fit; keyword coverage and the final weighted score are
// computed here so the same inputs always produce the same number.
import type { JobKeyword, KeywordResult, Priority } from "./analysis-types";

export const SCORE_WEIGHTS = {
  keywords: 0.35,
  skills: 0.3,
  experience: 0.25,
  education: 0.1,
} as const;

const IMPORTANCE_WEIGHT: Record<Priority, number> = { alta: 3, media: 2, baixa: 1 };

/** Lowercase, strip accents, keep characters meaningful in tech terms (+ # . /). */
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/[-/]/g, " ")
    .replace(/\.(?=\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsTerm(normalizedHaystack: string, term: string): boolean {
  const needle = normalizeText(term);
  if (!needle) return false;
  return ` ${normalizedHaystack} `.includes(` ${needle} `);
}

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export interface KeywordMatchResult {
  matched: KeywordResult[];
  missing: KeywordResult[];
  score: number;
}

export function matchKeywords(resumeText: string, keywords: JobKeyword[]): KeywordMatchResult {
  const haystack = normalizeText(resumeText);
  const seen = new Set<string>();
  const matched: KeywordResult[] = [];
  const missing: KeywordResult[] = [];
  let total = 0;
  let got = 0;

  for (const kw of keywords) {
    const key = normalizeText(kw.term);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const forms = [kw.term, ...kw.variants].filter((f) => f && f.trim().length > 0);
    const hit = forms.find((form) => containsTerm(haystack, form)) ?? null;
    const weight = IMPORTANCE_WEIGHT[kw.importance] ?? 1;
    total += weight;
    const result: KeywordResult = {
      term: kw.term.trim(),
      category: kw.category,
      importance: kw.importance,
      matchedAs: hit,
    };
    if (hit) {
      got += weight;
      matched.push(result);
    } else {
      missing.push(result);
    }
  }

  const order = (r: KeywordResult) => -IMPORTANCE_WEIGHT[r.importance];
  matched.sort((a, b) => order(a) - order(b));
  missing.sort((a, b) => order(a) - order(b));

  return { matched, missing, score: total === 0 ? 0 : clampScore((got / total) * 100) };
}

export interface ScoreInputs {
  keywords: number;
  skills: number | null;
  experience: number | null;
  /** null when the job has no education requirement — its weight is redistributed. */
  education: number | null;
}

export function computeOverallScore(inputs: ScoreInputs): number {
  const parts: Array<[number, number]> = [[inputs.keywords, SCORE_WEIGHTS.keywords]];
  if (inputs.skills !== null) parts.push([inputs.skills, SCORE_WEIGHTS.skills]);
  if (inputs.experience !== null) parts.push([inputs.experience, SCORE_WEIGHTS.experience]);
  if (inputs.education !== null) parts.push([inputs.education, SCORE_WEIGHTS.education]);
  const weightSum = parts.reduce((acc, [, w]) => acc + w, 0);
  const weighted = parts.reduce((acc, [s, w]) => acc + clampScore(s) * w, 0);
  return clampScore(weighted / weightSum);
}

export type ScoreTone = "success" | "warning" | "danger";

export function scoreBand(score: number): { tone: ScoreTone; label: string; description: string } {
  if (score >= 75)
    return {
      tone: "success",
      label: "Alta compatibilidade",
      description: "Seu currículo cobre a maior parte do que a vaga pede.",
    };
  if (score >= 50)
    return {
      tone: "warning",
      label: "Compatibilidade moderada",
      description: "Há uma boa base, mas faltam termos e evidências importantes.",
    };
  return {
    tone: "danger",
    label: "Baixa compatibilidade",
    description: "O currículo ainda não reflete bem os requisitos desta vaga.",
  };
}
