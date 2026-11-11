import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type {
  AnalysisDetails,
  KeywordResult,
  Optimization,
  Recommendation,
} from "./analysis-types";

export type AnalysisStatus = "processing" | "completed" | "failed";

export interface AnalysisListItem {
  id: string;
  job_title: string;
  company: string | null;
  status: AnalysisStatus;
  score: number | null;
  created_at: string;
  resume_id: string | null;
}

export interface AnalysisFull extends AnalysisListItem {
  job_description: string;
  keyword_score: number | null;
  skills_score: number | null;
  experience_score: number | null;
  education_score: number | null;
  summary: string | null;
  matched_keywords: KeywordResult[];
  missing_keywords: KeywordResult[];
  details: AnalysisDetails | null;
  recommendations: Recommendation[];
  optimization: Optimization | null;
  error_message: string | null;
  resume: { id: string; file_name: string; extracted_text: string } | null;
}

export interface ResumeListItem {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  analyses_count: number;
}

export const analysesQuery = () =>
  queryOptions({
    queryKey: ["analyses"],
    queryFn: async (): Promise<AnalysisListItem[]> => {
      const { data, error } = await supabase
        .from("analyses")
        .select("id, job_title, company, status, score, created_at, resume_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AnalysisListItem[];
    },
  });

export const analysisQuery = (id: string) =>
  queryOptions({
    queryKey: ["analyses", id],
    queryFn: async (): Promise<AnalysisFull | null> => {
      const { data, error } = await supabase
        .from("analyses")
        .select("*, resume:resumes(id, file_name, extracted_text)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as AnalysisFull | null;
    },
  });

export const resumesQuery = () =>
  queryOptions({
    queryKey: ["resumes"],
    queryFn: async (): Promise<ResumeListItem[]> => {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, file_name, file_path, file_type, file_size, created_at, analyses(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => {
        const counts = r.analyses as unknown as Array<{ count: number }> | null;
        return {
          id: r.id,
          file_name: r.file_name,
          file_path: r.file_path,
          file_type: r.file_type,
          file_size: r.file_size,
          created_at: r.created_at,
          analyses_count: counts?.[0]?.count ?? 0,
        };
      });
    },
  });

export const profileQuery = () =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      const fallback = (user.user_metadata?.["full_name"] as string | undefined) ?? (user.user_metadata?.["name"] as string | undefined);
      return { id: user.id, email: user.email ?? "", full_name: data?.full_name ?? fallback ?? null };
    },
  });
