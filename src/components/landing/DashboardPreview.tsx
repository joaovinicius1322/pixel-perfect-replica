import { CheckCircle2, FileText, Sparkles, XCircle } from "lucide-react";

import { ScoreRing } from "@/components/analysis/ScoreRing";
import { Badge } from "@/components/ui/badge";

// Illustrative product preview on the marketing page (not a user's result).
export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl" aria-label="Prévia ilustrativa do painel de análise" role="img">
      <div className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[40px] bg-gradient-glow opacity-20 blur-3xl" />
      <div className="surface-card overflow-hidden shadow-float">
        <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-warning/60" />
          <span className="size-2.5 rounded-full bg-success/60" />
          <span className="ml-3 text-xs text-muted-foreground">Análise · Product Designer Sênior</span>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[240px_1fr_1fr] md:p-6">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-gradient-soft p-5 text-center">
            <ScoreRing score={82} size={132} stroke={10} />
            <p className="mt-3 text-sm font-semibold">Alta compatibilidade</p>
            <p className="text-xs text-muted-foreground">Score ATS</p>
          </div>
          <div className="space-y-4 rounded-xl border border-border p-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-success-ink">
                <CheckCircle2 className="size-3.5" /> Palavras-chave encontradas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Figma", "Design System", "UX Research", "Prototipação", "Acessibilidade"].map((k) => (
                  <Badge key={k} variant="success">{k}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-destructive-ink">
                <XCircle className="size-3.5" /> Palavras-chave ausentes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Testes A/B", "Métricas de produto", "SaaS B2B"].map((k) => (
                  <Badge key={k} variant="danger">{k}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-1">
              {[
                ["Habilidades", 86],
                ["Experiência", 78],
                ["Formação", 90],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>{l}</span>
                    <span className="tabular-nums">{v}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-lilac">
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> Currículo otimizado
            </p>
            <div className="space-y-2.5 rounded-lg bg-muted/60 p-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <div className="h-2 w-28 rounded bg-foreground/70" />
              </div>
              <div className="h-1.5 w-full rounded bg-foreground/15" />
              <div className="h-1.5 w-5/6 rounded bg-foreground/15" />
              <div className="mt-3 h-1.5 w-20 rounded bg-primary/60" />
              <div className="rounded-md border border-primary/25 bg-lilac/70 p-2 text-[11px] leading-4 text-lilac-foreground">
                “Liderei a evolução do design system, reduzindo retrabalho entre squads.”
              </div>
              <div className="h-1.5 w-11/12 rounded bg-foreground/15" />
              <div className="h-1.5 w-4/6 rounded bg-foreground/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
