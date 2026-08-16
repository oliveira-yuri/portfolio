import { describe, expect, it } from 'vitest'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { siteUrl } from '@/lib/site'

describe('sitemap', () => {
  it('lista as duas rotas de idioma com alternates', () => {
    const entradas = sitemap()

    expect(entradas.map((e) => e.url)).toEqual([`${siteUrl}/pt`, `${siteUrl}/en`])
    expect(entradas[0].alternates?.languages).toMatchObject({
      'pt-BR': `${siteUrl}/pt`,
      en: `${siteUrl}/en`,
    })
  })
})

describe('robots', () => {
  it('libera o rastreamento e aponta para o sitemap', () => {
    const regras = robots()

    expect(regras.sitemap).toBe(`${siteUrl}/sitemap.xml`)
    expect(regras.rules).toMatchObject({ userAgent: '*', allow: '/' })
  })
})
