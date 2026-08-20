# Redesenho "Intervalo" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a camada visual do site pela direção "Intervalo", derivada de estatística, mantendo intacta toda a estrutura já construída e testada.

**Architecture:** Só apresentação muda. Tokens de cor viram uma escala divergente cujos polos são os três pilares; a tipografia vira duas famílias com papéis nomeados; o arquivo ganha um eixo do tempo como assinatura; os fios de jornal saem. Nenhuma rota, regra de conteúdo, validação ou contrato de módulo é reaberto.

**Tech Stack:** Next.js 16.3.1, React 19.2.8, Tailwind CSS 4, Newsreader + IBM Plex Mono via `next/font/google`, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-20-newsletter-design.md`, seção "Design visual — direção Intervalo".

## Global Constraints

- Branch `newsletter`. Nunca commitar em `master`.
- **A estrutura não é reaberta.** Rotas, `lib/posts.ts`, `lib/mdx.tsx`, `lib/cta.ts`, `lib/feed.ts`, `lib/headings.ts`, `lib/tags.ts`, `lib/relacionados.ts`, `lib/routes.ts` e todas as regras de conteúdo ficam como estão. Se uma task parecer exigir mudança neles, pare e reporte.
- **Nenhum componente contém texto literal voltado ao usuário.** Rótulos vêm de `src/content/ui.ts` via `t(value, locale)`, sob a cláusula `satisfies LocalizedTree`.
- `src/lib/posts.ts` continua o único módulo que toca o sistema de arquivos.
- **Nenhum componente cliente novo.** `PostToc` é o único que este trabalho adicionou; `LocaleSwitch`, `ThemeToggle` e `Reveal` são anteriores.
- Paleta, valores exatos:

  | Token | Claro | Escuro |
  |---|---|---|
  | `papel` | `#f1f2f0` | `#14171a` |
  | `tinta` | `#15171a` | `#e8eae8` |
  | `suave` | `#5c6269` | `#949b9f` |
  | `fio` | `#d4d7d5` | `#262b2e` |
  | `frio` | `#2b6a86` | `#6fb3ce` |
  | `quente` | `#9c4a6e` | `#d98aa8` |

- Mapeamento pilar → polo, fixo: `academico` = frio, `ensino` = neutro (usa `suave`), `projetos` = quente.
- Fontes: **Newsreader** (display e texto) e **IBM Plex Mono** (dado). Nenhuma sem serifa em lugar nenhum.
- Tokens de fonte nomeados por papel: `--font-display`, `--font-texto`, `--font-dado`. As classes Tailwind viram `font-display`, `font-texto`, `font-dado`.
- **Sem fio entre linhas do arquivo.** Régua só sob o eixo do tempo e sob títulos de seção.
- A barra de números mostra data absoluta, nunca tempo relativo. O site é estático.
- TypeScript strict. CI roda `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` — todos passam antes de cada commit.
- Estado inicial: 226 testes unitários e 11 e2e passando. **Nenhum número desses pode cair.** Teste que asserta classe ou fonte antiga deve ser ATUALIZADO para a nova, nunca removido para "passar".

---

### Task 1: Tokens de cor e tipografia

**Files:**
- Modify: `src/lib/fonts.ts`
- Modify: `src/app/globals.css`
- Modify: `src/test/mocks/next-font-google.ts`
- Modify: todo arquivo em `src/` que use `font-serif`, `font-sans` ou `font-mono`

**Interfaces:**
- Consumes: nada.
- Produces: as CSS custom properties `--papel`, `--tinta`, `--suave`, `--fio`, `--frio`, `--quente`; as classes Tailwind `bg-papel`, `text-tinta`, `text-suave`, `border-fio`, `text-frio`, `text-quente`; e as classes de fonte `font-display`, `font-texto`, `font-dado`.

- [ ] **Step 1: Verificar a API de fonte variável nesta versão do Next**

`Newsreader` é uma fonte variável com eixo óptico (`opsz`, 6–72) além do peso, e `next/font/google` trata eixos extras por um parâmetro dedicado. Antes de escrever, ler a documentação instalada:

