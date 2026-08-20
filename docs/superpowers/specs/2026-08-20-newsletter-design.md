# Newsletter de aprendizado em público — design

**Data:** 2026-08-20
**Status:** aprovado para planejamento
**Antecessor:** `2026-08-15-portfolio-estudante-tech-design.md`

## Contexto e objetivo

O site `yurioliveira.dev` hoje é um portfólio de página única, bilíngue, feito
em Next.js. Este documento descreve sua evolução: o site passa a ter duas
partes, e a Newsletter passa a ser a principal.

- **Newsletter** (`/pt`, `/en`) — o arquivo de textos. É a home.
- **Portfólio** (`/pt/portfolio`) — o one-pager atual, movido para uma rota
  própria e preservado como está.

O objetivo declarado da Newsletter é **registro de aprendizado em público**:
sucesso é consistência de publicação e um arquivo que o autor consulta depois.
Audiência e conversão são consequência, não meta. Toda decisão de design abaixo
foi tomada com esse critério — quando duas opções competiam, ganhou a que
reduz atrito para escrever e a que protege a leitura.

Os textos cobrem três frentes da vida do autor: o curso de Análise e
Desenvolvimento de Sistemas na Fatec Campinas, o trabalho como assistente de
ensino de IA no ibe.IA, e projetos próprios — hoje, um modelo de análise de
padrões para esportes e e-sports.

Um objetivo secundário e real: levar leitores interessados em IA para o
ibe.IA. Secundário significa que ele **nunca** se sobrepõe à leitura; a seção
"Ligação com o ibe.IA" define o limite exato.

## Decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| Modelo de publicação | Site próprio; e-mail é fase posterior | O autor é dono do conteúdo, do domínio e do design. RSS já é canal de distribuição real no v1. |
| Stack | Evoluir o Next.js existente | i18n, tema, tokens de design, testes e CI já funcionam. Migrar para outro gerador descartaria tudo isso em troca de ganho imperceptível num site de texto. |
| Formato dos textos | MDX em `src/content/posts/` | Permite fórmula, tabela, figura numerada e gráfico — a assinatura visual escolhida. Markdown puro não permitiria. |
| Fluxo de publicação | Arquivo novo, commit, push | Sem CMS, sem banco, sem painel. Versionado, e o deploy é automático. |
| Idiomas | PT e EN, com post podendo existir em um só | Alcance internacional sem obrigar tradução de tudo. |
| Taxonomia | Pilar fechado (1 por post) + tags livres (1–4) | Pilar é tipado e governa navegação e visual; tag livre nunca governa layout. |
| Home | Identidade curta + trilhas + destaques + arquivo | Recrutador se localiza em segundos; leitor recorrente rola para o conteúdo. Nenhuma seção "sobre mim" além do bloco de identidade. |
| Página de post | Coluna única + índice de seções fixo | Texto técnico longo se navega melhor com índice. Material de apoio fica no fluxo do texto. |
| Ligação com o ibe.IA | Bloco no fim do post, por pilar, opt-in por texto | Não interrompe a leitura, alcança o leitor mais qualificado, e nunca aparece sem o autor pedir. |
| Data do post | Somente no nome do arquivo | Fonte única de verdade; os arquivos ordenam cronologicamente no editor. |
| Busca e lista de e-mail | Fora do v1 | Busca só faz sentido com volume; lista de e-mail é um projeto próprio. Ver "Fases". |

## Não-objetivos

Fora de escopo no v1, deliberadamente:

- **Busca (`Ctrl+K`).** Exige índice e componente com estado. Com poucos textos
  é enfeite. Reavaliar por volta de trinta posts.
- **Lista de e-mail.** Provedor, dupla confirmação, LGPD, template, gestão de
  baixas — projeto próprio, com spec própria. Ver "Fases".
- **Páginas de detalhe por projeto.** O `/portfolio` já lista os projetos.
- **Biblioteca de gráficos.** Figura é SVG escrito à mão ou imagem, com legenda
  numerada. Gráfico interativo entra como ilha isolada se um post exigir.
- **Comentários, analytics de terceiros, autenticação, backend.**
- **Nome próprio para a newsletter.** Assina com o nome do autor. Dar nome
  depois é mudar uma constante de conteúdo.

## Modelo de conteúdo

