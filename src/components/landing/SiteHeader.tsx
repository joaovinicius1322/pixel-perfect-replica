import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

const NAV = [
  { href: "/#funcionalidades", label: "Funcionalidades" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#beneficios", label: "Benefícios" },
];

export function SiteHeader() {
  const { session } = useSession();
  const [open, setOpen] = useState(false);

  const cta = session ? (
    <Button asChild variant="hero">
      <Link to="/painel">Ir para o painel</Link>
    </Button>
  ) : (
    <Button asChild variant="hero">
      <Link to="/auth" search={{ mode: "signup" }}>
        Começar gratuitamente
      </Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {!session && (
            <Button asChild variant="ghost">
              <Link to="/auth" search={{ mode: "signin" }}>
                Entrar
              </Link>
            </Button>
          )}
          {cta}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <div className="animate-fade-up border-t border-border/60 bg-surface px-5 pb-5 pt-3 md:hidden">
          <nav aria-label="Principal (móvel)" className="flex flex-col">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 text-base text-foreground hover:bg-accent">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            {!session && (
              <Button asChild variant="outline">
                <Link to="/auth" search={{ mode: "signin" }}>
                  Entrar
                </Link>
              </Button>
            )}
            {cta}
          </div>
        </div>
      )}
    </header>
  );
}
