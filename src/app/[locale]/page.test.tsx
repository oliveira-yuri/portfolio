import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NewsletterPage from '@/app/[locale]/page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/pt',
  notFound: () => {
    throw new Error('notFound')
  },
}))

describe('Newsletter (home)', () => {
  it('mostra o nome do autor e o bloco de identidade', async () => {
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'pt' }) }))

    expect(screen.getByRole('heading', { level: 1, name: 'Yuri Oliveira' })).toBeInTheDocument()
  })

  it('linka para o portfólio a partir do topo e do bloco de identidade', async () => {
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'pt' }) }))

    const links = screen.getAllByRole('link', { name: 'Portfólio' })
    expect(links.length).toBeGreaterThan(1)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/pt/portfolio')
    }
  })

  it('não tem seção "sobre mim" fora do bloco de identidade', async () => {
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'pt' }) }))

    expect(screen.queryByRole('heading', { level: 2, name: 'Sobre' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Experiência' })).not.toBeInTheDocument()
  })

  it('mostra as três trilhas', async () => {
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'pt' }) }))

    expect(screen.getByRole('heading', { level: 2, name: 'Trilhas' })).toBeInTheDocument()
  })
})
