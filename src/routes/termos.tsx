import { createFileRoute } from "@tanstack/react-router";

import { PublicPage, SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — MatchCV AI" },
      { name: "description", content: "Condições de uso da plataforma MatchCV AI de análise e otimização de currículos." },
      { property: "og:title", content: "Termos de uso — MatchCV AI" },
      { property: "og:description", content: "Condições de uso da plataforma MatchCV AI." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <PublicPage title="Termos de uso" intro="Ao usar o MatchCV AI, você concorda com as condições abaixo.">
          <section>
            <h2>Uso da plataforma</h2>
            <p>O MatchCV AI oferece análises e sugestões para apoiar sua candidatura. As análises são estimativas e não garantem aprovação em processos seletivos.</p>
          </section>
          <section>
            <h2>Veracidade das informações</h2>
            <p>Você é responsável pelas informações do seu currículo. A plataforma foi projetada para não inventar experiências, cargos, formações ou resultados, e só inclui palavras-chave que você confirmar como verdadeiras.</p>
          </section>
          <section>
            <h2>Conta</h2>
            <p>Mantenha suas credenciais em segurança. Você pode encerrar o uso e excluir seus dados quando quiser.</p>
          </section>
        </PublicPage>
      </main>
      <SiteFooter />
    </div>
  ),
});
