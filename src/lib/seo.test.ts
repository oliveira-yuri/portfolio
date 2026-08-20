import { describe, expect, it } from 'vitest'
import { profile } from '@/content/profile'
import { metadataFor, personJsonLd } from '@/lib/seo'
import { siteUrl } from '@/lib/site'

describe('personJsonLd', () => {
  it('descreve a pessoa dona do portfólio', () => {
    const json = personJsonLd('pt')

    expect(json['@type']).toBe('Person')
    expect(json.name).toBe(profile.name)
    expect(Array.isArray(json.sameAs)).toBe(true)
    expect(json.sameAs).toContain(profile.links.github)
    expect(json.sameAs).toContain(profile.links.linkedin)
  })

  it('lista habilidades e formação', () => {
    const json = personJsonLd('en')

    expect((json.knowsAbout as string[]).length).toBeGreaterThan(0)
    expect(json.alumniOf).toBeDefined()
  })
})

describe('metadataFor', () => {
  it('liga as duas versões de idioma com x-default apontando para pt', () => {
    const metadata = metadataFor('pt')

    expect(metadata.alternates?.languages).toMatchObject({
      'pt-BR': '/pt',
      en: '/en',
      'x-default': '/pt',
    })
    expect(metadata.alternates?.canonical).toBe('/pt')
  })

  it('usa título e descrição no idioma da página', () => {
    expect(metadataFor('en').description).toBe(profile.headline.en)
    expect(metadataFor('pt').description).toBe(profile.headline.pt)
  })

  it('com path, usa esse path como canonical e como og:url, em vez da home', () => {
    const metadata = metadataFor('pt', { path: '/pt/tags' })

    expect(metadata.alternates?.canonical).toBe('/pt/tags')
    expect(metadata.openGraph?.url).toBe(`${siteUrl}/pt/tags`)
  })

  it('com title, usa esse título em vez do título padrão da home', () => {
    const metadata = metadataFor('pt', { title: 'Ver todas as tags — Yuri Oliveira' })

    expect(metadata.title).toBe('Ver todas as tags — Yuri Oliveira')
    expect(metadata.openGraph?.title).toBe('Ver todas as tags — Yuri Oliveira')
    expect(metadata.twitter?.title).toBe('Ver todas as tags — Yuri Oliveira')
  })

  it('deriva as duas versões de idioma a partir do path quando o segmento é igual nos dois idiomas', () => {
    const metadata = metadataFor('en', { path: '/en/tags/estatistica' })

    expect(metadata.alternates?.languages).toMatchObject({
      'pt-BR': '/pt/tags/estatistica',
      en: '/en/tags/estatistica',
      'x-default': '/pt/tags/estatistica',
    })
  })

  it('com languages explícito, ignora a derivação automática a partir do path', () => {
    const metadata = metadataFor('en', {
      path: '/en/pillars/ensino',
      languages: { 'pt-BR': '/pt/pilares/ensino', en: '/en/pillars/ensino', 'x-default': '/pt/pilares/ensino' },
    })

    expect(metadata.alternates?.languages).toEqual({
      'pt-BR': '/pt/pilares/ensino',
      en: '/en/pillars/ensino',
      'x-default': '/pt/pilares/ensino',
    })
  })
})