```bash
grep -rl "next/font" node_modules/next/dist/docs/ | head
```

Confirmar como declarar `axes` e `style` para uma fonte variável nesta versão. A documentação instalada ganha de qualquer memória. Registrar num comentário no topo de `src/lib/fonts.ts` qual arquivo foi consultado.

- [ ] **Step 2: Trocar as fontes**

Substituir o conteúdo de `src/lib/fonts.ts`, preservando o `themeScript` exatamente como está (ele resolve o piscar de tema e não tem nada a ver com este trabalho):

```ts
import { IBM_Plex_Mono, Newsreader } from 'next/font/google'

// Newsreader carrega display E texto: o eixo óptico faz a mesma família se
// comportar de forma diferente em 34px e em 17px. Não há fonte sem serifa
// neste projeto — dado é monoespaçado, prosa é serifada, não há terceira
// categoria.
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const fontClassName = `${newsreader.variable} ${plexMono.variable}`
```

Manter `themeScript` no arquivo, inalterado.

- [ ] **Step 3: Ajustar o stub de fonte usado nos testes**

`src/test/mocks/next-font-google.ts` substitui `next/font/google` sob o Vitest. Lê-lo e garantir que ele exporte `Newsreader` e `IBM_Plex_Mono` com a mesma forma que os stubs atuais, e que os stubs antigos que ninguém mais usa saiam.

- [ ] **Step 4: Trocar os tokens em `globals.css`**

Substituir os blocos `:root`, `.dark` e `@theme inline` por:

```css
:root {
  --papel: #f1f2f0;
  --tinta: #15171a;
  --suave: #5c6269;
  --fio: #d4d7d5;
  --frio: #2b6a86;
  --quente: #9c4a6e;
}

.dark {
  --papel: #14171a;
  --tinta: #e8eae8;
  --suave: #949b9f;
  --fio: #262b2e;
  --frio: #6fb3ce;
  --quente: #d98aa8;
}

@theme inline {
  --color-papel: var(--papel);
  --color-tinta: var(--tinta);
  --color-suave: var(--suave);
  --color-fio: var(--fio);
  --color-frio: var(--frio);
  --color-quente: var(--quente);

  /* Nomeados por papel, não por classificação tipográfica: `font-sans`
     apontando para uma serifada seria um nome que mente. */
  --font-display: var(--font-newsreader);
  --font-texto: var(--font-newsreader);
  --font-dado: var(--font-plex-mono);
}
```

E o `body`:

```css
body {
  background-color: var(--papel);
  color: var(--tinta);
  font-family: var(--font-texto), Georgia, 'Times New Roman', serif;
  font-size: 1.0625rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}
```

Manter `@import 'tailwindcss'`, `@import 'katex/dist/katex.min.css'`, `@custom-variant dark`, a regra de `a`, o `:focus-visible` (trocando a cor para `var(--frio)`) e o bloco `prefers-reduced-motion`, todos inalterados no resto.

- [ ] **Step 5: Varrer as classes antigas**

Listar todas as ocorrências e trocar uma a uma:

```bash
grep -rn "font-serif\|font-sans\|font-mono\|text-ink\|bg-surface\|bg-raised\|text-muted\|border-line\|text-accent\|bg-accent\|border-accent\|accent/" src/ --include=*.tsx --include=*.ts --include=*.css
```

Mapeamento: `font-serif`→`font-display`, `font-sans`→`font-texto`, `font-mono`→`font-dado`, `bg-surface`→`bg-papel`, `bg-raised`→`bg-papel` (não há mais superfície elevada; a direção não usa cartões), `text-ink`→`text-tinta`, `text-muted`→`text-suave`, `border-line`→`border-fio`, `text-accent`→`text-frio`, `bg-accent`→`bg-frio`, `border-accent`→`border-frio`, `accent/NN`→`frio/NN`.

