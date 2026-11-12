import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { PageHeader, PageSkeleton } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — MatchCV AI" },
      { name: "description", content: "Gerencie seu perfil, senha e sessão no MatchCV AI." },
      { property: "og:title", content: "Configurações — MatchCV AI" },
      { property: "og:description", content: "Gerencie sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery()),
  pendingComponent: PageSkeleton,
  component: Settings,
});

function Settings() {
  const { data: profile } = useSuspenseQuery(profileQuery());
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    const full_name = String(new FormData(e.currentTarget).get("name")).trim();
    setSavingName(true);
    const { error } = await supabase.from("profiles").upsert({ id: profile.id, full_name });
    setSavingName(false);
    if (error) {
      toast.error("Não foi possível salvar seu nome.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Perfil atualizado.");
  };

  const savePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const current = String(fd.get("current"));
    const password = String(fd.get("password"));
    if (password.length < 8) {
      toast.error("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password, current_password: current } as { password: string });
    setSavingPw(false);
    if (error) {
      toast.error("Não foi possível alterar a senha. Verifique a senha atual.");
      return;
    }
    form.reset();
    toast.success("Senha alterada.");
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  };

  return (
    <div className="animate-fade-up max-w-2xl">
      <PageHeader title="Configurações" description="Gerencie seus dados de conta." />
      <div className="space-y-6">
        <section className="surface-card p-6">
          <h2 className="font-semibold">Perfil</h2>
          <form onSubmit={saveName} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={profile?.email ?? ""} disabled className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" name="name" defaultValue={profile?.full_name ?? ""} required maxLength={120} className="h-11" />
            </div>
            <Button type="submit" disabled={savingName}>
              {savingName && <Loader2 className="animate-spin" />} Salvar perfil
            </Button>
          </form>
        </section>

        <section className="surface-card p-6">
          <h2 className="font-semibold">Alterar senha</h2>
          <p className="mt-1 text-sm text-muted-foreground">Se você entra com Google ou Lovable, não é necessário definir senha.</p>
          <form onSubmit={savePassword} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current">Senha atual</Label>
              <Input id="current" name="current" type="password" autoComplete="current-password" required className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="h-11" />
            </div>
            <Button type="submit" variant="outline" disabled={savingPw}>
              {savingPw && <Loader2 className="animate-spin" />} Alterar senha
            </Button>
          </form>
        </section>

        <section className="surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Sessão</h2>
            <p className="mt-1 text-sm text-muted-foreground">Encerrar a sessão neste dispositivo.</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut /> Sair da conta
          </Button>
        </section>
      </div>
    </div>
  );
}
