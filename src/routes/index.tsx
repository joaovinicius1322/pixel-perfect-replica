import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  ClipboardPaste,
  Download,
  FileSearch,
  FileUp,
  Gauge,
  KeyRound,
  Lightbulb,
  PenLine,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";

import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MatchCV AI — Otimize seu currículo para sistemas ATS" },
      {
        name: "description",
        content:
          "Compare seu currículo com a vaga, descubra palavras-chave ausentes, receba seu score ATS e gere uma versão otimizada em PDF com IA.",
      },
      { property: "og:title", content: "MatchCV AI — Seu currículo merece passar pela primeira seleção" },
      {
        property: "og:description",
        content: "Análise de compatibilidade ATS, palavras-chave e reescrita inteligente do currículo — sem inventar informações.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Gauge, title: "Score ATS real", text: "Pontuação de 0 a 100 calculada a partir das palavras-chave, habilidades, experiência e formação." },
  { icon: KeyRound, title: "Palavras-chave", text: "Veja o que a vaga pede, o que seu currículo já tem e o que está faltando." },
  { icon: Lightbulb, title: "Recomendações", text: "Problema, impacto e como corrigir — com sugestões de reescrita baseadas no que você escreveu." },
  { icon: Wand2, title: "Reescrita guiada", text: "Aceite, rejeite ou edite cada sugestão. Você mantém o controle do texto final." },
  { icon: ShieldCheck, title: "Veracidade garantida", text: "A IA nunca inventa cargos, empresas, certificações ou métricas. Em dúvida, ela pergunta." },
  { icon: Download, title: "PDF compatível", text: "Exportação em coluna única, com texto selecionável e sem elementos que confundem o ATS." },
];

const STEPS = [
  { icon: FileUp, title: "Envie seu currículo", text: "PDF ou DOCX, guardado com segurança na sua conta." },
  { icon: ClipboardPaste, title: "Cole a descrição da vaga", text: "Quanto mais completa, mais precisa a análise." },
  { icon: FileSearch, title: "Receba sua análise", text: "Score, palavras-chave e análise detalhada em segundos." },
  { icon: PenLine, title: "Otimize seu currículo", text: "Revise sugestões e ajuste com suas próprias palavras." },
  { icon: Download, title: "Exporte seu PDF", text: "Baixe uma versão limpa, pronta para candidatura." },
];

const BENEFITS = [
  { icon: BrainCircuit, title: "Análise inteligente", text: "A IA entende o contexto da vaga, não só palavras soltas." },
  { icon: Target, title: "Sugestões práticas", text: "Ações claras, priorizadas pelo impacto na sua candidatura." },
  { icon: Gauge, title: "Otimização ATS", text: "Vocabulário e estrutura que os sistemas de triagem conseguem ler." },
  { icon: Sparkles, title: "Currículo personalizado", text: "Uma versão adaptada para cada vaga, sem perder a sua história." },
  { icon: Download, title: "Exportação profissional", text: "PDF com tipografia legível, margens adequadas e seções organizadas." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-hero" />
          <div className="pointer-events-none absolute inset-0 bg-grid" />
          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-primary/20 bg-surface/80 px-3 py-1 text-xs font-medium text-primary shadow-soft">
                <Sparkles className="size-3.5" /> Análise de currículo com inteligência artificial
              </span>
              <h1 className="mt-6 animate-fade-up text-balance text-4xl font-semibold leading-[1.05] tracking-tight [animation-delay:60ms] sm:text-5xl md:text-6xl">
                Seu currículo merece passar pela <span className="text-gradient">primeira seleção.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-pretty text-lg text-muted-foreground [animation-delay:120ms]">
                Descubra como seu currículo se compara à vaga desejada, identifique palavras-chave importantes e otimize
                sua candidatura com inteligência artificial.
              </p>
              <div className="mt-9 flex animate-fade-up flex-col justify-center gap-3 [animation-delay:180ms] sm:flex-row">
                <Button asChild variant="hero" size="lg">
                  <Link to="/nova-analise">
                    Analisar meu currículo <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#como-funciona">Como funciona</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Grátis para começar · Seus dados ficam privados na sua conta</p>
            </div>
            <div className="mt-16 animate-fade-up [animation-delay:260ms]">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Funcionalidades */}
        <section id="funcionalidades" className="scroll-mt-20 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <SectionHeading
              eyebrow="Funcionalidades"
              title="Tudo o que você precisa para uma candidatura mais forte"
              text="Da leitura do currículo à exportação do PDF final, cada etapa foi pensada para clareza e confiança."
            />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="surface-card group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-float">
                  <div className="grid size-11 place-items-center rounded-xl bg-lilac text-primary transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="scroll-mt-20 border-y border-border bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <SectionHeading eyebrow="Como funciona" title="Cinco passos até um currículo mais estratégico" />
            <ol className="mt-14 grid gap-6 md:grid-cols-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative">
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className="absolute left-14 right-0 top-6 hidden h-px bg-gradient-to-r from-primary/40 to-transparent md:block" />
                  )}
                  <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <s.icon className="size-5" />
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">Passo {i + 1}</p>
                  <h3 className="mt-1 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Benefícios */}
        <section id="beneficios" className="scroll-mt-20 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                align="left"
                eyebrow="Benefícios"
                title="Mais clareza para você, mais relevância para o recrutador"
                text="O MatchCV AI destaca o que você já tem de melhor e mostra exatamente onde agir — sempre com base em fatos reais da sua trajetória."
              />
            </div>
            <ul className="grid gap-3">
              {BENEFITS.map((b) => (
                <li key={b.title} className="surface-card flex gap-4 p-5 transition-colors hover:border-primary/30">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-lilac text-primary">
                    <b.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-5 pb-24">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-glow px-6 py-16 text-center text-primary-foreground shadow-float md:py-20">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Transforme seu currículo em uma candidatura mais estratégica.
            </h2>
            <div className="relative mt-8">
              <Button asChild size="lg" variant="outline" className="border-transparent text-primary-deep hover:bg-lilac hover:text-primary-deep">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar agora <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  text?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-pretty text-muted-foreground">{text}</p>}
    </div>
  );
}
