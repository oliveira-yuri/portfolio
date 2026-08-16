import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContactSection } from '@/components/sections/ContactSection'
import { profileFixture } from '@/test/fixtures'

describe('ContactSection', () => {
  it('repete os caminhos de contato no fim da página', () => {
    render(<ContactSection locale="pt" profile={profileFixture} />)

    expect(screen.getByRole('region', { name: 'Contato' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'fulano@exemplo.com' })).toHaveAttribute(
      'href',
      'mailto:fulano@exemplo.com',
    )
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Baixar currículo' })).toHaveAttribute('href', '/cv/curriculo-pt.pdf')
  })

  it('mostra o e-mail como texto selecionável, não só ícone', () => {
    render(<ContactSection locale="pt" profile={profileFixture} />)

    expect(screen.getByText('fulano@exemplo.com')).toBeInTheDocument()
  })

  it('serve o currículo em inglês na versão em inglês', () => {
    render(<ContactSection locale="en" profile={profileFixture} />)

    expect(screen.getByRole('link', { name: 'Download résumé' })).toHaveAttribute('href', '/cv/resume-en.pdf')
  })
})
