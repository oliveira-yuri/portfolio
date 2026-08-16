import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkillsSection } from '@/components/sections/SkillsSection'
import { skillGroupsFixture } from '@/test/fixtures'

describe('SkillsSection', () => {
  it('agrupa por nível de uso, na ordem core → used → learning', () => {
    render(<SkillsSection locale="pt" groups={[...skillGroupsFixture].reverse()} />)

    const grupos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(grupos).toEqual(['Uso em projetos', 'Já usei', 'Estudando agora'])
  })

  it('lista as tecnologias de cada grupo', () => {
    render(<SkillsSection locale="pt" groups={skillGroupsFixture} />)

    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('traduz os rótulos de nível', () => {
    render(<SkillsSection locale="en" groups={skillGroupsFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Currently learning' })).toBeInTheDocument()
  })

  it('omite grupo sem itens', () => {
    render(<SkillsSection locale="pt" groups={[{ level: 'core', items: ['Python'] }, { level: 'used', items: [] }]} />)

    expect(screen.queryByRole('heading', { level: 3, name: 'Já usei' })).not.toBeInTheDocument()
  })
})
