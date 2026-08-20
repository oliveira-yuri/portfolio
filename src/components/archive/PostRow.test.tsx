import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostRow } from '@/components/archive/PostRow'
import { postFixture } from '@/test/fixtures'

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

  it('marca visualmente o pilar do post', () => {
    const { container } = render(<PostRow locale="pt" post={postFixture[0]} />)

    expect(container.querySelector('[data-pilar="projetos"]')).not.toBeNull()
  })
})
