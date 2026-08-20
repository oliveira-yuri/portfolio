# Newsletter de aprendizado em público — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o portfólio de página única em um site de duas partes — uma Newsletter de textos em MDX como home, e o portfólio atual movido para `/portfolio`.

**Architecture:** Um único módulo (`lib/posts.ts`) lê o disco, valida frontmatter e devolve objetos `Post` prontos; todo o resto recebe dados como props e é renderizado no servidor em tempo de build. Exatamente um componente roda no navegador (`PostToc`). O acoplamento com a biblioteca de MDX fica isolado em `lib/mdx.tsx`.

**Tech Stack:** Next.js 16.3.1 (App Router), React 19.2.8, TypeScript strict, Tailwind CSS 4, MDX via `next-mdx-remote`, KaTeX, `rehype-pretty-code`, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-20-newsletter-design.md`

## Global Constraints

- Branch de trabalho: `newsletter`. Não commitar em `master`.
- **Nenhum componente contém texto literal voltado ao usuário.** Todo rótulo vive em `src/content/ui.ts` como `Localized = { pt: string; en: string }`. Faltar uma chave quebra o build.
- **Um único módulo toca o sistema de arquivos:** `src/lib/posts.ts`. Nenhum componente, nenhuma página e nenhum outro módulo de `lib/` importa `node:fs`.
- **Exatamente um componente cliente no projeto inteiro:** `PostToc`. Nenhum outro arquivo recebe `'use client'`.
- Idiomas: `pt` (padrão) e `en`, já definidos em `src/lib/i18n.ts`. Não adicionar biblioteca de i18n.
- Testes ficam ao lado do arquivo testado (`Arquivo.tsx` + `Arquivo.test.tsx`), com nomes de teste em português, seguindo o padrão de `src/components/sections/ProjectsSection.test.tsx`.
- Fixtures de dados em `src/test/fixtures.ts`; fixtures de arquivos MDX em `src/test/posts-fixtures/`. **Nunca** usar `src/content/posts/` em teste.
- Cores só pelos tokens existentes: `surface`, `raised`, `ink`, `muted`, `line`, `accent`. Fontes só por `font-sans`, `font-serif`, `font-mono`.
- Pilares, exatamente três: `academico`, `ensino`, `projetos`.
- Formações do ibe.IA, exatamente três: `vibe-coding`, `agentes-ia`, `ia-para-negocios`.
- Limite de `resumo`: 200 caracteres.
- Nome de arquivo de post: `YYYY-MM-DD-<slug>.<locale>.mdx`, com `slug` casando `^[a-z0-9-]+$`.
- CI (`.github/workflows/ci.yml`) roda, nesta ordem: `typecheck`, `lint`, `test`, `build`, `test:e2e`. Todos precisam passar antes de cada commit.
- `node_modules` não está instalado no clone. Rodar `npm ci` antes de qualquer coisa.

---

### Task 1: Dependências e pipeline MDX

Antes de qualquer código de produto, provar que MDX com fórmula e realce de código compila neste Next.

**Files:**
- Modify: `package.json`
- Create: `src/lib/mdx.tsx`
- Create: `src/lib/mdx.test.tsx`
- Create: `src/test/posts-fixtures/2026-01-15-exemplo-completo.pt.mdx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: nada.
- Produces: `renderizarMdx(corpo: string): Promise<ReactElement>` e `componentesMdx: MDXComponents`, ambos de `@/lib/mdx`.

- [ ] **Step 1: Instalar e verificar a API real desta versão do Next**

```bash
npm ci
```

Depois, **antes de escrever `lib/mdx.tsx`**, ler a documentação instalada — o `AGENTS.md` do projeto avisa que este Next tem mudanças de API em relação ao conhecimento prévio do agente:

```bash
ls node_modules/next/dist/docs/
grep -ril "mdx" node_modules/next/dist/docs/ | head
```

Registrar num comentário no topo de `src/lib/mdx.tsx` qual arquivo da doc foi consultado. Se a API divergir do código abaixo, **a doc instalada ganha** — ajustar o código e seguir.

- [ ] **Step 2: Instalar as dependências do pipeline**

```bash
npm install gray-matter next-mdx-remote remark-math remark-gfm rehype-katex katex rehype-slug rehype-pretty-code
```

> **Correção em relação à spec:** a spec listou sete dependências e esqueceu
> `remark-gfm`. Sem ela, MDX não entende tabela em Markdown — e tabela é um
> requisito explícito da página de post. São oito, não sete. A alternativa
> seria escrever cada tabela como JSX à mão em todo post, o que é pior.

- [ ] **Step 3: Criar a fixture MDX que exercita todos os recursos**

Criar `src/test/posts-fixtures/2026-01-15-exemplo-completo.pt.mdx`:

```mdx
---
titulo: Exemplo completo
resumo: Post de fixture que exercita fórmula, código e figura.
pilar: projetos
tags: [estatistica, esports]
destaque: true
cta: ia-para-negocios
---

## Primeira seção

Texto de exemplo com uma fórmula em linha: $\sigma(x)$.

$$P(v) = \sigma(0{,}41 w + 0{,}37 g - 0{,}08)$$

```ts
const dobro = (n: number) => n * 2
```

## Segunda seção

Fim do exemplo.
```

- [ ] **Step 4: Escrever o teste que falha**

Criar `src/lib/mdx.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderizarMdx } from '@/lib/mdx'

describe('renderizarMdx', () => {
  it('renderiza títulos com id derivado do texto', async () => {
    render(await renderizarMdx('## Primeira seção\n\nTexto.'))

    const titulo = screen.getByRole('heading', { level: 2, name: 'Primeira seção' })
    expect(titulo).toHaveAttribute('id', 'primeira-secao')
  })

  it('tipografa fórmula em bloco com KaTeX', async () => {
    const { container } = render(await renderizarMdx('$$x^2$$'))

    expect(container.querySelector('.katex')).not.toBeNull()
  })

  it('realça bloco de código no build, sem enviar JS ao cliente', async () => {
    const { container } = render(await renderizarMdx('```ts\nconst a = 1\n```'))

    // rehype-pretty-code marca os tokens com data-attributes no HTML gerado.
    expect(container.querySelector('pre[data-language="ts"]')).not.toBeNull()
    expect(container.querySelector('script')).toBeNull()
  })

  it('renderiza tabela escrita em Markdown', async () => {
    render(await renderizarMdx('| Modelo | Log loss |\n| --- | --- |\n| baseline | 0,589 |'))

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Log loss' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/mdx.test.tsx`
Expected: FAIL — `Cannot find module '@/lib/mdx'`.

- [ ] **Step 6: Implementar o pipeline**

Criar `src/lib/mdx.tsx`:

```tsx
// API de MDX verificada em node_modules/next/dist/docs/ — ver Task 1, Step 1.
import { MDXRemote } from 'next-mdx-remote/rsc'
import type { MDXComponents } from 'mdx/types'
import type { ReactElement } from 'react'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

/** Componentes disponíveis dentro de qualquer MDX. Cresce na Task 9. */
export const componentesMdx: MDXComponents = {}

export function renderizarMdx(corpo: string): Promise<ReactElement> {
  return Promise.resolve(
    <MDXRemote
      source={corpo}
      components={componentesMdx}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMath, remarkGfm],
          rehypePlugins: [rehypeSlug, rehypeKatex, [rehypePrettyCode, { theme: 'github-light' }]],
        },
      }}
    />,
  )
}
```

- [ ] **Step 7: Importar o CSS do KaTeX**

Em `src/app/globals.css`, adicionar logo abaixo do `@import 'tailwindcss';`:

```css
@import 'katex/dist/katex.min.css';
```

- [ ] **Step 8: Rodar os testes e o typecheck**

Run: `npx vitest run src/lib/mdx.test.tsx && npm run typecheck`
Expected: PASS nos três testes, zero erro de tipo.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/lib/mdx.tsx src/lib/mdx.test.tsx src/test/posts-fixtures src/app/globals.css
git commit -m "feat: pipeline de MDX com fórmula, realce de código e âncora de título"
```

---

### Task 2: Leitura e validação dos posts

O módulo mais importante do plano. É o único que lê disco, e é onde erro silencioso viraria post publicado errado.

**Files:**
- Create: `src/content/posts/.gitkeep`
- Create: `src/lib/posts.ts`
- Create: `src/lib/posts.test.ts`
- Create: `src/test/posts-fixtures/2026-02-20-so-em-portugues.pt.mdx`
- Create: `src/test/posts-fixtures/2026-03-10-texto-bilingue.pt.mdx`
- Create: `src/test/posts-fixtures/2026-04-02-texto-bilingue.en.mdx`

**Interfaces:**
- Consumes: `Locale`, `locales` de `@/lib/i18n`.
- Produces, todos de `@/lib/posts`:
  - `type Pilar = 'academico' | 'ensino' | 'projetos'`
  - `const pilares: readonly Pilar[]`
  - `type FormacaoId = 'vibe-coding' | 'agentes-ia' | 'ia-para-negocios'`
  - `type Post = { slug: string; locale: Locale; data: string; titulo: string; resumo: string; pilar: Pilar; tags: string[]; destaque: boolean; cta?: FormacaoId; atualizado?: string; corpo: string }`
  - `function lerPosts(dir?: string): Post[]` — ordenado por `data` decrescente
  - `function postsDoLocale(posts: Post[], locale: Locale): Post[]`
  - `function agruparPorMes(posts: Post[]): { ano: number; mes: number; posts: Post[] }[]`
  - `function parLinguistico(posts: Post[], slug: string): { pt?: Post; en?: Post }`

- [ ] **Step 1: Criar as fixtures que faltam**

`src/test/posts-fixtures/2026-02-20-so-em-portugues.pt.mdx`:

```mdx
---
titulo: Só em português
resumo: Este texto não tem versão em inglês.
pilar: academico
tags: [estatistica]
---

Corpo curto.
```

`src/test/posts-fixtures/2026-03-10-texto-bilingue.pt.mdx`:

```mdx
---
titulo: Texto bilíngue
resumo: Versão em português.
pilar: ensino
tags: [ia, ensino]
---

Corpo em português.
```

`src/test/posts-fixtures/2026-04-02-texto-bilingue.en.mdx` — data diferente de propósito, porque traduzir semanas depois é o caso normal:

```mdx
---
titulo: Bilingual text
resumo: English version.
pilar: ensino
tags: [ia, ensino]
---

Body in English.
```

Criar também `src/content/posts/.gitkeep` vazio, para a pasta real existir sem conteúdo.

- [ ] **Step 2: Escrever os testes que falham**

Criar `src/lib/posts.test.ts`:

```ts
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { agruparPorMes, lerPosts, parLinguistico, postsDoLocale } from '@/lib/posts'

const FIXTURES = 'src/test/posts-fixtures'

/** Escreve um único arquivo num diretório temporário, para testar rejeição. */
function comArquivo(nome: string, conteudo: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'posts-'))
  writeFileSync(join(dir, nome), conteudo)
  return dir
}

const FRONTMATTER_OK = `---
titulo: Título
resumo: Resumo curto.
pilar: ensino
tags: [ia]
---

Corpo.`

