# Portfólio de estudante de tecnologia — design

**Data:** 2026-08-15
**Status:** aprovado para planejamento

## Contexto e objetivo

Site de portfólio pessoal de um estudante de tecnologia com experiência como
assistente de ensino em IA e trabalhos freelance, e de um a três projetos
próprios.

O site tem dois objetivos, nesta ordem de prioridade:

1. **Converter recrutador em contato.** Público primário são recrutadores e
   tech leads. Em trinta segundos a página precisa comunicar competência e
   oferecer caminhos óbvios de contato (currículo, LinkedIn, GitHub, e-mail).
2. **Ser vitrine técnica e pessoal.** Mostrar quem a pessoa é, o que construiu
   e o que sabe fazer — com personalidade suficiente para não parecer mais um
   template.

Um objetivo derivado, mas real: o código do site é ele mesmo uma amostra de
trabalho. Qualidade de implementação faz parte da entrega.

## Decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| Formato | Página única (one-pager), uma por idioma | Com 1–3 projetos, múltiplas páginas ficariam vazias. Toda a informação em uma rolagem. |
| Stack | Next.js (App Router) + TypeScript strict + Tailwind | O que o público-alvo espera ver; SSG resolve SEO; deploy trivial na Vercel. |
| Renderização | Estático (SSG), sem backend | Não há formulário nem dado dinâmico. Zero superfície de falha e custo zero. |
| Idiomas | Bilíngue PT/EN, sem biblioteca de i18n | Alcança vaga nacional e internacional; o volume de texto não justifica dependência. |
| Contato | Apenas links diretos | Sem formulário: nenhuma chave de API, nenhum anti-spam, nada para quebrar. |
| Conteúdo | Arquivos TypeScript versionados | Edição por push, histórico no git, tipagem impede tradução faltando. |
| Estética | Minimalista editorial | Envelhece bem, foca no conteúdo, não parece template. |
| Cor de destaque | Verde-musgo escuro (tom mais claro no tema escuro) | Maturidade e referência sutil a terminal, sem cair no visual "hacker". |

## Não-objetivos

Fora de escopo nesta versão, deliberadamente:

- Blog ou seção de artigos.
- Páginas de detalhe por projeto (o modelo de dados as prevê; ver "Evolução").
- CMS, banco de dados, autenticação, analytics de terceiros.
- Formulário de contato.
- Animações elaboradas, biblioteca de animação, testes de screenshot.

## Arquitetura

### Estrutura de arquivos

```
src/
  app/
    layout.tsx              # <html>, fontes, metadata base
    page.tsx                # redirect permanente para /pt
    [locale]/
      layout.tsx            # valida locale, define lang do documento
      page.tsx              # monta as seções na ordem definida
    sitemap.ts
    robots.ts
  content/
    types.ts                # Localized, Project, Experience, Skill, Education…
    profile.ts
    experience.ts
    projects.ts
    skills.ts
    education.ts
    ui.ts                   # rótulos de interface traduzidos
  components/
    sections/               # Hero, About, Experience, Projects, Skills,
                            # Education, Contact — um arquivo por seção
    ui/                     # Section, Card, Tag, LocaleSwitch, ThemeToggle,
                            # SkipLink
  lib/
    i18n.ts                 # Locale, locales, t(), isLocale()
    date.ts                 # formatPeriod() por idioma
tests/
  e2e/                      # Playwright
public/
  cv/curriculo-pt.pdf
  cv/resume-en.pdf
  images/projects/
```

**Regra estrutural:** nenhum componente contém texto literal voltado ao
usuário. Componentes recebem dados de `content/` e decidem apenas a
apresentação. Adicionar um projeto é editar um arquivo de conteúdo, nunca um
componente.

### Rotas

- `/` → redirect permanente para `/pt`.
- `/[locale]` com `generateStaticParams()` retornando `pt` e `en`, e
  `dynamicParams = false`. Qualquer outro segmento resulta em 404.
- Não há outras rotas.

### Internacionalização

```ts
export const locales = ['pt', 'en'] as const
export type Locale = (typeof locales)[number]
export type Localized = { pt: string; en: string }
export const t = (value: Localized, locale: Locale): string => value[locale]
```

Todo texto de conteúdo é `Localized`. Como o tipo exige as duas chaves, uma
tradução faltando falha o `typecheck`/`build` — não chega a produção. Isso
inclui textos `alt` de imagem.

O seletor de idioma é um link para a mesma página no outro idioma, preservando
o `hash` atual, de modo que trocar de idioma no meio da página não devolve o
visitante ao topo.

