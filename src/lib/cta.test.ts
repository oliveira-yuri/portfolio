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