### Duas dimensões, e por que são duas

**Pilar** é um enum fechado — `academico`, `ensino`, `projetos` — e todo post
tem exatamente um. É a taxonomia editorial: responde "de que parte da minha
vida isso veio". Sendo fechado e tipado, é seguro derivar dele navegação,
marcador visual e o bloco do ibe.IA.

**Tags** são livres e múltiplas (`estatistica`, `llms`, `n8n`, `esports`). É a
taxonomia de assunto e alimenta as páginas de tag. Tag livre não pode governar
layout — é exatamente por isso que as duas dimensões existem em vez de uma.

### Arquivos e nomes

```
src/content/posts/
  2026-08-12-regressao-linear-esports.pt.mdx
  2026-08-12-regressao-linear-esports.en.mdx
  2026-08-05-explicar-ia-para-25-mil-alunos.pt.mdx
```

O nome do arquivo obedece a `YYYY-MM-DD-<slug>.<locale>.mdx`. Nome fora desse
padrão quebra o build. Dele saem três informações:

- **A data**, e ela existe *só aqui* — não há campo `data` no frontmatter.
  Fonte única de verdade, sem risco de divergência, e os arquivos ordenam
  cronologicamente no editor.
- **O slug**, que forma a URL (`/pt/posts/regressao-linear-esports`). Trocar a
  data de um post renomeia o arquivo sem alterar a URL.
- **O idioma**, que decide em qual árvore de rotas o post aparece.

Versões PT e EN do mesmo texto se emparelham **pelo slug**, e podem ter datas
diferentes — traduzir semanas depois é o caso normal, não a exceção.

### Frontmatter

```yaml
---
titulo: Por que a regressão linear ainda ganha do meu modelo de e-sports
resumo: Três semanas afinando um gradient boosting para descobrir que um
  baseline de duas variáveis previa melhor. Esta é a autópsia.
pilar: projetos
tags: [estatistica, esports, machine-learning]
destaque: true
cta: ia-para-negocios
atualizado: 2026-08-19
---
```

`titulo`, `resumo`, `pilar` e `tags` são obrigatórios. `resumo` tem limite de
200 caracteres e é reaproveitado no arquivo, no RSS e na imagem de
compartilhamento — um resumo só, escrito uma vez. `destaque` (padrão `false`)
promove o post para a seção Destaques. `cta` (padrão: ausente) é opt-in e
identifica uma formação do ibe.IA. `atualizado` é opcional.

**Validação é falha de build, não aviso.** Pilar inexistente, tag fora de
`^[a-z0-9-]+$`, resumo estourado, `cta` desconhecido, título vazio: o build
falha. Isso estende ao conteúdo a regra que o projeto já aplica a traduções.

### Post que existe em um idioma só

É o caso esperado, não o erro. Quando um post não existe no idioma corrente:

- **Não** aparece nas listagens daquele idioma, nem no RSS daquele idioma.
- Se o leitor chegar pela URL, a página **não** devolve 404: mostra o título, o
  aviso "este texto existe apenas em português" traduzido para o idioma
  corrente, e o link para a versão que existe.
- A tag `hreflang` só declara os idiomas realmente disponíveis, e a URL
  canônica de cada versão aponta para si mesma.

## Arquitetura

### Estrutura

```
src/
  app/
    [locale]/
      page.tsx                    # Newsletter (home)
      portfolio/page.tsx          # o one-pager atual, movido
      posts/[slug]/page.tsx       # post
      tags/page.tsx               # índice de tags, com contagem
      tags/[tag]/page.tsx
      pilares/[pilar]/page.tsx    # `/en/pillars/...` chega aqui por rewrite
      index.xml/route.ts          # RSS do idioma
      opengraph-image.tsx         # já existe
      posts/[slug]/opengraph-image.tsx
    sitemap.ts                    # passa a incluir posts, tags e pilares
    robots.ts
  content/
    posts/*.mdx                   # os textos, e nada mais
    pilares.ts                    # rótulo e descrição de cada pilar (Localized)
    formacoes.ts                  # catálogo de formações do ibe.IA (Localized)
    ui.ts                         # ganha os rótulos novos de interface
  lib/
    posts.ts                      # descobre, valida, ordena, agrupa, emparelha
    mdx.tsx                       # pipeline de renderização + componentes MDX
    cta.ts                        # escolhe a formação e monta a UTM
    reading.ts                    # tempo de leitura
    routes.ts                     # tradução de segmento: pilares ↔ pillars
  components/
    archive/                      # PillarCards, ArchiveList, PostRow, StatRail
    post/                         # PostHeader, PostToc, PostBody, PostFooter,
                                  # Figura, Formula
```

