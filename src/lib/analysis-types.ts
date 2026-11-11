// Shared, browser-safe types for analyses and resume optimization.

export type Priority = "alta" | "media" | "baixa";

export type KeywordCategory =
  | "competencia_tecnica"
  | "ferramenta"
  | "competencia_comportamental"
  | "certificacao"
  | "formacao"
  | "idioma"
  | "dominio";

export interface JobKeyword {
  term: string;
  variants: string[];
  category: KeywordCategory;
  importance: Priority;
}

export interface KeywordResult {
  term: string;
  category: KeywordCategory;
  importance: Priority;
  /** The exact form found in the resume, or null when missing. */
  matchedAs: string | null;
}

export interface DimensionAssessment {
  score: number | null;
  rationale: string;
}

export interface AnalysisDetails {
  skills: DimensionAssessment;
  experience: DimensionAssessment;
  education: DimensionAssessment;
  keywords: { score: number; matched: number; total: number };
  strengths: string[];
  improvements: string[];
}

export interface Recommendation {
  title: string;
  problem: string;
  why_it_matters: string;
  how_to_improve: string;
  rewrite_suggestion: string | null;
  priority: Priority;
}

export type ItemKind = "heading" | "subheading" | "bullet" | "paragraph";
export type Decision = "pending" | "accepted" | "rejected";

export interface OptimizationItem {
  id: string;
  kind: ItemKind;
  original: string;
  suggested: string | null;
  reason: string | null;
  decision: Decision;
  /** Manual edit by the user; takes precedence when set. */
  edited: string | null;
}

export interface OptimizationSection {
  id: string;
  title: string;
  items: OptimizationItem[];
}

export interface Confirmation {
  id: string;
  keyword: string;
  question: string;
  confirmed: boolean;
}

export interface Optimization {
  generated_at: string;
  name: string | null;
  contact: string | null;
  sections: OptimizationSection[];
  confirmations: Confirmation[];
}

export const CATEGORY_LABEL: Record<KeywordCategory, string> = {
  competencia_tecnica: "Competência técnica",
  ferramenta: "Ferramenta",
  competencia_comportamental: "Comportamental",
  certificacao: "Certificação",
  formacao: "Formação",
  idioma: "Idioma",
  dominio: "Domínio/Setor",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};
