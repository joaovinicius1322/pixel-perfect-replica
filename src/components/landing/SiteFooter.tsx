import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Análise inteligente de currículos para candidaturas mais estratégicas — sem inventar nada sobre você.
          </p>
        </div>
        <nav aria-label="Produto" className="space-y-3 text-sm">
          <h2 className="font-semibold text-foreground">Produto</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li><a className="hover:text-primary" href="/#funcionalidades">Funcionalidades</a></li>
            <li><a className="hover:text-primary" href="/#como-funciona">Como funciona</a></li>
            <li><a className="hover:text-primary" href="/#beneficios">Benefícios</a></li>
          </ul>
        </nav>
        <nav aria-label="Institucional" className="space-y-3 text-sm">
          <h2 className="font-semibold text-foreground">Institucional</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link className="hover:text-primary" to="/privacidade">Privacidade</Link></li>
            <li><Link className="hover:text-primary" to="/termos">Termos de uso</Link></li>
            <li><Link className="hover:text-primary" to="/contato">Contato</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} MatchCV AI. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

export function PublicPage({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
      {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
      <div className="mt-10 space-y-8 text-[15px] leading-7 text-foreground/90 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}
