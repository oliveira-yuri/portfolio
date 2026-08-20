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