### Duas regras estruturais

A primeira já existe no projeto e continua valendo: **nenhum componente contém
texto literal voltado ao usuário.** Componentes recebem dados e decidem apenas
apresentação.

A segunda é nova: **um único módulo toca o sistema de arquivos.** `posts.ts`
descobre, valida e devolve objetos `Post` prontos. Todo o resto recebe esses
objetos e não sabe de onde vieram — o que torna cada componente testável com
uma fixture, exatamente como `src/test/fixtures.ts` já faz para `Project` e
`Experience`.

### O que roda no navegador

Exatamente **um** componente cliente: `PostToc`, porque marcar a seção atual e
o progresso de leitura exige observar o scroll. Todo o resto é renderizado no
servidor, em tempo de build.

Duas consequências: o site preserva a leveza que tem hoje, e a superfície de
teste de estado fica limitada a um componente.

### Dependências novas

`gray-matter`, `next-mdx-remote`, `remark-math`, `remark-gfm`, `rehype-katex`,
`katex`, `rehype-slug`, `rehype-pretty-code` — oito.

(`remark-gfm` foi acrescentada durante o planejamento: sem ela o MDX não
entende tabela escrita em Markdown, e tabela é requisito da página de post.)

Todas rodam em tempo de build. A única que alcança o navegador é o CSS do
KaTeX (~23 KB comprimidos, com fontes sob demanda), e só nas páginas que
contêm fórmula. O realce de código e a compilação do MDX não enviam byte algum
ao cliente.

O risco assumido é uma atualização de Next major em que `next-mdx-remote`
demore a acompanhar. Mitigação estrutural: **todo o acoplamento com essa
biblioteca vive em `lib/mdx.tsx`** — trocá-la é mexer em um arquivo.

## Rotas

```
/                          → 308 para /pt                     (já existe)
/[locale]                  → Newsletter: identidade, trilhas, destaques, arquivo
/[locale]/posts/[slug]     → post
/[locale]/tags             → índice de tags com contagem
/[locale]/tags/[tag]       → posts da tag
/pt/pilares/[pilar]        → posts do pilar
/en/pillars/[pilar]        → idem, em inglês
/[locale]/portfolio        → o one-pager atual
/[locale]/index.xml        → RSS do idioma
```

`posts`, `tags` e `portfolio` se escrevem igual em português e em inglês, então
não precisam de tradução. **`pilares` é a única exceção**, e é a razão de
`lib/routes.ts` existir: um mapa de um par só, com um teste, mantendo a URL
inglesa legível para quem lê em inglês. O valor do pilar dentro da URL
(`academico`, `ensino`, `projetos`) **não** é traduzido — é a chave do enum, não
texto de interface.

**Compatibilidade:** hoje `/pt` serve o portfólio. Depois desta mudança, `/pt`
serve a Newsletter e o portfólio vive em `/pt/portfolio`. Nenhuma URL deixa de
responder; o conteúdo de `/pt` muda. `sitemap.ts` passa a listar posts, tags e
pilares dos dois idiomas.

## Design visual — direção "Intervalo"

**Esta seção substitui a identidade anterior.** A primeira versão do site usava
papel quente `#faf9f6`, uma serifada de alto contraste e fios de jornal — uma
combinação que, revisada com critério de design, se revelou o resultado
genérico que ferramentas de IA produzem por padrão, independente do assunto.
Foi trocada por uma direção derivada do assunto real: estatística.

A tese é **uma publicação que mostra a própria incerteza**.

### Cor: uma escala divergente, não uma cor de destaque

A paleta é uma escala divergente — frio, neutro, quente — que é o vocabulário
de quem lê gráfico de calibração. E ela **codifica algo verdadeiro**: os três
pilares ocupam os três pontos da escala, na ordem do abstrato ao aplicado.

