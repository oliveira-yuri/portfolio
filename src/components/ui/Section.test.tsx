import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Section } from '@/components/ui/Section'

describe('Section', () => {
  it('expõe uma região nomeada pelo próprio título', () => {
    render(
      <Section id="projetos" title="Projetos">
        <p>conteúdo</p>
      </Section>,
    )

    const regiao = screen.getByRole('region', { name: 'Projetos' })
    expect(regiao).toHaveAttribute('id', 'projetos')
    expect(screen.getByRole('heading', { level: 2, name: 'Projetos' })).toBeInTheDocument()
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })
})
