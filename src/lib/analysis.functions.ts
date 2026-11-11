import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import { AiUserError } from "./ai-gateway.server";
import { computeAnalysis, computeOptimization } from "./analysis.server";
import type { KeywordResult } from "./analysis-types";

type ActionResult = { ok: true } | { ok: false; error: string };

const idInput = z.object({ analysisId: z.string().uuid() });

function friendly(error: unknown) {
  if (error instanceof AiUserError) return error.message;
  console.error(error);
  return "Algo deu errado ao processar. Tente novamente em instantes.";
}

export const runAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idInput.parse(input))
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const { supabase } = context;
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("id, status, company, job_description, resume_id, resumes(extracted_text)")
      .eq("id", data.analysisId)
      .maybeSingle();

    if (error || !analysis) return { ok: false, error: "Análise não encontrada." };
    if (analysis.status === "completed") return { ok: true };

    const resumeText = analysis.resumes?.extracted_text;
    if (!resumeText) {
      await supabase
        .from("analyses")
        .update({ status: "failed", error_message: "O currículo desta análise não está mais disponível." })
        .eq("id", analysis.id);
      return { ok: false, error: "O currículo desta análise não está mais disponível." };
    }

    await supabase.from("analyses").update({ status: "processing", error_message: null }).eq("id", analysis.id);

    try {
      const result = await computeAnalysis({
        request: getRequest(),
        resumeText,
        jobDescription: analysis.job_description,
        company: analysis.company,
      });
      const { error: updateError } = await supabase
        .from("analyses")
        .update({
          status: "completed",
          job_title: result.job_title,
          score: result.score,
          keyword_score: result.keyword_score,
          skills_score: result.skills_score,
          experience_score: result.experience_score,
          education_score: result.education_score,
          summary: result.summary,
          matched_keywords: result.matched_keywords as unknown as Json,
          missing_keywords: result.missing_keywords as unknown as Json,
          details: result.details as unknown as Json,
          recommendations: result.recommendations as unknown as Json,
          error_message: null,
        })
        .eq("id", analysis.id);
      if (updateError) throw updateError;
      return { ok: true };
    } catch (err) {
      const message = friendly(err);
      await supabase.from("analyses").update({ status: "failed", error_message: message }).eq("id", analysis.id);
      return { ok: false, error: message };
    }
  });

export const generateOptimization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idInput.parse(input))
  .handler(async ({ data, context }): Promise<ActionResult> => {
    const { supabase } = context;
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("id, status, job_description, missing_keywords, resumes(extracted_text)")
      .eq("id", data.analysisId)
      .maybeSingle();

    if (error || !analysis) return { ok: false, error: "Análise não encontrada." };
    if (analysis.status !== "completed") return { ok: false, error: "Conclua a análise antes de otimizar." };
    const resumeText = analysis.resumes?.extracted_text;
    if (!resumeText) return { ok: false, error: "O currículo desta análise não está mais disponível." };

    try {
      const missing = (analysis.missing_keywords as unknown as KeywordResult[]).map((k) => k.term);
      const optimization = await computeOptimization({
        request: getRequest(),
        resumeText,
        jobDescription: analysis.job_description,
        missingKeywords: missing,
      });
      const { error: updateError } = await supabase
        .from("analyses")
        .update({ optimization: optimization as unknown as Json })
        .eq("id", analysis.id);
      if (updateError) throw updateError;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: friendly(err) };
    }
  });
