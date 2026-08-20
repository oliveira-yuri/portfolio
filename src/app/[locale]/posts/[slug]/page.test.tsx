import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Post } from '@/lib/posts'
import { postFixture } from '@/test/fixtures'
import PostPage, { dynamicParams, generateStaticParams } from './page'

const postEnComCta: Post = {
  ...postFixture[0],
  locale: 'en',
  titulo: 'Post with CTA',
  resumo: 'Summary of the CTA post.',
  corpo: '## A section\n\nBody.',
}

const postSomenteEn: Post = {
  ...postFixture[2],
  slug: 'somente-en',
  locale: 'en',
  titulo: 'English only post',
  resumo: 'Only available in English.',
  corpo: 'Body.',
}

const posts: Post[] = [...postFixture, postEnComCta, postSomenteEn]

vi.mock('next/navigation', () => ({
  usePathname: () => '/pt/posts/com-cta',
  notFound: () => {
    throw new Error('notFound')
  },
}))

vi.mock('@/lib/posts', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/posts')>()
  return { ...original, lerPosts: () => posts }
})

describe('parâmetros estáticos da rota de post', () => {
  it('gera uma rota por combinação de idioma e slug existente, mesmo quando o slug só existe num idioma', () => {
    expect(generateStaticParams()).toEqual([
      { locale: 'pt', slug: 'com-cta' },
      { locale: 'pt', slug: 'sem-cta' },
      { locale: 'pt', slug: 'de-ensino' },
      { locale: 'pt', slug: 'somente-en' },
      { locale: 'en', slug: 'com-cta' },
      { locale: 'en', slug: 'sem-cta' },
      { locale: 'en', slug: 'de-ensino' },
      { locale: 'en', slug: 'somente-en' },
    ])
  })

  it('não aceita slugs fora dessa lista', () => {
    expect(dynamicParams).toBe(false)
  })
})

describe('página de post', () => {
  it('renderiza o post e o corpo em MDX com a classe de estilo quando ele existe no idioma da rota', async () => {
    const { container } = render(await PostPage({ params: Promise.resolve({ locale: 'pt', slug: 'com-cta' }) }))

    expect(screen.getByRole('heading', { level: 1, name: 'Post com CTA' })).toBeInTheDocument()
    expect(container.querySelector('.corpo-post')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Uma seção' })).toBeInTheDocument()
  })

  it('não retorna 404 para um post que só existe em português; mostra aviso em inglês e link para o pt', async () => {
    render(await PostPage({ params: Promise.resolve({ locale: 'en', slug: 'sem-cta' }) }))

    expect(screen.getByRole('heading', { level: 1, name: 'Post sem CTA' })).toBeInTheDocument()
    expect(screen.getByText('This text is only available in Portuguese.')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Ler em português' })
    expect(link).toHaveAttribute('href', '/pt/posts/sem-cta')
    // Página em lang="en", mas o rótulo do link está em português (WCAG 3.1.2).
    expect(link).toHaveAttribute('lang', 'pt-BR')
  })

  it('não retorna 404 para um post que só existe em inglês; mostra aviso em português e link para o en', async () => {
    render(await PostPage({ params: Promise.resolve({ locale: 'pt', slug: 'somente-en' }) }))

    expect(screen.getByRole('heading', { level: 1, name: 'English only post' })).toBeInTheDocument()
    expect(screen.getByText('Este texto existe apenas em inglês.')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Read in English' })
    expect(link).toHaveAttribute('href', '/en/posts/somente-en')
    // Página em lang="pt-BR", mas o rótulo do link está em inglês (WCAG 3.1.2).
    expect(link).toHaveAttribute('lang', 'en')
  })

  it('404 para locale inexistente', async () => {
    await expect(
      PostPage({ params: Promise.resolve({ locale: 'fr', slug: 'com-cta' }) }),
    ).rejects.toThrow('notFound')
  })

  it('404 para slug que não existe em nenhum idioma', async () => {
    await expect(
      PostPage({ params: Promise.resolve({ locale: 'pt', slug: 'inexistente' }) }),
    ).rejects.toThrow('notFound')
  })
})
