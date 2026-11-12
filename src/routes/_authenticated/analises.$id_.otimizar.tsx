import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  CircleHelp,
  Download,
  Loader2,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { PageSkeleton } from "@/components/app/AppShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { generateOptimization } from "@/lib/analysis.functions";
import type { Optimization, OptimizationItem } from "@/lib/analysis-types";
import { buildFinalResume, finalItemText, optimizationProgress, type FinalResume } from "@/lib/optimization";
import { analysisQuery } from "@/lib/queries";
import { downloadResumePdf } from "@/lib/resume-pdf";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/analises/$id_/otimizar")({
  head: () => ({
    meta: [
      { title: "Otimizar currículo — MatchCV AI" },
      { name: "description", content: "Revise sugestões de reescrita e exporte seu currículo otimizado em PDF." },
      { property: "og:title", content: "Otimizar currículo — MatchCV AI" },
      { property: "og:description", content: "Reescrita guiada e exportação em PDF compatível com ATS." },
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
  component: OptimizePage,
});

function OptimizePage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(analysisQuery(id));
  const queryClient = useQueryClient();
  const generate = useServerFn(generateOptimization);
  const [generating, setGenerating] = useState(false);

  if (!data) return null;

  const run = async () => {
    setGenerating(true);
    const result = await generate({ data: { analysisId: id } });
    if (result.ok) {
      await queryClient.invalidateQueries({ queryKey: ["analyses", id] });
      toast.success("Sugestões geradas. Revise cada uma antes de exportar.");
    } else toast.error(result.error);
    setGenerating(false);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3 text-muted-foreground">
          <Link to="/analises/$id" params={{ id }}>
            <ArrowLeft /> Voltar à análise
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Otimizar currículo</h1>
            <p className="mt-1.5 text-muted-foreground">Para a vaga: {data.job_title}</p>
          </div>
          {data.optimization && !generating && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <RefreshCw /> Gerar novamente
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Gerar novas sugestões?</AlertDialogTitle>
                  <AlertDialogDescription>
                    As decisões e edições que você fez nesta versão serão substituídas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={run}>Gerar novamente</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-primary/20 bg-lilac/40 p-4 text-sm">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>
          <strong>Compromisso com a veracidade:</strong> as sugestões só reorganizam e esclarecem o que já está no seu currículo.
          Nada de cargos, empresas, certificações ou métricas inventadas. Quando algo não puder ser comprovado, perguntamos a você.
        </p>
      </div>

      {generating ? (
        <div className="surface-card flex flex-col items-center px-6 py-16 text-center" role="status" aria-live="polite">
          <Loader2 className="size-8 animate-spin text-primary" />
          <h2 className="mt-4 font-semibold">Preparando sugestões de reescrita…</h2>
          <p className="mt-1 text-sm text-muted-foreground">Isso pode levar até um minuto.</p>
        </div>
      ) : data.optimization ? (
        <Editor key={data.optimization.generated_at} analysisId={id} initial={data.optimization} original={data.resume?.extracted_text ?? ""} jobTitle={data.job_title} />
      ) : (
        <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-lilac text-primary">
            <Sparkles className="size-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Gere sugestões para esta vaga</h2>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            A IA organiza seu currículo por seções e propõe melhorias de redação. Você decide o que aceitar.
          </p>
          <Button variant="hero" size="lg" className="mt-6" onClick={run}>
            <Sparkles /> Gerar sugestões
          </Button>
        </div>
      )}
    </div>
  );
}

function Editor({ analysisId, initial, original, jobTitle }: { analysisId: string; initial: Optimization; original: string; jobTitle: string }) {
  const queryClient = useQueryClient();
  const [opt, setOpt] = useState<Optimization>(initial);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaving("saving");
    const t = setTimeout(async () => {
      const { error } = await supabase.from("analyses").update({ optimization: opt as unknown as Json }).eq("id", analysisId);
      if (error) {
        setSaving("error");
        toast.error("Não foi possível salvar suas alterações.");
      } else {
        setSaving("saved");
        queryClient.setQueryData(["analyses", analysisId], (prev: unknown) =>
          prev && typeof prev === "object" ? { ...(prev as object), optimization: opt } : prev,
        );
      }
    }, 700);
    return () => clearTimeout(t);
  }, [opt, analysisId, queryClient]);

  const updateItem = (itemId: string, patch: Partial<OptimizationItem>) =>
    setOpt((o) => ({
      ...o,
      sections: o.sections.map((s) => ({ ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })),
    }));

  const acceptAll = () =>
    setOpt((o) => ({
      ...o,
      sections: o.sections.map((s) => ({
        ...s,
        items: s.items.map((i) => (i.suggested && i.decision === "pending" ? { ...i, decision: "accepted" } : i)),
      })),
    }));

  const progress = optimizationProgress(opt);
  const final = useMemo(() => buildFinalResume(opt), [opt]);
  const pct = progress.total ? Math.round((progress.reviewed / progress.total) * 100) : 100;

  const download = async () => {
    const slug = jobTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w]+/g, "-").toLowerCase().slice(0, 40);
    await downloadResumePdf(final, `curriculo-${slug || "otimizado"}.pdf`);
    toast.success("PDF baixado.");
  };

  return (
    <Tabs defaultValue="review" className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TabsList className="w-full overflow-x-auto md:w-auto">
          <TabsTrigger value="review">Revisar sugestões</TabsTrigger>
          <TabsTrigger value="original">Currículo original</TabsTrigger>
          <TabsTrigger value="final">Resultado final</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {saving === "saving" ? "Salvando…" : saving === "saved" ? "Alterações salvas" : saving === "error" ? "Erro ao salvar" : ""}
          </span>
          <Button variant="hero" onClick={download}>
            <Download /> Baixar currículo em PDF
          </Button>
        </div>
      </div>

      <TabsContent value="review" className="mt-0 space-y-5">
        <div className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Sugestões revisadas</span>
              <span className="tabular-nums text-muted-foreground">
                {progress.reviewed} de {progress.total}
              </span>
            </div>
            <Progress value={pct} className="mt-2 h-2" aria-label="Progresso da revisão" />
          </div>
          <Button variant="soft" onClick={acceptAll} disabled={progress.reviewed === progress.total}>
            <CheckCheck /> Aceitar pendentes
          </Button>
        </div>

        {opt.confirmations.length > 0 && (
          <section className="surface-card border-warning/30 p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <CircleHelp className="size-5 text-warning" /> Confirme antes de incluir
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Estes termos são relevantes para a vaga, mas não aparecem comprovados no seu currículo. Marque apenas o que for verdade —
              eles serão adicionados à seção de competências.
            </p>
            <ul className="mt-4 space-y-2">
              {opt.confirmations.map((c) => (
                <li key={c.id}>
                  <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-accent", c.confirmed ? "border-success/40 bg-success-soft/50" : "border-border")}>
                    <Checkbox
                      checked={c.confirmed}
                      onCheckedChange={(v) =>
                        setOpt((o) => ({ ...o, confirmations: o.confirmations.map((x) => (x.id === c.id ? { ...x, confirmed: v === true } : x)) }))
                      }
                      className="mt-0.5"
                    />
                    <span className="text-sm">
                      <span className="font-medium">{c.keyword}</span>
                      <span className="block text-muted-foreground">{c.question}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        {opt.sections.map((s) => (
          <section key={s.id} className="surface-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">{s.title}</h2>
            <div className="mt-4 space-y-3">
              {s.items.map((item) => (
                <ItemEditor key={item.id} item={item} onChange={(patch) => updateItem(item.id, patch)} />
              ))}
            </div>
          </section>
        ))}
      </TabsContent>

      <TabsContent value="original" className="mt-0">
        <div className="surface-card p-6">
          <p className="mb-4 text-sm text-muted-foreground">Texto extraído do arquivo que você enviou.</p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6">{original}</pre>
        </div>
      </TabsContent>

      <TabsContent value="final" className="mt-0">
        <ResumePreview resume={final} />
      </TabsContent>
    </Tabs>
  );
}

function ItemEditor({ item, onChange }: { item: OptimizationItem; onChange: (patch: Partial<OptimizationItem>) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(finalItemText(item));
  const textCls = cn(
    "text-sm leading-6",
    item.kind === "heading" && "font-semibold",
    item.kind === "subheading" && "text-muted-foreground",
  );
  const bullet = item.kind === "bullet" ? "• " : "";

  if (editing)
    return (
      <div className="rounded-xl border border-primary/40 p-3">
        <label className="sr-only" htmlFor={`edit-${item.id}`}>Editar texto</label>
        <Textarea id={`edit-${item.id}`} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} autoFocus />
        <div className="mt-2 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
          <Button
            size="sm"
            onClick={() => {
              onChange({ edited: draft.trim() || null, decision: item.suggested ? "accepted" : item.decision });
              setEditing(false);
            }}
          >
            Salvar edição
          </Button>
        </div>
      </div>
    );

  if (!item.suggested)
    return (
      <div className="group flex items-start gap-2 rounded-lg px-2 py-1 hover:bg-muted/60">
        <p className={cn(textCls, "flex-1")}>
          {bullet}
          {finalItemText(item)}
          {item.edited && <Badge variant="lilac" className="ml-2 align-middle">Editado</Badge>}
        </p>
        <Button size="icon-sm" variant="ghost" aria-label="Editar texto" className="opacity-60 group-hover:opacity-100" onClick={() => { setDraft(finalItemText(item)); setEditing(true); }}>
          <Pencil />
        </Button>
      </div>
    );

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        item.decision === "accepted" && "border-success/40 bg-success-soft/40",
        item.decision === "rejected" && "border-border bg-muted/40",
        item.decision === "pending" && "border-primary/25 bg-lilac/30",
      )}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Original</p>
          <p className={cn(textCls, "mt-1", item.decision === "accepted" && "text-muted-foreground line-through decoration-muted-foreground/40")}>
            {bullet}
            {item.original}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-3" /> {item.edited ? "Sua versão" : "Sugestão"}
          </p>
          <p className={cn(textCls, "mt-1", item.decision === "rejected" && "text-muted-foreground line-through decoration-muted-foreground/40")}>
            {bullet}
            {item.edited ?? item.suggested}
          </p>
        </div>
      </div>
      {item.reason && <p className="mt-3 text-xs text-muted-foreground">Por quê: {item.reason}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {item.decision === "pending" ? (
          <>
            <Button size="sm" variant="default" onClick={() => onChange({ decision: "accepted" })}>
              <Check /> Aceitar
            </Button>
            <Button size="sm" variant="outline" onClick={() => onChange({ decision: "rejected", edited: null })}>
              <X /> Rejeitar
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => onChange({ decision: "pending", edited: null })}>
            <Undo2 /> Desfazer ({item.decision === "accepted" ? "aceita" : "rejeitada"})
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => { setDraft(item.edited ?? item.suggested ?? item.original); setEditing(true); }}>
          <Pencil /> Editar
        </Button>
      </div>
    </div>
  );
}

function ResumePreview({ resume }: { resume: FinalResume }) {
  return (
    <div className="mx-auto max-w-[800px] rounded-lg border border-border bg-surface p-8 shadow-float sm:p-12" aria-label="Pré-visualização do currículo final">
      {resume.name && <h2 className="text-2xl font-bold tracking-normal">{resume.name}</h2>}
      {resume.contact && <p className="mt-1 text-sm text-muted-foreground">{resume.contact}</p>}
      {resume.sections.map((s, i) => (
        <section key={i} className="mt-6">
          <h3 className="border-b border-border pb-1 text-sm font-bold uppercase tracking-wide">{s.title}</h3>
          <div className="mt-3 space-y-1.5">
            {s.items.map((it, j) =>
              it.kind === "heading" ? (
                <p key={j} className="pt-2 text-sm font-semibold">{it.text}</p>
              ) : it.kind === "subheading" ? (
                <p key={j} className="text-sm text-muted-foreground">{it.text}</p>
              ) : it.kind === "bullet" ? (
                <p key={j} className="flex gap-2 text-sm leading-6"><span aria-hidden>•</span><span>{it.text}</span></p>
              ) : (
                <p key={j} className="text-sm leading-6">{it.text}</p>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