Atualizar também `src/lib/styles.ts` se ele carregar classe antiga, e os testes que assertarem qualquer uma delas.

- [ ] **Step 6: Rodar o portão inteiro**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: PASS, com a contagem de testes ainda em 226. Se algum teste falhar por assertar classe antiga, ATUALIZE a asserção para a classe nova — não a remova.

- [ ] **Step 7: Commit**

```bash
git add src/ && git commit -m "feat: paleta divergente e tipografia Newsreader + Plex Mono"
```

---

### Task 2: A escala divergente dos pilares

O mapeamento pilar → polo vive num módulo só. Nenhum componente escolhe cor de pilar por conta própria — é isso que impede a escala de virar decoração inconsistente.

**Files:**
- Create: `src/lib/escala.ts` + `src/lib/escala.test.ts`

**Interfaces:**
- Consumes: `Pilar` de `@/lib/posts`.
- Produces, de `@/lib/escala`:
  - `type Polo = 'frio' | 'neutro' | 'quente'`
  - `poloDoPilar(pilar: Pilar): Polo`
  - `classesDoPilar(pilar: Pilar): { texto: string; fundo: string }`
  - `corDoPilar(pilar: Pilar): string` — a CSS custom property, para uso em `style` inline (o eixo do tempo precisa disso, porque posição e cor são calculadas)

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/escala.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { classesDoPilar, corDoPilar, poloDoPilar } from '@/lib/escala'
import { pilares } from '@/lib/posts'

describe('poloDoPilar', () => {
  it('ordena os pilares do abstrato ao aplicado na escala divergente', () => {
    expect(poloDoPilar('academico')).toBe('frio')
    expect(poloDoPilar('ensino')).toBe('neutro')
    expect(poloDoPilar('projetos')).toBe('quente')
  })

  it('cobre todos os pilares existentes, sem sobrar nem faltar', () => {
    expect(pilares.map(poloDoPilar).sort()).toEqual(['frio', 'neutro', 'quente'])
  })
})

describe('classesDoPilar', () => {
  it('usa a cor do polo no texto', () => {
    expect(classesDoPilar('academico').texto).toBe('text-frio')
    expect(classesDoPilar('ensino').texto).toBe('text-suave')
    expect(classesDoPilar('projetos').texto).toBe('text-quente')
  })

  it('devolve classes estáticas, porque Tailwind não vê classe montada em tempo de execução', () => {
    for (const pilar of pilares) {
      const { texto, fundo } = classesDoPilar(pilar)
      expect(texto).not.toContain('${')
      expect(fundo).not.toContain('${')
    }
  })
})

