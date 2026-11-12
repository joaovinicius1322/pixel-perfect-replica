import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileText,
  Info,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Wand2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ScoreRing } from "@/components/analysis/ScoreRing";
import { StatusBadge } from "@/components/analysis/StatusBadge";
import { PageSkeleton } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { runAnalysis } from "@/lib/analysis.functions";
import { CATEGORY_LABEL, PRIORITY_LABEL, type KeywordResult, type Recommendation } from "@/lib/analysis-types";
import { formatDateTime } from "@/lib/format";
import { analysisQuery, type AnalysisFull } from "@/lib/queries";
import { scoreBand, SCORE_WEIGHTS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/analises/$id")({
  head: () => ({
    meta: [
      { title: "Resultado da análise — MatchCV AI" },
      { name: "description", content: "Score ATS, palavras-chave e recomendações para o seu currículo." },
      { property: "og:title", content: "Resultado da análise — MatchCV AI" },
      { property: "og:description", content: "Veja sua compatibilidade com a vaga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(analysisQuery(params.id));
    if (!data) throw notFound();
  },
  pendingComponent: PageSkeleton,
  notFoundComponent: () => (
    <div className="surface-card p-10 text-center">
      <h1 className="text-xl font-semibold">Análise não encontrada</h1>
      <p className="mt-2 text-sm text-muted-foreground">Ela pode ter sido excluída.</p>
      <Button asChild variant="soft" className="mt-6">
        <Link to="/analises">Ver minhas análises</Link>
      </Button>
    </div>
  ),
  component: AnalysisPage,
});

function AnalysisPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(analysisQuery(id));
  if (!data) return null;
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3 text-muted-foreground">
          <Link to="/analises">
            <ArrowLeft /> Minhas análises
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{data.job_title}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {data.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="size-3.5" /> {data.company}
                </span>
              )}
              {data.resume && (
                <span className="flex items-center gap-1">
                  <FileText className="size-3.5" /> {data.resume.file_name}
                </span>
              )}
              <span>{formatDateTime(data.created_at)}</span>
              <StatusBadge status={data.status} />
            </p>
          </div>
          {data.status === "completed" && (
            <Button asChild variant="hero" size="lg">
              <Link to="/analises/$id/otimizar" params={{ id: data.id }}>
                <Wand2 /> Otimizar currículo
              </Link>
            </Button>
          )}
        </div>
      </div>
      {data.status === "completed" ? <Results a={data} /> : <NotReady a={data} />}
    </div>
  );
}

function NotReady({ a }: { a: AnalysisFull }) {
  const queryClient = useQueryClient();
  const analyze = useServerFn(runAnalysis);
  const [busy, setBusy] = useState(a.status === "processing" ? false : false);
  const retry = async () => {
    setBusy(true);
    const result = await analyze({ data: { analysisId: a.id } });
    await queryClient.invalidateQueries({ queryKey: ["analyses"] });
    setBusy(false);
    if (result.ok) toast.success("Análise concluída!");
    else toast.error(result.error);
  };
  const failed = a.status === "failed";
  return (
    <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
      <div className={cn("grid size-14 place-items-center rounded-2xl", failed ? "bg-destructive-soft text-destructive" : "bg-lilac text-primary")}>
        {busy ? <Loader2 className="size-6 animate-spin" /> : failed ? <AlertTriangle className="size-6" /> : <Loader2 className="size-6 animate-spin" />}
      </div>
      <h2 className="mt-5 text-lg font-semibold">{busy ? "Analisando…" : failed ? "A análise não foi concluída" : "Análise em processamento"}</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        {busy
          ? "Isso costuma levar de 20 a 60 segundos."
          : failed
            ? a.error_message ?? "Ocorreu um erro inesperado."
            : "Se a análise foi interrompida, você pode reiniciá-la."}
      </p>
      {!busy && (
        <Button variant="hero" className="mt-6" onClick={retry}>
          <RefreshCw /> {failed ? "Tentar novamente" : "Reiniciar análise"}
        </Button>
      )}
    </div>
  );
}

