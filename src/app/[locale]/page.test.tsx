import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NewsletterPage from '@/app/[locale]/page'
import { postFixture } from '@/test/fixtures'

vi.mock('next/navigation', () => ({
  usePathname: () => '/pt',
  notFound: () => {
    throw new Error('notFound')
  },
}))

// Único teste de rota que não mockava lerPosts — passava a asserir contra o
// conteúdo real de src/content/posts/, que vai crescer com os próximos
// textos e quebrar por motivo nenhum ligado ao que este teste diz testar.
// Segue o mesmo padrão de mock dos outros testes de rota (ver
// src/app/[locale]/tags/page.test.tsx e pares).
vi.mock('@/lib/posts', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/posts')>()
  return { ...original, lerPosts: () => postFixture }
})

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

  it('mostra a legenda da escala, sem o eixo do tempo (retirado de propósito, ver comentário em page.tsx)', async () => {
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'pt' }) }))

    expect(screen.getByRole('link', { name: 'Projetos 01' })).toHaveAttribute('href', '/pt/pilares/projetos')
    expect(screen.queryByRole('heading', { level: 2, name: 'Cadência' })).not.toBeInTheDocument()
  })
})
