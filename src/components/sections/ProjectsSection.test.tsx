import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import type { Project } from '@/content/types'
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

  it('mostra o projeto mais recente primeiro dentro de cada grupo de destaque', () => {
    render(<ProjectsSection locale="pt" items={[...projectFixture].reverse()} />)

    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titulos).toEqual(['Analisador de Notas', 'CLI de Estudos'])
  })

  it('mostra o papel do autor no projeto perto do período', () => {
    render(<ProjectsSection locale="pt" items={projectFixture} />)

    expect(screen.getAllByText(/Projeto pessoal/)).toHaveLength(projectFixture.length)
  })

  it('coloca projeto em destaque primeiro mesmo quando é mais antigo que os outros', () => {
    // Arranjo onde destaque e data discordam: se a ordenação fosse só por data,
    // "Projeto Recente Sem Destaque" viria primeiro (2026 > 2022). A regra é
    // destaque primeiro, então "Projeto Antigo em Destaque" deve vir primeiro.
    const antigoDestaque: Project = {
      ...projectFixture[0],
      slug: 'antigo-destaque',
      title: 'Projeto Antigo em Destaque',
      featured: true,
      period: { start: '2022-01', end: '2022-06' },
    }
    const recenteSemDestaque: Project = {
      ...projectFixture[1],
      slug: 'recente-sem-destaque',
      title: 'Projeto Recente Sem Destaque',
      featured: false,
      period: { start: '2026-01', end: null },
    }

    render(<ProjectsSection locale="pt" items={[recenteSemDestaque, antigoDestaque]} />)

    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titulos).toEqual(['Projeto Antigo em Destaque', 'Projeto Recente Sem Destaque'])
  })

  it('não renderiza nada quando a lista está vazia', () => {
    const { container } = render(<ProjectsSection locale="pt" items={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('omite o link de código do projeto que só tem demo', () => {
    const somenteDemo = { ...projectFixture[0], slug: 'somente-demo', links: { demo: 'https://somente-demo.exemplo.com' } }

    render(<ProjectsSection locale="pt" items={[somenteDemo]} />)

    expect(screen.getByRole('link', { name: 'Ver demo' })).toHaveAttribute('href', 'https://somente-demo.exemplo.com')
    expect(screen.queryByRole('link', { name: 'Ver código' })).not.toBeInTheDocument()
  })

  it('não usa cartão — sem borda, sem fundo elevado; o ritmo é o espaço', () => {
    const { container } = render(<ProjectsSection locale="pt" items={projectFixture} />)

    // A lista externa (um projeto por item) vem primeiro no documento; as
    // tags de tecnologia são `<li>` de uma lista ANINHADA dentro de cada
    // projeto e legitimamente têm borda — são pílulas, não o cartão do
    // projeto. `:scope > li` restringe aos filhos diretos da lista externa.
    const listaDeProjetos = container.querySelector('ul')
    expect(listaDeProjetos).not.toBeNull()

    const itens = listaDeProjetos?.querySelectorAll(':scope > li') ?? []
    expect(itens).toHaveLength(projectFixture.length)
    for (const item of itens) {
      expect(item.className).not.toMatch(/border|bg-papel|rounded/)
    }
  })

  it('mostra papel e período como rótulo monoespaçado acima do título', () => {
    render(<ProjectsSection locale="pt" items={projectFixture} />)

    const rotulo = screen.getAllByText(/Projeto pessoal/)[0]
    expect(rotulo.className).toMatch(/font-dado/)
  })
})