describe('corDoPilar', () => {
  it('devolve a custom property, para posição e cor calculadas em SVG', () => {
    expect(corDoPilar('academico')).toBe('var(--frio)')
    expect(corDoPilar('ensino')).toBe('var(--suave)')
    expect(corDoPilar('projetos')).toBe('var(--quente)')
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/lib/escala.test.ts`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar**

Criar `src/lib/escala.ts`:

```ts
import type { Pilar } from '@/lib/posts'

/**
 * A paleta do site é uma escala divergente, e os três pilares ocupam seus três
 * pontos na ordem do abstrato ao aplicado: teoria (académico) → transmissão
 * (ensino) → construção (projetos). A cor codifica esse eixo; não é enfeite.
 */
export type Polo = 'frio' | 'neutro' | 'quente'

const POLO: Record<Pilar, Polo> = {
  academico: 'frio',
  ensino: 'neutro',
  projetos: 'quente',
}

/** Classes literais: Tailwind não enxerga classe montada em tempo de execução. */
const CLASSES: Record<Polo, { texto: string; fundo: string }> = {
  frio: { texto: 'text-frio', fundo: 'bg-frio' },
  neutro: { texto: 'text-suave', fundo: 'bg-suave' },
  quente: { texto: 'text-quente', fundo: 'bg-quente' },
}

const COR: Record<Polo, string> = {
  frio: 'var(--frio)',
  neutro: 'var(--suave)',
  quente: 'var(--quente)',
}

export function poloDoPilar(pilar: Pilar): Polo {
  return POLO[pilar]
}

export function classesDoPilar(pilar: Pilar): { texto: string; fundo: string } {
  return CLASSES[POLO[pilar]]
}

export function corDoPilar(pilar: Pilar): string {
  return COR[POLO[pilar]]
}
```

- [ ] **Step 4: Rodar e commitar**

Run: `npx vitest run src/lib/escala.test.ts && npm run typecheck && npm run lint`
Expected: PASS.

```bash
git add src/lib/escala.ts src/lib/escala.test.ts
git commit -m "feat: escala divergente mapeando os três pilares"
```

---

### Task 3: O eixo do tempo — a assinatura

O elemento pelo qual a home é lembrada. O arquivo inteiro plotado: um traço por texto, posição pela data, altura pelo tempo de leitura, cor pelo pilar. A densidade que o leitor vê **é** a cadência de publicação — é o mesmo dado da lista abaixo, em outra projeção.

**Files:**
- Create: `src/components/archive/EixoDoTempo.tsx` + `EixoDoTempo.test.tsx`
- Modify: `src/content/ui.ts`

**Interfaces:**
- Consumes: `Post` de `@/lib/posts`; `corDoPilar` de `@/lib/escala`; `tempoDeLeitura` de `@/lib/reading`; `formatarMesAno` de `@/lib/date`.
- Produces: `<EixoDoTempo locale posts />`.

- [ ] **Step 1: Acrescentar os rótulos**

Em `src/content/ui.ts`, dentro de `ui.newsletter`:

```ts
    eixoRotulo: { pt: 'Arquivo', en: 'Archive' },
    eixoDescricao: {
      pt: 'Um traço por texto, posicionado pela data de publicação. A densidade mostra a cadência.',
      en: 'One mark per text, positioned by publication date. Density shows the cadence.',
    },
    escalaRotulo: { pt: 'Do abstrato ao aplicado', en: 'From abstract to applied' },
```

- [ ] **Step 2: Escrever o teste que falha**

Criar `src/components/archive/EixoDoTempo.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EixoDoTempo } from '@/components/archive/EixoDoTempo'
import type { Post } from '@/lib/posts'
import { postFixture } from '@/test/fixtures'

describe('EixoDoTempo', () => {
  it('desenha um traço por texto', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixture} />)

    expect(container.querySelectorAll('[data-traco]')).toHaveLength(postFixture.length)
  })

  it('posiciona pelo intervalo real de datas: o mais antigo em 0% e o mais recente em 100%', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixture} />)
    const tracos = [...container.querySelectorAll<HTMLElement>('[data-traco]')]
    const posicoes = tracos.map((t) => t.style.left)

    expect(posicoes).toContain('0%')
    expect(posicoes).toContain('100%')
  })

  it('colore cada traço pelo polo do pilar', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixture} />)

    expect(container.querySelector('[data-traco][data-pilar="projetos"]')).toHaveStyle({
      backgroundColor: 'var(--quente)',
    })
    expect(container.querySelector('[data-traco][data-pilar="academico"]')).toHaveStyle({
      backgroundColor: 'var(--frio)',
    })
  })

  it('não divide por zero quando existe um único texto', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={[postFixture[0]]} />)
    const traco = container.querySelector<HTMLElement>('[data-traco]')

    expect(traco?.style.left).toBe('0%')
    expect(traco?.style.left).not.toContain('NaN')
  })

  it('anuncia o resumo para leitor de tela, com os traços escondidos da árvore', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixture} />)

    expect(screen.getByRole('img', { name: /3 textos/ })).toBeInTheDocument()
    expect(container.querySelector('[data-traco]')?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('não renderiza nada sem textos', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `npx vitest run src/components/archive/EixoDoTempo.test.tsx`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 4: Implementar**

Criar `src/components/archive/EixoDoTempo.tsx`:

```tsx
import { ui } from '@/content/ui'
import { formatarMesAno } from '@/lib/date'
import { corDoPilar } from '@/lib/escala'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'
import { tempoDeLeitura } from '@/lib/reading'

const ALTURA_MINIMA = 22
const ALTURA_MAXIMA = 100

function emDias(data: string): number {
  return Date.parse(`${data}T12:00:00Z`) / 86_400_000
}

export function EixoDoTempo({ locale, posts }: { locale: Locale; posts: Post[] }) {
  if (posts.length === 0) return null

  const dias = posts.map((post) => emDias(post.data))
  const inicio = Math.min(...dias)
  const fim = Math.max(...dias)
  const janela = fim - inicio

  const leituras = posts.map((post) => tempoDeLeitura(post.corpo))
  const maiorLeitura = Math.max(...leituras)

  const maisAntigo = posts[posts.length - 1]
  const maisRecente = posts[0]

  const resumo = `${posts.length} ${t(ui.newsletter.textos, locale)} · ${formatarMesAno(maisAntigo.data)} — ${formatarMesAno(maisRecente.data)}`

  return (
    <section aria-labelledby="eixo-rotulo">
      <div className="flex items-baseline justify-between border-b border-tinta pb-1.5 font-dado text-[0.65rem] uppercase tracking-[0.16em] text-suave">
        <h2 id="eixo-rotulo" className="text-tinta">
          {t(ui.newsletter.eixoRotulo, locale)}
        </h2>
        <span className="tabular-nums">{resumo}</span>
      </div>

      {/* O gráfico é uma segunda projeção do mesmo dado da lista abaixo, que já
          é acessível. Aqui basta o resumo; os traços saem da árvore. */}
      <div role="img" aria-label={`${t(ui.newsletter.eixoDescricao, locale)} ${resumo}`}>
        <div className="relative h-11" aria-hidden="true">
          {posts.map((post, i) => (
            <span
              key={`${post.slug}-${post.locale}`}
              data-traco
              data-pilar={post.pilar}
              className="absolute bottom-0 block w-0.5"
              style={{
                left: janela === 0 ? '0%' : `${((dias[i] - inicio) / janela) * 100}%`,
                height: `${ALTURA_MINIMA + (leituras[i] / maiorLeitura) * (ALTURA_MAXIMA - ALTURA_MINIMA)}%`,
                backgroundColor: corDoPilar(post.pilar),
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between border-t border-fio pt-1 font-dado text-[0.65rem] tabular-nums text-suave">
        <span>{formatarMesAno(maisAntigo.data)}</span>
        <span>{formatarMesAno(maisRecente.data)}</span>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Conferir o comportamento em tela estreita**

Rodar `npm run dev`, abrir `/pt` num viewport de 375px e confirmar que os traços não estouram a largura nem colidem de forma ilegível. Se colidirem com muitos textos, reduzir a largura do traço em telas pequenas — nunca esconder o eixo. Relatar o que observou. Encerrar o servidor depois.

- [ ] **Step 6: Rodar e commitar**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: PASS.

```bash
git add src/components/archive/EixoDoTempo.tsx src/components/archive/EixoDoTempo.test.tsx src/content/ui.ts
git commit -m "feat: eixo do tempo como assinatura do arquivo"
```

---

### Task 4: Linha do arquivo com barra de intervalo

Sai o fio de jornal entre itens; entra o ritmo de espaço, rótulo de pilar e barra de tempo de leitura. Número tratado como grandeza, não como texto.

**Files:**
- Modify: `src/components/archive/PostRow.tsx` + `PostRow.test.tsx`
- Modify: `src/components/archive/ArchiveList.tsx` + `ArchiveList.test.tsx`

**Interfaces:**
- Consumes: `classesDoPilar` de `@/lib/escala`; `tempoDeLeitura` de `@/lib/reading`; `descricaoPilar` de `@/content/pilares`; `caminhoPilar` de `@/lib/routes`.
- Produces: mesma assinatura de props de antes — `<PostRow locale post comResumo? />` e `<ArchiveList locale posts />`. Nenhum consumidor muda.

- [ ] **Step 1: Atualizar os testes**

Em `PostRow.test.tsx`, manter todas as asserções existentes de link, data, tags e resumo. Trocar a asserção do marcador de pilar (hoje `[data-pilar]` numa barra) por estas, e acrescentar as de intervalo:

```tsx
  it('mostra o pilar como rótulo, linkado para a página do pilar', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByRole('link', { name: 'Projetos' })).toHaveAttribute('href', '/pt/pilares/projetos')
  })

  it('colore o rótulo do pilar pelo polo da escala', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByRole('link', { name: 'Projetos' })).toHaveClass('text-quente')
  })

  it('mostra o tempo de leitura como número e como barra proporcional', () => {
    const { container } = render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByText(/^1 min$/)).toBeInTheDocument()
    expect(container.querySelector('[data-intervalo]')).not.toBeNull()
  })

  it('não separa itens com régua — o ritmo é o espaço', () => {
    const { container } = render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(container.querySelector('li')?.className ?? '').not.toMatch(/border-b|border-dotted/)
  })
