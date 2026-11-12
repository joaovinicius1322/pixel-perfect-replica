# MatchCV AI

Aplicação web para análise e otimização de currículos com base em descrições de vagas e critérios de sistemas ATS.

## Acesse o projeto

- **Aplicação publicada:** [seu-curriculo-gio.lovable.app](https://seu-curriculo-gio.lovable.app/ )
- **Repositório no GitHub:** [github.com/joaovinicius1322/pixel-perfect-replica](https://github.com/joaovinicius1322/pixel-perfect-replica )

## Sobre o projeto

O MatchCV AI foi desenvolvido como uma solução para um problema comum em processos seletivos: currículos com boas experiências que não chegam ao recrutador porque são filtrados por um sistema ATS antes mesmo de serem avaliados por uma pessoa.

ATS significa *Applicant Tracking System*. Esses sistemas analisam currículos automaticamente e procuram palavras-chave, competências, experiências e informações relacionadas à descrição da vaga.

A proposta da aplicação é ajudar o candidato a entender como o currículo se relaciona com uma oportunidade específica, identificar pontos de melhoria e organizar melhor suas informações profissionais.

## Problema resolvido

Muitas pessoas enviam o mesmo currículo para várias vagas, sem adaptar o conteúdo às exigências de cada oportunidade. Como consequência, o documento pode não apresentar palavras-chave importantes ou não destacar experiências relevantes.

O MatchCV AI ajuda o usuário a:

- Comparar o currículo com uma descrição de vaga;
- Identificar palavras-chave encontradas;
- Encontrar termos relevantes que ainda não aparecem no currículo;
- Entender o nível de compatibilidade com a vaga;
- Receber sugestões de melhoria;
- Reescrever partes do currículo com mais clareza;
- Gerar uma versão mais organizada e compatível com sistemas ATS.

A aplicação não deve inventar informações profissionais. Seu objetivo é melhorar a forma como experiências verdadeiras são apresentadas.

## Funcionalidades principais

- Análise de compatibilidade entre currículo e vaga;
- Identificação de palavras-chave;
- Exibição de pontos fortes e oportunidades de melhoria;
- Sugestões de otimização do currículo;
- Reescrita de trechos profissionais;
- Organização do currículo em formato mais amigável para ATS;
- Interface responsiva para desktop, tablet e celular;
- Exportação do currículo otimizado em PDF;
- Experiência visual inspirada em produtos SaaS modernos.

## Como a análise funciona

O fluxo principal da aplicação acontece em algumas etapas:

1. O usuário acessa a aplicação.
2. Insere ou envia seu currículo.
3. Cola a descrição completa da vaga desejada.
4. A aplicação compara as informações do currículo com os requisitos da vaga.
5. São identificadas as palavras-chave presentes nos dois textos.
6. Também são destacados termos relevantes da vaga que não aparecem no currículo.
7. O sistema apresenta uma pontuação ou indicador de compatibilidade.
8. A análise mostra pontos fortes, possíveis melhorias e recomendações.
9. O usuário pode revisar e ajustar o conteúdo sugerido.
10. O currículo final pode ser exportado em PDF.

A análise deve servir como apoio à decisão do candidato. Uma palavra-chave ausente não significa necessariamente que a pessoa não possui aquela competência. Ela pode apenas não ter informado essa experiência no currículo.

## Regra de integridade das informações

Uma das principais regras do projeto é preservar a veracidade das informações.

A aplicação pode:

- Melhorar a clareza dos textos;
- Corrigir a organização das informações;
- Reescrever frases;
- Destacar experiências já existentes;
- Adaptar o vocabulário à vaga quando houver relação real;
- Sugerir termos para que o usuário avalie se são verdadeiros.

A aplicação não deve:

- Inventar experiências profissionais;
- Criar empresas ou cargos fictícios;
- Inventar certificações;
- Criar formações acadêmicas inexistentes;
- Adicionar competências que o usuário não possui;
- Aumentar artificialmente o tempo de experiência;
- Criar resultados ou métricas que não foram informados.

Essa regra é importante para que a otimização do currículo seja estratégica, mas continue ética e fiel à trajetória do candidato.

## Mega prompt utilizado

O desenvolvimento inicial foi orientado por um mega prompt com instruções sobre o objetivo do produto, as telas, o fluxo de análise, a identidade visual e as regras de funcionamento.

O prompt solicitava a criação de uma aplicação SaaS chamada MatchCV AI, com:

- Landing page;
- Dashboard;
- Tela de nova análise;
- Comparação entre currículo e vaga;
- Score de compatibilidade;
- Palavras-chave encontradas e ausentes;
- Recomendações de melhoria;
- Editor de currículo;
- Exportação em PDF;
- Histórico de análises;
- Responsividade;
- Acessibilidade;
- Componentes baseados em React, TypeScript, Tailwind CSS, shadcn/ui e Lucide Icons;
- Preservação obrigatória da veracidade das informações profissionais.

A orientação visual inicial utilizava uma identidade moderna, com tons de roxo, branco, lilás, verde e vermelho para estados de sucesso e alerta. Também foram definidos cards com bordas suaves, espaçamento generoso, tipografia moderna e microinterações discretas.

## Evolução do mega prompt

Depois da primeira geração da aplicação, o prompt foi refinado para melhorar a qualidade visual e a experiência de uso.

### Primeira versão

A primeira versão estava concentrada na construção da estrutura geral do produto. Ela definia:

- A proposta da aplicação;
- As páginas principais;
- O fluxo de análise;
- O cálculo da compatibilidade;
- As sugestões de melhoria;
- A exportação do currículo;
- A estrutura de backend;
- A responsividade;
- A acessibilidade;
- A regra de não inventar informações.

### Versão refinada

Na segunda versão, o foco passou a ser o refinamento da interface. O objetivo era transformar a aplicação em um SaaS mais elegante, organizado e profissional.

Foram acrescentadas orientações para:

- Melhorar a hierarquia visual;
- Criar uma sidebar mais limpa;
- Organizar a topbar;
- Refinar os cards de métricas;
- Melhorar a tabela de análises;
- Criar uma tela de nova análise mais objetiva;
- Tornar a página de resultados mais clara;
- Utilizar uma experiência de edição inspirada em ferramentas como Notion;
- Reduzir gradientes, sombras e elementos decorativos;
- Padronizar botões, inputs, badges, tabelas e estados de carregamento;
- Criar microinterações mais discretas;
- Melhorar a experiência em dispositivos móveis;
- Preparar a aplicação para um futuro modo escuro.

A principal mudança foi sair de uma aparência genérica de dashboard e buscar uma interface mais refinada, com inspiração em produtos como Linear, Stripe e Notion.

## Ajustes realizados depois da primeira geração

Após a primeira versão, foram solicitados ajustes para melhorar a apresentação e a usabilidade da aplicação.

Os principais objetivos desses ajustes foram:

- Tornar o layout mais limpo;
- Melhorar o espaçamento entre os elementos;
- Criar uma hierarquia mais clara entre títulos, subtítulos e informações;
- Padronizar as cores;
- Reduzir o excesso de elementos visuais;
- Melhorar a apresentação do score ATS;
- Organizar melhor as palavras-chave encontradas e ausentes;
- Refinar a tela de resultados;
- Deixar a navegação mais próxima de um produto SaaS profissional;
- Garantir que os componentes mantivessem uma linguagem visual consistente;
- Melhorar a adaptação da interface para telas menores.

Esses ajustes foram importantes porque a primeira versão priorizava a estrutura e as funcionalidades. A segunda etapa teve como foco a qualidade visual, a clareza da navegação e a percepção de profissionalismo.

## Tecnologias e ferramentas

O projeto foi desenvolvido com apoio das seguintes tecnologias e ferramentas:

- React;
- TypeScript;
- Tailwind CSS;
- shadcn/ui;
- Lucide Icons;
- Lovable;
- GitHub.

## Design da aplicação

A identidade visual utiliza uma abordagem de SaaS moderno e minimalista.

Os principais elementos visuais incluem:

- Fundo claro;
- Superfícies brancas;
- Tons de roxo como cor de destaque;
- Lilás para estados ativos e áreas de apoio;
- Verde para indicar compatibilidade e sucesso;
- Cores de alerta utilizadas com moderação;
- Tipografia moderna;
- Cards com bordas discretas;
- Espaçamento baseado em múltiplos de 4 pixels;
- Microinterações rápidas e suaves;
- Layout responsivo.

A intenção é transmitir confiança, clareza, tecnologia e profissionalismo sem deixar a interface visualmente poluída.

## Exemplo de uso

Um exemplo de utilização seria:

1. O candidato acessa a aplicação.
2. Cola seu currículo.
3. Cola a descrição de uma vaga.
4. Inicia a análise de compatibilidade.
5. Confere o score ATS.
6. Analisa as palavras-chave encontradas.
7. Verifica os termos relevantes que ainda não aparecem no currículo.
8. Lê as recomendações de melhoria.
9. Ajusta o currículo com base em suas experiências reais.
10. Exporta a versão final em PDF.

A ferramenta não substitui a avaliação do candidato nem garante aprovação em um processo seletivo. Ela funciona como um apoio para tornar o currículo mais claro, organizado e alinhado à oportunidade desejada.

## Publicação

A aplicação foi publicada utilizando o Lovable e pode ser acessada pelo endereço:

[https://seu-curriculo-gio.lovable.app/](https://seu-curriculo-gio.lovable.app/ )

O código-fonte foi exportado para este repositório do GitHub:

[https://github.com/joaovinicius1322/pixel-perfect-replica](https://github.com/joaovinicius1322/pixel-perfect-replica )

## Segurança

Nenhuma chave de API, token, senha ou credencial privada deve ser versionada neste repositório.

Antes de publicar o projeto, é importante verificar:

- Se não existem arquivos `.env` versionados;
- Se nenhuma chave aparece no código;
- Se tokens não foram inseridos diretamente nos componentes;
- Se as credenciais estão configuradas apenas no ambiente apropriado;
- Se os arquivos citados neste README existem no repositório;
- Se a aplicação publicada pode ser acessada pelo endereço informado.

## Status do projeto

Projeto desenvolvido como parte de um desafio prático de criação de aplicações com inteligência artificial e desenvolvimento visual.

O MatchCV AI foi pensado para evoluir futuramente com recursos como:

- Login de usuários;
- Histórico persistente de análises;
- Armazenamento seguro de currículos;
- Exportação em DOCX;
- Dashboard de evolução;
- Especialização por área profissional;
- Integração mais avançada com modelos de inteligência artificial;
- Melhorias de SEO e descoberta da aplicação.

## Autor

Desenvolvido por **João Vinícius**.