### Modelo de dados

```ts
type Period = { start: string; end: string | null }  // 'YYYY-MM'; null = atual

type Profile = {
  name: string
  headline: Localized          // ex.: "Estudante de X · Foco em IA e web"
  bio: Localized[]             // parágrafos da seção Sobre
  location: Localized
  intent: Localized            // o que está buscando agora
  links: {
    github: string
    linkedin: string
    email: string
    whatsapp?: string
  }
  cv: { pt: string; en: string }   // caminhos dos PDFs em /public/cv
}

type Experience = {
  id: string
  role: Localized
  organization: string
  organizationUrl?: string
  period: Period
  highlights: Localized[]      // 2 a 3 bullets de impacto
  tech?: string[]
}

type Project = {
  slug: string
  title: string
  summary: Localized           // 1–2 linhas, aparece no card
  description: Localized       // parágrafo
  tech: string[]
  role: Localized
  period: Period
  links: { repo?: string; demo?: string }
  image?: { src: string; alt: Localized }
  featured: boolean
  caseStudy?: Localized        // não renderizado nesta versão
}

type SkillLevel = 'core' | 'used' | 'learning'
type SkillGroup = { level: SkillLevel; items: string[] }

type Education = {
  institution: string
  degree: Localized
  period: Period
  status: Localized            // ex.: "em andamento"
}

type Certificate = {
  title: Localized
  issuer: string
  date: string                 // 'YYYY-MM'
  credentialUrl?: string
}
```

Datas são armazenadas em formato neutro (`YYYY-MM`) e formatadas por idioma em
`lib/date.ts`; palavras como "atual"/"present" vêm de `content/ui.ts`. Listas
de experiência, projetos e certificados são ordenadas do mais recente para o
mais antigo, calculado a partir de `period.start`.

Os arquivos de conteúdo nascem com dados reais fornecidos pela pessoa dona do
portfólio. Onde um dado ainda não existir no momento da implementação, o campo
recebe um valor marcado com o prefixo `PENDENTE:` para ficar visível e ser
capturado pelos testes de invariante de conteúdo.

## Seções da página

Ordem definida pelo que o recrutador procura primeiro, não por cronologia.

1. **Hero** — nome, headline concreta, duas ou três linhas de posicionamento e
   ações: baixar CV, GitHub, LinkedIn, e-mail. Seletor PT/EN e alternador de
   tema no topo. Sem animação de digitação.
2. **Sobre** — dois parágrafos em primeira pessoa (origem, o que puxou para
   tecnologia e IA, para onde quer ir), encerrando com a frase de intenção
   (`profile.intent`).
3. **Experiência** — lista vertical, mais recente primeiro; cargo, organização,
   período e 2–3 bullets de impacto com resultado, não descrição de tarefa.
4. **Projetos** — cards com screenshot, resumo, tags de tecnologia e links para
   repositório e demo. Layout largo e detalhado, dimensionado para poucos
   projetos; sem grade com lacunas.
5. **Habilidades** — três grupos: *uso em projetos* (`core`), *já usei*
   (`used`), *estudando agora* (`learning`). Sem porcentagem, barra de
   progresso ou estrelas.
6. **Formação e certificados** — curso, instituição, período e status;
   certificados com link de verificação quando houver.
7. **Contato / rodapé** — repete os links do topo; e-mail visível como texto
   selecionável, não apenas ícone.

Elementos transversais: seletor de idioma, alternador de tema, link "pular para
o conteúdo", e o CV correspondente ao idioma ativo acessível do topo e do
rodapé.

## Design system

**Tipografia.** Serifada de display para títulos (Instrument Serif ou
Newsreader), sans neutra para corpo (Inter), monoespaçada para tags de
tecnologia, períodos e números. Corpo em 17–18px com entrelinha folgada;
parágrafos limitados a 65–72 caracteres. Fontes carregadas por `next/font`,
self-hosted, sem requisição externa e sem salto de layout.

**Cor.** Tokens CSS definidos uma vez e usados em ambos os temas: fundo
quase-branco levemente quente, tinta escura (nunca preto puro), cinza de
metadado, e um único destaque verde-musgo — mais claro no tema escuro para
preservar contraste. O destaque é reservado a links, foco de teclado e
elementos em evidência.

**Layout.** Coluna única, página até ~1100px. Seções separadas por espaço
vertical generoso e uma linha de 1px — não por blocos de fundo alternado. Cards
com borda fina e mudança de fundo no hover, sem elevação pesada.

