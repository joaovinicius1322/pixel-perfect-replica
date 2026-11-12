import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, History, Plus, Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ScorePill } from "@/components/analysis/ScoreRing";
import { StatusBadge } from "@/components/analysis/StatusBadge";
import { EmptyState, PageHeader, PageSkeleton } from "@/components/app/AppShell";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import { analysesQuery, type AnalysisListItem } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/analises/")({
  head: () => ({
    meta: [
      { title: "Minhas análises — MatchCV AI" },
      { name: "description", content: "Histórico das suas análises de currículo e scores ATS." },
      { property: "og:title", content: "Minhas análises — MatchCV AI" },
      { property: "og:description", content: "Histórico de análises de currículo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(analysesQuery()),
  pendingComponent: PageSkeleton,
  component: History_,
});

type StatusFilter = "all" | "completed" | "processing" | "failed";
type ScoreFilter = "all" | "high" | "mid" | "low";

function History_() {
  const { data } = useSuspenseQuery(analysesQuery());
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [score, setScore] = useState<ScoreFilter>("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((a) => {
      if (term && !`${a.job_title} ${a.company ?? ""}`.toLowerCase().includes(term)) return false;
      if (status !== "all" && a.status !== status) return false;
      if (score !== "all") {
        if (a.score === null) return false;
        if (score === "high" && a.score < 75) return false;
        if (score === "mid" && (a.score < 50 || a.score >= 75)) return false;
        if (score === "low" && a.score >= 50) return false;
      }
      return true;
    });
  }, [data, q, status, score]);

  const remove = async (a: AnalysisListItem) => {
    const { error } = await supabase.from("analyses").delete().eq("id", a.id);
    if (error) {
      toast.error("Não foi possível excluir a análise.");
      return;
    }
    queryClient.setQueryData<AnalysisListItem[]>(["analyses"], (prev) => prev?.filter((x) => x.id !== a.id));
    queryClient.removeQueries({ queryKey: ["analyses", a.id] });
    queryClient.invalidateQueries({ queryKey: ["resumes"] });
    toast.success("Análise excluída.");
  };

  const newBtn = (
    <Button asChild variant="hero">
      <Link to="/nova-analise">
        <Plus /> Nova análise
      </Link>
    </Button>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title="Minhas análises" description="Acompanhe e compare suas candidaturas." actions={newBtn} />
      {data.length === 0 ? (
        <EmptyState icon={History} title="Você ainda não fez nenhuma análise" text="Compare seu currículo com uma vaga para ver seu score ATS." action={newBtn} />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por vaga ou empresa" className="h-10 pl-9" aria-label="Buscar análises" />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <SelectTrigger className="h-10 md:w-44" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="failed">Com falha</SelectItem>
              </SelectContent>
            </Select>
            <Select value={score} onValueChange={(v) => setScore(v as ScoreFilter)}>
              <SelectTrigger className="h-10 md:w-44" aria-label="Filtrar por score">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer score</SelectItem>
                <SelectItem value="high">Alto (75+)</SelectItem>
                <SelectItem value="mid">Moderado (50–74)</SelectItem>
                <SelectItem value="low">Baixo (até 49)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={SearchX} title="Nenhum resultado" text="Ajuste a busca ou os filtros." />
          ) : (
            <div className="surface-card overflow-hidden">
              <table className="hidden w-full text-sm md:table">
                <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Vaga</th>
                    <th scope="col" className="px-5 py-3 font-medium">Empresa</th>
                    <th scope="col" className="px-5 py-3 font-medium">Data</th>
                    <th scope="col" className="px-5 py-3 font-medium">Score ATS</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-accent/40">
                      <td className="max-w-xs truncate px-5 py-3.5 font-medium">{a.job_title}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{a.company ?? "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{formatDate(a.created_at)}</td>
                      <td className="px-5 py-3.5"><ScorePill score={a.score} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link to="/analises/$id" params={{ id: a.id }}>
                              <Eye /> Visualizar
                            </Link>
                          </Button>
                          <ConfirmDelete
                            label={`Excluir análise ${a.job_title}`}
                            title="Excluir esta análise?"
                            description="O resultado e o currículo otimizado desta vaga serão removidos. Seu arquivo de currículo continua salvo."
                            onConfirm={() => remove(a)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="divide-y divide-border md:hidden">
                {filtered.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 p-4">
                    <ScorePill score={a.score} />
                    <Link to="/analises/$id" params={{ id: a.id }} className="min-w-0 flex-1">
                      <p className="truncate font-medium">{a.job_title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.company ? `${a.company} · ` : ""}
                        {formatDate(a.created_at)}
                      </p>
                      <div className="mt-1.5"><StatusBadge status={a.status} /></div>
                    </Link>
                    <ConfirmDelete
                      label={`Excluir análise ${a.job_title}`}
                      title="Excluir esta análise?"
                      description="O resultado e o currículo otimizado desta vaga serão removidos."
                      onConfirm={() => remove(a)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