describe('lerPosts', () => {
  it('lê os posts da pasta e ordena por data decrescente', () => {
    const posts = lerPosts(FIXTURES)

    expect(posts.map((p) => p.data)).toEqual(['2026-04-02', '2026-03-10', '2026-02-20', '2026-01-15'])
  })

  it('extrai data, slug e idioma do nome do arquivo', () => {
    const post = lerPosts(FIXTURES).find((p) => p.slug === 'so-em-portugues')

    expect(post).toMatchObject({ data: '2026-02-20', slug: 'so-em-portugues', locale: 'pt' })
  })

  it('aplica os padrões de destaque e cta quando ausentes', () => {
    const post = lerPosts(FIXTURES).find((p) => p.slug === 'so-em-portugues')

    expect(post?.destaque).toBe(false)
    expect(post?.cta).toBeUndefined()
  })

  it('lê destaque e cta quando declarados', () => {
    const post = lerPosts(FIXTURES).find((p) => p.slug === 'exemplo-completo')

    expect(post?.destaque).toBe(true)
    expect(post?.cta).toBe('ia-para-negocios')
  })

  it('separa o corpo do frontmatter', () => {
    const post = lerPosts(FIXTURES).find((p) => p.slug === 'so-em-portugues')

    expect(post?.corpo.trim()).toBe('Corpo curto.')
    expect(post?.corpo).not.toContain('titulo:')
  })

  it('rejeita nome de arquivo fora do padrão', () => {
    const dir = comArquivo('sem-data.pt.mdx', FRONTMATTER_OK)

    expect(() => lerPosts(dir)).toThrow(/sem-data\.pt\.mdx/)
  })

  it('rejeita idioma desconhecido no nome do arquivo', () => {
    const dir = comArquivo('2026-01-01-texto.fr.mdx', FRONTMATTER_OK)

    expect(() => lerPosts(dir)).toThrow(/fr/)
  })

  it('rejeita slug com maiúscula ou acento', () => {
    const dir = comArquivo('2026-01-01-Título.pt.mdx', FRONTMATTER_OK)

    expect(() => lerPosts(dir)).toThrow(/slug/i)
  })

  it('rejeita pilar inexistente', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('ensino', 'financas'))

    expect(() => lerPosts(dir)).toThrow(/financas/)
  })

  it('rejeita tag fora do padrão kebab-case', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('[ia]', '[Machine Learning]'))

    expect(() => lerPosts(dir)).toThrow(/tag/i)
  })

  it('rejeita post sem nenhuma tag', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('[ia]', '[]'))

    expect(() => lerPosts(dir)).toThrow(/tag/i)
  })

  it('rejeita resumo acima de 200 caracteres', () => {
    const longo = 'a'.repeat(201)
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('Resumo curto.', longo))

    expect(() => lerPosts(dir)).toThrow(/resumo/i)
  })

  it('rejeita título vazio', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('Título', ''))

    expect(() => lerPosts(dir)).toThrow(/titulo/i)
  })

  it('rejeita cta que não é uma formação conhecida', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', `${FRONTMATTER_OK.replace('tags: [ia]', 'tags: [ia]\ncta: curso-inexistente')}`)

    expect(() => lerPosts(dir)).toThrow(/curso-inexistente/)
  })
})

describe('postsDoLocale', () => {
  it('devolve só os posts do idioma pedido', () => {
    const posts = lerPosts(FIXTURES)

    expect(postsDoLocale(posts, 'en').map((p) => p.slug)).toEqual(['texto-bilingue'])
  })

  it('não vaza post que existe só em português para a listagem em inglês', () => {
    const posts = lerPosts(FIXTURES)

    expect(postsDoLocale(posts, 'en').map((p) => p.slug)).not.toContain('so-em-portugues')
  })
})

describe('agruparPorMes', () => {
  it('agrupa por ano e mês, do mais recente para o mais antigo', () => {
    const grupos = agruparPorMes(postsDoLocale(lerPosts(FIXTURES), 'pt'))

    expect(grupos.map((g) => [g.ano, g.mes])).toEqual([
      [2026, 3],
      [2026, 2],
      [2026, 1],
    ])
  })

  it('mantém os posts de um mesmo mês juntos', () => {
    const posts = postsDoLocale(lerPosts(FIXTURES), 'pt')
    const total = agruparPorMes(posts).reduce((soma, g) => soma + g.posts.length, 0)

    expect(total).toBe(posts.length)
  })
})

describe('parLinguistico', () => {
  it('emparelha pt e en pelo slug, mesmo com datas diferentes', () => {
    const par = parLinguistico(lerPosts(FIXTURES), 'texto-bilingue')

    expect(par.pt?.data).toBe('2026-03-10')
    expect(par.en?.data).toBe('2026-04-02')
  })

  it('devolve só o idioma existente quando não há tradução', () => {
    const par = parLinguistico(lerPosts(FIXTURES), 'so-em-portugues')

    expect(par.pt).toBeDefined()
    expect(par.en).toBeUndefined()
  })
})
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `npx vitest run src/lib/posts.test.ts`
Expected: FAIL — `Cannot find module '@/lib/posts'`.

- [ ] **Step 4: Implementar `lib/posts.ts`**

```ts
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { type Locale, isLocale } from '@/lib/i18n'

export type Pilar = 'academico' | 'ensino' | 'projetos'
export const pilares = ['academico', 'ensino', 'projetos'] as const satisfies readonly Pilar[]

export type FormacaoId = 'vibe-coding' | 'agentes-ia' | 'ia-para-negocios'
const formacaoIds = ['vibe-coding', 'agentes-ia', 'ia-para-negocios'] as const satisfies readonly FormacaoId[]

export type Post = {
  slug: string
  locale: Locale
  /** 'YYYY-MM-DD', vindo do nome do arquivo. Fonte única de verdade. */
  data: string
  titulo: string
  resumo: string
  pilar: Pilar
  tags: string[]
  destaque: boolean
  cta?: FormacaoId
  /** 'YYYY-MM-DD', opcional. */
  atualizado?: string
  /** MDX cru, sem frontmatter. */
  corpo: string
}

const NOME = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.([a-z]{2})\.mdx$/
const TAG = /^[a-z0-9-]+$/
const DIRETORIO_PADRAO = 'src/content/posts'
const LIMITE_RESUMO = 200

function erro(arquivo: string, motivo: string): never {
  throw new Error(`Post inválido em "${arquivo}": ${motivo}`)
}

function texto(valor: unknown, campo: string, arquivo: string): string {
  if (typeof valor !== 'string' || valor.trim() === '') erro(arquivo, `${campo} é obrigatório e não pode ser vazio`)
  return valor.trim()
}

function nomeDoArquivo(arquivo: string): { data: string; slug: string; locale: Locale } {
  const casou = NOME.exec(arquivo)
  if (!casou) {
    erro(arquivo, 'o nome deve seguir "YYYY-MM-DD-<slug>.<locale>.mdx", com slug em minúsculas, dígitos e hífens')
  }
  const [, data, slug, locale] = casou
  if (!isLocale(locale)) erro(arquivo, `idioma "${locale}" não existe; use ${['pt', 'en'].join(' ou ')}`)
  return { data, slug, locale }
}

function frontmatter(dados: Record<string, unknown>, arquivo: string) {
  const titulo = texto(dados.titulo, 'titulo', arquivo)
  const resumo = texto(dados.resumo, 'resumo', arquivo)
  if (resumo.length > LIMITE_RESUMO) {
    erro(arquivo, `resumo tem ${resumo.length} caracteres e o limite é ${LIMITE_RESUMO}`)
  }

  const pilar = texto(dados.pilar, 'pilar', arquivo)
  if (!(pilares as readonly string[]).includes(pilar)) {
    erro(arquivo, `pilar "${pilar}" não existe; use ${pilares.join(', ')}`)
  }

  const tags = dados.tags
  if (!Array.isArray(tags) || tags.length === 0) erro(arquivo, 'é preciso ao menos uma tag')
  for (const tag of tags) {
    if (typeof tag !== 'string' || !TAG.test(tag)) {
      erro(arquivo, `tag ${JSON.stringify(tag)} deve ser kebab-case: minúsculas, dígitos e hífens`)
    }
  }

  const cta = dados.cta
  if (cta !== undefined && !(formacaoIds as readonly unknown[]).includes(cta)) {
    erro(arquivo, `cta "${String(cta)}" não é uma formação conhecida; use ${formacaoIds.join(', ')}`)
  }

  return {
    titulo,
    resumo,
    pilar: pilar as Pilar,
    tags: tags as string[],
    destaque: dados.destaque === true,
    cta: cta as FormacaoId | undefined,
    atualizado: typeof dados.atualizado === 'string' ? dados.atualizado : undefined,
  }
}

/** Lê, valida e ordena por data decrescente. Frontmatter inválido lança. */
export function lerPosts(dir: string = DIRETORIO_PADRAO): Post[] {
  return readdirSync(dir)
    .filter((arquivo) => arquivo.endsWith('.mdx'))
    .map((arquivo) => {
      const { data, slug, locale } = nomeDoArquivo(arquivo)
      const { data: dados, content } = matter(readFileSync(join(dir, arquivo), 'utf8'))
      return { slug, locale, data, corpo: content, ...frontmatter(dados, arquivo) }
    })
    .sort((a, b) => b.data.localeCompare(a.data))
}

export function postsDoLocale(posts: Post[], locale: Locale): Post[] {
  return posts.filter((post) => post.locale === locale)
}

export function agruparPorMes(posts: Post[]): { ano: number; mes: number; posts: Post[] }[] {
  const grupos: { ano: number; mes: number; posts: Post[] }[] = []

  for (const post of posts) {
    const ano = Number(post.data.slice(0, 4))
    const mes = Number(post.data.slice(5, 7))
    const ultimo = grupos.at(-1)
    if (ultimo?.ano === ano && ultimo.mes === mes) ultimo.posts.push(post)
    else grupos.push({ ano, mes, posts: [post] })
  }

  return grupos
}

export function parLinguistico(posts: Post[], slug: string): { pt?: Post; en?: Post } {
  const doSlug = posts.filter((post) => post.slug === slug)
  return {
    pt: doSlug.find((post) => post.locale === 'pt'),
    en: doSlug.find((post) => post.locale === 'en'),
  }
}
```

- [ ] **Step 5: Rodar até tudo passar**

Run: `npx vitest run src/lib/posts.test.ts && npm run typecheck && npm run lint`
Expected: PASS em todos os testes, zero erro.

- [ ] **Step 6: Commit**

```bash
git add src/lib/posts.ts src/lib/posts.test.ts src/test/posts-fixtures src/content/posts/.gitkeep
git commit -m "feat: leitura e validação de posts em MDX"
```

---

### Task 3: Tempo de leitura e rótulos dos pilares

**Files:**
- Create: `src/lib/reading.ts`
- Create: `src/lib/reading.test.ts`
- Create: `src/content/pilares.ts`
- Modify: `src/content/ui.ts`

**Interfaces:**
- Consumes: `Pilar` de `@/lib/posts`; `Localized` de `@/lib/i18n`.
- Produces: `tempoDeLeitura(corpo: string): number` de `@/lib/reading`; `descricaoPilar: Record<Pilar, { nome: Localized; descricao: Localized }>` de `@/content/pilares`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/reading.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { tempoDeLeitura } from '@/lib/reading'

