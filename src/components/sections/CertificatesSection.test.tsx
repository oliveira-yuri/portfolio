import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CertificatesSection } from '@/components/sections/CertificatesSection'
import { certificatesFixture } from '@/test/fixtures'

describe('CertificatesSection', () => {
  it('mostra título, emissor e data de cada certificado', () => {
    render(<CertificatesSection locale="pt" items={certificatesFixture} />)

    expect(screen.getByRole('region', { name: 'Certificados' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Fundamentos de IA' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'SQL Aplicado' })).toBeInTheDocument()
    expect(screen.getAllByText('Exemplo Academy')).toHaveLength(2)
    expect(screen.getByText('mar 2025')).toBeInTheDocument()
  })

  it('linka a credencial de quem tem link, e mostra quem não tem sem penalizar', () => {
    render(<CertificatesSection locale="pt" items={certificatesFixture} />)

    const links = screen.getAllByRole('link', { name: 'Verificar credencial' })
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', 'https://exemplo.com/credencial/1')
    expect(screen.getByRole('heading', { level: 3, name: 'SQL Aplicado' })).toBeInTheDocument()
  })

  it('mostra o certificado mais recente primeiro', () => {
    render(<CertificatesSection locale="pt" items={[...certificatesFixture].reverse()} />)

    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titulos).toEqual(['Fundamentos de IA', 'SQL Aplicado'])
  })

  it('não renderiza nada quando a lista está vazia', () => {
    const { container } = render(<CertificatesSection locale="pt" items={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('traduz título da seção e dos certificados', () => {
    render(<CertificatesSection locale="en" items={certificatesFixture} />)

    expect(screen.getByRole('region', { name: 'Certificates' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'AI Foundations' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Verify credential' })).toBeInTheDocument()
  })
})