```

Em `ArchiveList.test.tsx`, manter as asserções de agrupamento e idioma; acrescentar:

```tsx
  it('marca o mês com régua, que é onde a régua deve existir', () => {
    const { container } = render(<ArchiveList locale="pt" posts={postFixture} />)

    expect(container.querySelector('h3')?.className ?? '').toMatch(/border-b/)
  })
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/components/archive`
Expected: FAIL nas asserções novas.

- [ ] **Step 3: Reescrever `PostRow`**

```tsx
import Link from 'next/link'
import { descricaoPilar } from '@/content/pilares'
import { ui } from '@/content/ui'
import { formatarData } from '@/lib/date'
import { classesDoPilar } from '@/lib/escala'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'
import { tempoDeLeitura } from '@/lib/reading'
import { caminhoPilar } from '@/lib/routes'

/** Acima disso a barra satura; textos mais longos que isso são raros. */
const LEITURA_DE_REFERENCIA = 12

export function PostRow({
  locale,
  post,
  comResumo = false,
}: {
  locale: Locale
  post: Post
  comResumo?: boolean
}) {
  const minutos = tempoDeLeitura(post.corpo)
  const proporcao = Math.min(1, minutos / LEITURA_DE_REFERENCIA)
  const { texto: classePilar } = classesDoPilar(post.pilar)

  return (
    <li className="grid grid-cols-[1fr] gap-x-5 gap-y-1 py-5 sm:grid-cols-[4.5rem_1fr_5rem]">
      <time dateTime={post.data} className="font-dado text-xs tabular-nums text-suave sm:pt-1.5">
        {formatarData(post.data, locale)}
      </time>

      <div className="min-w-0">
        <Link
          href={caminhoPilar(locale, post.pilar)}
          className={`font-dado text-[0.65rem] uppercase tracking-[0.14em] ${classePilar}`}
        >
          {t(descricaoPilar[post.pilar].nome, locale)}
        </Link>
        <h3 className="mt-0.5">
          <Link href={`/${locale}/posts/${post.slug}`} className="font-display text-xl leading-snug text-tinta">
            {post.titulo}
          </Link>
        </h3>
        {comResumo ? <p className="mt-1 text-suave">{post.resumo}</p> : null}
        <ul className="mt-1.5 flex flex-wrap gap-x-3 font-dado text-[0.7rem] text-suave">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link href={`/${locale}/tags/${tag}`}>#{tag}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sm:pt-2">
        <span data-intervalo className="block h-[3px] bg-fio">
          <span className={`block h-full ${classesDoPilar(post.pilar).fundo}`} style={{ width: `${proporcao * 100}%` }} />
        </span>
        <span className="mt-1 block font-dado text-[0.65rem] tabular-nums text-suave">
          {minutos} {t(ui.post.tempoLeituraCurto, locale)}
        </span>
      </div>
    </li>
  )
}
```

Acrescentar em `src/content/ui.ts`, dentro de `ui.post`:

```ts
    tempoLeituraCurto: { pt: 'min', en: 'min' },