**Tema escuro.** Respeita `prefers-color-scheme` por padrão, com alternador que
persiste a escolha. Aplicado antes da pintura para não piscar.

**Movimento.** Uma única entrada: fade com deslocamento curto quando o elemento
chega na viewport, uma vez por elemento. Hover suave em links e cards. Tudo
desativado sob `prefers-reduced-motion`.

**Mobile-first.** Desenhado primeiro para o celular, onde o link chega vindo do
LinkedIn: coluna única, escala tipográfica reduzida proporcionalmente, alvos de
toque adequados nos botões de contato.

## Acessibilidade

Requisito de entrega, não item opcional:

- HTML semântico (`header`, `main`, `section` com título acessível, `nav`,
  `footer`), um único `h1`, hierarquia de headings sem pulos.
- Contraste mínimo AA em ambos os temas, verificado nos tokens de cor.
- Foco de teclado sempre visível; navegação completa por teclado.
- `alt` em todas as imagens, traduzido junto com o restante do conteúdo.
- Link "pular para o conteúdo" como primeiro elemento focável.
- Alternadores de idioma e tema com rótulo acessível e estado comunicado.

## SEO

- Metadata por idioma: title, description e Open Graph.
- `hreflang` ligando `/pt` e `/en` como versões alternativas, com
  `x-default` apontando para `/pt`.
- `sitemap.ts` e `robots.ts` gerados, incluindo as duas rotas.
- JSON-LD do tipo `Person` com nome, formação, habilidades e perfis, para que o
  buscador entenda que a página é sobre a pessoa.
- Imagem de Open Graph própria, para o link renderizar corretamente quando
  compartilhado no LinkedIn.

## Performance

Site estático, sem biblioteca de animação, fontes self-hosted, imagens via
`next/image` em formato moderno com dimensões declaradas.

Meta verificável: Lighthouse ≥ 95 nas quatro categorias, em mobile, nas duas
rotas.

## Estratégia de testes

Vitest + Testing Library para unidade e componente; Playwright para o smoke
test. Proporcional ao risco real de um site estático — o erro provável aqui é
conteúdo malformado, não lógica complexa.

1. **Invariantes de conteúdo** (maior valor): slugs de projeto únicos; todo
   projeto com ao menos um link; períodos válidos e coerentes (`start` anterior
   a `end`); nenhum campo de texto vazio ou contendo o prefixo `PENDENTE:`;
   caminhos de CV e de imagem apontando para arquivos existentes em `public/`.
2. **Helpers**: `t()`, `isLocale()` (incluindo locale inválido) e
   `formatPeriod()` nos dois idiomas, com e sem data final.
3. **Componentes de seção**: cada seção renderiza a partir de fixtures — título
   presente, itens listados, `href` correto nos links — incluindo o caso de
   lista vazia (por exemplo, nenhum certificado) sem quebrar o layout.
4. **Smoke end-to-end**: abre `/pt`, confere a presença das seções, troca para
   `/en`, confere que o conteúdo mudou de idioma e que o CV servido é o
   correspondente.

Excluído: testes de screenshot pixel a pixel, que só gerariam ruído enquanto o
visual evolui.

## Deploy

- Repositório git com Vercel conectada: cada push gera preview, `main` publica
  em produção.
- Verificação antes do merge (GitHub Actions e localmente): `typecheck`,
  `lint`, `test`.
- Domínio: `.vercel.app` inicialmente; domínio próprio é passo posterior e
  opcional.

## Critérios de pronto

- `build`, `typecheck`, `lint` e todos os testes passando.
- Rotas `/pt` e `/en` geradas estaticamente; `/` redirecionando; locale
  inválido resultando em 404.
- Conteúdo real presente nos dois idiomas, sem nenhum `PENDENTE:` restante.
- CV disponível nos dois idiomas, servido conforme o idioma ativo.
- Lighthouse ≥ 95 nas quatro categorias, em mobile.
- Contraste AA conferido nos temas claro e escuro.
- Navegação completa por teclado, com foco visível.

## Evolução prevista

O caminho natural, quando houver um projeto com história para contar: preencher
`caseStudy` e criar a rota `/[locale]/projetos/[slug]` gerada estaticamente a
partir dos projetos que tiverem esse campo. Nenhum dado precisa ser
reestruturado — apenas uma pasta de rota é adicionada.

Outras evoluções possíveis, fora do escopo atual: blog em MDX, seção de
depoimentos, domínio próprio.
