import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, FileText, Info, Loader2, ShieldCheck, Sparkles, UploadCloud, X } from "lucide-react";
import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { runAnalysis } from "@/lib/analysis.functions";
import { formatBytes, formatDate } from "@/lib/format";
import { resumesQuery } from "@/lib/queries";
import { extractResumeText, ResumeFileError, validateResumeFile } from "@/lib/resume-extract";
import { cn } from "@/lib/utils";

const MIN_JOB_CHARS = 150;
type FieldErrors = { file?: string | undefined; job?: string | undefined };

export const Route = createFileRoute("/_authenticated/nova-analise")({
  validateSearch: (search: Record<string, unknown>): { resume?: string } =>
    typeof search["resume"] === "string" ? { resume: search["resume"] } : {},
  head: () => ({
    meta: [
      { title: "Nova análise — MatchCV AI" },
      { name: "description", content: "Envie seu currículo e a descrição da vaga para receber seu score ATS." },
      { property: "og:title", content: "Nova análise — MatchCV AI" },
      { property: "og:description", content: "Compare seu currículo com a vaga desejada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewAnalysis,
});

const STEPS = [
  "Validando o arquivo",
  "Lendo o conteúdo do currículo",
  "Salvando com segurança na sua conta",
  "Analisando compatibilidade com IA",
] as const;

function NewAnalysis() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const analyze = useServerFn(runAnalysis);
  const { data: resumes = [] } = useQuery(resumesQuery());

  const [source, setSource] = useState<"upload" | "saved">(search.resume ? "saved" : "upload");
  const [file, setFile] = useState<File | null>(null);
  const [savedId, setSavedId] = useState<string>(search.resume ?? "");
  const [job, setJob] = useState("");
  const [company, setCompany] = useState("");
  const [step, setStep] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      await validateResumeFile(f);
      setFile(f);
      setErrors((e) => ({ ...e, file: undefined }));
    } catch (err) {
      setFile(null);
      setErrors((e) => ({ ...e, file: err instanceof Error ? err.message : "Arquivo inválido." }));
    }
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    void pickFile(e.dataTransfer.files[0]);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors = {};
    if (source === "upload" && !file) nextErrors.file = "Selecione seu currículo em PDF ou DOCX.";
    if (source === "saved" && !savedId) nextErrors.file = "Escolha um currículo salvo.";
    if (job.trim().length < MIN_JOB_CHARS)
      nextErrors.job = `Cole a descrição completa da vaga (mínimo de ${MIN_JOB_CHARS} caracteres).`;
    setErrors(nextErrors);
    if (nextErrors.file || nextErrors.job) return;

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Sua sessão expirou. Entre novamente.");

      let resumeId = savedId;
      if (source === "upload" && file) {
        setStep(0);
        const kind = await validateResumeFile(file);
        setStep(1);
        const text = await extractResumeText(file, kind);
        setStep(2);
        const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
        const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
          contentType:
            kind === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        if (upErr) throw new Error("Não foi possível salvar o arquivo. Tente novamente.");
        const { data: row, error: insErr } = await supabase
          .from("resumes")
          .insert({ user_id: userId, file_name: file.name, file_path: path, file_type: kind, file_size: file.size, extracted_text: text })
          .select("id")
          .single();
        if (insErr || !row) throw new Error("Não foi possível registrar o currículo.");
        resumeId = row.id;
      } else {
        setStep(2);
      }

      const { data: analysis, error: aErr } = await supabase
        .from("analyses")
        .insert({
          user_id: userId,
          resume_id: resumeId,
          job_description: job.trim(),
          company: company.trim() || null,
          status: "processing",
        })
        .select("id")
        .single();
      if (aErr || !analysis) throw new Error("Não foi possível iniciar a análise.");

      setStep(3);
      const result = await analyze({ data: { analysisId: analysis.id } });
      await queryClient.invalidateQueries({ queryKey: ["analyses"] });
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      if (result.ok) toast.success("Análise concluída!");
      else toast.error(result.error);
      navigate({ to: "/analises/$id", params: { id: analysis.id } });
    } catch (err) {
      setStep(null);
      const message = err instanceof ResumeFileError || err instanceof Error ? err.message : "Algo deu errado.";
      if (err instanceof ResumeFileError) setErrors({ file: message });
      toast.error(message);
    }
  };

  if (step !== null) return <Processing step={step} />;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Nova análise" description="Compare seu currículo com a vaga desejada em três passos." />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]" noValidate>
        <div className="space-y-6">
          <section className="surface-card p-5 md:p-6">
            <StepTitle n={1} title="Seu currículo" />
            <Tabs value={source} onValueChange={(v) => setSource(v as "upload" | "saved")} className="mt-4">
              {resumes.length > 0 && (
                <TabsList className="mb-4">
                  <TabsTrigger value="upload">Enviar arquivo</TabsTrigger>
                  <TabsTrigger value="saved">Usar currículo salvo</TabsTrigger>
                </TabsList>
              )}
              <TabsContent value="upload" className="mt-0">
                {file ? (
                  <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-lilac/50 p-4">
                    <div className="grid size-10 place-items-center rounded-lg bg-surface text-primary shadow-soft">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remover arquivo" onClick={() => setFile(null)}>
                      <X />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="resume-file"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/40 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-lilac/40 focus-within:border-primary",
                      dragging && "border-primary bg-lilac/60",
                      errors.file && "border-destructive/60",
                    )}
                  >
                    <div className="grid size-12 place-items-center rounded-2xl bg-surface text-primary shadow-soft">
                      <UploadCloud className="size-6" />
                    </div>
                    <p className="mt-4 font-medium">Arraste seu currículo ou clique para selecionar</p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF ou DOCX · até 10 MB</p>
                    <input
                      ref={inputRef}
                      id="resume-file"
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="sr-only"
                      aria-describedby={errors.file ? "file-error" : undefined}
                      onChange={(e) => void pickFile(e.target.files?.[0])}
                    />
                  </label>
                )}
              </TabsContent>
              <TabsContent value="saved" className="mt-0">
                <fieldset className="grid gap-2">
                  <legend className="sr-only">Currículos salvos</legend>
                  {resumes.map((r) => (
                    <label
                      key={r.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent",
                        savedId === r.id ? "border-primary bg-lilac/50" : "border-border",
                      )}
                    >
                      <input type="radio" name="saved" value={r.id} checked={savedId === r.id} onChange={() => setSavedId(r.id)} className="accent-primary" />
                      <FileText className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.file_name}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                    </label>
                  ))}
                </fieldset>
              </TabsContent>
            </Tabs>
            {errors.file && (
              <p id="file-error" role="alert" className="mt-2 text-sm text-destructive-ink">
                {errors.file}
              </p>
            )}
          </section>

          <section className="surface-card p-5 md:p-6">
            <StepTitle n={2} title="Descrição da vaga" />
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="job">Cole a descrição completa da vaga</Label>
              <Textarea
                id="job"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                rows={12}
                placeholder="Inclua responsabilidades, requisitos obrigatórios, diferenciais e ferramentas citadas…"
                aria-invalid={!!errors.job}
                aria-describedby="job-help"
                className="min-h-56 resize-y"
              />
              <div id="job-help" className="flex justify-between text-xs">
                <span className={errors.job ? "text-destructive-ink" : "text-muted-foreground"} role={errors.job ? "alert" : undefined}>
                  {errors.job ?? "Quanto mais completa, mais precisa será a análise."}
                </span>
                <span className="tabular-nums text-muted-foreground">{job.trim().length} caracteres</span>
              </div>
            </div>
          </section>

          <section className="surface-card p-5 md:p-6">
            <StepTitle n={3} title="Empresa" optional />
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="company">Nome da empresa</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex.: Nubank" className="h-11" maxLength={120} />
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="surface-card p-5">
            <h2 className="font-semibold">O que você vai receber</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              {["Score ATS de 0 a 100", "Palavras-chave encontradas e ausentes", "Análise de habilidades, experiência e formação", "Recomendações com sugestões de reescrita"].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" /> {t}
                </li>
              ))}
            </ul>
            <Button type="submit" variant="hero" size="lg" className="mt-5 w-full">
              <Sparkles /> Analisar compatibilidade
            </Button>
          </div>
          <div className="flex gap-3 rounded-xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            <p>
              Seu arquivo fica privado na sua conta. A IA nunca inventa informações.{" "}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex items-center gap-0.5 text-primary underline-offset-2 hover:underline">
                    Como o score é calculado <Info className="size-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  35% cobertura de palavras-chave da vaga, 30% habilidades, 25% experiência e 10% formação (quando a vaga exige).
                </TooltipContent>
              </Tooltip>
            </p>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Precisa organizar seus arquivos? <Link to="/curriculos" className="text-primary hover:underline">Meus currículos</Link>
          </p>
        </aside>
      </form>
    </div>
  );
}

