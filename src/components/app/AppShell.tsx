import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, History, LayoutDashboard, LogOut, Menu, PlusCircle, Settings } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/queries";

const NAV = [
  { to: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { to: "/nova-analise", label: "Nova análise", icon: PlusCircle },
  { to: "/analises", label: "Minhas análises", icon: History },
  { to: "/curriculos", label: "Meus currículos", icon: FileText },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Painel" className="flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to === "/painel" }}
          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-lilac data-[status=active]:text-lilac-foreground"
        >
          <item.icon className="size-[18px]" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function UserFooter() {
  const { data: profile } = useQuery(profileQuery());
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  };
  const initials = (profile?.full_name ?? profile?.email ?? "?")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{profile?.full_name ?? "Sua conta"}</p>
        <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
      </div>
      <Button variant="ghost" size="icon-sm" onClick={signOut} aria-label="Sair da conta">
        <LogOut />
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Logo to="/painel" className="px-2" />
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <UserFooter />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:hidden">
        <Logo to="/painel" />
        <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setOpen(true)}>
          <Menu />
        </Button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-5">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo to="/painel" />
          <div className="mt-8 flex-1">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <UserFooter />
        </SheetContent>
      </Sheet>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: typeof FileText; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-lilac text-primary">
        <Icon className="size-6" />
      </div>
      <h2 className="mt-5 text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-56 rounded-lg skeleton-shimmer" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
        ))}
      </div>
      <div className="h-72 rounded-xl skeleton-shimmer" />
    </div>
  );
}
