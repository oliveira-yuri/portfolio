import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EixoDoTempo } from '@/components/archive/EixoDoTempo'
import { postFixture } from '@/test/fixtures'

describe('EixoDoTempo', () => {
  it('desenha um traço por texto', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixture} />)

    expect(container.querySelectorAll('[data-traco]')).toHaveLength(postFixture.length)
  })

  it('posiciona pelo intervalo real de datas: o mais antigo em 0% e o mais recente em 100%', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixture} />)
    const tracos = [...container.querySelectorAll<HTMLElement>('[data-traco]')]
    const posicoes = tracos.map((t) => t.style.left)

    expect(posicoes).toContain('0%')
    expect(posicoes).toContain('100%')
  })

  it('colore cada traço pelo polo do pilar', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixture} />)

    expect(container.querySelector('[data-traco][data-pilar="projetos"]')).toHaveStyle({
      backgroundColor: 'var(--quente)',
    })
    expect(container.querySelector('[data-traco][data-pilar="academico"]')).toHaveStyle({
      backgroundColor: 'var(--frio)',
    })
  })

  it('não divide por zero quando existe um único texto', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={[postFixture[0]]} />)
    const traco = container.querySelector<HTMLElement>('[data-traco]')

    expect(traco?.style.left).toBe('0%')
    expect(traco?.style.left).not.toContain('NaN')
  })

  it('anuncia o resumo para leitor de tela, com os traços escondidos da árvore', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixture} />)

    expect(screen.getByRole('img', { name: /3 textos/ })).toBeInTheDocument()
    expect(container.querySelector('[data-traco]')?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('não renderiza nada sem textos', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
