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

const TITULO = /^(#{1,6})[ \t]+(.+)$/gm

/**
 * Extrai as seções de nível 2 (`##`) do corpo em MDX, com o mesmo `id` que
 * `rehype-slug` atribui à âncora renderizada — inclusive a deduplicação
 * (`-1`, `-2`, ...) que ele aplica quando dois títulos têm o mesmo texto.
 *
 * Usa o pacote `github-slugger` (o mesmo que `rehype-slug` usa por baixo,
 * já presente no projeto como dependência transitiva dele, agora declarada
 * como direta) em vez de reimplementar sua tabela Unicode de pontuação à
 * mão — ela é grande, gerada, e uma reimplementação aproximada é exatamente
 * o tipo de divergência silenciosa que quebraria os links do índice.
 */
export function extrairSecoes(corpo: string): { id: string; texto: string }[] {
  const semCodigo = corpo.replace(/```[\s\S]*?```/g, '')
  const slugger = new GithubSlugger()
  const secoes: { id: string; texto: string }[] = []

  for (const casou of semCodigo.matchAll(TITULO)) {
    const nivel = casou[1].length
    const texto = casou[2].trim()

    // Gera o slug (e avança o contador de deduplicação do slugger) para
    // todo título encontrado, não só os de nível 2 — é o mesmo namespace
    // compartilhado que o rehype-slug usa para o documento inteiro. Só o
    // que entra no índice é filtrado depois.
    const id = removerAcentos(slugger.slug(texto))
    if (nivel === 2) secoes.push({ id, texto })
  }

  return secoes
}
