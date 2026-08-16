import { describe, expect, it } from 'vitest'
import { profile } from '@/content/profile'
import { metadataFor, personJsonLd } from '@/lib/seo'

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
})
