import GithubSlugger from 'github-slugger'

/**
 * Mesma normalização de acento aplicada por `rehypeSlugSemAcento`
 * (`src/lib/mdx.tsx`) sobre o id que `rehype-slug` já atribuiu. Duplicada
 * aqui de propósito — ver o teste que compara, byte a byte, o resultado
 * desta função contra o HTML de fato produzido por `renderizarMdx` para o
 * mesmo texto de entrada.
 */
function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const TITULO_ATX = /^(#{1,6})[ \t]+(.+)$/gm

/**
 * Título setext: uma linha de texto seguida, na linha imediatamente
 * seguinte (sem linha em branco entre elas), por uma linha só de `=`
 * (nível 1) ou só de `-` (nível 2) — a outra sintaxe de título do
 * CommonMark, sem `#`. `(?!#)` no início evita um falso positivo: um `##
 * Título` (bloco ATX já fechado sozinho) seguido de `---` sem linha em
 * branco é uma linha horizontal separada, não um segundo título reaproveitando
 * o mesmo texto — confirmado contra a saída real de `renderizarMdx`.
 */
const TITULO_SETEXT = /^(?!#)(.+)\n(=+|-+)[ \t]*$/gm

type Correspondencia = { indice: number; nivel: number; texto: string }

/**
 * Extrai as seções de nível 2 (`##` ou setext com `---`) do corpo em MDX,
 * com o mesmo `id` que `rehype-slug` atribui à âncora renderizada —
 * inclusive a deduplicação (`-1`, `-2`, ...) que ele aplica quando dois
 * títulos têm o mesmo texto.
 *
 * Usa o pacote `github-slugger` (o mesmo que `rehype-slug` usa por baixo,
 * já presente no projeto como dependência transitiva dele, agora declarada
 * como direta) em vez de reimplementar sua tabela Unicode de pontuação à
 * mão — ela é grande, gerada, e uma reimplementação aproximada é exatamente
 * o tipo de divergência silenciosa que quebraria os links do índice.
 */
export function extrairSecoes(corpo: string): { id: string; texto: string }[] {
  // As duas sintaxes de bloco de código cercado do CommonMark — rehype-slug
  // (que opera sobre a árvore já parseada) nunca vê um `#`/setext dentro de
  // nenhuma das duas, então esta função também não pode ver.
  const semCodigo = corpo.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '')

  const atx: Correspondencia[] = [...semCodigo.matchAll(TITULO_ATX)].map((casou) => ({
    indice: casou.index,
    nivel: casou[1].length,
    texto: casou[2].trim(),
  }))
  const setext: Correspondencia[] = [...semCodigo.matchAll(TITULO_SETEXT)].map((casou) => ({
    indice: casou.index,
    nivel: casou[2][0] === '=' ? 1 : 2,
    texto: casou[1].trim(),
  }))

  // Ordem de aparição no documento importa: é a ordem em que o slugger real
  // consome os títulos para gerar sufixo de deduplicação.
  const todos = [...atx, ...setext].sort((a, b) => a.indice - b.indice)

  const slugger = new GithubSlugger()
  const secoes: { id: string; texto: string }[] = []

  for (const { nivel, texto } of todos) {
    // Gera o slug (e avança o contador de deduplicação do slugger) para
    // todo título encontrado, não só os de nível 2 — é o mesmo namespace
    // compartilhado que o rehype-slug usa para o documento inteiro. Só o
    // que entra no índice é filtrado depois.
    const id = removerAcentos(slugger.slug(texto))
    if (nivel === 2) secoes.push({ id, texto })
  }

  return secoes
}
