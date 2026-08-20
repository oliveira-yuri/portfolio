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

  it('nunca inclui posts de outro idioma', () => {
    const emIngles = { ...postFixture[1], slug: 'em-ingles', locale: 'en' as const, pilar: 'projetos' as const }
    const lista = relacionados([...postFixture, emIngles], postFixture[0])

    expect(lista.map((p) => p.slug)).not.toContain('em-ingles')
  })
})
