import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { metadataFor } from '@/lib/seo'
import { postFixture } from '@/test/fixtures'
import TagPage, { dynamicParams, generateMetadata, generateStaticParams } from './page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/pt/tags/estatistica',
  notFound: () => {
    throw new Error('notFound')
  },
}))

vi.mock('@/lib/posts', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/posts')>()
  return { ...original, lerPosts: () => postFixture }
})

describe('parâmetros estáticos da rota de tag', () => {
  it('gera uma rota por combinação de idioma e tag existente', () => {
    expect(generateStaticParams()).toEqual([
      { locale: 'pt', tag: 'ensino' },
      { locale: 'pt', tag: 'esports' },
      { locale: 'pt', tag: 'estatistica' },
      { locale: 'pt', tag: 'ia' },
      { locale: 'pt', tag: 'probabilidade' },
    ])
  })

  it('não aceita tags fora dessa lista', () => {
    expect(dynamicParams).toBe(false)
  })
})

describe('página de tag', () => {
  it('mostra somente os posts que têm a tag pedida', async () => {
    render(await TagPage({ params: Promise.resolve({ locale: 'pt', tag: 'estatistica' }) }))

    expect(screen.getByRole('heading', { level: 1, name: '#estatistica' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Post com CTA' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Post sem CTA' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Post de ensino' })).not.toBeInTheDocument()
  })

  it('404 para locale inexistente', async () => {
    await expect(
      TagPage({ params: Promise.resolve({ locale: 'fr', tag: 'estatistica' }) }),
    ).rejects.toThrow('notFound')
  })

  it('404 para tag sem nenhum post nesse idioma', async () => {
    await expect(
      TagPage({ params: Promise.resolve({ locale: 'pt', tag: 'inexistente' }) }),
    ).rejects.toThrow('notFound')
  })
})

describe('metadados da página de tag', () => {
  it('declara canonical e título próprios da tag, não os da home', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt', tag: 'estatistica' }) })

    expect(metadata.alternates?.canonical).toBe('/pt/tags/estatistica')
    expect(metadata.alternates?.canonical).not.toBe(metadataFor('pt').alternates?.canonical)
    expect(metadata.title).toContain('#estatistica')
  })

  it('retorna metadados vazios para locale inexistente', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'fr', tag: 'estatistica' }) })

    expect(metadata).toEqual({})
  })

  it('retorna metadados vazios para tag sem nenhum post nesse idioma', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt', tag: 'inexistente' }) })

    expect(metadata).toEqual({})
  })
})
