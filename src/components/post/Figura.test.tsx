import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Figura } from '@/components/post/Figura'

describe('Figura', () => {
  it('numera a legenda e associa ao conteúdo', () => {
    render(
      <Figura numero={1} legenda="Curva de calibração.">
        <svg role="img" aria-label="gráfico" />
      </Figura>,
    )

    expect(screen.getByText(/Fig\. 1/)).toBeInTheDocument()
    expect(screen.getByText(/Curva de calibração\./)).toBeInTheDocument()
    expect(screen.getByRole('figure')).toContainElement(screen.getByRole('img', { name: 'gráfico' }))
  })
})
