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
