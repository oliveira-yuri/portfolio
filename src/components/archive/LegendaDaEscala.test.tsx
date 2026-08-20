import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LegendaDaEscala } from '@/components/archive/LegendaDaEscala'
import { postFixture } from '@/test/fixtures'

describe('LegendaDaEscala', () => {
  it('mostra os três pilares na ordem da escala, do abstrato ao aplicado', () => {
    render(<LegendaDaEscala locale="pt" posts={postFixture} />)

    const nomes = screen.getAllByRole('link').map((l) => l.textContent)
    expect(nomes).toEqual(['Acadêmico 01', 'Ensino 01', 'Projetos 01'])
  })

  it('linka cada pilar para sua página no idioma corrente', () => {
    render(<LegendaDaEscala locale="en" posts={postFixture} />)

    expect(screen.getByRole('link', { name: /Teaching/ })).toHaveAttribute('href', '/en/pillars/ensino')
  })

  it('mostra contagem real, inclusive zero, sem esconder pilar vazio', () => {
    render(<LegendaDaEscala locale="pt" posts={[postFixture[0]]} />)

    expect(screen.getByRole('link', { name: 'Acadêmico 00' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projetos 01' })).toBeInTheDocument()
  })
})