function StepTitle({ n, title, optional }: { n: number; title: string; optional?: boolean }) {
  return (
    <h2 className="flex items-center gap-3 font-semibold">
      <span className="grid size-7 place-items-center rounded-full bg-lilac text-sm text-primary">{n}</span>
      {title}
      {optional && <span className="text-xs font-normal text-muted-foreground">(opcional)</span>}
    </h2>
  );
}

function Processing({ step }: { step: number }) {
  return (
    <div className="grid min-h-[70vh] place-items-center" role="status" aria-live="polite">
      <div className="surface-card w-full max-w-md p-8 text-center">
        <div className="relative mx-auto grid size-20 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
          <span className="relative grid size-16 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="size-7 animate-pulse" />
          </span>
        </div>
        <h1 className="mt-6 text-xl font-semibold">Analisando seu currículo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Isso costuma levar de 20 a 60 segundos. Não feche esta página.</p>
        <ol className="mt-8 space-y-3 text-left">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className={cn("flex items-center gap-3 text-sm", !done && !active && "text-muted-foreground")}>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border",
                    done && "border-success bg-success text-success-foreground",
                    active && "border-primary text-primary",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : active ? <Loader2 className="size-3.5 animate-spin" /> : <span className="size-1.5 rounded-full bg-border" />}
                </span>
                <span className={cn(active && "font-medium text-foreground")}>{label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
