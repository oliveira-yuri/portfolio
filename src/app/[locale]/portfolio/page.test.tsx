import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { metadataFor } from '@/lib/seo'
import PortfolioPage, { generateMetadata } from './page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/pt',
  notFound: () => {
    throw new Error('notFound')
  },
}))

describe('página do portfólio', () => {
  it('monta todas as seções na ordem definida', async () => {
    render(await PortfolioPage({ params: Promise.resolve({ locale: 'pt' }) }))

    const regioes = screen.getAllByRole('region').map((r) => r.getAttribute('id'))
    expect(regioes).toEqual(['sobre', 'experiencia', 'habilidades', 'certificados', 'formacao', 'contato'])
  })

  it('tem exatamente um h1 e um main', async () => {
    render(await PortfolioPage({ params: Promise.resolve({ locale: 'en' }) }))

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })
})

describe('metadados da página de portfólio', () => {
  it('declara canonical e título próprios, não os da home', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'pt' }) })

    expect(metadata.alternates?.canonical).toBe('/pt/portfolio')
    expect(metadata.alternates?.canonical).not.toBe(metadataFor('pt').alternates?.canonical)
    expect(metadata.title).toContain('Portfólio')
  })

  it('retorna metadados vazios para locale inexistente', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'fr' }) })

    expect(metadata).toEqual({})
  })
})
