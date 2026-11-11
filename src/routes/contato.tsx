import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { PublicPage, SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Button } from "@/components/ui/button";

const CONTACT_EMAIL = "contato@matchcv.ai";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — MatchCV AI" },
      { name: "description", content: "Fale com a equipe do MatchCV AI: dúvidas, sugestões e suporte." },
      { property: "og:title", content: "Contato — MatchCV AI" },
      { property: "og:description", content: "Fale com a equipe do MatchCV AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <PublicPage title="Contato" intro="Dúvidas, sugestões ou problemas com sua conta? Fale com a gente.">
          <div className="surface-card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <div className="grid size-12 place-items-center rounded-xl bg-lilac text-primary">
              <Mail className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">E-mail</p>
              <p className="text-muted-foreground">{CONTACT_EMAIL}</p>
            </div>
            <Button asChild variant="hero">
              <a href={`mailto:${CONTACT_EMAIL}`}>Enviar e-mail</a>
            </Button>
          </div>
        </PublicPage>
      </main>
      <SiteFooter />
    </div>
  ),
});
