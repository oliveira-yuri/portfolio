// API de MDX verificada em node_modules/next/dist/docs/01-app/02-guides/mdx.md
// e node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/mdx-components.md
// — ver Task 1, Step 1. Essa doc cobre `@next/mdx` (compilação de arquivos .mdx
// como páginas/imports); `renderizarMdx` compila uma string vinda de fora do
// sistema de arquivos de páginas, caso que a doc instalada não cobre — por isso
// usamos `next-mdx-remote/rsc`, que compila MDX vindo de uma string.
//
// Divergência em relação à spec da Task 1: a spec usa `<MDXRemote source={...} />`
// como elemento JSX. Sob React 19.2 isso falha em teste (@testing-library/react
// usa renderização client-side) com "<MDXRemote> is an async Client Component.
// Only Server Components can be async at the moment" — `MDXRemote` é, ele
// próprio, um Server Component assíncrono, e só pode ser resolvido pelo runtime
// RSC do Next.js, não pelo `react-dom` client usado pelos testes. A solução,
// dentro do mesmo pacote `next-mdx-remote/rsc`, é chamar `compileMDX` diretamente
// e dar `await` nele aqui — o resultado (`content`) já é um elemento React
// resolvido, renderizável nos dois contextos. A interface pública
// (`renderizarMdx`, `componentesMdx`) não muda.
import { compileMDX } from 'next-mdx-remote/rsc'
import type { MDXComponents } from 'mdx/types'
import type { ReactElement } from 'react'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { bundledThemes, type ThemeRegistrationRaw } from 'shiki'
import { Figura } from '@/components/post/Figura'

/** Componentes disponíveis dentro de qualquer MDX. */
export const componentesMdx: MDXComponents = { Figura }

/**
 * Formato mínimo de um nó hast que `rehypeSlugSemAcento` precisa tocar:
 * elemento com `tagName`/`properties`, mais uma lista opcional de filhos.
 * Declarado localmente para não depender do pacote `hast` (nem de
 * `@types/hast`) só para andar na árvore — este projeto mantém a lista de
 * dependências deliberadamente enxuta.
 */
interface NoHast {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: NoHast[]
}

const PADRAO_TAG_DE_TITULO = /^h[1-6]$/

function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function normalizarIdsDeTitulo(no: NoHast): void {
  if (no.tagName && PADRAO_TAG_DE_TITULO.test(no.tagName) && typeof no.properties?.id === 'string') {
    no.properties.id = removerAcentos(no.properties.id)
  }

  for (const filho of no.children ?? []) {
    normalizarIdsDeTitulo(filho)
  }
}

/**
 * `rehype-slug` usa `github-slugger`, que preserva acentuação (ex.: "seção"
 * vira o id "seção", não "secao") — não expõe opção para mudar isso. Como
 * âncoras do site devem ser só ASCII, normalizamos o id logo depois que
 * `rehype-slug` o gera, com uma varredura recursiva local em vez de
 * `unist-util-visit`/`hast-util-heading-rank` — sem reimplementar a lógica
 * de deduplicação do `rehype-slug`, só ajustando o texto do id já atribuído.
 */
function rehypeSlugSemAcento() {
  return (tree: NoHast) => {
    normalizarIdsDeTitulo(tree)
  }
}

/**
 * Nenhum tema claro embutido no shiki chega a 4.5:1 (WCAG AA) no token de
 * comentário contra o fundo derivado do bloco em modo claro — medido
 * originalmente para os 21 temas `type: "light"` do pacote (ver
 * task-8-report.md); `github-light`, o tema em produção, media 4.04:1 contra
 * o fundo antigo. Como não existe tema pronto que passe, a saída não é
 * trocar de tema — é pegar o registro do `github-light` já embutido no shiki
 * (sem vendorizar cópia) e sobrescrever só a cor das regras de comentário
 * para a cor do token `--suave` do site em modo claro (ver
 * `src/app/globals.css`), a mesma usada em toda a prosa secundária.
 * Raciocínio semântico antes de numérico — um comentário de código É prosa
 * secundária.
 *
 * RE-MEDIDO na direção "Clorofila" (paleta inteira trocada, ver
 * .superpowers/sdd/2026-08-20-redesenho-intervalo/clorofila-report.md): novo
 * `--suave` claro é `#57605a`; novo fundo do bloco é
 * `color-mix(in srgb, var(--tinta) 3%, var(--papel))` com os tokens novos
 * (`--tinta: #0e1210`, `--papel: #fdfefd`), que resolve para `#f6f7f6`.
 * `#57605a` contra `#f6f7f6` mede 6.06:1 — folga confortável acima de 4.5:1.
 *
 * O hex é fixo de propósito, não lido de `--suave`: shiki não lê custom
 * property CSS, só recebe uma string de cor no registro do tema e a emite
 * inline por token (ver comentário sobre `defaultColor: false` abaixo). Se
 * `--suave` mudar em `globals.css`, este valor precisa ser atualizado junto
 * à mão — não há como um ler o outro nesta pilha.
 *
 * Única regra de `tokenColors` com escopo de comentário neste tema
 * (inspecionado via `node`, não assumido — ver task-8-report.md): escopo
 * `["comment", "punctuation.definition.comment", "string.comment"]`,
 * `foreground` único `#6a737d`. Escopo TextMate casa por prefixo, então
 * `"comment"` sozinho já cobre variantes mais específicas que gramáticas de
 * linguagem emitem (`comment.line`, `comment.block`,
 * `comment.block.documentation` etc.) — não há uma segunda regra escondida
 * para corrigir.
 */
const COR_COMENTARIO_CLARO = '#57605a'

