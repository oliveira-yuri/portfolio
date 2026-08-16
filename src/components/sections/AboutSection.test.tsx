import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AboutSection } from '@/components/sections/AboutSection'
import { profileFixture } from '@/test/fixtures'

describe('AboutSection', () => {
  it('renderiza todos os parágrafos da bio e a intenção', () => {
    render(<AboutSection locale="pt" profile={profileFixture} />)

    expect(screen.getByRole('region', { name: 'Sobre' })).toBeInTheDocument()
    expect(screen.getByText('Primeiro parágrafo da bio.')).toBeInTheDocument()
    expect(screen.getByText('Segundo parágrafo da bio.')).toBeInTheDocument()
    expect(screen.getByText('Buscando estágio em dados.')).toBeInTheDocument()
  })

  it('traduz o conteúdo', () => {
    render(<AboutSection locale="en" profile={profileFixture} />)

    expect(screen.getByRole('region', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByText('First bio paragraph.')).toBeInTheDocument()
  })
})