```

- [ ] **Step 4: Ajustar `ArchiveList`**

Manter a lógica de agrupamento intacta. Trocar só a apresentação do cabeçalho de mês:

```tsx
          <h3 className="border-b border-fio pb-1.5 font-dado text-[0.65rem] uppercase tracking-[0.16em] text-suave">
            {formatarMesLongo(grupo.ano, grupo.mes, locale)}
          </h3>
```

e o espaçamento da seção para `className="mt-10"`.

- [ ] **Step 5: Rodar e commitar**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: PASS.

```bash
git add src/components/archive src/content/ui.ts
git commit -m "feat: linha do arquivo com rótulo de pilar e barra de intervalo"
```

---

### Task 5: Home recomposta

Os três cartões de trilha saem: com o eixo do tempo logo acima, eles repetiam a mesma informação ocupando o dobro do espaço. Entra uma legenda compacta da escala, que é o que o leitor precisa para decodificar as cores — e que continua levando às páginas de pilar.

**Files:**
- Create: `src/components/archive/LegendaDaEscala.tsx` + `LegendaDaEscala.test.tsx`
- Delete: `src/components/archive/PillarCards.tsx` + `PillarCards.test.tsx`
- Modify: `src/components/archive/StatRail.tsx` + `StatRail.test.tsx`
- Modify: `src/app/[locale]/page.tsx` + `page.test.tsx`

**Interfaces:**
- Produces: `<LegendaDaEscala locale posts />`.

- [ ] **Step 1: Escrever o teste da legenda**

Criar `src/components/archive/LegendaDaEscala.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LegendaDaEscala } from '@/components/archive/LegendaDaEscala'
import { postFixture } from '@/test/fixtures'

