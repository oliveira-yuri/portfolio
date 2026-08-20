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

  it('numera a legenda quando numero chega como string — o caso real de um post em MDX', () => {
    render(
      <Figura numero="1" legenda="Curva de calibração.">
        <svg role="img" aria-label="gráfico" />
      </Figura>,
    )

    expect(screen.getByText(/Fig\. 1/)).toBeInTheDocument()
  })

  it('rejeita numero não numérico em vez de renderizar "Fig. NaN" em silêncio', () => {
    expect(() =>
      render(
        <Figura numero="dois" legenda="Legenda qualquer.">
          <svg role="img" aria-label="gráfico" />
        </Figura>,
      ),
    ).toThrow(/numero/)
  })

  it('rejeita numero vazio (Number(\'\') é 0, não um número válido de figura)', () => {
    expect(() =>
      render(
        <Figura numero="" legenda="Legenda qualquer.">
          <svg role="img" aria-label="gráfico" />
        </Figura>,
      ),
    ).toThrow(/numero/)
  })
})