describe('tempoDeLeitura', () => {
  it('estima 200 palavras por minuto, arredondando para cima', () => {
    expect(tempoDeLeitura('palavra '.repeat(400))).toBe(2)
    expect(tempoDeLeitura('palavra '.repeat(401))).toBe(3)
  })

  it('nunca devolve menos de um minuto', () => {
    expect(tempoDeLeitura('duas palavras')).toBe(1)
    expect(tempoDeLeitura('')).toBe(1)
  })

  it('ignora bloco de código na contagem, porque não se lê código como texto', () => {
    const comCodigo = `Texto curto.\n\n\`\`\`ts\n${'const x = 1\n'.repeat(300)}\`\`\``

    expect(tempoDeLeitura(comCodigo)).toBe(1)
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/lib/reading.test.ts`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar**

Criar `src/lib/reading.ts`:

```ts
const PALAVRAS_POR_MINUTO = 200

/** Minutos de leitura do corpo MDX. Bloco de código não conta. */
export function tempoDeLeitura(corpo: string): number {
  const semCodigo = corpo.replace(/```[\s\S]*?```/g, ' ')
  const palavras = semCodigo.split(/\s+/).filter((palavra) => palavra !== '').length
  return Math.max(1, Math.ceil(palavras / PALAVRAS_POR_MINUTO))
}
```

- [ ] **Step 4: Criar os rótulos dos pilares**

Criar `src/content/pilares.ts`:

```ts
import type { Localized } from '@/lib/i18n'
import type { Pilar } from '@/lib/posts'

export const descricaoPilar: Record<Pilar, { nome: Localized; descricao: Localized }> = {
  academico: {
    nome: { pt: 'Acadêmico', en: 'Academic' },
    descricao: {
      pt: 'Estatística, probabilidade e estrutura de dados na Fatec.',
      en: 'Statistics, probability and data structures at Fatec.',
    },
  },
  ensino: {
    nome: { pt: 'Ensino', en: 'Teaching' },
    descricao: {
      pt: 'O que dar aula de IA no ibe.IA me ensinou sobre IA.',
      en: 'What teaching AI at ibe.IA taught me about AI.',
    },
  },
  projetos: {
    nome: { pt: 'Projetos', en: 'Projects' },
    descricao: {
      pt: 'Análise de padrões em e-sports, pipelines e experimentos.',
      en: 'Pattern analysis in e-sports, pipelines and experiments.',
    },
  },
}
```

- [ ] **Step 5: Adicionar os rótulos de interface**

Em `src/content/ui.ts`, acrescentar dentro do objeto `ui`:

```ts
  newsletter: {
    trilhas: { pt: 'Trilhas', en: 'Tracks' },
    destaques: { pt: 'Destaques', en: 'Featured' },
    arquivo: { pt: 'Arquivo', en: 'Archive' },
    textos: { pt: 'textos', en: 'texts' },
    desde: { pt: 'desde', en: 'since' },
    ultimo: { pt: 'último em', en: 'latest on' },
    verTodas: { pt: 'Ver todas as tags', en: 'See all tags' },
  },
  post: {
    nesteTexto: { pt: 'Neste texto', en: 'In this text' },
    tempoLeitura: { pt: 'min de leitura', en: 'min read' },
    atualizadoEm: { pt: 'atualizado em', en: 'updated on' },
    restante: { pt: 'restante', en: 'left' },
    notas: { pt: 'Notas', en: 'Notes' },
    noSite: { pt: 'No site', en: 'On the site' },
    daquiVocePodeIr: { pt: 'Daqui você pode ir para', en: 'From here you can go to' },
    estudarAFundo: { pt: 'Se quiser estudar isso a fundo', en: 'If you want to study this in depth' },
    divulgacao: {
      pt: 'Divulgação: sou assistente de ensino no ibe.IA — este link é do lugar onde eu trabalho.',
      en: 'Disclosure: I am a teaching assistant at ibe.IA — this link points to where I work.',
    },
    soEmPortugues: {
      pt: 'Este texto existe apenas em português.',
      en: 'This text is only available in Portuguese.',
    },
    soEmIngles: {
      pt: 'Este texto existe apenas em inglês.',
      en: 'This text is only available in English.',
    },
    lerNoIdiomaDisponivel: { pt: 'Ler em português', en: 'Read in English' },
  },
  nav: {
    newsletter: { pt: 'Newsletter', en: 'Newsletter' },
    portfolio: { pt: 'Portfólio', en: 'Portfolio' },
  },
```

- [ ] **Step 6: Rodar tudo e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint`
Expected: PASS.

```bash
git add src/lib/reading.ts src/lib/reading.test.ts src/content/pilares.ts src/content/ui.ts
git commit -m "feat: tempo de leitura e rótulos de pilares e newsletter"
```

---

### Task 4: Catálogo de formações e o CTA do ibe.IA

O teste que mais importa aqui é o negativo: post sem `cta` **não** produz bloco algum. É a garantia automatizada de que o site não vira anúncio por descuido.

**Files:**
- Create: `src/content/formacoes.ts`
- Create: `src/lib/cta.ts`
- Create: `src/lib/cta.test.ts`
- Modify: `src/test/fixtures.ts`

**Interfaces:**
- Consumes: `FormacaoId`, `Post` de `@/lib/posts`.
- Produces:
  - `type Formacao = { id: FormacaoId; nome: string; url: string; descricao: Localized }` e `formacoes: Record<FormacaoId, Formacao>` de `@/content/formacoes`
  - `function ctaDoPost(post: Post): { formacao: Formacao; url: string } | null` de `@/lib/cta`
  - `function urlComUtm(base: string, campanha: string): string` de `@/lib/cta`
  - `postFixture: Post[]` de `@/test/fixtures`

- [ ] **Step 1: Criar a fixture de posts**

Em `src/test/fixtures.ts`, acrescentar ao final (mantendo o `import type` no topo coerente):

```ts
import type { Post } from '@/lib/posts'

export const postFixture: Post[] = [
  {
    slug: 'com-cta',
    locale: 'pt',
    data: '2026-08-12',
    titulo: 'Post com CTA',
    resumo: 'Resumo do post com CTA.',
    pilar: 'projetos',
    tags: ['estatistica', 'esports'],
    destaque: true,
    cta: 'ia-para-negocios',
    corpo: '## Uma seção\n\nCorpo.',
  },
  {
    slug: 'sem-cta',
    locale: 'pt',
    data: '2026-07-30',
    titulo: 'Post sem CTA',
    resumo: 'Resumo do post sem CTA.',
    pilar: 'academico',
    tags: ['probabilidade'],
    destaque: false,
    corpo: 'Corpo sem seções.',
  },
  {
    slug: 'de-ensino',
    locale: 'pt',
    data: '2026-06-05',
    titulo: 'Post de ensino',
    resumo: 'Resumo do post de ensino.',
    pilar: 'ensino',
    tags: ['ia', 'ensino'],
    destaque: false,
    corpo: 'Corpo.',
  },
]
```

- [ ] **Step 2: Escrever o teste que falha**

Criar `src/lib/cta.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ctaDoPost, urlComUtm } from '@/lib/cta'
import { postFixture } from '@/test/fixtures'

const [comCta, semCta] = postFixture

describe('ctaDoPost', () => {
  it('não devolve nada quando o post não declara cta', () => {
    expect(ctaDoPost(semCta)).toBeNull()
  })

  it('resolve a formação declarada no frontmatter', () => {
    expect(ctaDoPost(comCta)?.formacao.id).toBe('ia-para-negocios')
  })

  it('marca a campanha com o slug do post', () => {
    const url = new URL(ctaDoPost(comCta)!.url)

    expect(url.searchParams.get('utm_campaign')).toBe('com-cta')
  })
})

describe('urlComUtm', () => {
  it('acrescenta origem, meio e campanha', () => {
    const url = new URL(urlComUtm('https://ibe.ia.br/curso', 'meu-post'))

    expect(url.searchParams.get('utm_source')).toBe('yurioliveira.dev')
    expect(url.searchParams.get('utm_medium')).toBe('post')
    expect(url.searchParams.get('utm_campaign')).toBe('meu-post')
  })

  it('preserva os parâmetros que a URL já tinha', () => {
    const url = new URL(urlComUtm('https://ibe.ia.br/curso?turma=2', 'meu-post'))

    expect(url.searchParams.get('turma')).toBe('2')
    expect(url.searchParams.get('utm_source')).toBe('yurioliveira.dev')
  })
})
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `npx vitest run src/lib/cta.test.ts`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 4: Criar o catálogo**

Criar `src/content/formacoes.ts`:

```ts
import type { Localized } from '@/lib/i18n'
import type { FormacaoId } from '@/lib/posts'

export type Formacao = { id: FormacaoId; nome: string; url: string; descricao: Localized }

export const formacoes: Record<FormacaoId, Formacao> = {
  'vibe-coding': {
    id: 'vibe-coding',
    nome: 'Formação em Vibe Coding',
    url: 'https://ibe.ia.br/',
    descricao: {
      pt: 'Construir aplicações e SaaS com assistentes de código.',
      en: 'Building apps and SaaS with coding assistants.',
    },
  },
  'agentes-ia': {
    id: 'agentes-ia',
    nome: 'Formação em Agentes IA',
    url: 'https://ibe.ia.br/',
    descricao: {
      pt: 'Agentes e automações para atendimento e processos.',
      en: 'Agents and automations for support and operations.',
    },
  },
  'ia-para-negocios': {
    id: 'ia-para-negocios',
    nome: 'Formação em IA para Negócios',
    url: 'https://ibe.ia.br/',
    descricao: {
      pt: 'Decisão com dados e uso de IA nas áreas da empresa.',
      en: 'Data-driven decisions and AI across business areas.',
    },
  },
}
```

> **Nota para o executor:** as três URLs apontam para a home do instituto porque as URLs profundas de cada formação não foram confirmadas durante o design. Ao trocar por URLs específicas, mudar **apenas** este arquivo — nenhum outro lugar conhece essas URLs.

- [ ] **Step 5: Implementar o CTA**

Criar `src/lib/cta.ts`:

```ts
import { type Formacao, formacoes } from '@/content/formacoes'
import type { Post } from '@/lib/posts'

const ORIGEM = 'yurioliveira.dev'
const MEIO = 'post'

export function urlComUtm(base: string, campanha: string): string {
  const url = new URL(base)
  url.searchParams.set('utm_source', ORIGEM)
  url.searchParams.set('utm_medium', MEIO)
  url.searchParams.set('utm_campaign', campanha)
  return url.toString()
}

/** Só devolve algo se o post declarou `cta`. Nunca é automático. */
export function ctaDoPost(post: Post): { formacao: Formacao; url: string } | null {
  if (!post.cta) return null
  const formacao = formacoes[post.cta]
  return { formacao, url: urlComUtm(formacao.url, post.slug) }
}
```

- [ ] **Step 6: Rodar e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint`
Expected: PASS.

```bash
git add src/content/formacoes.ts src/lib/cta.ts src/lib/cta.test.ts src/test/fixtures.ts
git commit -m "feat: catálogo de formações do ibe.IA e CTA opt-in por post"
```

---

### Task 5: Componentes do arquivo

**Files:**
- Create: `src/components/archive/StatRail.tsx` + `StatRail.test.tsx`
- Create: `src/components/archive/PillarCards.tsx` + `PillarCards.test.tsx`
- Create: `src/components/archive/PostRow.tsx` + `PostRow.test.tsx`
- Create: `src/components/archive/ArchiveList.tsx` + `ArchiveList.test.tsx`
- Create: `src/lib/routes.ts` + `src/lib/routes.test.ts`
- Modify: `src/lib/date.ts` — já existe

**Interfaces:**
- Consumes: `Post`, `Pilar`, `pilares`, `agruparPorMes` de `@/lib/posts`; `descricaoPilar` de `@/content/pilares`; `ui` de `@/content/ui`.
- Produces: `<StatRail locale posts />`, `<PillarCards locale posts />`, `<PostRow locale post comResumo? />`, `<ArchiveList locale posts />`, e `caminhoPilar(locale, pilar)` / `segmentoPilares` de `@/lib/routes`.

- [ ] **Step 0: Criar `lib/routes.ts` primeiro, porque `PillarCards` depende dele**

Criar `src/lib/routes.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { caminhoPilar, segmentoPilares } from '@/lib/routes'

describe('caminhoPilar', () => {
  it('usa "pilares" em português e "pillars" em inglês', () => {
    expect(caminhoPilar('pt', 'ensino')).toBe('/pt/pilares/ensino')
    expect(caminhoPilar('en', 'ensino')).toBe('/en/pillars/ensino')
  })

  it('não traduz a chave do pilar, porque ela é enum e não texto de interface', () => {
    expect(caminhoPilar('en', 'academico')).toBe('/en/pillars/academico')
  })

  it('cobre os dois idiomas no mapa de segmentos', () => {
    expect(Object.keys(segmentoPilares).sort()).toEqual(['en', 'pt'])
  })
})
```

Rodar (`npx vitest run src/lib/routes.test.ts`), confirmar FAIL, e criar `src/lib/routes.ts`:

```ts
import type { Locale } from '@/lib/i18n'
import type { Pilar } from '@/lib/posts'

/**
 * Único segmento de rota que difere entre idiomas. `posts`, `tags` e
 * `portfolio` se escrevem igual em pt e en, então não entram aqui.
 * A pasta real no App Router é `pilares`; `/en/pillars/...` chega por rewrite.
 */
export const segmentoPilares: Record<Locale, string> = { pt: 'pilares', en: 'pillars' }

export function caminhoPilar(locale: Locale, pilar: Pilar): string {
  return `/${locale}/${segmentoPilares[locale]}/${pilar}`
}
```

Rodar de novo e confirmar PASS.

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/components/archive/StatRail.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatRail } from '@/components/archive/StatRail'
import { postFixture } from '@/test/fixtures'

describe('StatRail', () => {
  it('mostra a contagem real de textos', () => {
    render(<StatRail locale="pt" posts={postFixture} />)

    expect(screen.getByText(/3 textos/)).toBeInTheDocument()
  })

  it('mostra a data absoluta do último texto, nunca tempo relativo', () => {
    render(<StatRail locale="pt" posts={postFixture} />)

    expect(screen.getByText(/12\/08\/2026/)).toBeInTheDocument()
    expect(screen.queryByText(/há \d+ dias?/)).not.toBeInTheDocument()
  })

  it('mostra o mês do texto mais antigo como início', () => {
    render(<StatRail locale="pt" posts={postFixture} />)

    expect(screen.getByText(/06\/2026/)).toBeInTheDocument()
  })

  it('não renderiza nada sem posts', () => {
    const { container } = render(<StatRail locale="pt" posts={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
```

Criar `src/components/archive/PillarCards.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PillarCards } from '@/components/archive/PillarCards'
import type { Post } from '@/lib/posts'
import { postFixture } from '@/test/fixtures'

describe('PillarCards', () => {
  it('mostra os três pilares com a contagem real, inclusive zero', () => {
    render(<PillarCards locale="pt" posts={[postFixture[1]]} />)

    expect(screen.getByRole('link', { name: /Acadêmico/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ensino/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Projetos/ })).toBeInTheDocument()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getAllByText('00')).toHaveLength(2)
  })

  it('não renderiza o gráfico de cadência com menos de quatro meses de histórico', () => {
    const { container } = render(<PillarCards locale="pt" posts={postFixture} />)

    expect(container.querySelector('[data-cadencia]')).toBeNull()
  })

  it('renderiza o gráfico de cadência a partir de quatro meses de histórico', () => {
    const espalhados: Post[] = ['2026-08-01', '2026-07-01', '2026-06-01', '2026-05-01'].map((data, i) => ({
      ...postFixture[0],
      slug: `post-${i}`,
      data,
    }))

    const { container } = render(<PillarCards locale="pt" posts={espalhados} />)

    expect(container.querySelector('[data-cadencia]')).not.toBeNull()
  })

  it('linka cada cartão para a página do pilar no idioma corrente', () => {
    render(<PillarCards locale="en" posts={postFixture} />)

    expect(screen.getByRole('link', { name: /Teaching/ })).toHaveAttribute('href', '/en/pillars/ensino')
  })
})
```

Criar `src/components/archive/PostRow.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostRow } from '@/components/archive/PostRow'
import { postFixture } from '@/test/fixtures'

describe('PostRow', () => {
  it('linka o título para o post no idioma corrente', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByRole('link', { name: 'Post com CTA' })).toHaveAttribute('href', '/pt/posts/com-cta')
  })

  it('mostra data e tags', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByText('12/08/2026')).toBeInTheDocument()
    expect(screen.getByText('#estatistica')).toBeInTheDocument()
  })

  it('omite o resumo quando não pedido', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.queryByText('Resumo do post com CTA.')).not.toBeInTheDocument()
  })

  it('mostra o resumo quando pedido', () => {
    render(<PostRow locale="pt" post={postFixture[0]} comResumo />)

    expect(screen.getByText('Resumo do post com CTA.')).toBeInTheDocument()
  })

  it('marca visualmente o pilar do post', () => {
    const { container } = render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(container.querySelector('[data-pilar="projetos"]')).not.toBeNull()
  })
})
```

Criar `src/components/archive/ArchiveList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { postFixture } from '@/test/fixtures'