| Token | Claro | Escuro | Papel |
|---|---|---|---|
| `papel` | `#f1f2f0` | `#14171a` | fundo, neutro frio — deliberadamente não creme |
| `tinta` | `#15171a` | `#e8eae8` | texto |
| `suave` | `#5c6269` | `#949b9f` | texto secundário; **também o polo neutro** |
| `fio` | `#d4d7d5` | `#262b2e` | régua, borda |
| `frio` | `#2b6a86` | `#6fb3ce` | polo frio; **pilar `academico`** |
| `quente` | `#9c4a6e` | `#d98aa8` | polo quente; **pilar `projetos`** |

O pilar `ensino` ocupa o meio da escala e usa `suave`. O mapeamento
pilar → polo vive num módulo único; nenhum componente escolhe cor de pilar por
conta própria.

### Tipografia: duas famílias, três papéis, nenhuma sem serifa

- **Newsreader** (variável, eixo óptico 6–72) carrega display E texto corrido.
  A mesma família se comporta de forma diferente em 34px e em 17px porque o
  eixo óptico é real, não uma simulação por peso.
- **IBM Plex Mono** carrega todo dado, rótulo, metadado e número.

O site não usa nenhuma fonte sem serifa. É uma restrição deliberada: dado é
monoespaçado, prosa é serifada, e não há terceira categoria.

Os tokens de fonte são nomeados por papel — `--font-display`, `--font-texto`,
`--font-dado` — e não por classificação tipográfica, porque `font-sans`
apontando para uma serifada seria um nome que mente.

### Assinatura: o eixo do tempo

O elemento pelo qual a home é lembrada é o **arquivo plotado como eixo do
tempo**: um traço por texto, posicionado pela data, colorido pelo pilar. A
densidade que o leitor enxerga *é* a cadência de publicação. Não é enfeite —
é o mesmo dado da listagem abaixo, em outra projeção.

Cada linha do arquivo carrega uma **barra de intervalo** cujo comprimento é o
tempo de leitura. Número tratado como grandeza, não como texto.

### Ritmo estrutural

O arquivo **não** usa fio entre linhas. Separar cada item com uma régua de um
pixel produz a densidade de jornal que é, ela mesma, um clichê de design
gerado. O ritmo vem do espaço, do rótulo de pilar acima do título e da barra
de intervalo à direita. Fio existe só sob o eixo do tempo e sob títulos de
seção.

### Ordem da home

1. **Identidade** — nome em display, três a quatro linhas, links para
   currículo, GitHub, LinkedIn e Portfólio.
2. **Eixo do tempo**, sob o título "Cadência", com legenda em monoespaçada:
   total de textos à esquerda, período à direita. O rótulo é "Cadência" e não
   "Arquivo" porque é o que o gráfico mostra de fato — densidade de publicação
   ao longo do tempo. "Arquivo" fica com a lista cronológica, que é o que esse
   nome descreve. Dois `h2` com o mesmo texto na mesma página seriam um sumário
   ambíguo para quem navega por cabeçalhos.
3. **Legenda da escala** — os três pilares como pontos da escala divergente,
   cada um linkando para sua página. Substitui os cartões de trilha da versão
   anterior: com o eixo do tempo acima, três cartões repetiam a mesma
   informação ocupando o dobro do espaço.
4. **Destaques**, com resumo.
5. **Arquivo cronológico** agrupado por mês.

Regras contra o problema de site recém-nascido continuam valendo: a legenda
mostra contagens reais desde o primeiro dia, e a barra de números exibe data
absoluta, nunca tempo relativo — o site é estático e um tempo relativo
congelaria no build.

### Página de post

Duas colunas no desktop, índice de seções à esquerda, texto à direita, com o
título antes do índice na ordem do DOM. O corpo mantém medida controlada,
fórmula em KaTeX, tabela com cabeçalho monoespaçado e números alinhados por
dígito, figura com legenda numerada, código com realce feito no build.

### Movimento

Praticamente nenhum. O `Reveal` já existente continua; nada novo é
acrescentado. A assinatura é o eixo, e uma assinatura basta.


## Ligação com o ibe.IA

O objetivo é levar leitores ao instituto sem que o site pareça anúncio — porque
um registro de aprendizado em público que parece publicidade perde a
credibilidade que é sua única razão de existir.

Três regras, e todas são verificadas por teste:

