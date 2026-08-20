import { describe, expect, it, vi } from 'vitest'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import type { Post } from '@/lib/posts'
import { siteUrl } from '@/lib/site'
import { postFixture } from '@/test/fixtures'

// `src/content/posts/` está vazio neste repo (ver `.gitkeep`), então os testes
// que dependem de haver post/tag no sitemap precisam da própria fixture — não
// dá pra fazer `lerPosts()` real produzir esses casos aqui.
const postEnComCta: Post = {
  ...postFixture[0],
  locale: 'en',
  titulo: 'Post with CTA',
  resumo: 'Summary of the CTA post.',
  corpo: '## A section\n\nBody.',
}

const posts: Post[] = [...postFixture, postEnComCta]

vi.mock('@/lib/posts', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/posts')>()
  return { ...original, lerPosts: () => posts }
})

describe('sitemap', () => {
  it('lista as duas rotas de idioma com alternates', () => {
    const entradas = sitemap()
    const homes = entradas.filter((e) => e.url === `${siteUrl}/pt` || e.url === `${siteUrl}/en`)

    expect(homes.map((e) => e.url)).toEqual([`${siteUrl}/pt`, `${siteUrl}/en`])
    expect(homes[0].alternates?.languages).toMatchObject({
      'pt-BR': `${siteUrl}/pt`,
      en: `${siteUrl}/en`,
    })
  })

  it('inclui a página de cada post nos dois idiomas', () => {
    const urls = sitemap().map((entrada) => entrada.url)

    expect(urls).toContain(`${siteUrl}/pt/posts/com-cta`)
    expect(urls).toContain(`${siteUrl}/pt/posts/sem-cta`)
    expect(urls).toContain(`${siteUrl}/pt/posts/de-ensino`)
    expect(urls).toContain(`${siteUrl}/en/posts/com-cta`)
  })

  it('inclui o portfólio, as tags e os pilares', () => {
    const urls = sitemap().map((entrada) => entrada.url)

    expect(urls).toContain(`${siteUrl}/pt/portfolio`)
    expect(urls).toContain(`${siteUrl}/pt/tags/estatistica`)
    expect(urls).toContain(`${siteUrl}/pt/tags/probabilidade`)
    expect(urls).toContain(`${siteUrl}/en/pillars/projetos`)
    expect(urls).toContain(`${siteUrl}/pt/pilares/academico`)
  })

  it('não repete nenhuma URL', () => {
    const urls = sitemap().map((entrada) => entrada.url)

    expect(new Set(urls).size).toBe(urls.length)
  })
})

describe('robots', () => {
  it('libera o rastreamento e aponta para o sitemap', () => {
    const regras = robots()

    expect(regras.sitemap).toBe(`${siteUrl}/sitemap.xml`)
    expect(regras.rules).toMatchObject({ userAgent: '*', allow: '/' })
  })
})
