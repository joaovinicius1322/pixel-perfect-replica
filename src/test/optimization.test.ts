import { describe, expect, it } from "vitest";

import type { Optimization } from "@/lib/analysis-types";
import { buildFinalResume } from "@/lib/optimization";

const base = (): Optimization => ({
  generated_at: "2026-01-01T00:00:00Z",
  name: "Ana",
  contact: null,
  sections: [
    {
      id: "s1",
      title: "Experiência",
      items: [
        { id: "a", kind: "bullet", original: "Fiz relatórios", suggested: "Elaborei relatórios", reason: "verbo", decision: "pending", edited: null },
        { id: "b", kind: "bullet", original: "Atendi clientes", suggested: "Atendimento consultivo", reason: "x", decision: "rejected", edited: null },
        { id: "c", kind: "bullet", original: "Usei Excel", suggested: "Analisei dados no Excel", reason: "x", decision: "accepted", edited: null },
      ],
    },
  ],
  confirmations: [
    { id: "k1", keyword: "Power BI", question: "?", confirmed: false },
    { id: "k2", keyword: "SQL", question: "?", confirmed: true },
  ],
});

describe("final resume", () => {
  it("uses suggestions only when accepted; pending and rejected keep the original", () => {
    const texts = buildFinalResume(base()).sections[0]!.items.map((i) => i.text);
    expect(texts).toEqual(["Fiz relatórios", "Atendi clientes", "Analisei dados no Excel"]);
  });

  it("manual edits win over suggestion and original", () => {
    const o = base();
    o.sections[0]!.items[0]!.edited = "Minha versão";
    expect(buildFinalResume(o).sections[0]!.items[0]!.text).toBe("Minha versão");
  });

  it("adds only keywords the user confirmed as true", () => {
    const final = buildFinalResume(base());
    const all = final.sections.flatMap((s) => s.items.map((i) => i.text)).join(" ");
    expect(all).toContain("SQL");
    expect(all).not.toContain("Power BI");
  });
});