function Results({ a }: { a: AnalysisFull }) {
  const score = a.score ?? 0;
  const band = scoreBand(score);
  const d = a.details;
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section aria-labelledby="score-title" className="surface-card flex flex-col items-center bg-gradient-soft p-6 text-center">
          <h2 id="score-title" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            Score ATS
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="Como o score é calculado" className="text-muted-foreground hover:text-primary">
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Média ponderada: {SCORE_WEIGHTS.keywords * 100}% palavras-chave, {SCORE_WEIGHTS.skills * 100}% habilidades,{" "}
                {SCORE_WEIGHTS.experience * 100}% experiência e {SCORE_WEIGHTS.education * 100}% formação. A cobertura de palavras-chave é
                verificada diretamente no texto do seu currículo.
              </TooltipContent>
            </Tooltip>
          </h2>
          <ScoreRing score={score} className="mt-4" />
          <p
            className={cn(
              "mt-4 font-semibold",
              band.tone === "success" && "text-success-ink",
              band.tone === "warning" && "text-warning-ink",
              band.tone === "danger" && "text-destructive-ink",
            )}
          >
            {band.label}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{band.description}</p>
          {a.summary && <p className="mt-4 rounded-xl bg-surface/80 p-3 text-left text-sm leading-6">{a.summary}</p>}
        </section>

        <section aria-labelledby="dims-title" className="surface-card p-6">
          <h2 id="dims-title" className="font-semibold">Análise detalhada</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Dimension label="Palavras-chave" score={a.keyword_score} rationale={d ? `${d.keywords.matched} de ${d.keywords.total} termos relevantes da vaga aparecem no currículo (ponderado pela importância).` : ""} />
            <Dimension label="Habilidades" score={a.skills_score} rationale={d?.skills.rationale ?? ""} />
            <Dimension label="Experiência" score={a.experience_score} rationale={d?.experience.rationale ?? ""} />
            <Dimension label="Formação" score={a.education_score} rationale={d?.education.rationale ?? ""} emptyLabel="Não exigida pela vaga" />
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <KeywordCard title="Palavras-chave encontradas" icon={CheckCircle2} tone="success" items={a.matched_keywords} empty="Nenhuma palavra-chave da vaga foi encontrada no currículo." />
        <KeywordCard title="Palavras-chave ausentes" icon={XCircle} tone="danger" items={a.missing_keywords} empty="Ótimo! Seu currículo cobre todas as palavras-chave identificadas." />
      </div>

      {d && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ListCard title="Pontos fortes" icon={ThumbsUp} items={d.strengths} tone="success" />
          <ListCard title="Oportunidades de melhoria" icon={TrendingUp} items={d.improvements} tone="warning" />
        </div>
      )}

      <section aria-labelledby="recs-title" className="space-y-3">
        <h2 id="recs-title" className="flex items-center gap-2 text-lg font-semibold">
          <Lightbulb className="size-5 text-primary" /> Recomendações
        </h2>
        {a.recommendations.map((r, i) => (
          <RecommendationCard key={i} r={r} defaultOpen={i === 0} />
        ))}
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-glow p-6 text-primary-foreground md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="size-5" /> Pronto para otimizar?
            </h2>
            <p className="mt-1 text-sm opacity-85">Revise sugestões de reescrita, aceite o que fizer sentido e baixe seu PDF.</p>
          </div>
          <Button asChild size="lg" variant="outline" className="border-transparent text-primary-deep hover:bg-lilac hover:text-primary-deep">
            <Link to="/analises/$id/otimizar" params={{ id: a.id }}>
              <Wand2 /> Otimizar currículo
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Dimension({ label, score, rationale, emptyLabel }: { label: string; score: number | null; rationale: string; emptyLabel?: string }) {
  const tone = score === null ? null : scoreBand(score).tone;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{score === null ? <span className="font-normal text-muted-foreground">{emptyLabel ?? "—"}</span> : score}</p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-lilac" role="progressbar" aria-label={label} aria-valuenow={score ?? 0} aria-valuemin={0} aria-valuemax={100}>
        {score !== null && (
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700",
              tone === "success" && "bg-success",
              tone === "warning" && "bg-warning",
              tone === "danger" && "bg-destructive",
            )}
            style={{ width: `${score}%` }}
          />
        )}
      </div>
      {rationale && <p className="mt-2 text-xs leading-5 text-muted-foreground">{rationale}</p>}
    </div>
  );
}

function KeywordCard({
  title,
  icon: Icon,
  tone,
  items,
  empty,
}: {
  title: string;
  icon: typeof CheckCircle2;
  tone: "success" | "danger";
  items: KeywordResult[];
  empty: string;
}) {
  return (
    <section className="surface-card p-6">
      <div className="flex items-center justify-between">
        <h2 className={cn("flex items-center gap-2 font-semibold", tone === "success" ? "text-success-ink" : "text-destructive-ink")}>
          <Icon className="size-5" /> {title}
        </h2>
        <span className="text-sm tabular-nums text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {items.map((k) => (
            <li key={k.term}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="rounded-full">
                    <Badge
                      variant={tone === "success" ? "success" : k.importance === "alta" ? "danger" : "warning"}
                      className="px-3 py-1 text-[13px]"
                    >
                      {k.term}
                      {k.importance === "alta" && <span className="sr-only"> (importância alta)</span>}
                    </Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {CATEGORY_LABEL[k.category]} · Importância {PRIORITY_LABEL[k.importance].toLowerCase()}
                  {k.matchedAs && k.matchedAs !== k.term ? ` · encontrado como “${k.matchedAs}”` : ""}
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
      {tone === "danger" && items.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Vermelho: requisito de alta importância · Amarelo: desejável. Inclua apenas termos que correspondam à sua experiência real.
        </p>
      )}
    </section>
  );
}

function ListCard({ title, icon: Icon, items, tone }: { title: string; icon: typeof ThumbsUp; items: string[]; tone: "success" | "warning" }) {
  return (
    <section className="surface-card p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className={cn("size-5", tone === "success" ? "text-success" : "text-warning")} /> {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3 text-sm leading-6">
            <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", tone === "success" ? "bg-success" : "bg-warning")} />
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecommendationCard({ r, defaultOpen }: { r: Recommendation; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="surface-card overflow-hidden">
      <CollapsibleTrigger className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-accent/50">
        <Badge variant={r.priority === "alta" ? "danger" : r.priority === "media" ? "warning" : "lilac"}>Prioridade {PRIORITY_LABEL[r.priority].toLowerCase()}</Badge>
        <span className="flex-1 font-medium">{r.title}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-4 border-t border-border p-5 md:grid-cols-3">
          <Field label="Problema identificado" text={r.problem} />
          <Field label="Por que isso importa" text={r.why_it_matters} />
          <Field label="Como melhorar" text={r.how_to_improve} />
        </div>
        {r.rewrite_suggestion && (
          <div className="mx-5 mb-5 rounded-xl border border-primary/20 bg-lilac/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sugestão de reescrita</p>
            <p className="mt-1.5 text-sm leading-6">{r.rewrite_suggestion}</p>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function Field({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm leading-6">{text}</p>
    </div>
  );
}
