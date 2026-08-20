import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatRail } from '@/components/archive/StatRail'
import { postFixture } from '@/test/fixtures'

describe('StatRail', () => {
  it('mostra a data absoluta do último texto, nunca tempo relativo', () => {
    render(<StatRail locale="pt" posts={postFixture} />)

    expect(screen.getByRole('term')).toHaveTextContent('último em')
    expect(screen.getByRole('definition')).toHaveTextContent('12/08/2026')
    expect(screen.queryByText(/há \d+ dias?/)).not.toBeInTheDocument()
  })

  it('não repete o rótulo entre o termo e a definição (leitor de tela não ouve "último em" duas vezes)', () => {
    render(<StatRail locale="pt" posts={postFixture} />)

    const termo = screen.getByRole('term')
    const definicao = screen.getByRole('definition')
    expect(termo.textContent).toBe('último em')
    expect(definicao.textContent).not.toMatch(/último em/)
  })

  it('não mostra nenhum outro fato: só a definição da data mais recente', () => {
    render(<StatRail locale="pt" posts={postFixture} />)

    expect(screen.getAllByRole('definition')).toHaveLength(1)
  })

  it('não renderiza nada sem posts', () => {
    const { container } = render(<StatRail locale="pt" posts={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
