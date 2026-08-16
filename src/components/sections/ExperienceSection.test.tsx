import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExperienceSection } from '@/components/sections/ExperienceSection'
import { experienceFixture } from '@/test/fixtures'

describe('ExperienceSection', () => {
  it('lista cargo, organização, período e bullets', () => {
    render(<ExperienceSection locale="pt" items={experienceFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Monitor de IA' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Instituto Exemplo' })).toHaveAttribute('href', 'https://exemplo.edu')
    expect(screen.getByText('fev 2025 — atual')).toBeInTheDocument()
    expect(screen.getByText('Acompanhou 60 alunos.')).toBeInTheDocument()
    expect(screen.getByText('Produziu 12 aulas práticas.')).toBeInTheDocument()
  })

  it('mostra a experiência mais recente primeiro', () => {
    render(<ExperienceSection locale="pt" items={[...experienceFixture].reverse()} />)

    const cargos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(cargos).toEqual(['Monitor de IA', 'Desenvolvedor freelance'])
  })

  it('mostra organização sem link como texto simples', () => {
    render(<ExperienceSection locale="pt" items={experienceFixture} />)

    expect(screen.queryByRole('link', { name: 'Autônomo' })).not.toBeInTheDocument()
    expect(screen.getByText('Autônomo')).toBeInTheDocument()
  })

  it('traduz cargo e período', () => {
    render(<ExperienceSection locale="en" items={experienceFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: 'AI teaching assistant' })).toBeInTheDocument()
    expect(screen.getByText('Feb 2025 — present')).toBeInTheDocument()
  })

  it('não quebra com lista vazia', () => {
    render(<ExperienceSection locale="pt" items={[]} />)

    expect(screen.getByRole('region', { name: 'Experiência' })).toBeInTheDocument()
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
  })
})