1. **Opt-in por texto.** O bloco só existe se o post declarar `cta` no
   frontmatter. Nunca é automático. Post sem `cta` não renderiza nada.
2. **Só no fim.** Nada no meio do corpo do texto, em nenhuma hipótese.
3. **Vínculo declarado.** O bloco sempre acompanha a divulgação de que o autor
   trabalha no instituto.

O catálogo de formações vive em `content/formacoes.ts`, com título e descrição
em `Localized`. `lib/cta.ts` resolve a formação e monta a URL com
`?utm_source=yurioliveira.dev&utm_medium=post&utm_campaign=<slug>` — os
parâmetros são montados por uma função única, nunca escritos à mão num post.

Além disso, o rodapé global do site traz uma linha permanente identificando o
vínculo. Isso é identidade, não campanha.

## Testes

Seguindo o padrão do projeto: teste ao lado do arquivo, fixtures em
`src/test/`, e o CI já existente rodando typecheck, lint, vitest, build e
Playwright.

**`posts.ts`** recebe a maior cobertura, porque é onde o erro é silencioso:
nome de arquivo fora do padrão falha; pilar inválido, tag malformada, resumo
estourado e `cta` desconhecido falham; ordenação por data decrescente;
agrupamento por ano e mês; emparelhamento PT/EN pelo slug, inclusive com datas
diferentes; post em um idioma só ausente das listagens do outro.

**`cta.ts`** verifica a UTM montada e — o teste que mais importa — que post sem
`cta` declarado **não** produz bloco algum. É a garantia automatizada de que o
site não vira anúncio por descuido.

**`reading.ts`** verifica o cálculo de tempo de leitura.

**`routes.ts`** verifica que `/en/pillars/projetos` e `/pt/pilares/projetos`
chegam ao mesmo conteúdo, e que a chave do pilar não é traduzida no caminho.

**Componentes de arquivo e de post** são testados com fixtures, como os atuais.
Inclui os dois casos de borda visual: cartão de trilha sem histórico suficiente
não renderiza o mini-gráfico, e a barra de números exibe data absoluta.

**`PostToc`**, único componente com estado, ganha teste de comportamento.

**E2E** ganha um caminho novo: abrir a home, entrar num post, confirmar que
fórmula, figura e índice renderizaram, e trocar de idioma permanecendo no mesmo
texto.

## Fases

**Fase 0 — três textos escritos antes de virar a home.** É a resposta ao risco
que a home carrega: trilhas com `00` e `01` e um arquivo de um mês só entregam
um site nascendo. Com três textos distribuídos entre os pilares, a estrutura se
sustenta. Não é código; é ordem de trabalho, e é a primeira tarefa do plano.

**Fase 1 — este documento.** Pipeline MDX, Newsletter, página de post, rodapé
de artigo, tags, pilares, portfólio movido, RSS, sitemap, imagens de
compartilhamento.

**Fase 2 — lista de e-mail.** Spec própria. Só depois de existir cadência de
publicação: lista sem conteúdo regular é dívida, não ativo.

**Fase 3 — busca.** Reavaliar por volta de trinta textos.

## Itens abertos

Nenhum bloqueia a implementação; todos precisam de verificação.

1. **Certificado TLS de `yurioliveira.dev`.** Durante este design, a conexão
   apresentou certificado emitido por um FortiGate (`CN=FGT60FTK24021761`), o
   que indica inspeção TLS na rede local. Precisa ser testado de fora dessa
   rede: se o erro persistir, é falha real de produção e tem prioridade sobre
   qualquer item deste documento.
2. **Apontamento do domínio na Vercel**, a confirmar antes do deploy.
3. **API de MDX no Next 16.** O `AGENTS.md` do projeto avisa que esta versão
   tem mudanças em relação ao conhecimento prévio do agente e manda consultar
   `node_modules/next/dist/docs/`. A forma de compilar MDX em Server Component
   é exatamente o tipo de API que muda entre versões: **verificar na
   documentação instalada é tarefa explícita do plano**, não suposição.

## Evolução prevista

Previsto pelo modelo de dados, fora do escopo atual: páginas de detalhe por
projeto, gráfico interativo como ilha isolada, e um quarto pilar caso a vida do
autor ganhe uma frente que não caiba nos três atuais.