describe('LegendaDaEscala', () => {
  it('mostra os três pilares na ordem da escala, do abstrato ao aplicado', () => {
    render(<LegendaDaEscala locale="pt" posts={postFixture} />)

    const nomes = screen.getAllByRole('link').map((l) => l.textContent)
    expect(nomes).toEqual(['Acadêmico 01', 'Ensino 01', 'Projetos 01'])
  })

  it('linka cada pilar para sua página no idioma corrente', () => {
    render(<LegendaDaEscala locale="en" posts={postFixture} />)

    expect(screen.getByRole('link', { name: /Teaching/ })).toHaveAttribute('href', '/en/pillars/ensino')
  })

  it('mostra contagem real, inclusive zero, sem esconder pilar vazio', () => {
    render(<LegendaDaEscala locale="pt" posts={[postFixture[0]]} />)

    expect(screen.getByRole('link', { name: 'Acadêmico 00' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projetos 01' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar, confirmar falha, implementar**

Criar `src/components/archive/LegendaDaEscala.tsx`. Requisitos: renderiza `pilares` na ordem do array (que já é abstrato → aplicado); cada item é um `<Link>` para `caminhoPilar`, com o nome traduzido, a contagem com dois dígitos em `font-dado tabular-nums`, e um quadrado de 8px preenchido com `classesDoPilar(pilar).fundo`; a lista fica em `flex` com `gap-x-6`, precedida por um rótulo `t(ui.newsletter.escalaRotulo, locale)` em `font-dado text-[0.65rem] uppercase tracking-[0.16em] text-suave`. O nome acessível de cada link deve ser exatamente `"<Nome> <NN>"`, como os testes assertam — o quadrado é `aria-hidden`.

- [ ] **Step 3: Enxugar o `StatRail`**

O eixo do tempo já mostra total e período na sua legenda. O `StatRail` fica com uma informação só: a data absoluta do texto mais recente. Manter obrigatoriamente a asserção de que nenhum tempo relativo aparece — ela é load-bearing, porque o site é estático e um tempo relativo congelaria no build. Ajustar as demais asserções do teste ao novo conteúdo, sem enfraquecê-las: continuar assertando o valor exato da data com regex ancorada.

- [ ] **Step 4: Recompor a home**

Em `src/app/[locale]/page.tsx`, substituir a seção de trilhas e o `StatRail` solto pela ordem da spec: identidade → `EixoDoTempo` → `LegendaDaEscala` → `StatRail` → Destaques → Arquivo. Remover o import de `PillarCards`. Manter `TopBar`, `SiteFooter`, os quatro links de identidade e a condicional que esconde Destaques quando não há post em destaque.

Atualizar `page.test.tsx`: trocar a asserção do heading "Trilhas" pela do heading do eixo (`Arquivo`) e pela presença da legenda. Manter intactas as asserções de identidade, de links do portfólio e de ausência de seção "sobre mim".

- [ ] **Step 5: Apagar o que saiu**

```bash
git rm src/components/archive/PillarCards.tsx src/components/archive/PillarCards.test.tsx
```

- [ ] **Step 6: Rodar e commitar**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: PASS, com o total de testes ajustado pela troca de PillarCards por LegendaDaEscala.

```bash
git add -A src/ && git commit -m "feat: home recomposta em torno do eixo do tempo"
```

---

### Task 6: Post, portfólio e imagens de compartilhamento

**Files:**
- Modify: `src/app/globals.css` (bloco `.corpo-post`)
- Modify: `src/components/post/PostHeader.tsx`, `PostToc.tsx`, `PostFooter.tsx`, `Figura.tsx` e seus testes
- Modify: `src/app/[locale]/opengraph-image.tsx`, `src/app/[locale]/posts/[slug]/opengraph-image.tsx`
- Modify: `src/components/ui/SiteFooter.tsx`, `TopBar.tsx`, `src/lib/styles.ts` se necessário

- [ ] **Step 1: Atualizar `.corpo-post`**

Trocar as referências de fonte e cor para os tokens novos: `var(--font-display)` nos títulos, `var(--font-dado)` em código e cabeçalho de tabela, `var(--accent)` → `var(--frio)`, `var(--ink)` → `var(--tinta)`, `var(--muted)` → `var(--suave)`, `var(--line)` → `var(--fio)`, `var(--raised)` → `var(--papel)`. **Remover a capitular** — ela era da direção anterior, e nesta o peso já está no eixo do tempo; a regra de Chanel manda tirar um acessório.

- [ ] **Step 2: Ajustar os componentes de post**

`PostHeader`: pilar como rótulo colorido pelo polo, via `classesDoPilar`. `PostToc`: seção atual marcada em `text-frio`. `PostFooter`: régua superior em `border-tinta`, links em `text-frio`. `Figura`: legenda em `font-dado`, régua em `border-fio`. Atualizar as asserções de classe nos testes correspondentes; não enfraquecer nenhuma.

- [ ] **Step 3: Atualizar as imagens de compartilhamento**

São renderizadas por Satori, que não lê Tailwind nem custom property — os literais hexadecimais são corretos AQUI e só aqui. Trocar para `#f1f2f0` (fundo), `#15171a` (texto), `#5c6269` (secundário) e `#2b6a86` (destaque). Manter a estrutura, os exports e o `alt` estático como estão.

- [ ] **Step 4: Conferir o resultado com os próprios olhos**

Rodar `npm run dev` e abrir `/pt`, `/pt/portfolio`, `/pt/tags` e um post, nos temas claro e escuro, num viewport de 375px e num de 1280px. Procurar por: contraste insuficiente do `suave` sobre o `papel` no tema escuro, colisão do eixo do tempo, régua que sobrou onde não devia, e qualquer texto ainda em fonte sem serifa. Relatar o que encontrou e corrigir. Encerrar o servidor depois.

- [ ] **Step 5: Portão completo e commit**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npm run test:e2e`
Expected: PASS, incluindo os 11 testes de ponta a ponta.

```bash
git add -A src/ && git commit -m "feat: post, portfólio e imagens de compartilhamento na direção Intervalo"
```
