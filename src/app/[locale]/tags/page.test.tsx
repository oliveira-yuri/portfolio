import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { postFixture } from '@/test/fixtures'
import TagsPage, { dynamicParams, generateStaticParams } from './page'

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
