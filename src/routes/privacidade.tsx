import { createFileRoute } from "@tanstack/react-router";

import { PublicPage, SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — MatchCV AI" },
      { name: "description", content: "Como o MatchCV AI coleta, usa e protege seus dados e currículos." },
      { property: "og:title", content: "Política de privacidade — MatchCV AI" },
      { property: "og:description", content: "Como protegemos seus dados e currículos." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <PublicPage title="Política de privacidade" intro="Seus currículos são pessoais. Tratamos cada arquivo com o cuidado que ele merece.">
          <section>
            <h2>Quais dados coletamos</h2>
            <ul>
              <li>Dados de conta: nome e e-mail.</li>
              <li>Currículos enviados (PDF ou DOCX) e o texto extraído deles.</li>
              <li>Descrições de vagas, análises geradas e versões otimizadas que você salvar.</li>
            </ul>
          </section>
          <section>
            <h2>Como usamos</h2>
            <p>Usamos seus dados exclusivamente para gerar análises de compatibilidade, recomendações e currículos otimizados. O conteúdo é processado por um serviço de inteligência artificial apenas para responder às suas solicitações.</p>
          </section>
          <section>
            <h2>Armazenamento e acesso</h2>
            <p>Os arquivos ficam em armazenamento privado vinculado à sua conta. Somente você, autenticado, pode acessá-los.</p>
          </section>
          <section>
            <h2>Exclusão</h2>
            <p>Você pode excluir análises e currículos a qualquer momento nas páginas “Minhas análises” e “Meus currículos”. A exclusão remove o arquivo e os dados associados.</p>
          </section>
        </PublicPage>
      </main>
      <SiteFooter />
    </div>
  ),
});
