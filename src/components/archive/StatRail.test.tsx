import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatRail } from '@/components/archive/StatRail'
import { postFixture } from '@/test/fixtures'

describe('StatRail', () => {
  it('mostra a contagem real de textos', () => {
    render(<StatRail locale="pt" posts={postFixture} />)

    const [textos] = screen.getAllByRole('definition')
    expect(textos).toHaveTextContent(/^3 textos$/)
  })

  it('mostra a data absoluta do último texto, nunca tempo relativo', () => {
    render(<StatRail locale="pt" posts={postFixture} />)

    expect(screen.getByText(/^12\/08\/2026$/)).toBeInTheDocument()
    expect(screen.queryByText(/há \d+ dias?/)).not.toBeInTheDocument()
  })

  it('mostra o mês do texto mais antigo como início', () => {
    render(<StatRail locale="pt" posts={postFixture} />)

    expect(screen.getByText(/^06\/2026$/)).toBeInTheDocument()
  })

  it('não renderiza nada sem posts', () => {
    const { container } = render(<StatRail locale="pt" posts={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
