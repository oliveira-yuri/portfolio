import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Post } from '@/lib/posts'
import { siteUrl } from '@/lib/site'
import { postFixture } from '@/test/fixtures'
import PostPage, { dynamicParams, generateMetadata, generateStaticParams } from './page'

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
    // Índice de seções: presente quando o post tem título de nível 2, com âncora casando o id da seção.
    expect(screen.getByRole('navigation', { name: 'Neste texto' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Uma seção' })).toHaveAttribute('href', '#uma-secao')
  })

  it('não renderiza índice de seções quando o post não tem título de nível 2', async () => {
    render(await PostPage({ params: Promise.resolve({ locale: 'pt', slug: 'sem-cta' }) }))

    expect(screen.getByRole('heading', { level: 1, name: 'Post sem CTA' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Neste texto' })).not.toBeInTheDocument()
  })

  it('mantém o título do post antes do índice de seções na ordem do DOM, mesmo com o índice reposicionado visualmente à esquerda (WCAG 1.3.2)', async () => {
    render(await PostPage({ params: Promise.resolve({ locale: 'pt', slug: 'com-cta' }) }))

    const titulo = screen.getByRole('heading', { level: 1, name: 'Post com CTA' })
    const indice = screen.getByRole('navigation', { name: 'Neste texto' })

    // DOCUMENT_POSITION_FOLLOWING (4): `indice` vem DEPOIS de `titulo` no DOM.
    // `md:order-first` na classe do wrapper do índice muda só a posição
    // visual em telas largas — a ordem de leitura/DOM tem que continuar
    // título -> corpo -> índice, senão leitor de tela lê a lista de seções
    // antes de saber do que o post trata.
    expect(titulo.compareDocumentPosition(indice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

  it('mostra o rodapé com posts relacionados do mesmo idioma e o bloco do instituto quando o post declara cta', async () => {
    render(await PostPage({ params: Promise.resolve({ locale: 'pt', slug: 'com-cta' }) }))

    const relacionadosLinks = screen.getAllByRole('link', { name: /^Post (sem CTA|de ensino)$/ })
    expect(relacionadosLinks.map((link) => link.textContent)).toEqual(['Post sem CTA', 'Post de ensino'])
    expect(relacionadosLinks[0]).toHaveAttribute('href', '/pt/posts/sem-cta')
    expect(relacionadosLinks[1]).toHaveAttribute('href', '/pt/posts/de-ensino')

    expect(screen.getByRole('link', { name: /IA para Negócios/ })).toBeInTheDocument()
    expect(screen.getByText(/Divulgação: sou assistente de ensino no ibe\.IA/)).toBeInTheDocument()
  })

  it('não mostra o bloco do instituto no rodapé quando o post não declara cta', async () => {
    render(await PostPage({ params: Promise.resolve({ locale: 'pt', slug: 'sem-cta' }) }))

    expect(screen.queryByRole('link', { name: /Formação/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Divulgação/)).not.toBeInTheDocument()
  })

  it('não sugere post em outro idioma nos relacionados do rodapé', async () => {
    render(await PostPage({ params: Promise.resolve({ locale: 'en', slug: 'com-cta' }) }))

    expect(screen.getByRole('link', { name: 'English only post' })).toHaveAttribute(
      'href',
      '/en/posts/somente-en',
    )
    expect(screen.queryByText('Post sem CTA')).not.toBeInTheDocument()
    expect(screen.queryByText('Post de ensino')).not.toBeInTheDocument()
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

describe('metadados do post', () => {
  it('declara hreflang para os dois idiomas quando o post existe em pt e en', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt', slug: 'com-cta' }) })

    expect(metadata.title).toBe('Post com CTA')
    expect(metadata.description).toBe('Resumo do post com CTA.')
    expect(metadata.alternates?.canonical).toBe('/pt/posts/com-cta')
    expect(metadata.alternates?.languages).toEqual({
      'pt-BR': `${siteUrl}/pt/posts/com-cta`,
      en: `${siteUrl}/en/posts/com-cta`,
    })
    expect(metadata.openGraph).toMatchObject({
      title: 'Post com CTA',
      description: 'Resumo do post com CTA.',
      type: 'article',
    })
  })

  it('não declara hreflang de en quando o post só existe em pt', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt', slug: 'sem-cta' }) })

    expect(metadata.alternates?.languages).toEqual({ 'pt-BR': `${siteUrl}/pt/posts/sem-cta` })
  })

  it('não declara hreflang de pt quando o post só existe em en', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en', slug: 'somente-en' }) })

    expect(metadata.alternates?.languages).toEqual({ en: `${siteUrl}/en/posts/somente-en` })
  })

  it('retorna metadados vazios para locale inexistente', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'fr', slug: 'com-cta' }) })

    expect(metadata).toEqual({})
  })

  it('retorna metadados vazios para slug que não existe em nenhum idioma', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt', slug: 'inexistente' }) })

    expect(metadata).toEqual({})
  })
})
