// Server-only: prompts, schemas and AI orchestration for analysis and optimization.
import { z } from "zod";

import type {
  AnalysisDetails,
  JobKeyword,
  Optimization,
  Recommendation,
} from "./analysis-types";
import { generateStructured } from "./ai-gateway.server";
import { clampScore, computeOverallScore, matchKeywords } from "./scoring";

const MAX_RESUME_CHARS = 24000;
const MAX_JOB_CHARS = 16000;

const priority = z.enum(["alta", "media", "baixa"]);
const category = z.enum([
  "competencia_tecnica",
  "ferramenta",
  "competencia_comportamental",
  "certificacao",
  "formacao",
  "idioma",
  "dominio",
]);

const analysisSchema = z.object({
  job_title: z.string(),
  keywords: z.array(
    z.object({
      term: z.string(),
      variants: z.array(z.string()),
      category,
      importance: priority,
    }),
  ),
  skills: z.object({ score: z.number(), rationale: z.string() }),
  experience: z.object({ score: z.number(), rationale: z.string() }),
  education: z.object({ score: z.number().nullable(), rationale: z.string() }),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  summary: z.string(),
  recommendations: z.array(
    z.object({
      title: z.string(),
      problem: z.string(),
      why_it_matters: z.string(),
      how_to_improve: z.string(),
      rewrite_suggestion: z.string().nullable(),
      priority,
    }),
  ),
});

const INTEGRITY_RULES = `
REGRAS DE INTEGRIDADE (obrigatórias):
- NUNCA invente experiências, empresas, cargos, certificações, formação, competências, métricas, resultados ou datas.
- NUNCA aumente o tempo de experiência nem "arredonde para cima" conquistas.
- Use somente fatos presentes no currículo. Se algo relevante não estiver comprovado, diga que o candidato deve incluir APENAS se for verdade.
- Sugestões de reescrita devem reorganizar e esclarecer o que já existe, adaptando o vocabulário à vaga apenas quando houver evidência no currículo.`;

const ANALYSIS_INSTRUCTIONS = `Você é um especialista sênior em recrutamento e sistemas ATS no Brasil.
Compare um currículo com uma descrição de vaga e produza uma avaliação honesta, específica e acionável, em português do Brasil.

Tarefas:
1. job_title: o título da vaga como aparece na descrição (curto).
2. keywords: extraia de 12 a 30 termos que um ATS e um recrutador usariam para filtrar candidatos NESTA vaga (tecnologias, ferramentas, competências, certificações, formação exigida, idiomas, domínio do setor). Use o termo como aparece na vaga. Em "variants" liste sinônimos, siglas e grafias equivalentes (ex.: "JavaScript" → ["JS"], "Gestão de projetos" → ["gerenciamento de projetos", "project management"]). importance: "alta" para requisitos obrigatórios, "media" para desejáveis, "baixa" para diferenciais. Não decida se o termo está no currículo; isso é calculado depois.
3. skills.score (0-100): aderência das competências e ferramentas comprovadas no currículo aos requisitos.
4. experience.score (0-100): aderência de senioridade, tempo e tipo de experiência (responsabilidades, contexto, escopo).
5. education.score (0-100): aderência de formação/certificações. Use null se a vaga não menciona nenhum requisito de formação.
   Rubrica para os scores: 90-100 atende plenamente com evidências claras; 70-89 atende a maioria; 50-69 atende parcialmente; 30-49 lacunas relevantes; 0-29 pouco ou nenhum alinhamento. Cada rationale deve citar evidências concretas do currículo (1-3 frases).
6. strengths: 3 a 6 pontos fortes reais do currículo para esta vaga.
7. improvements: 3 a 6 oportunidades de melhoria.
8. summary: 2-3 frases resumindo a compatibilidade.
9. recommendations: 4 a 8 recomendações priorizadas. Cada uma com: problem (o que foi identificado), why_it_matters (impacto no ATS/recrutador), how_to_improve (passo prático), rewrite_suggestion (exemplo de reescrita baseada SOMENTE em trechos reais do currículo; null se não se aplica).
${INTEGRITY_RULES}`;

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}\n[...texto truncado]` : text;
}

export interface AnalysisComputation {
  job_title: string;
  score: number;
  keyword_score: number;
  skills_score: number | null;
  experience_score: number | null;
  education_score: number | null;
  summary: string;
  matched_keywords: ReturnType<typeof matchKeywords>["matched"];
  missing_keywords: ReturnType<typeof matchKeywords>["missing"];
  details: AnalysisDetails;
  recommendations: Recommendation[];
}

export async function computeAnalysis(input: {
  request: Request;
  resumeText: string;
  jobDescription: string;
  company: string | null;
}): Promise<AnalysisComputation> {
  const ai = await generateStructured({
    request: input.request,
    schema: analysisSchema,
    instructions: ANALYSIS_INSTRUCTIONS,
    prompt: `EMPRESA: ${input.company?.trim() || "não informada"}

DESCRIÇÃO DA VAGA:
"""
${clip(input.jobDescription, MAX_JOB_CHARS)}
"""

