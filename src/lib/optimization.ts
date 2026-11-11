// Pure helpers that turn the user's accept/reject/edit decisions into the final resume.
import type { Optimization, OptimizationItem } from "./analysis-types";

export function finalItemText(item: OptimizationItem): string {
  if (item.edited !== null && item.edited.trim() !== "") return item.edited.trim();
  if (item.decision === "accepted" && item.suggested) return item.suggested.trim();
  return item.original.trim();
}

export interface FinalSection {
  title: string;
  items: Array<{ kind: OptimizationItem["kind"]; text: string }>;
}

export interface FinalResume {
  name: string | null;
  contact: string | null;
  sections: FinalSection[];
}

const SKILLS_TITLE = /(compet[eê]ncia|habilidade|skill|conhecimento|tecnologia)/i;

export function buildFinalResume(opt: Optimization): FinalResume {
  const sections: FinalSection[] = opt.sections
    .map((s) => ({
      title: s.title.trim(),
      items: s.items
        .map((i) => ({ kind: i.kind, text: finalItemText(i) }))
        .filter((i) => i.text.length > 0),
    }))
    .filter((s) => s.items.length > 0);

  // Keywords are only added when the user explicitly confirmed they are true.
  const confirmed = opt.confirmations.filter((c) => c.confirmed).map((c) => c.keyword.trim());
  if (confirmed.length > 0) {
    const line = confirmed.join(" · ");
    const target = sections.find((s) => SKILLS_TITLE.test(s.title));
    if (target) target.items.push({ kind: "paragraph", text: line });
    else sections.push({ title: "Competências", items: [{ kind: "paragraph", text: line }] });
  }

  return { name: opt.name, contact: opt.contact, sections };
}

export function optimizationProgress(opt: Optimization) {
  const withSuggestion = opt.sections.flatMap((s) => s.items).filter((i) => i.suggested);
  const reviewed = withSuggestion.filter((i) => i.decision !== "pending").length;
  return { total: withSuggestion.length, reviewed };
}
