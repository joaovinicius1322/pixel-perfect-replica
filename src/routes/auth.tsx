import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { ProviderButtons } from "@/components/auth/ProviderButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/safe-redirect";

type Mode = "signin" | "signup";
const REDIRECT_KEY = "matchcv:post-auth-redirect";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string; mode?: Mode } => {
    const out: { redirect?: string; mode?: Mode } = {};
    if (typeof search["redirect"] === "string") out.redirect = search["redirect"];
    if (search["mode"] === "signup" || search["mode"] === "signin") out.mode = search["mode"];
    return out;
  },
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — MatchCV AI" },
      { name: "description", content: "Acesse sua conta MatchCV AI para analisar e otimizar seu currículo." },
      { property: "og:title", content: "Entrar — MatchCV AI" },
      { property: "og:description", content: "Acesse sua conta para analisar seu currículo com IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [forgot, setForgot] = useState(false);

  useEffect(() => {
    const finish = () => {
      const stored = sessionStorage.getItem(REDIRECT_KEY);
      sessionStorage.removeItem(REDIRECT_KEY);
      router.history.replace(safeRedirect(search.redirect ?? stored));
    };
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish();
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) finish();
    });
    return () => data.subscription.unsubscribe();
  }, [router, search.redirect]);

  const rememberRedirect = () => {
    if (search.redirect) sessionStorage.setItem(REDIRECT_KEY, safeRedirect(search.redirect));
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft /> Voltar
            </Link>
          </Button>
        </div>
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          {forgot ? (
            <ForgotPassword onBack={() => setForgot(false)} />
          ) : (
            <>
              <h1 className="text-3xl font-semibold tracking-tight">
                {mode === "signin" ? "Bem-vindo de volta" : "Crie sua conta"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Entre para acessar suas análises e currículos."
                  : "Comece a analisar seu currículo gratuitamente."}
              </p>
              <div className="mt-8">
                <ProviderButtons onBeforeRedirect={rememberRedirect} />
              </div>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> ou com e-mail <span className="h-px flex-1 bg-border" />
              </div>
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Criar conta</TabsTrigger>
                </TabsList>
                <TabsContent value="signin" className="mt-5">
                  <SignInForm onForgot={() => setForgot(true)} />
                </TabsContent>
                <TabsContent value="signup" className="mt-5">
                  <SignUpForm />
                </TabsContent>
              </Tabs>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                Ao continuar, você concorda com os{" "}
                <Link to="/termos" className="text-primary hover:underline">Termos de uso</Link> e a{" "}
                <Link to="/privacidade" className="text-primary hover:underline">Política de privacidade</Link>.
              </p>
            </>
          )}
        </main>
      </div>
      <aside className="relative hidden overflow-hidden bg-gradient-glow lg:block" aria-hidden>
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative flex h-full flex-col justify-end p-12 text-primary-foreground">
          <blockquote className="max-w-md text-2xl font-medium leading-snug tracking-tight">
            “Entendi em minutos o que faltava no meu currículo — e sem precisar inventar nada.”
          </blockquote>
          <p className="mt-4 text-sm opacity-80">Análise ATS, palavras-chave e reescrita guiada por IA.</p>
        </div>
      </aside>
    </div>
  );
}

function translateAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  if (m.includes("already registered")) return "Este e-mail já tem uma conta. Tente entrar.";
  if (m.includes("password")) return "A senha não atende aos requisitos mínimos (use 8+ caracteres).";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos.";
  return "Não foi possível concluir. Tente novamente.";
}

function SignInForm({ onForgot }: { onForgot: () => void }) {
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) toast.error(translateAuthError(error.message));
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="signin-email">E-mail</Label>
        <Input id="signin-email" name="email" type="email" autoComplete="email" required className="h-11" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Senha</Label>
          <button type="button" onClick={onForgot} className="text-xs text-primary hover:underline">
            Esqueci minha senha
          </button>
        </div>
        <Input id="signin-password" name="password" type="password" autoComplete="current-password" required className="h-11" />
      </div>
      <Button type="submit" variant="hero" className="h-11 w-full" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />} Entrar
      </Button>
    </form>
  );
}

function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    if (password.length < 8) {
      toast.error("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { full_name: String(form.get("name")).trim() },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(translateAuthError(error.message));
      return;
    }
    if (!data.session) setSentTo(email);
  };
  if (sentTo)
    return (
      <div className="surface-card p-6 text-center">
        <MailCheck className="mx-auto size-10 text-primary" />
        <h2 className="mt-3 font-semibold">Confirme seu e-mail</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enviamos um link para <strong className="text-foreground">{sentTo}</strong>. Abra-o para ativar sua conta.
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="signup-name">Nome completo</Label>
        <Input id="signup-name" name="name" autoComplete="name" required className="h-11" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">E-mail</Label>
        <Input id="signup-email" name="email" type="email" autoComplete="email" required className="h-11" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Senha</Label>
        <Input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} required className="h-11" />
        <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
      </div>
      <Button type="submit" variant="hero" className="h-11 w-full" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />} Criar conta
      </Button>
    </form>
  );
}

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(translateAuthError(error.message));
      return;
    }
    setSent(true);
  };
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar para o login
      </button>
      <h1 className="text-3xl font-semibold tracking-tight">Redefinir senha</h1>
      {sent ? (
        <p className="mt-3 text-sm text-muted-foreground">Se houver uma conta com este e-mail, você receberá um link para criar uma nova senha.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">E-mail</Label>
            <Input id="forgot-email" name="email" type="email" autoComplete="email" required className="h-11" />
          </div>
          <Button type="submit" variant="hero" className="h-11 w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Enviar link
          </Button>
        </form>
      )}
    </div>
  );
}