CURRÍCULO DO CANDIDATO:
"""
${clip(input.resumeText, MAX_RESUME_CHARS)}
"""`,
  });

  const keywords: JobKeyword[] = ai.keywords.map((k) => ({
    term: k.term,
    variants: k.variants,
    category: k.category,
    importance: k.importance,
  }));
  const kw = matchKeywords(input.resumeText, keywords);
  const skills = clampScore(ai.skills.score);
  const experience = clampScore(ai.experience.score);
  const education = ai.education.score === null ? null : clampScore(ai.education.score);

  const score = computeOverallScore({ keywords: kw.score, skills, experience, education });

  return {
    job_title: ai.job_title.trim().slice(0, 140) || "Vaga sem título",
    score,
    keyword_score: kw.score,
    skills_score: skills,
    experience_score: experience,
    education_score: education,
    summary: ai.summary,
    matched_keywords: kw.matched,
    missing_keywords: kw.missing,
    details: {
      skills: { score: skills, rationale: ai.skills.rationale },
      experience: { score: experience, rationale: ai.experience.rationale },
      education: { score: education, rationale: ai.education.rationale },
      keywords: { score: kw.score, matched: kw.matched.length, total: kw.matched.length + kw.missing.length },
      strengths: ai.strengths.slice(0, 8),
      improvements: ai.improvements.slice(0, 8),
    },
    recommendations: ai.recommendations.slice(0, 10),
  };
}

const optimizationSchema = z.object({
  name: z.string().nullable(),
  contact: z.string().nullable(),
  sections: z.array(
    z.object({
      title: z.string(),
      items: z.array(
        z.object({
          kind: z.enum(["heading", "subheading", "bullet", "paragraph"]),
          original: z.string(),
          suggested: z.string().nullable(),
          reason: z.string().nullable(),
        }),
      ),
    }),
  ),
  confirmations: z.array(z.object({ keyword: z.string(), question: z.string() })),
});

const OPTIMIZATION_INSTRUCTIONS = `Você é um redator profissional de currículos, especialista em ATS, escrevendo em português do Brasil.
Sua tarefa é estruturar o currículo original e propor melhorias de redação para uma vaga específica.

Como responder:
- name: nome do candidato exatamente como no currículo (null se ausente).
- contact: uma linha com os contatos presentes (e-mail, telefone, cidade, LinkedIn), separados por " | " (null se ausentes).
- sections: reproduza TODAS as seções do currículo na ordem original (ex.: Resumo profissional, Experiência profissional, Formação acadêmica, Competências, Certificações, Idiomas). Use títulos claros e padrão de mercado.
  Cada item:
  - kind: "heading" para cargo/empresa/curso (ex.: "Analista de Dados — Empresa X (2021–2024)"), "subheading" para informações complementares curtas, "bullet" para responsabilidades/conquistas, "paragraph" para textos corridos ou listas de competências.
  - original: o texto fiel do currículo (apenas corrigindo quebras de linha ou artefatos de extração). Nunca altere fatos no original.
  - suggested: uma versão melhorada SOMENTE quando houver ganho real de clareza, impacto, organização ou alinhamento ao vocabulário da vaga. Comece bullets com verbos de ação. Mantenha exatamente os mesmos fatos, números, datas, empresas e cargos. Use null quando o original já está bom ou para headings com dados factuais.
  - reason: frase curta explicando a melhoria (null quando suggested é null).
- confirmations: para palavras-chave ausentes que são relevantes para a vaga e NÃO estão comprovadas no currículo, crie uma pergunta ao candidato (ex.: "Você tem experiência real com Power BI? Inclua apenas se for verdade."). Máximo de 8.
${INTEGRITY_RULES}
- Se uma suggested exigir informação que não existe no currículo, NÃO a escreva: transforme em uma confirmation.`;

export async function computeOptimization(input: {
  request: Request;
  resumeText: string;
  jobDescription: string;
  missingKeywords: string[];
}): Promise<Optimization> {
  const ai = await generateStructured({
    request: input.request,
    schema: optimizationSchema,
    instructions: OPTIMIZATION_INSTRUCTIONS,
    prompt: `DESCRIÇÃO DA VAGA:
"""
${clip(input.jobDescription, MAX_JOB_CHARS)}
"""

PALAVRAS-CHAVE DA VAGA AUSENTES NO CURRÍCULO: ${input.missingKeywords.join(", ") || "nenhuma"}

CURRÍCULO ORIGINAL:
"""
${clip(input.resumeText, MAX_RESUME_CHARS)}
"""`,
  });

  return {
    generated_at: new Date().toISOString(),
    name: ai.name?.trim() || null,
    contact: ai.contact?.trim() || null,
    sections: ai.sections
      .filter((s) => s.items.length > 0)
      .map((s) => ({
        id: crypto.randomUUID(),
        title: s.title.trim(),
        items: s.items
          .filter((i) => i.original.trim().length > 0 || (i.suggested ?? "").trim().length > 0)
          .map((i) => {
            const suggested = i.suggested?.trim() || null;
            const same = suggested !== null && suggested === i.original.trim();
            return {
              id: crypto.randomUUID(),
              kind: i.kind,
              original: i.original.trim(),
              suggested: same ? null : suggested,
              reason: same ? null : i.reason?.trim() || null,
              decision: "pending" as const,
              edited: null,
            };
          }),
      })),
    confirmations: ai.confirmations.slice(0, 8).map((c) => ({
      id: crypto.randomUUID(),
      keyword: c.keyword.trim(),
      question: c.question.trim(),
      confirmed: false,
    })),
  };
}