describe('ArchiveList', () => {
  it('agrupa por ano e mês, do mais recente para o mais antigo', () => {
    render(<ArchiveList locale="pt" posts={postFixture} />)

    const meses = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(meses).toEqual(['2026 — Agosto', '2026 — Julho', '2026 — Junho'])
  })

  it('usa o nome do mês no idioma corrente', () => {
    render(<ArchiveList locale="en" posts={postFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: '2026 — August' })).toBeInTheDocument()
  })

  it('não renderiza nada sem posts', () => {
    const { container } = render(<ArchiveList locale="pt" posts={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/components/archive`
Expected: FAIL — nenhum dos módulos existe.

- [ ] **Step 3: Acrescentar os formatadores de data**

Em `src/lib/date.ts`, acrescentar:

```ts
import { type Locale, htmlLang } from '@/lib/i18n'

/** 'YYYY-MM-DD' → '12/08/2026' (pt) ou '08/12/2026' (en). */
export function formatarData(data: string, locale: Locale): string {
  return new Date(`${data}T12:00:00Z`).toLocaleDateString(htmlLang[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** 'YYYY-MM-DD' → '06/2026'. */
export function formatarMesAno(data: string): string {
  return `${data.slice(5, 7)}/${data.slice(0, 4)}`
}

/** 2026, 8 → '2026 — Agosto' / '2026 — August'. */
export function formatarMesLongo(ano: number, mes: number, locale: Locale): string {
  const nome = new Date(Date.UTC(ano, mes - 1, 1)).toLocaleDateString(htmlLang[locale], {
    month: 'long',
    timeZone: 'UTC',
  })
  return `${ano} — ${nome.charAt(0).toUpperCase()}${nome.slice(1)}`
}
```

- [ ] **Step 4: Implementar os quatro componentes**

`src/components/archive/StatRail.tsx`:

```tsx
import { ui } from '@/content/ui'
import { formatarData, formatarMesAno } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'

export function StatRail({ locale, posts }: { locale: Locale; posts: Post[] }) {
  if (posts.length === 0) return null

  const maisRecente = posts[0]
  const maisAntigo = posts[posts.length - 1]

  return (
    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
      <div>
        <dt className="sr-only">{t(ui.newsletter.textos, locale)}</dt>
        <dd>
          <span className="text-accent">{posts.length}</span> {t(ui.newsletter.textos, locale)}
        </dd>
      </div>
      <div>
        <dt className="sr-only">{t(ui.newsletter.desde, locale)}</dt>
        <dd>
          {t(ui.newsletter.desde, locale)} <span className="text-accent">{formatarMesAno(maisAntigo.data)}</span>
        </dd>
      </div>
      <div>
        <dt className="sr-only">{t(ui.newsletter.ultimo, locale)}</dt>
        {/* Data absoluta de propósito: o site é estático e "há N dias" congelaria no build. */}
        <dd>
          {t(ui.newsletter.ultimo, locale)}{' '}
          <span className="text-accent">{formatarData(maisRecente.data, locale)}</span>
        </dd>
      </div>
    </dl>
  )
}
```

`src/components/archive/PillarCards.tsx`:

```tsx
import Link from 'next/link'
import { descricaoPilar } from '@/content/pilares'
import { type Locale, t } from '@/lib/i18n'
import { type Pilar, type Post, pilares } from '@/lib/posts'
import { caminhoPilar } from '@/lib/routes'

const MESES_MINIMOS_PARA_CADENCIA = 4

function mesesDistintos(posts: Post[]): string[] {
  return [...new Set(posts.map((post) => post.data.slice(0, 7)))].sort().reverse()
}

function Cadencia({ posts, meses }: { posts: Post[]; meses: string[] }) {
  const contagens = meses.map((mes) => posts.filter((post) => post.data.startsWith(mes)).length)
  const maximo = Math.max(1, ...contagens)

  return (
    <div data-cadencia className="mt-3 flex h-4 items-end gap-0.5" aria-hidden="true">
      {[...contagens].reverse().map((valor, i) => (
        <span
          key={meses[i]}
          className="w-1 bg-accent/40"
          style={{ height: `${Math.max(8, (valor / maximo) * 100)}%` }}
        />
      ))}
    </div>
  )
}

export function PillarCards({ locale, posts }: { locale: Locale; posts: Post[] }) {
  const meses = mesesDistintos(posts)
  const mostrarCadencia = meses.length >= MESES_MINIMOS_PARA_CADENCIA

  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-3">
      {pilares.map((pilar: Pilar) => {
        const doPilar = posts.filter((post) => post.pilar === pilar)
        const { nome, descricao } = descricaoPilar[pilar]

        return (
          <li key={pilar}>
            <Link
              href={caminhoPilar(locale, pilar)}
              className="block h-full rounded border border-line bg-raised p-4 transition-colors hover:border-accent"
            >
              <span className="font-mono text-2xl text-accent">
                {String(doPilar.length).padStart(2, '0')}
              </span>
              <span className="mt-1 block font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                {t(nome, locale)}
              </span>
              <span className="mt-1 block text-sm text-muted">{t(descricao, locale)}</span>
              {mostrarCadencia ? <Cadencia posts={doPilar} meses={meses} /> : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
```

`src/components/archive/PostRow.tsx`:

```tsx
import Link from 'next/link'
import { formatarData } from '@/lib/date'
import { type Locale } from '@/lib/i18n'
import type { Post } from '@/lib/posts'

export function PostRow({
  locale,
  post,
  comResumo = false,
}: {
  locale: Locale
  post: Post
  comResumo?: boolean
}) {
  return (
    <li className="flex gap-4 border-b border-dotted border-line py-2 last:border-b-0">
      <span data-pilar={post.pilar} className="mt-1 w-0.5 shrink-0 self-stretch rounded bg-accent/40" />
      <time dateTime={post.data} className="mt-0.5 w-24 shrink-0 font-mono text-xs tabular-nums text-muted">
        {formatarData(post.data, locale)}
      </time>
      <div className="min-w-0">
        <Link href={`/${locale}/posts/${post.slug}`} className="font-serif text-lg text-ink hover:text-accent">
          {post.titulo}
        </Link>
        {comResumo ? <p className="text-sm text-muted">{post.resumo}</p> : null}
        <ul className="mt-0.5 flex flex-wrap gap-x-3 font-mono text-[0.7rem] text-accent/90">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link href={`/${locale}/tags/${tag}`}>#{tag}</Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}
```

`src/components/archive/ArchiveList.tsx`:

```tsx
import { PostRow } from '@/components/archive/PostRow'
import { formatarMesLongo } from '@/lib/date'
import type { Locale } from '@/lib/i18n'
import { agruparPorMes, type Post } from '@/lib/posts'

export function ArchiveList({ locale, posts }: { locale: Locale; posts: Post[] }) {
  if (posts.length === 0) return null

  return (
    <div>
      {agruparPorMes(posts).map((grupo) => (
        <section key={`${grupo.ano}-${grupo.mes}`} className="mt-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
            {formatarMesLongo(grupo.ano, grupo.mes, locale)}
          </h3>
          <ul className="mt-2">
            {grupo.posts.map((post) => (
              <PostRow key={post.slug} locale={locale} post={post} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Rodar até passar**

Run: `npx vitest run src/components/archive src/lib/routes.test.ts && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/archive src/lib/date.ts src/lib/routes.ts src/lib/routes.test.ts
git commit -m "feat: componentes do arquivo da newsletter"
```

---

### Task 6: Páginas de pilar

**Files:**
- Create: `src/app/[locale]/pilares/[pilar]/page.tsx`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `Pilar`, `pilares`, `lerPosts`, `postsDoLocale` de `@/lib/posts`; `caminhoPilar` de `@/lib/routes` (Task 5); `descricaoPilar` de `@/content/pilares`; `<ArchiveList/>` (Task 5).
- Produces: as rotas `/pt/pilares/[pilar]` e `/en/pillars/[pilar]`.

- [ ] **Step 1: Adicionar o rewrite**

Substituir `next.config.ts` por:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/pt', permanent: true }]
  },
  async rewrites() {
    // A pasta real é `pilares`; a URL inglesa é `pillars`. Ver src/lib/routes.ts.
    return [{ source: '/en/pillars/:pilar', destination: '/en/pilares/:pilar' }]
  },
}

export default nextConfig
```

- [ ] **Step 2: Criar a página do pilar**

Criar `src/app/[locale]/pilares/[pilar]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { TopBar } from '@/components/ui/TopBar'
import { descricaoPilar } from '@/content/pilares'
import { isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, pilares, postsDoLocale, type Pilar } from '@/lib/posts'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.flatMap((locale) => pilares.map((pilar) => ({ locale, pilar })))
}

export default async function PilarPage({ params }: { params: Promise<{ locale: string; pilar: string }> }) {
  const { locale, pilar } = await params
  if (!isLocale(locale) || !(pilares as readonly string[]).includes(pilar)) notFound()

  const { nome, descricao } = descricaoPilar[pilar as Pilar]
  const posts = postsDoLocale(lerPosts(), locale).filter((post) => post.pilar === pilar)

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        <h1 className="font-serif text-3xl text-ink">{t(nome, locale)}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t(descricao, locale)}</p>
        <ArchiveList locale={locale} posts={posts} />
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Rodar, buildar e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint && npm run build`
Expected: PASS e build concluído.

```bash
git add src/app/\[locale\]/pilares next.config.ts
git commit -m "feat: páginas de pilar com segmento traduzido em inglês"
```

---

### Task 7: Newsletter como home e portfólio movido

O corte. Depois desta task, `/pt` é a Newsletter.

**Files:**
- Create: `src/app/[locale]/portfolio/page.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Create: `src/app/[locale]/page.test.tsx` — **substitui** o teste existente
- Modify: `src/components/ui/TopBar.tsx`
- Create: `src/components/ui/SiteFooter.tsx` + `SiteFooter.test.tsx`

**Interfaces:**
- Consumes: tudo das Tasks 2–6.
- Produces: a rota `/[locale]` (Newsletter) e `/[locale]/portfolio`.

- [ ] **Step 1: Mover o one-pager para `/portfolio`**

Criar `src/app/[locale]/portfolio/page.tsx` com **exatamente** o conteúdo atual de `src/app/[locale]/page.tsx` (o componente que monta `HeroSection`…`ContactSection`), renomeando a função de `PortfolioPage` para `PortfolioPage` (o nome já é esse) e mantendo o `TopBar` e o `footer`. Mover também `src/app/[locale]/page.test.tsx` para `src/app/[locale]/portfolio/page.test.tsx`, sem alterar as asserções — o conteúdo é o mesmo, só mudou de rota.

- [ ] **Step 2: Escrever o teste da nova home, que falha**

Criar `src/app/[locale]/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NewsletterPage from '@/app/[locale]/page'

describe('Newsletter (home)', () => {
  it('mostra o nome do autor e o bloco de identidade', async () => {
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'pt' }) }))

    expect(screen.getByRole('heading', { level: 1, name: 'Yuri Oliveira' })).toBeInTheDocument()
  })

  it('linka para o portfólio', async () => {
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'pt' }) }))

    expect(screen.getByRole('link', { name: 'Portfólio' })).toHaveAttribute('href', '/pt/portfolio')
  })

  it('não tem seção "sobre mim" fora do bloco de identidade', async () => {
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'pt' }) }))

    expect(screen.queryByRole('heading', { level: 2, name: 'Sobre' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Experiência' })).not.toBeInTheDocument()
  })

  it('mostra as três trilhas', async () => {
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'pt' }) }))

    expect(screen.getByRole('heading', { level: 2, name: 'Trilhas' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `npx vitest run src/app/\[locale\]/page.test.tsx`
Expected: FAIL — a home ainda é o portfólio, não tem "Trilhas".

- [ ] **Step 4: Implementar a Newsletter**

Substituir `src/app/[locale]/page.tsx` por:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { PillarCards } from '@/components/archive/PillarCards'
import { PostRow } from '@/components/archive/PostRow'
import { StatRail } from '@/components/archive/StatRail'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { profile } from '@/content/profile'
import { ui } from '@/content/ui'
import { isLocale, t } from '@/lib/i18n'
import { lerPosts, postsDoLocale } from '@/lib/posts'

export default async function NewsletterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const posts = postsDoLocale(lerPosts(), locale)
  const destaques = posts.filter((post) => post.destaque)

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        <h1 className="font-serif text-4xl text-ink md:text-5xl">{profile.name}</h1>
        <p className="mt-3 max-w-2xl text-muted">{t(profile.headline, locale)}</p>
        <p className="mt-4 font-mono text-xs text-accent">
          <Link href={`/${locale}/portfolio`} className="border-b border-accent/40">
            {t(ui.nav.portfolio, locale)}
          </Link>
        </p>
        <StatRail locale={locale} posts={posts} />

        <section className="mt-12 border-t border-line pt-6" aria-labelledby="trilhas">
          <h2 id="trilhas" className="font-mono text-xs uppercase tracking-widest text-muted">
            {t(ui.newsletter.trilhas, locale)}
          </h2>
          <PillarCards locale={locale} posts={posts} />
        </section>

        {destaques.length > 0 ? (
          <section className="mt-12 border-t border-line pt-6" aria-labelledby="destaques">
            <h2 id="destaques" className="font-mono text-xs uppercase tracking-widest text-muted">
              {t(ui.newsletter.destaques, locale)}
            </h2>
            <ul className="mt-2">
              {destaques.map((post) => (
                <PostRow key={post.slug} locale={locale} post={post} comResumo />
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-12 border-t border-line pt-6" aria-labelledby="arquivo">
          <h2 id="arquivo" className="font-mono text-xs uppercase tracking-widest text-muted">
            {t(ui.newsletter.arquivo, locale)}
          </h2>
          <ArchiveList locale={locale} posts={posts} />
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}
```

- [ ] **Step 5: Criar o rodapé global com o vínculo declarado**

Criar `src/components/ui/SiteFooter.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from '@/components/ui/SiteFooter'

describe('SiteFooter', () => {
  it('declara o vínculo com o instituto em todas as páginas', () => {
    render(<SiteFooter locale="pt" />)

    expect(screen.getByRole('link', { name: /ibe\.IA/ })).toHaveAttribute('href', 'https://ibe.ia.br/')
  })

  it('linka o RSS do idioma corrente', () => {
    render(<SiteFooter locale="en" />)

    expect(screen.getByRole('link', { name: 'RSS' })).toHaveAttribute('href', '/en/index.xml')
  })
})
```

Criar `src/components/ui/SiteFooter.tsx`:

```tsx
import { ui } from '@/content/ui'
import { profile } from '@/content/profile'
import { type Locale, t } from '@/lib/i18n'

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="flex flex-wrap justify-between gap-4 border-t border-line py-8 font-mono text-xs text-muted">
      <span>{profile.name}</span>
      <span>
        {t(ui.footer.vinculo, locale)}{' '}
        <a href="https://ibe.ia.br/" className="text-accent">
          ibe.IA
        </a>
      </span>
      <a href={`/${locale}/index.xml`}>RSS</a>
    </footer>
  )
}
```

Acrescentar em `src/content/ui.ts`:

```ts
  footer: {
    vinculo: { pt: 'Assistente de ensino no', en: 'Teaching assistant at' },
  },
```

- [ ] **Step 6: Acrescentar a navegação no TopBar**

Substituir `src/components/ui/TopBar.tsx` por:

```tsx
import Link from 'next/link'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'
import { SkipLink } from '@/components/ui/SkipLink'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function TopBar({ locale }: { locale: Locale }) {
  return (
    <header className="flex items-center justify-between gap-2 py-6">
      <SkipLink locale={locale} />
      <nav className="flex gap-4 font-mono text-xs text-muted">
        <Link href={`/${locale}`}>{t(ui.nav.newsletter, locale)}</Link>
        <Link href={`/${locale}/portfolio`}>{t(ui.nav.portfolio, locale)}</Link>
      </nav>
      <div className="flex items-center gap-2">
        <LocaleSwitch locale={locale} />
        <ThemeToggle locale={locale} />
      </div>
    </header>
  )
}
```

- [ ] **Step 7: Rodar tudo e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint && npm run build`
Expected: PASS. Se algum teste de seção do portfólio falhar por causa da mudança de rota, ajustar **só o caminho de import**, nunca a asserção.

```bash
git add src/app/\[locale\] src/components/ui/TopBar.tsx src/components/ui/SiteFooter.tsx src/components/ui/SiteFooter.test.tsx src/content/ui.ts
git commit -m "feat: newsletter como home e portfólio movido para /portfolio"
```

---

### Task 8: Páginas de tag

**Files:**
- Create: `src/app/[locale]/tags/page.tsx`
- Create: `src/app/[locale]/tags/[tag]/page.tsx`
- Create: `src/lib/tags.ts` + `src/lib/tags.test.ts`

**Interfaces:**
- Consumes: `Post`, `postsDoLocale` de `@/lib/posts`.
- Produces: `contarTags(posts: Post[]): { tag: string; total: number }[]` de `@/lib/tags`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/tags.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { contarTags } from '@/lib/tags'
import { postFixture } from '@/test/fixtures'

describe('contarTags', () => {
  it('conta quantos posts cada tag tem', () => {
    const contagem = contarTags(postFixture)

    expect(contagem.find((c) => c.tag === 'estatistica')?.total).toBe(1)
  })

  it('ordena por total decrescente e, no empate, alfabeticamente', () => {
    const contagem = contarTags([...postFixture, { ...postFixture[1], slug: 'outro', tags: ['estatistica'] }])

    expect(contagem[0]).toEqual({ tag: 'estatistica', total: 2 })
    expect(contagem.slice(1).map((c) => c.tag)).toEqual(['ensino', 'esports', 'ia', 'probabilidade'])
  })

  it('devolve lista vazia sem posts', () => {
    expect(contarTags([])).toEqual([])
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/lib/tags.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Criar `src/lib/tags.ts`:

```ts
import type { Post } from '@/lib/posts'

export function contarTags(posts: Post[]): { tag: string; total: number }[] {
  const totais = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) totais.set(tag, (totais.get(tag) ?? 0) + 1)
  }

  return [...totais.entries()]
    .map(([tag, total]) => ({ tag, total }))
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag))
}
```

- [ ] **Step 4: Criar as duas páginas**

Criar `src/app/[locale]/tags/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { ui } from '@/content/ui'
import { isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, postsDoLocale } from '@/lib/posts'
import { contarTags } from '@/lib/tags'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function TagsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const tags = contarTags(postsDoLocale(lerPosts(), locale))

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        <h1 className="font-serif text-3xl text-ink">{t(ui.newsletter.verTodas, locale)}</h1>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm">
          {tags.map(({ tag, total }) => (
            <li key={tag}>
              <Link href={`/${locale}/tags/${tag}`} className="text-accent">
                #{tag}
              </Link>{' '}
              <span className="text-muted tabular-nums">{total}</span>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}
```

Criar `src/app/[locale]/tags/[tag]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { isLocale, locales } from '@/lib/i18n'
import { lerPosts, postsDoLocale } from '@/lib/posts'
import { contarTags } from '@/lib/tags'

export const dynamicParams = false

export function generateStaticParams() {
  const posts = lerPosts()
  return locales.flatMap((locale) =>
    contarTags(postsDoLocale(posts, locale)).map(({ tag }) => ({ locale, tag })),
  )
}

export default async function TagPage({ params }: { params: Promise<{ locale: string; tag: string }> }) {
  const { locale, tag } = await params
  if (!isLocale(locale)) notFound()

  const posts = postsDoLocale(lerPosts(), locale).filter((post) => post.tags.includes(tag))
  if (posts.length === 0) notFound()

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        <h1 className="font-mono text-2xl text-accent">#{tag}</h1>
        <ArchiveList locale={locale} posts={posts} />
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}
```

- [ ] **Step 5: Rodar e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint && npm run build`
Expected: PASS.

```bash
git add src/lib/tags.ts src/lib/tags.test.ts src/app/\[locale\]/tags
git commit -m "feat: índice de tags e página por tag"
```

---

### Task 9: Página do post, com cabeçalho, corpo e figura

**Files:**
- Create: `src/components/post/PostHeader.tsx` + `PostHeader.test.tsx`
- Create: `src/components/post/Figura.tsx` + `Figura.test.tsx`
- Create: `src/app/[locale]/posts/[slug]/page.tsx`
- Modify: `src/lib/mdx.tsx`

**Interfaces:**
- Consumes: `Post`, `parLinguistico`, `lerPosts`, `postsDoLocale`; `tempoDeLeitura`; `descricaoPilar`; `caminhoPilar`.
- Produces: `<PostHeader locale post />`, `<Figura numero legenda>…</Figura>`, e a rota `/[locale]/posts/[slug]`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/components/post/PostHeader.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostHeader } from '@/components/post/PostHeader'
import { postFixture } from '@/test/fixtures'

describe('PostHeader', () => {
  it('mostra pilar, data, tempo de leitura e título', () => {
    render(<PostHeader locale="pt" post={postFixture[0]} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Post com CTA' })).toBeInTheDocument()
    expect(screen.getByText(/Projetos/)).toBeInTheDocument()
    expect(screen.getByText(/12\/08\/2026/)).toBeInTheDocument()
    expect(screen.getByText(/min de leitura/)).toBeInTheDocument()
  })

  it('mostra o resumo como linha de apoio', () => {
    render(<PostHeader locale="pt" post={postFixture[0]} />)

    expect(screen.getByText('Resumo do post com CTA.')).toBeInTheDocument()
  })

  it('não mostra "atualizado em" quando o post nunca foi atualizado', () => {
    render(<PostHeader locale="pt" post={postFixture[0]} />)

    expect(screen.queryByText(/atualizado em/)).not.toBeInTheDocument()
  })

  it('mostra "atualizado em" quando o post declara a data', () => {
    render(<PostHeader locale="pt" post={{ ...postFixture[0], atualizado: '2026-08-19' }} />)

    expect(screen.getByText(/atualizado em 19\/08\/2026/)).toBeInTheDocument()
  })
})
```

Criar `src/components/post/Figura.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Figura } from '@/components/post/Figura'

describe('Figura', () => {
  it('numera a legenda e associa ao conteúdo', () => {
    render(
      <Figura numero={1} legenda="Curva de calibração.">
        <svg role="img" aria-label="gráfico" />
      </Figura>,
    )

    expect(screen.getByText(/Fig\. 1/)).toBeInTheDocument()
    expect(screen.getByText(/Curva de calibração\./)).toBeInTheDocument()
    expect(screen.getByRole('figure')).toContainElement(screen.getByRole('img', { name: 'gráfico' }))
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/components/post`
Expected: FAIL.

- [ ] **Step 3: Implementar os componentes**

Criar `src/components/post/Figura.tsx`:

```tsx
import type { ReactNode } from 'react'

export function Figura({
  numero,
  legenda,
  children,
}: {
  numero: number
  legenda: string
  children: ReactNode
}) {
  return (
    <figure className="my-6">
      {children}
      <figcaption className="mt-2 border-t border-line pt-2 font-mono text-xs text-muted">
        <span className="text-ink">Fig. {numero}</span> — {legenda}
      </figcaption>
    </figure>
  )
}
```

Criar `src/components/post/PostHeader.tsx`:

```tsx
import Link from 'next/link'
import { descricaoPilar } from '@/content/pilares'
import { ui } from '@/content/ui'
import { formatarData } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'
import { caminhoPilar } from '@/lib/routes'
import { tempoDeLeitura } from '@/lib/reading'

export function PostHeader({ locale, post }: { locale: Locale; post: Post }) {
  return (
    <header>
      <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
        <Link href={caminhoPilar(locale, post.pilar)} className="text-accent">
          {t(descricaoPilar[post.pilar].nome, locale)}
        </Link>
        {' · '}
        <time dateTime={post.data}>{formatarData(post.data, locale)}</time>
        {' · '}
        <span>
          {tempoDeLeitura(post.corpo)} {t(ui.post.tempoLeitura, locale)}
        </span>
        {post.atualizado ? (
          <>
            {' · '}
            <span>
              {t(ui.post.atualizadoEm, locale)} {formatarData(post.atualizado, locale)}
            </span>
          </>
        ) : null}
      </p>
      <h1 className="mt-2 max-w-[24em] font-serif text-3xl text-ink md:text-4xl">{post.titulo}</h1>
      <p className="mt-2 max-w-2xl text-muted">{post.resumo}</p>
      <ul className="mt-3 flex flex-wrap gap-x-3 font-mono text-xs text-accent/90">
        {post.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/${locale}/tags/${tag}`}>#{tag}</Link>
          </li>
        ))}
      </ul>
    </header>
  )
}
```

- [ ] **Step 4: Registrar `Figura` no pipeline MDX**

Em `src/lib/mdx.tsx`, substituir a linha `export const componentesMdx: MDXComponents = {}` por:

```tsx
import { Figura } from '@/components/post/Figura'

/** Componentes disponíveis dentro de qualquer MDX. */
export const componentesMdx: MDXComponents = { Figura }
```

- [ ] **Step 5: Criar a página do post**

Criar `src/app/[locale]/posts/[slug]/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostHeader } from '@/components/post/PostHeader'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { ui } from '@/content/ui'
import { isLocale, locales, otherLocale, t } from '@/lib/i18n'
import { renderizarMdx } from '@/lib/mdx'
import { lerPosts, parLinguistico } from '@/lib/posts'

export const dynamicParams = false

export function generateStaticParams() {
  const slugs = [...new Set(lerPosts().map((post) => post.slug))]
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export default async function PostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const par = parLinguistico(lerPosts(), slug)
  const post = par[locale]
  const alternativo = par[otherLocale(locale)]

  if (!post && !alternativo) notFound()

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        {post ? (
          <article>
            <PostHeader locale={locale} post={post} />
            <div className="mt-8 max-w-[34em]">{await renderizarMdx(post.corpo)}</div>
          </article>
        ) : (
          // Não é 404: o texto existe, só não neste idioma.
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl text-ink">{alternativo!.titulo}</h1>
            <p className="mt-4 text-muted">
              {t(alternativo!.locale === 'pt' ? ui.post.soEmPortugues : ui.post.soEmIngles, locale)}
            </p>
            <p className="mt-4 font-mono text-xs">
              <Link href={`/${alternativo!.locale}/posts/${slug}`} className="text-accent">
                {t(ui.post.lerNoIdiomaDisponivel, locale)}
              </Link>
            </p>
          </div>
        )}
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}
```

- [ ] **Step 6: Estilizar o corpo do post**

Tailwind zera a aparência de todo elemento HTML, e o MDX gera HTML sem
classe nenhuma — sem este passo, o corpo do post sai como texto corrido sem
hierarquia, tabela sem borda e código sem fundo. Acrescentar ao final de
`src/app/globals.css`:

```css
/* Corpo de post. O MDX gera HTML sem classes, então a estilização é por elemento. */
.corpo-post {
  font-size: 1.0625rem;
  line-height: 1.75;
}

.corpo-post > p + p {
  margin-top: 0.75rem;
}

/* Capitular só no primeiro parágrafo, e só quando ele não é um bloco especial. */
.corpo-post > p:first-child::first-letter {
  font-family: var(--font-instrument-serif), Georgia, serif;
  font-size: 3.1em;
  float: left;
  line-height: 0.82;
  padding: 0.18rem 0.4rem 0 0;
  color: var(--accent);
}

.corpo-post h2 {
  font-family: var(--font-instrument-serif), Georgia, serif;
  font-size: 1.6rem;
  margin: 2rem 0 0.5rem;
  scroll-margin-top: 2rem;
}

.corpo-post h3 {
  font-family: var(--font-instrument-serif), Georgia, serif;
  font-size: 1.25rem;
  margin: 1.5rem 0 0.4rem;
  scroll-margin-top: 2rem;
}

.corpo-post a {
  color: var(--accent);
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
}

.corpo-post ul,
.corpo-post ol {
  margin: 0.75rem 0 0.75rem 1.25rem;
  list-style: revert;
}

.corpo-post blockquote {
  border-left: 2px solid var(--accent);
  padding-left: 0.9rem;
  color: var(--muted);
  margin: 1rem 0;
}

.corpo-post table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.25rem 0;
  font-size: 0.9rem;
}

.corpo-post th {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  text-align: left;
  font-weight: 400;
  border-bottom: 1px solid var(--ink);
  padding: 0.3rem 0.6rem 0.3rem 0;
}

.corpo-post td {
  padding: 0.3rem 0.6rem 0.3rem 0;
  border-bottom: 1px dotted var(--line);
  /* Números de resultado alinham por dígito; é metade da leitura de uma tabela. */
  font-variant-numeric: tabular-nums;
}

.corpo-post td:not(:first-child) {
  text-align: right;
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
}

.corpo-post :not(pre) > code {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 0.875em;
  background: var(--raised);
  border: 1px solid var(--line);
  border-radius: 2px;
  padding: 0.05rem 0.3rem;
}

.corpo-post pre {
  background: var(--raised);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 0.9rem 1rem;
  margin: 1.25rem 0;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.6;
}

/* A tabela é o único elemento que pode estourar a medida no celular. */
.corpo-post table {
  display: block;
  overflow-x: auto;
}
```

Trocar, em `src/app/[locale]/posts/[slug]/page.tsx`, a `div` que envolve o MDX
por `<div className="corpo-post mt-8 max-w-[34em]">`.

> **Sobre as notas de fim de texto:** não há plugin para isso. A nota é escrita
> como uma seção normal (`## Notas`) com uma lista — que já ganha o estilo
> acima. Menos maquinaria, e a nota aparece no índice de seções de graça.

> **Sobre "idioma disponível" no cabeçalho:** a spec pede que o cabeçalho
> mostre em que idiomas o texto existe. Isso **não** vira um controle novo: o
> `LocaleSwitch` no `TopBar` já preserva o caminho ao trocar de idioma, e o
> `hreflang` da Task 13 declara só os idiomas que existem. Duplicar o controle
> dentro do artigo seria duas fontes de verdade para a mesma navegação.

- [ ] **Step 7: Rodar e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint && npm run build`
Expected: PASS.

```bash
git add src/components/post src/app/\[locale\]/posts src/lib/mdx.tsx src/app/globals.css
git commit -m "feat: página de post com cabeçalho, corpo em MDX e figura numerada"
```

---

### Task 10: Índice de seções (o único componente cliente)

**Files:**
- Create: `src/components/post/PostToc.tsx` + `PostToc.test.tsx`
- Create: `src/lib/headings.ts` + `src/lib/headings.test.ts`
- Modify: `src/app/[locale]/posts/[slug]/page.tsx`

**Interfaces:**
- Consumes: `Post`.
- Produces: `extrairSecoes(corpo: string): { id: string; texto: string }[]` de `@/lib/headings`; `<PostToc locale secoes />`.

- [ ] **Step 1: Escrever o teste da extração**

Criar `src/lib/headings.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { extrairSecoes } from '@/lib/headings'

describe('extrairSecoes', () => {
  it('pega os títulos de nível 2 com id no mesmo formato do rehype-slug', () => {
    const secoes = extrairSecoes('## Primeira seção\n\ntexto\n\n## Segunda Seção\n')

    expect(secoes).toEqual([
      { id: 'primeira-secao', texto: 'Primeira seção' },
      { id: 'segunda-secao', texto: 'Segunda Seção' },
    ])
  })

  it('ignora títulos dentro de bloco de código', () => {
    expect(extrairSecoes('```md\n## Não é seção\n```\n')).toEqual([])
  })

  it('devolve lista vazia em post sem seções', () => {
    expect(extrairSecoes('Só um parágrafo.')).toEqual([])
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/lib/headings.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar a extração**

Criar `src/lib/headings.ts`:

```ts
/** Mesma normalização do rehype-slug, para o link do índice casar com a âncora. */
function paraId(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function extrairSecoes(corpo: string): { id: string; texto: string }[] {
  const semCodigo = corpo.replace(/```[\s\S]*?```/g, '')

  return [...semCodigo.matchAll(/^##\s+(.+)$/gm)].map((casou) => {
    const texto = casou[1].trim()
    return { id: paraId(texto), texto }
  })
}
```

- [ ] **Step 4: Escrever o teste do componente**

Criar `src/components/post/PostToc.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostToc } from '@/components/post/PostToc'

const secoes = [
  { id: 'primeira', texto: 'Primeira' },
  { id: 'segunda', texto: 'Segunda' },
]

describe('PostToc', () => {
  it('lista as seções com âncora', () => {
    render(<PostToc locale="pt" secoes={secoes} />)

    expect(screen.getByRole('link', { name: 'Primeira' })).toHaveAttribute('href', '#primeira')
  })

  it('marca a primeira seção como atual antes de qualquer scroll', () => {
    render(<PostToc locale="pt" secoes={secoes} />)

    expect(screen.getByRole('link', { name: 'Primeira' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Segunda' })).not.toHaveAttribute('aria-current')
  })

  it('não renderiza nada em post sem seções', () => {
    const { container } = render(<PostToc locale="pt" secoes={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('rotula a navegação para leitor de tela', () => {
    render(<PostToc locale="pt" secoes={secoes} />)

    expect(screen.getByRole('navigation', { name: 'Neste texto' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Rodar e confirmar que falha**

Run: `npx vitest run src/components/post/PostToc.test.tsx`
Expected: FAIL.

- [ ] **Step 6: Implementar o componente cliente**

Criar `src/components/post/PostToc.tsx`:

```tsx
'use client'

// Único componente cliente do projeto: marcar a seção atual exige observar o scroll.
import { useEffect, useState } from 'react'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function PostToc({
  locale,
  secoes,
}: {
  locale: Locale
  secoes: { id: string; texto: string }[]
}) {
  const [atual, setAtual] = useState(secoes[0]?.id)

  useEffect(() => {
    if (secoes.length === 0) return

    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.find((entrada) => entrada.isIntersecting)
        if (visivel) setAtual(visivel.target.id)
      },
      { rootMargin: '-10% 0px -70% 0px' },
    )

    for (const secao of secoes) {
      const alvo = document.getElementById(secao.id)
      if (alvo) observador.observe(alvo)
    }

    return () => observador.disconnect()
  }, [secoes])

  if (secoes.length === 0) return null

  return (
    <nav aria-label={t(ui.post.nesteTexto, locale)} className="font-mono text-xs">
      <p className="uppercase tracking-widest text-muted">{t(ui.post.nesteTexto, locale)}</p>
      <ul className="mt-3 space-y-2 border-l border-line pl-3">
        {secoes.map((secao) => (
          <li key={secao.id}>
            <a
              href={`#${secao.id}`}
              aria-current={secao.id === atual ? 'true' : undefined}
              className={secao.id === atual ? 'text-accent' : 'text-muted'}
            >
              {secao.texto}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 7: Encaixar o índice na página do post**

Em `src/app/[locale]/posts/[slug]/page.tsx`, trocar o bloco `<article>` por:

```tsx
          <article className="grid gap-8 md:grid-cols-[9.5rem_1fr]">
            <div className="md:sticky md:top-6 md:self-start">
              <PostToc locale={locale} secoes={extrairSecoes(post.corpo)} />
            </div>
            <div>
              <PostHeader locale={locale} post={post} />
              <div className="corpo-post mt-8 max-w-[34em]">{await renderizarMdx(post.corpo)}</div>
            </div>
          </article>
```

E acrescentar os imports:

```tsx
import { PostToc } from '@/components/post/PostToc'
import { extrairSecoes } from '@/lib/headings'
```

- [ ] **Step 8: Rodar e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint && npm run build`
Expected: PASS.

```bash
git add src/components/post/PostToc.tsx src/components/post/PostToc.test.tsx src/lib/headings.ts src/lib/headings.test.ts src/app/\[locale\]/posts
git commit -m "feat: índice de seções fixo na página de post"
```

---

### Task 11: Rodapé do artigo, com relacionados e CTA

**Files:**
- Create: `src/components/post/PostFooter.tsx` + `PostFooter.test.tsx`
- Create: `src/lib/relacionados.ts` + `src/lib/relacionados.test.ts`
- Modify: `src/app/[locale]/posts/[slug]/page.tsx`

**Interfaces:**
- Consumes: `Post`; `ctaDoPost`.
- Produces: `relacionados(posts: Post[], atual: Post, limite?: number): Post[]` de `@/lib/relacionados`; `<PostFooter locale post relacionados />`.

- [ ] **Step 1: Escrever o teste dos relacionados**

Criar `src/lib/relacionados.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { relacionados } from '@/lib/relacionados'
import { postFixture } from '@/test/fixtures'

describe('relacionados', () => {
  it('nunca inclui o próprio post', () => {
    const lista = relacionados(postFixture, postFixture[0])

    expect(lista.map((p) => p.slug)).not.toContain('com-cta')
  })

  it('prefere posts do mesmo pilar', () => {
    const mesmoPilar = { ...postFixture[1], slug: 'outro-projetos', pilar: 'projetos' as const, tags: ['nada-a-ver'] }
    const lista = relacionados([...postFixture, mesmoPilar], postFixture[0], 1)

    expect(lista[0].slug).toBe('outro-projetos')
  })

  it('usa tag em comum como segundo critério', () => {
    const comTag = { ...postFixture[1], slug: 'com-tag', tags: ['esports'] }
    const lista = relacionados([postFixture[0], comTag, postFixture[2]], postFixture[0], 1)

    expect(lista[0].slug).toBe('com-tag')
  })

  it('respeita o limite', () => {
    expect(relacionados(postFixture, postFixture[0], 1)).toHaveLength(1)
  })

  it('devolve lista vazia quando o post é o único', () => {
    expect(relacionados([postFixture[0]], postFixture[0])).toEqual([])
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/lib/relacionados.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Criar `src/lib/relacionados.ts`:

```ts
import type { Post } from '@/lib/posts'

/** Pilar em comum vale mais que tag em comum; empate resolve pela data. */
function afinidade(a: Post, b: Post): number {
  const mesmoPilar = a.pilar === b.pilar ? 10 : 0
  const tagsEmComum = b.tags.filter((tag) => a.tags.includes(tag)).length
  return mesmoPilar + tagsEmComum
}

export function relacionados(posts: Post[], atual: Post, limite = 2): Post[] {
  return posts
    .filter((post) => post.slug !== atual.slug && post.locale === atual.locale)
    .map((post) => ({ post, peso: afinidade(atual, post) }))
    .sort((a, b) => b.peso - a.peso || b.post.data.localeCompare(a.post.data))
    .slice(0, limite)
    .map(({ post }) => post)
}
```

- [ ] **Step 4: Escrever o teste do rodapé — o teste negativo é o mais importante**

Criar `src/components/post/PostFooter.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostFooter } from '@/components/post/PostFooter'
import { postFixture } from '@/test/fixtures'

const [comCta, semCta, deEnsino] = postFixture

describe('PostFooter', () => {
  it('NÃO mostra bloco do instituto quando o post não declara cta', () => {
    render(<PostFooter locale="pt" post={semCta} relacionados={[comCta]} />)

    expect(screen.queryByRole('link', { name: /Formação/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Divulgação/)).not.toBeInTheDocument()
  })

  it('mostra a formação e a divulgação do vínculo quando o post declara cta', () => {
    render(<PostFooter locale="pt" post={comCta} relacionados={[semCta]} />)

    expect(screen.getByRole('link', { name: /IA para Negócios/ })).toBeInTheDocument()
    expect(screen.getByText(/Divulgação: sou assistente de ensino no ibe\.IA/)).toBeInTheDocument()
  })

  it('marca a URL do instituto com origem, meio e campanha', () => {
    render(<PostFooter locale="pt" post={comCta} relacionados={[]} />)

    const href = screen.getByRole('link', { name: /IA para Negócios/ }).getAttribute('href') ?? ''
    const url = new URL(href)

    expect(url.searchParams.get('utm_source')).toBe('yurioliveira.dev')
    expect(url.searchParams.get('utm_campaign')).toBe('com-cta')
  })

  it('lista os posts relacionados com link', () => {
    render(<PostFooter locale="pt" post={comCta} relacionados={[semCta, deEnsino]} />)

    expect(screen.getByRole('link', { name: 'Post sem CTA' })).toHaveAttribute('href', '/pt/posts/sem-cta')
    expect(screen.getByRole('link', { name: 'Post de ensino' })).toBeInTheDocument()
  })

  it('omite a coluna de relacionados quando não há nenhum', () => {
    render(<PostFooter locale="pt" post={comCta} relacionados={[]} />)

    expect(screen.queryByText('No site')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Rodar e confirmar que falha**

Run: `npx vitest run src/components/post/PostFooter.test.tsx`
Expected: FAIL.

- [ ] **Step 6: Implementar o rodapé**

Criar `src/components/post/PostFooter.tsx`:

```tsx
import Link from 'next/link'
import { ui } from '@/content/ui'
import { ctaDoPost } from '@/lib/cta'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'

export function PostFooter({
  locale,
  post,
  relacionados,
}: {
  locale: Locale
  post: Post
  relacionados: Post[]
}) {
  const cta = ctaDoPost(post)

  return (
    <footer className="mt-12 border-t border-ink pt-4">
      <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
        {t(ui.post.daquiVocePodeIr, locale)}
      </p>
      <div className="mt-3 grid gap-6 sm:grid-cols-2">
        {relacionados.length > 0 ? (
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
              {t(ui.post.noSite, locale)}
            </p>
            <ul className="mt-2 space-y-2">
              {relacionados.map((outro) => (
                <li key={outro.slug}>
                  <Link href={`/${locale}/posts/${outro.slug}`} className="font-serif text-ink hover:text-accent">
                    {outro.titulo}
                  </Link>
                  <span className="block text-sm text-muted">{outro.resumo}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Só existe se o post declarou `cta`. Nunca automático. */}
        {cta ? (
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
              {t(ui.post.estudarAFundo, locale)}
            </p>
            <p className="mt-2 text-sm text-muted">
              <a href={cta.url} className="text-accent">
                {cta.formacao.nome}
              </a>{' '}
              — {t(cta.formacao.descricao, locale)}
            </p>
            <p className="mt-3 border-t border-dotted border-line pt-2 font-mono text-[0.65rem] text-muted">
              {t(ui.post.divulgacao, locale)}
            </p>
          </div>
        ) : null}
      </div>
    </footer>
  )
}
```

- [ ] **Step 7: Encaixar na página do post**

Em `src/app/[locale]/posts/[slug]/page.tsx`, dentro do `<div>` da coluna de texto, depois do `renderizarMdx`, acrescentar:

```tsx
              <PostFooter
                locale={locale}
                post={post}
                relacionados={relacionados(postsDoLocale(lerPosts(), locale), post)}
              />
```

E os imports:

```tsx
import { PostFooter } from '@/components/post/PostFooter'
import { relacionados } from '@/lib/relacionados'
import { lerPosts, parLinguistico, postsDoLocale } from '@/lib/posts'
```

- [ ] **Step 8: Rodar e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint && npm run build`
Expected: PASS.

```bash
git add src/components/post src/lib/relacionados.ts src/lib/relacionados.test.ts src/app/\[locale\]/posts
git commit -m "feat: rodapé de artigo com relacionados e CTA opt-in do ibe.IA"
```

---

### Task 12: RSS por idioma

**Files:**
- Create: `src/lib/feed.ts` + `src/lib/feed.test.ts`
- Create: `src/app/[locale]/index.xml/route.ts`

**Interfaces:**
- Consumes: `Post`; `absoluteUrl` de `@/lib/site`; `profile`.
- Produces: `montarFeed(posts: Post[], locale: Locale): string` de `@/lib/feed`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/feed.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { montarFeed } from '@/lib/feed'
import { postFixture } from '@/test/fixtures'

describe('montarFeed', () => {
  it('gera XML de RSS 2.0 com um item por post', () => {
    const xml = montarFeed(postFixture, 'pt')

    expect(xml).toContain('<rss version="2.0"')
    expect(xml.match(/<item>/g)).toHaveLength(3)
  })

  it('usa título e resumo do post', () => {
    const xml = montarFeed([postFixture[0]], 'pt')

    expect(xml).toContain('<title>Post com CTA</title>')
    expect(xml).toContain('Resumo do post com CTA.')
  })

  it('usa link absoluto no idioma do feed', () => {
    const xml = montarFeed([postFixture[0]], 'en')

    expect(xml).toContain('/en/posts/com-cta')
  })

  it('escapa caracteres especiais de XML no título', () => {
    const xml = montarFeed([{ ...postFixture[0], titulo: 'Fé & <ciência>' }], 'pt')

    expect(xml).toContain('F&#233; &amp; &lt;ci&#234;ncia&gt;')
    expect(xml).not.toContain('<ciência>')
  })

  it('gera feed válido mesmo sem posts', () => {
    const xml = montarFeed([], 'pt')

    expect(xml).toContain('<rss version="2.0"')
    expect(xml).not.toContain('<item>')
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/lib/feed.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Criar `src/lib/feed.ts`:

```ts
import { profile } from '@/content/profile'
import { type Locale, htmlLang, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'
import { absoluteUrl } from '@/lib/site'

/** Escapa o que quebra XML e converte não-ASCII em entidade numérica. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/[^\x20-\x7E]/g, (caractere) => `&#${caractere.codePointAt(0)};`)
}

function item(post: Post, locale: Locale): string {
  const link = absoluteUrl(`/${locale}/posts/${post.slug}`)
  const data = new Date(`${post.data}T12:00:00Z`).toUTCString()

  return [
    '<item>',
    `<title>${escapar(post.titulo)}</title>`,
    `<link>${escapar(link)}</link>`,
    `<guid isPermaLink="true">${escapar(link)}</guid>`,
    `<pubDate>${data}</pubDate>`,
    `<description>${escapar(post.resumo)}</description>`,
    ...post.tags.map((tag) => `<category>${escapar(tag)}</category>`),
    '</item>',
  ].join('')
}

export function montarFeed(posts: Post[], locale: Locale): string {
  const titulo = `${profile.name} — Newsletter`

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapar(titulo)}</title>`,
    `<link>${escapar(absoluteUrl(`/${locale}`))}</link>`,
    `<description>${escapar(t(profile.headline, locale))}</description>`,
    `<language>${htmlLang[locale]}</language>`,
    `<atom:link href="${escapar(absoluteUrl(`/${locale}/index.xml`))}" rel="self" type="application/rss+xml"/>`,
    ...posts.map((post) => item(post, locale)),
    '</channel>',
    '</rss>',
  ].join('')
}
```

- [ ] **Step 4: Criar a rota**

Criar `src/app/[locale]/index.xml/route.ts`:

```ts
import { notFound } from 'next/navigation'
import { montarFeed } from '@/lib/feed'
import { isLocale, locales } from '@/lib/i18n'
import { lerPosts, postsDoLocale } from '@/lib/posts'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return new Response(montarFeed(postsDoLocale(lerPosts(), locale), locale), {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  })
}
```

- [ ] **Step 5: Rodar e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint && npm run build`
Expected: PASS.

```bash
git add src/lib/feed.ts src/lib/feed.test.ts src/app/\[locale\]/index.xml
git commit -m "feat: RSS por idioma"
```

---

### Task 13: Sitemap, metadados e imagem de compartilhamento por post

**Files:**
- Modify: `src/app/sitemap.ts` + `src/app/sitemap.test.ts`
- Modify: `src/app/[locale]/posts/[slug]/page.tsx`
- Create: `src/app/[locale]/posts/[slug]/opengraph-image.tsx`

**Interfaces:**
- Consumes: `lerPosts`, `postsDoLocale`, `contarTags`, `pilares`, `caminhoPilar`.
- Produces: sitemap incluindo posts, tags e pilares; `generateMetadata` na página de post.

- [ ] **Step 1: Escrever o teste do sitemap**

Acrescentar em `src/app/sitemap.test.ts`:

```ts
it('inclui a página de cada post nos dois idiomas', () => {
  const urls = sitemap().map((entrada) => entrada.url)

  expect(urls.some((url) => url.includes('/pt/posts/'))).toBe(true)
  expect(urls.some((url) => url.includes('/en/posts/'))).toBe(true)
})

it('inclui o portfólio, as tags e os pilares', () => {
  const urls = sitemap().map((entrada) => entrada.url)

  expect(urls.some((url) => url.endsWith('/pt/portfolio'))).toBe(true)
  expect(urls.some((url) => url.includes('/pt/tags/'))).toBe(true)
  expect(urls.some((url) => url.includes('/en/pillars/'))).toBe(true)
})

it('não repete nenhuma URL', () => {
  const urls = sitemap().map((entrada) => entrada.url)

  expect(new Set(urls).size).toBe(urls.length)
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/app/sitemap.test.ts`
Expected: FAIL — o sitemap atual só tem as duas homes.

- [ ] **Step 3: Reescrever o sitemap**

Substituir `src/app/sitemap.ts` por:

```ts
import type { MetadataRoute } from 'next'
import { htmlLang, locales } from '@/lib/i18n'
import { lerPosts, pilares, postsDoLocale } from '@/lib/posts'
import { caminhoPilar } from '@/lib/routes'
import { absoluteUrl } from '@/lib/site'
import { contarTags } from '@/lib/tags'

export default function sitemap(): MetadataRoute.Sitemap {
  const todos = lerPosts()

  const homes = locales.map((locale) => ({
    url: absoluteUrl(`/${locale}`),
    changeFrequency: 'weekly' as const,
    priority: locale === 'pt' ? 1 : 0.8,
    alternates: {
      languages: {
        [htmlLang.pt]: absoluteUrl('/pt'),
        [htmlLang.en]: absoluteUrl('/en'),
      },
    },
  }))

  const resto = locales.flatMap((locale) => {
    const doLocale = postsDoLocale(todos, locale)

    return [
      { url: absoluteUrl(`/${locale}/portfolio`), changeFrequency: 'monthly' as const, priority: 0.7 },
      { url: absoluteUrl(`/${locale}/tags`), changeFrequency: 'weekly' as const, priority: 0.4 },
      ...pilares.map((pilar) => ({
        url: absoluteUrl(caminhoPilar(locale, pilar)),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
      ...contarTags(doLocale).map(({ tag }) => ({
        url: absoluteUrl(`/${locale}/tags/${tag}`),
        changeFrequency: 'weekly' as const,
        priority: 0.4,
      })),
      ...doLocale.map((post) => ({
        url: absoluteUrl(`/${locale}/posts/${post.slug}`),
        lastModified: post.atualizado ?? post.data,
        changeFrequency: 'yearly' as const,
        priority: 0.9,
      })),
    ]
  })

  return [...homes, ...resto]
}
```

- [ ] **Step 4: Adicionar metadados na página de post**

Em `src/app/[locale]/posts/[slug]/page.tsx`, acrescentar antes do componente:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}

  const par = parLinguistico(lerPosts(), slug)
  const post = par[locale] ?? par[otherLocale(locale)]
  if (!post) return {}

  // hreflang só declara idioma que existe de fato.
  const languages: Record<string, string> = {}
  if (par.pt) languages[htmlLang.pt] = absoluteUrl(`/pt/posts/${slug}`)
  if (par.en) languages[htmlLang.en] = absoluteUrl(`/en/posts/${slug}`)

  return {
    title: post.titulo,
    description: post.resumo,
    alternates: { canonical: `/${locale}/posts/${slug}`, languages },
    openGraph: { title: post.titulo, description: post.resumo, type: 'article' },
  }
}
```

E os imports:

```tsx
import type { Metadata } from 'next'
import { htmlLang } from '@/lib/i18n'
import { absoluteUrl } from '@/lib/site'
```

- [ ] **Step 5: Criar a imagem de compartilhamento do post**

Segue o padrão de `src/app/[locale]/opengraph-image.tsx` (mesmo tamanho, mesmas
cores literais, `alt` estático porque o Next não permite variar por locale
aqui). Criar `src/app/[locale]/posts/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { descricaoPilar } from '@/content/pilares'
import { profile } from '@/content/profile'
import { defaultLocale, isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, parLinguistico } from '@/lib/posts'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
// Next só permite um `alt` estático por rota; este texto vira og:image:alt.
export const alt = profile.name
export const dynamic = 'force-static'

export function generateStaticParams() {
  const slugs = [...new Set(lerPosts().map((post) => post.slug))]
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export default async function PostOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const activeLocale = isLocale(locale) ? locale : defaultLocale

  const par = parLinguistico(lerPosts(), slug)
  const post = par[activeLocale] ?? par.pt ?? par.en

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          backgroundColor: '#faf9f6',
          color: '#1a1a18',
        }}
      >
        <div style={{ fontSize: 28, color: '#5f5e55' }}>
          {post ? t(descricaoPilar[post.pilar].nome, activeLocale) : profile.name}
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.12 }}>{post?.titulo ?? profile.name}</div>
        <div style={{ fontSize: 28, color: '#3d5a45' }}>{profile.name}</div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 6: Rodar e commitar**

Run: `npx vitest run && npm run typecheck && npm run lint && npm run build`
Expected: PASS.

```bash
git add src/app/sitemap.ts src/app/sitemap.test.ts src/app/\[locale\]/posts
git commit -m "feat: sitemap, metadados e imagem de compartilhamento dos posts"
```

---

### Task 14: Fluxo completo no navegador

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`
- Create: `src/content/posts/2026-01-01-post-de-verificacao.pt.mdx` — **temporário**, removido no Step 4

**Interfaces:**
- Consumes: o site inteiro.
- Produces: nada consumido por outra task.

- [ ] **Step 1: Criar um post temporário para o e2e ter o que abrir**

Criar `src/content/posts/2026-01-01-post-de-verificacao.pt.mdx`:

```mdx
---
titulo: Post de verificação
resumo: Post temporário, usado só pelo teste de ponta a ponta.
pilar: projetos
tags: [estatistica]
destaque: true
cta: ia-para-negocios
---

## Primeira seção

Uma fórmula: $$x^2 + y^2 = z^2$$

## Segunda seção

Fim.
```

- [ ] **Step 2: Escrever o teste e2e**

Acrescentar em `tests/e2e/smoke.spec.ts`:

```ts
test('da newsletter até o post, com fórmula e índice', async ({ page }) => {
  await page.goto('/pt')

  await expect(page.getByRole('heading', { level: 1, name: 'Yuri Oliveira' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Trilhas' })).toBeVisible()

  await page.getByRole('link', { name: 'Post de verificação' }).first().click()

  await expect(page.getByRole('heading', { level: 1, name: 'Post de verificação' })).toBeVisible()
  await expect(page.locator('.katex').first()).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Neste texto' })).toBeVisible()
  await expect(page.getByText(/Divulgação/)).toBeVisible()
})

test('trocar de idioma mantém o leitor no mesmo texto', async ({ page }) => {
  await page.goto('/pt/posts/post-de-verificacao')

  await page.getByRole('link', { name: /ingl[eê]s/i }).click()

  await expect(page).toHaveURL(/\/en\/posts\/post-de-verificacao/)
  await expect(page.getByText('Este texto existe apenas em português.')).toBeVisible()
})

test('o portfólio continua acessível na rota nova', async ({ page }) => {
  await page.goto('/pt/portfolio')

  await expect(page.getByRole('heading', { level: 2, name: 'Experiência' })).toBeVisible()
})
```

> **Nota:** o segundo teste funciona sem alteração alguma no `LocaleSwitch` — ele já monta o href com `pathname.replace('/pt', '/en')`, preservando o resto do caminho. Não mexer nesse componente; ele carrega correções de WCAG 2.5.3 e 3.1.2 nos comentários.

- [ ] **Step 3: Rodar o e2e**

Run: `npm run build && npx playwright install --with-deps chromium && npm run test:e2e`
Expected: PASS nos três testes.

- [ ] **Step 4: Verificar que o site builda com a pasta de posts vazia**

Sem apagar nada do git, mover o arquivo para fora da pasta e buildar:

```bash
mv src/content/posts/2026-01-01-post-de-verificacao.pt.mdx /tmp/
npm run build
mv /tmp/2026-01-01-post-de-verificacao.pt.mdx src/content/posts/
```

Expected: o build **passa** com `src/content/posts/` vazio — a home renderiza identidade, trilhas com `00` e nenhum arquivo, e nenhuma página lança. Se algo quebrar, corrigir o componente para tolerar lista vazia: o site precisa buildar antes do primeiro post existir.

O post de verificação **permanece** commitado até a Task 15, quando os textos reais o substituem — o e2e do CI precisa de algum conteúdo para abrir.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/smoke.spec.ts src/content/posts/2026-01-01-post-de-verificacao.pt.mdx
git commit -m "test: fluxo de ponta a ponta da newsletter até o post"
```

---

### Task 15: Fase 0 — três textos reais e publicação

**Esta task é do autor, não de um agente.** Um subagente não pode escrever os aprendizados de outra pessoa. Se você é um agente executando este plano: **pare aqui** e devolva o controle.

**Files:**
- Create: `src/content/posts/<data>-<slug>.pt.mdx` × 3
- Delete: `src/content/posts/2026-01-01-post-de-verificacao.pt.mdx`

- [ ] **Step 1: Escrever três textos, um por pilar**

Um de `academico`, um de `ensino`, um de `projetos`. Motivo: com um mês só de arquivo e trilhas em `00`/`01`, a home entrega um site nascendo — e as trilhas são a primeira coisa que o visitante vê.

- [ ] **Step 2: Ajustar o e2e para apontar para um texto real**

Trocar, em `tests/e2e/smoke.spec.ts`, o título `Post de verificação` pelo título de um dos textos reais, e o slug correspondente.

- [ ] **Step 3: Remover o post de verificação**

```bash
git rm src/content/posts/2026-01-01-post-de-verificacao.pt.mdx
```

- [ ] **Step 4: Rodar a verificação completa**

Run: `npm ci && npm run typecheck && npm run lint && npm test && npm run build && npm run test:e2e`
Expected: PASS em tudo.

- [ ] **Step 5: Commit e abertura de PR**

```bash
git add src/content/posts tests/e2e/smoke.spec.ts
git commit -m "feat: primeiros três textos da newsletter"
git push -u origin newsletter
gh pr create --title "Newsletter de aprendizado em público" --body "Implementa docs/superpowers/specs/2026-08-20-newsletter-design.md"
```

- [ ] **Step 6: Resolver os itens abertos da spec antes de considerar publicado**

1. Testar `https://yurioliveira.dev` **de fora da rede local** (4G, por exemplo). Durante o design, o certificado apresentado era emitido por um FortiGate — se o erro persistir fora da rede, é falha de produção e tem prioridade sobre tudo.
2. Conferir o apontamento do domínio na Vercel e a variável `NEXT_PUBLIC_SITE_URL`.
3. Conferir que `/pt/index.xml` valida num leitor de RSS real.
