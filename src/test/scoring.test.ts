import { describe, expect, it } from "vitest";

import { computeOverallScore, matchKeywords, normalizeText, scoreBand } from "@/lib/scoring";

describe("keyword matching", () => {
  it("matches accent- and case-insensitively, including variants", () => {
    const r = matchKeywords("Experiência com GESTAO de projetos e JS.", [
      { term: "Gestão de projetos", variants: [], category: "competencia_tecnica", importance: "alta" },
      { term: "JavaScript", variants: ["JS"], category: "competencia_tecnica", importance: "media" },
    ]);
    expect(r.matched.map((k) => k.term)).toEqual(["Gestão de projetos", "JavaScript"]);
    expect(r.score).toBe(100);
  });

  it("does not match partial words", () => {
    const r = matchKeywords("Trabalhei com Javanese", [
      { term: "Java", variants: [], category: "competencia_tecnica", importance: "alta" },
    ]);
    expect(r.missing).toHaveLength(1);
    expect(r.score).toBe(0);
  });

  it("weights coverage by importance (alta=3, media=2, baixa=1)", () => {
    const r = matchKeywords("Python", [
      { term: "Python", variants: [], category: "competencia_tecnica", importance: "alta" },
      { term: "Docker", variants: [], category: "ferramenta", importance: "baixa" },
    ]);
    expect(r.score).toBe(75);
  });

  it("keeps tech symbols like C++ and Node.js", () => {
    expect(normalizeText("C++ e Node.js.")).toBe("c++ e node.js");
  });
});

describe("overall score", () => {
  it("weights 35% keywords, 30% skills, 25% experience, 10% education", () => {
    expect(computeOverallScore({ keywords: 100, skills: 0, experience: 0, education: 0 })).toBe(35);
    expect(computeOverallScore({ keywords: 80, skills: 70, experience: 60, education: 100 })).toBe(74);
  });

  it("redistributes education weight when the job has no education requirement", () => {
    expect(computeOverallScore({ keywords: 100, skills: 100, experience: 100, education: null })).toBe(100);
    expect(computeOverallScore({ keywords: 90, skills: 0, experience: 0, education: null })).toBe(35);
  });

  it("is deterministic for the same inputs", () => {
    const i = { keywords: 63, skills: 71, experience: 58, education: 40 };
    expect(computeOverallScore(i)).toBe(computeOverallScore(i));
  });

  it("bands: 75+ high, 50-74 moderate, below 50 low", () => {
    expect(scoreBand(75).tone).toBe("success");
    expect(scoreBand(74).tone).toBe("warning");
    expect(scoreBand(50).tone).toBe("warning");
    expect(scoreBand(49).tone).toBe("danger");
  });
});
