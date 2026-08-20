import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostHeader } from '@/components/post/PostHeader'
import { postFixture } from '@/test/fixtures'

describe('PostHeader', () => {
  it('mostra pilar, data, tempo de leitura e título', () => {
    render(<PostHeader locale="pt" post={postFixture[0]} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Post com CTA' })).toBeInTheDocument()
    expect(screen.getByText(/Projetos/)).toBeInTheDocument()
    expect(screen.getByText(/12\/08\/2026/)).toBeInTheDocument()
    expect(screen.getByText(/min de leitura/)).toBeInTheDocument()
  })

  it('mostra o resumo como linha de apoio', () => {
    render(<PostHeader locale="pt" post={postFixture[0]} />)

    expect(screen.getByText('Resumo do post com CTA.')).toBeInTheDocument()
  })

  it('não mostra "atualizado em" quando o post nunca foi atualizado', () => {
    render(<PostHeader locale="pt" post={postFixture[0]} />)

    expect(screen.queryByText(/atualizado em/)).not.toBeInTheDocument()
  })

  it('mostra "atualizado em" quando o post declara a data', () => {
    render(<PostHeader locale="pt" post={{ ...postFixture[0], atualizado: '2026-08-19' }} />)

    expect(screen.getByText(/atualizado em 19\/08\/2026/)).toBeInTheDocument()
  })

  it('colore o rótulo do pilar pelo polo da escala, não por uma cor fixa', () => {
    render(<PostHeader locale="pt" post={postFixture[0]} />)

    // postFixture[0].pilar é 'projetos', que mapeia para o polo quente — se o
    // rótulo estivesse fixo em text-frio (o polo frio), esta asserção falha.
    expect(screen.getByRole('link', { name: 'Projetos' })).toHaveClass('text-quente')
  })
})
