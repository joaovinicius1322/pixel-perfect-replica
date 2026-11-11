import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, FileText, History, Sparkles, Trophy } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AnalysisRow } from "@/components/analysis/AnalysisRow";
import { EmptyState, PageSkeleton } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { firstName, formatDate } from "@/lib/format";
import { analysesQuery, profileQuery, resumesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Visão geral — MatchCV AI" },
      { name: "description", content: "Acompanhe suas análises de currículo e seu score ATS médio." },
      { property: "og:title", content: "Visão geral — MatchCV AI" },
      { property: "og:description", content: "Seu painel de análises de currículo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(analysesQuery()),
      context.queryClient.ensureQueryData(resumesQuery()),
      context.queryClient.ensureQueryData(profileQuery()),
    ]),
  pendingComponent: PageSkeleton,
  component: Overview,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function Overview() {
  const { data: analyses } = useSuspenseQuery(analysesQuery());
  const { data: resumes } = useSuspenseQuery(resumesQuery());
  const { data: profile } = useSuspenseQuery(profileQuery());

  const completed = analyses.filter((a) => a.status === "completed" && a.score !== null);
  const avg = completed.length ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length) : null;
  const best = completed.length ? Math.max(...completed.map((a) => a.score ?? 0)) : null;
  const now = new Date();
  const thisMonth = analyses.filter((a) => {
    const d = new Date(a.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const chart = completed
    .slice(0, 10)
    .reverse()
    .map((a) => ({ name: formatDate(a.created_at), score: a.score, vaga: a.job_title }));

  const name = firstName(profile?.full_name);

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">{greeting()}{name ? "," : ""}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{name ?? "Bem-vindo"} 👋</h1>
      </div>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-glow p-6 text-primary-foreground shadow-float md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            <p className="flex items-center gap-2 text-sm font-medium opacity-90">
              <Sparkles className="size-4" /> Nova análise
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Compare seu currículo com uma nova vaga</h2>
            <p className="mt-2 text-sm opacity-85">Envie o arquivo, cole a descrição e receba seu score ATS com recomendações práticas.</p>
          </div>
          <Button asChild size="lg" variant="outline" className="border-transparent text-primary-deep hover:bg-lilac hover:text-primary-deep">
            <Link to="/nova-analise">
              Começar análise <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section aria-label="Estatísticas" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={BarChart3} label="Score médio" value={avg !== null ? String(avg) : "—"} hint="Entre análises concluídas" />
        <Stat icon={Trophy} label="Melhor score" value={best !== null ? String(best) : "—"} hint="Sua maior compatibilidade" />
        <Stat icon={History} label="Análises" value={String(analyses.length)} hint={`${thisMonth} neste mês`} />
        <Stat icon={FileText} label="Currículos" value={String(resumes.length)} hint="Arquivos salvos" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Evolução do score</h2>
            <span className="text-xs text-muted-foreground">Últimas {chart.length} análises</span>
          </div>
          {chart.length >= 2 ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--elev-card)", fontSize: 12 }}
                    formatter={(v) => [v, "Score"]}
                    labelFormatter={(_, p) => (p?.[0]?.payload as { vaga?: string } | undefined)?.vaga ?? ""}
                  />
                  <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} fill="url(#scoreFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="grid h-60 place-items-center rounded-xl bg-muted/60 px-6 text-center text-sm text-muted-foreground">
              Conclua pelo menos duas análises para ver a evolução do seu score.
            </p>
          )}
        </section>

        <section className="surface-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Últimas análises</h2>
            {analyses.length > 0 && (
              <Link to="/analises" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            )}
          </div>
          {analyses.length === 0 ? (
            <EmptyState
              icon={History}
              title="Nenhuma análise ainda"
              text="Sua primeira análise aparecerá aqui."
              action={
                <Button asChild variant="soft">
                  <Link to="/nova-analise">Fazer primeira análise</Link>
                </Button>
              }
            />
          ) : (
            <div className="-mx-2">
              {analyses.slice(0, 5).map((a) => (
                <AnalysisRow key={a.id} a={a} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof BarChart3; label: string; value: string; hint: string }) {
  return (
    <div className="surface-card p-4 md:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
