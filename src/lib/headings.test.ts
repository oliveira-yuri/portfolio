import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { extrairSecoes } from '@/lib/headings'
import { renderizarMdx } from '@/lib/mdx'

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

  it('não lista título de nível 1 nem de nível 3, só os de nível 2', () => {
    const secoes = extrairSecoes('# Título do post\n\n## Uma seção\n\n### Uma subseção\n')

    expect(secoes).toEqual([{ id: 'uma-secao', texto: 'Uma seção' }])
  })

  it('desduplica id de título repetido como o rehype-slug, com sufixo -1, -2...', () => {
    const secoes = extrairSecoes('## Resultados\n\ntexto\n\n## Resultados\n\nmais texto\n\n## Resultados\n')

    expect(secoes).toEqual([
      { id: 'resultados', texto: 'Resultados' },
      { id: 'resultados-1', texto: 'Resultados' },
      { id: 'resultados-2', texto: 'Resultados' },
    ])
  })

  it('gera exatamente os mesmos ids que aparecem nas âncoras do HTML renderizado por renderizarMdx, com acento e título repetido', async () => {
    const corpo =
      '## Primeira seção\n\ntexto\n\n## Resultados\n\nmais texto\n\n## Resultados\n\nainda mais texto\n'

    const secoes = extrairSecoes(corpo)
    const { container } = render(await renderizarMdx(corpo))

    const idsRenderizados = [...container.querySelectorAll('h2')].map((titulo) => titulo.id)

    // Âncora do índice tem que bater com o id real gerado pelo pipeline de
    // MDX (rehype-slug + rehypeSlugSemAcento) — se essa lista aqui estiver
    // errada, o teste falha mostrando exatamente o que o rehype-slug gerou.
    expect(idsRenderizados).toEqual(['primeira-secao', 'resultados', 'resultados-1'])
    expect(secoes.map((secao) => secao.id)).toEqual(idsRenderizados)
  })
})
