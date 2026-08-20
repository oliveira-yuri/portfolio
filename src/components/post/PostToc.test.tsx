import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostToc } from '@/components/post/PostToc'

const secoes = [
  { id: 'primeira', texto: 'Primeira' },
  { id: 'segunda', texto: 'Segunda' },
]

describe('PostToc', () => {
  it('lista as seções com âncora', () => {
    render(<PostToc locale="pt" secoes={secoes} />)

    expect(screen.getByRole('link', { name: 'Primeira' })).toHaveAttribute('href', '#primeira')
    expect(screen.getByRole('link', { name: 'Segunda' })).toHaveAttribute('href', '#segunda')
  })

  it('marca a primeira seção como atual antes de qualquer scroll', () => {
    render(<PostToc locale="pt" secoes={secoes} />)

    expect(screen.getByRole('link', { name: 'Primeira' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Segunda' })).not.toHaveAttribute('aria-current')
  })

  it('não renderiza nada em post sem seções', () => {
    const { container } = render(<PostToc locale="pt" secoes={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('rotula a navegação para leitor de tela', () => {
    render(<PostToc locale="pt" secoes={secoes} />)

    expect(screen.getByRole('navigation', { name: 'Neste texto' })).toBeInTheDocument()
  })

  it('rotula a navegação em inglês quando o locale é en', () => {
    render(<PostToc locale="en" secoes={secoes} />)

    expect(screen.getByRole('navigation', { name: 'In this text' })).toBeInTheDocument()
  })
})
