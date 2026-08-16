import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HeroSection } from '@/components/sections/HeroSection'
import { profileFixture } from '@/test/fixtures'

describe('HeroSection', () => {
  it('mostra nome e headline com um único h1', () => {
    render(<HeroSection locale="pt" profile={profileFixture} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Fulano de Tal' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText('Estudante de Sistemas')).toBeInTheDocument()
  })

  it('oferece currículo, GitHub, LinkedIn e e-mail', () => {
    render(<HeroSection locale="pt" profile={profileFixture} />)

    expect(screen.getByRole('link', { name: 'Baixar currículo' })).toHaveAttribute('href', '/cv/curriculo-pt.pdf')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/fulano')
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/fulano')
    expect(screen.getByRole('link', { name: 'fulano@exemplo.com' })).toHaveAttribute(
      'href',
      'mailto:fulano@exemplo.com',
    )
  })

  it('serve o currículo em inglês quando a página está em inglês', () => {
    render(<HeroSection locale="en" profile={profileFixture} />)

    expect(screen.getByRole('link', { name: 'Download résumé' })).toHaveAttribute('href', '/cv/resume-en.pdf')
    expect(screen.getByText('Systems student')).toBeInTheDocument()
  })
})
