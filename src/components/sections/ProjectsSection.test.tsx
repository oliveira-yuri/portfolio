import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { projectFixture } from '@/test/fixtures'

describe('ProjectsSection', () => {
  it('mostra título, resumo, descrição e tecnologias', () => {
    render(<ProjectsSection locale="pt" items={projectFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Analisador de Notas' })).toBeInTheDocument()
    expect(screen.getByText('Resume boletins automaticamente.')).toBeInTheDocument()
    expect(screen.getByText('Descrição longa do projeto.')).toBeInTheDocument()
    expect(screen.getByText('FastAPI')).toBeInTheDocument()
  })

  it('linka repositório e demo quando existem', () => {
    render(<ProjectsSection locale="pt" items={projectFixture} />)

    const repos = screen.getAllByRole('link', { name: 'Ver código' })
    expect(repos[0]).toHaveAttribute('href', 'https://github.com/fulano/analisador')
    expect(screen.getByRole('link', { name: 'Ver demo' })).toHaveAttribute('href', 'https://analisador.exemplo.com')
  })

  it('omite o link de demo do projeto que não tem demo', () => {
    render(<ProjectsSection locale="pt" items={projectFixture} />)

    expect(screen.getAllByRole('link', { name: 'Ver demo' })).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: 'Ver código' })).toHaveLength(2)
  })

  it('usa alt traduzido na imagem e não exige imagem em todo projeto', () => {
    render(<ProjectsSection locale="en" items={projectFixture} />)

    expect(screen.getByRole('img', { name: 'Analyzer screen' })).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })

  it('mostra o projeto mais recente primeiro', () => {
    render(<ProjectsSection locale="pt" items={[...projectFixture].reverse()} />)

    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titulos).toEqual(['Analisador de Notas', 'CLI de Estudos'])
  })

  it('não quebra com lista vazia', () => {
    render(<ProjectsSection locale="pt" items={[]} />)

    expect(screen.getByRole('region', { name: 'Projetos' })).toBeInTheDocument()
  })

  it('omite o link de código do projeto que só tem demo', () => {
    const somenteDemo = { ...projectFixture[0], slug: 'somente-demo', links: { demo: 'https://somente-demo.exemplo.com' } }

    render(<ProjectsSection locale="pt" items={[somenteDemo]} />)

    expect(screen.getByRole('link', { name: 'Ver demo' })).toHaveAttribute('href', 'https://somente-demo.exemplo.com')
    expect(screen.queryByRole('link', { name: 'Ver código' })).not.toBeInTheDocument()
  })
})
