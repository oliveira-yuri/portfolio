import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { metadataFor } from '@/lib/seo'
import { postFixture } from '@/test/fixtures'
import TagsPage, { dynamicParams, generateMetadata, generateStaticParams } from './page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/pt/tags',
  notFound: () => {
    throw new Error('notFound')
  },
}))

vi.mock('@/lib/posts', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/posts')>()
  return { ...original, lerPosts: () => postFixture }
})

describe('parâmetros estáticos da rota de tags', () => {
  it('gera uma rota por idioma', () => {
    expect(generateStaticParams()).toEqual([{ locale: 'pt' }, { locale: 'en' }])
  })

  it('não aceita idiomas fora dessa lista', () => {
    expect(dynamicParams).toBe(false)
  })
})

describe('página de índice de tags', () => {
  it('lista cada tag com sua contagem, ordenada por total e depois alfabeticamente', async () => {
    render(await TagsPage({ params: Promise.resolve({ locale: 'pt' }) }))

    const links = within(screen.getByRole('list')).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      '#ensino',
      '#esports',
      '#estatistica',
      '#ia',
      '#probabilidade',
    ])
  })

  it('linka cada tag para a página de arquivo dessa tag no idioma corrente', async () => {
    render(await TagsPage({ params: Promise.resolve({ locale: 'pt' }) }))

    expect(within(screen.getByRole('list')).getByRole('link', { name: '#estatistica' })).toHaveAttribute(
      'href',
      '/pt/tags/estatistica',
    )
  })

  it('404 para locale inexistente', async () => {
    await expect(TagsPage({ params: Promise.resolve({ locale: 'fr' }) })).rejects.toThrow('notFound')
  })
})

describe('metadados da página de índice de tags', () => {
  it('declara canonical e título próprios, não os da home', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt' }) })

    expect(metadata.alternates?.canonical).toBe('/pt/tags')
    expect(metadata.alternates?.canonical).not.toBe(metadataFor('pt').alternates?.canonical)
    expect(metadata.title).not.toBe(metadataFor('pt').title)
    expect(metadata.title).toContain('Ver todas as tags')
  })

  it('retorna metadados vazios para locale inexistente', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'fr' }) })

    expect(metadata).toEqual({})
  })
})