let temaClaroDoBlocoDeCodigoPromise: Promise<ThemeRegistrationRaw> | undefined

function obterTemaClaroDoBlocoDeCodigo(): Promise<ThemeRegistrationRaw> {
  if (!temaClaroDoBlocoDeCodigoPromise) {
    temaClaroDoBlocoDeCodigoPromise = (async () => {
      const base = (await bundledThemes['github-light']()).default
      const regrasOriginais = base.tokenColors ?? base.settings ?? []
      let regraDeComentarioEncontrada = false

      const regras = regrasOriginais.map((regra) => {
        const escopos = Array.isArray(regra.scope) ? regra.scope : regra.scope ? [regra.scope] : []
        if (!escopos.includes('comment')) {
          return regra
        }
        regraDeComentarioEncontrada = true
        return { ...regra, settings: { ...regra.settings, foreground: COR_COMENTARIO_CLARO } }
      })

      if (!regraDeComentarioEncontrada) {
        // `github-light` mudou de formato desde a última verificação — a
        // regra de escopo "comment" que este patch depende de encontrar não
        // está mais lá. Falhar alto em vez de silenciosamente devolver o
        // tema sem o ajuste de contraste.
        throw new Error(
          'github-light: regra de tokenColors com escopo "comment" não encontrada — obterTemaClaroDoBlocoDeCodigo precisa ser revisada.',
        )
      }

      return { ...base, tokenColors: regras } as ThemeRegistrationRaw
    })()
  }

  return temaClaroDoBlocoDeCodigoPromise
}

export async function renderizarMdx(corpo: string): Promise<ReactElement> {
  const temaClaroDoBlocoDeCodigo = await obterTemaClaroDoBlocoDeCodigo()

  const { content } = await compileMDX({
    source: corpo,
    components: componentesMdx,
    options: {
      // `blockJS` fica no default (`true`): `next-mdx-remote` descarta
      // silenciosamente qualquer expressão JS em MDX — atributo JSX escrito
      // como `prop={expressão}` e interpolação solta `{expr}` no corpo —
      // sem erro nem aviso. Não desativamos essa proteção; componentes que
      // precisam de um valor não-string (ver `Figura`) recebem string e
      // convertem por conta própria.
      mdxOptions: {
        remarkPlugins: [remarkMath, remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          rehypeSlugSemAcento,
          rehypeKatex,
          // Tema único (`github-light`) fazia todo bloco com linguagem
          // declarada renderizar claro mesmo no tema escuro do site: shiki
          // emite `color`/`background-color` como atributo `style` inline
          // por token, que vence qualquer regra de CSS, camada ou não.
          // Verificado em node_modules/rehype-pretty-code/dist/index.js —
          // com `theme` como objeto (`{ light, dark }`) o pacote passa
          // `defaultColor: false` ao shiki (não é opção exposta aqui, é
          // interna); e em node_modules/@shikijs/core/dist/index.mjs —
          // `defaultColor: false` faz cada token emitir SÓ as custom
          // properties `--shiki-light`/`--shiki-dark` (e o `<pre>` raiz
          // `--shiki-light-bg`/`--shiki-dark-bg`), sem `color`/
          // `background-color` fixos. O CSS do site (`.corpo-post`, em
          // globals.css) escolhe qual variante cada tema usa; o fundo
          // continua vindo do tom derivado já usado por todo bloco de
          // código (`.corpo-post pre`), não das variáveis `-bg` do shiki.
          // `dark: 'github-dark'` falhava WCAG AA: o token de comentário
          // (`#6A737D`, rgb(106, 115, 125)) contra o fundo derivado do bloco
          // em modo escuro (rgb(26, 29, 32)) dá 3.52:1, abaixo dos 4.5:1
          // exigidos para texto normal — e o bloco usa ~13.6px, abaixo do
          // limiar de "texto grande" que relaxaria a exigência para 3:1. Não
          // dá para sobrescrever só o token do comentário via CSS: com
          // `defaultColor: false` (ver comentário acima) cada span shiki
          // recebe a cor só via custom property `--shiki-dark` inline, sem
          // classe semântica que identifique "isto é um comentário" — nada
          // estável para selecionar.
          //
          // A troca teve que ser de tema inteiro, escolhida por medição
          // (script ad hoc com `shiki.codeToTokensBase`, tema por tema,
          // contraste WCAG contra rgb(26, 29, 32)), não por olho. Entre os
          // temas escuros embutidos no shiki que passam 4.5:1 tanto para
          // comentário quanto para texto comum, `github-dark-default`
          // ("GitHub Dark Default") é o mais próximo em caráter de
          // `github-dark` — mesma família de design do GitHub, sucessor
          // direto do tema antigo, sem cores neon — e sobra margem
          // confortável: comentário `#8B949E` dá 5.50:1, texto comum
          // `#79C0FF` dá 8.70:1 (medido contra o fundo antigo).
          //
          // RE-VERIFICADO na direção "Clorofila" (ver COR_COMENTARIO_CLARO
          // acima e o relatório da tarefa): o fundo do bloco escuro mudou
          // para `#121a17` (3% do novo --tinta escuro + 97% do novo --papel
          // escuro). `github-dark-default` continua passando sem trocar de
          // tema: comentário `#8B949E` mede 5.76:1, texto comum `#79C0FF`
          // mede 9.10:1 — os dois ainda acima de 4.5:1, então esta escolha de
          // tema não precisou mudar, só a nota fica registrada aqui.
          [rehypePrettyCode, { theme: { light: temaClaroDoBlocoDeCodigo, dark: 'github-dark-default' } }],
        ],
      },
    },
  })

  return content
}
