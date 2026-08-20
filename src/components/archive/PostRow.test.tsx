import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostRow } from '@/components/archive/PostRow'
import { tempoDeLeitura } from '@/lib/reading'
import { postFixture } from '@/test/fixtures'

/** Mesma referência usada em PostRow: acima disso a barra satura. */
const LEITURA_DE_REFERENCIA = 12

describe('PostRow', () => {
  it('linka o título para o post no idioma corrente', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByRole('link', { name: 'Post com CTA' })).toHaveAttribute('href', '/pt/posts/com-cta')
  })

  it('mostra data e tags', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByText('12/08/2026')).toBeInTheDocument()
    expect(screen.getByText('#estatistica')).toBeInTheDocument()
  })

  it('omite o resumo quando não pedido', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.queryByText('Resumo do post com CTA.')).not.toBeInTheDocument()
  })

  it('mostra o resumo quando pedido', () => {
    render(<PostRow locale="pt" post={postFixture[0]} comResumo />)

    expect(screen.getByText('Resumo do post com CTA.')).toBeInTheDocument()
  })

  it('mostra o pilar como rótulo, linkado para a página do pilar', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByRole('link', { name: 'Projetos' })).toHaveAttribute('href', '/pt/pilares/projetos')
  })

  it('colore o rótulo do pilar pelo polo da escala', () => {
    render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByRole('link', { name: 'Projetos' })).toHaveClass('text-quente')
  })

  it('mostra o tempo de leitura como número e como barra proporcional', () => {
    const { container } = render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(screen.getByText(/^1 min$/)).toBeInTheDocument()
    expect(container.querySelector('[data-intervalo]')).not.toBeNull()
  })

  it('dimensiona a barra de intervalo pela proporção real do tempo de leitura', () => {
    const { container } = render(<PostRow locale="pt" post={postFixture[0]} />)

    const minutos = tempoDeLeitura(postFixture[0].corpo)
    const proporcaoEsperada = Math.min(1, minutos / LEITURA_DE_REFERENCIA) * 100

    // A proporção real do fixture (1 min / 12) não é nem 0% nem 100%: uma
    // barra com largura errada (fixa, invertida ou saturada) falha aqui.
    expect(proporcaoEsperada).toBeGreaterThan(0)
    expect(proporcaoEsperada).toBeLessThan(100)

    const preenchimento = container.querySelector('[data-intervalo] > span')
    expect(preenchimento).toHaveStyle({ width: `${proporcaoEsperada}%` })
  })

  it('não separa itens com régua — o ritmo é o espaço', () => {
    const { container } = render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(container.querySelector('li')?.className ?? '').not.toMatch(/border-b|border-dotted/)
  })

  it('não trata o título como heading — é um link de navegação, não uma seção desta página', () => {
    const { container } = render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull()
  })
})
