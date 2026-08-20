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

export async function renderizarMdx(corpo: string): Promise<ReactElement> {
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
          [rehypePrettyCode, { theme: { light: 'github-light', dark: 'github-dark' } }],
        ],
      },
    },
  })

  return content
}
