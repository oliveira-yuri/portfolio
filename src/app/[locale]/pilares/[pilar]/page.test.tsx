import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { metadataFor } from '@/lib/seo'
import { postFixture } from '@/test/fixtures'
import PilarPage, { dynamicParams, generateMetadata, generateStaticParams } from './page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/pt/pilares/ensino',
  notFound: () => {
    throw new Error('notFound')
  },
}))

vi.mock('@/lib/posts', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/posts')>()
  return { ...original, lerPosts: () => postFixture }
})

describe('parâmetros estáticos da rota de pilar', () => {
  it('gera todas as combinações de locale e pilar', async () => {
    expect(await generateStaticParams()).toEqual([
      { locale: 'pt', pilar: 'academico' },
      { locale: 'pt', pilar: 'ensino' },
      { locale: 'pt', pilar: 'projetos' },
      { locale: 'en', pilar: 'academico' },
      { locale: 'en', pilar: 'ensino' },
      { locale: 'en', pilar: 'projetos' },
    ])
  })

  it('não aceita pilares fora dessa lista', () => {
    expect(dynamicParams).toBe(false)
  })
})

describe('página de pilar', () => {
  it('mostra o nome e a descrição do pilar no idioma da rota', async () => {
    render(await PilarPage({ params: Promise.resolve({ locale: 'pt', pilar: 'ensino' }) }))

    expect(screen.getByRole('heading', { level: 1, name: 'Ensino' })).toBeInTheDocument()
    expect(screen.getByText('O que dar aula de IA no ibe.IA me ensinou sobre IA.')).toBeInTheDocument()
  })

  it('traduz o mesmo pilar em inglês sem traduzir a chave da URL', async () => {
    render(await PilarPage({ params: Promise.resolve({ locale: 'en', pilar: 'ensino' }) }))

    expect(screen.getByRole('heading', { level: 1, name: 'Teaching' })).toBeInTheDocument()
  })

  it('lista somente os posts do pilar corrente', async () => {
    render(await PilarPage({ params: Promise.resolve({ locale: 'pt', pilar: 'academico' }) }))

    expect(screen.getByRole('link', { name: 'Post sem CTA' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Post com CTA' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Post de ensino' })).not.toBeInTheDocument()
  })

  it('renderiza o cabeçalho sem lista de posts quando o pilar não tem nenhum', async () => {
    render(await PilarPage({ params: Promise.resolve({ locale: 'en', pilar: 'projetos' }) }))

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('404 para locale inexistente', async () => {
    await expect(PilarPage({ params: Promise.resolve({ locale: 'fr', pilar: 'ensino' }) })).rejects.toThrow(
      'notFound',
    )
  })

  it('404 para pilar inexistente', async () => {
    await expect(
      PilarPage({ params: Promise.resolve({ locale: 'pt', pilar: 'inexistente' }) }),
    ).rejects.toThrow('notFound')
  })
})

describe('metadados da página de pilar', () => {
  it('declara canonical e título próprios do pilar, não os da home', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt', pilar: 'ensino' }) })

    expect(metadata.alternates?.canonical).toBe('/pt/pilares/ensino')
    expect(metadata.alternates?.canonical).not.toBe(metadataFor('pt').alternates?.canonical)
    expect(metadata.title).toContain('Ensino')
  })

  it('em inglês, o canonical usa o segmento traduzido "pillars", não "pilares" — a mesma URL que o sitemap submete', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en', pilar: 'ensino' }) })

    expect(metadata.alternates?.canonical).toBe('/en/pillars/ensino')
  })

  it('o hreflang de en aponta para /pillars/, e o de pt continua em /pilares/ — as duas URLs de fato existentes', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt', pilar: 'ensino' }) })

    expect(metadata.alternates?.languages).toMatchObject({
      'pt-BR': '/pt/pilares/ensino',
      en: '/en/pillars/ensino',
    })
  })

  it('retorna metadados vazios para locale inexistente', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'fr', pilar: 'ensino' }) })

    expect(metadata).toEqual({})
  })

  it('retorna metadados vazios para pilar inexistente', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt', pilar: 'inexistente' }) })

    expect(metadata).toEqual({})
  })
})
