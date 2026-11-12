import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — MatchCV AI" },
      { name: "description", content: "Defina uma nova senha para sua conta MatchCV AI." },
      { property: "og:title", content: "Nova senha — MatchCV AI" },
      { property: "og:description", content: "Defina uma nova senha para sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password.length < 8) {
      toast.error("Use pelo menos 8 caracteres.");
      return;
    }
    if (password !== String(form.get("confirm"))) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("O link expirou ou é inválido. Solicite um novo.");
      return;
    }
    toast.success("Senha atualizada com sucesso.");
    navigate({ to: "/painel", replace: true });
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
      <Logo className="mb-8" />
      <main className="surface-card w-full max-w-sm p-7">
        <h1 className="text-2xl font-semibold tracking-tight">Crie uma nova senha</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className="h-11" />
          </div>
          <Button type="submit" variant="hero" className="h-11 w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Salvar nova senha
          </Button>
        </form>
      </main>
    </div>
  );
}
