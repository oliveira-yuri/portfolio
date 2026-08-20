import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PillarCards } from '@/components/archive/PillarCards'
import type { Post } from '@/lib/posts'
import { postFixture } from '@/test/fixtures'

describe('PillarCards', () => {
  it('mostra os três pilares com a contagem real, inclusive zero', () => {
    render(<PillarCards locale="pt" posts={[postFixture[1]]} />)

    expect(screen.getByRole('link', { name: /Acadêmico/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ensino/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Projetos/ })).toBeInTheDocument()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getAllByText('00')).toHaveLength(2)
  })

  it('não renderiza o gráfico de cadência com menos de quatro meses de histórico', () => {
    const { container } = render(<PillarCards locale="pt" posts={postFixture} />)

    expect(container.querySelector('[data-cadencia]')).toBeNull()
  })

  it('renderiza o gráfico de cadência a partir de quatro meses de histórico', () => {
    const espalhados: Post[] = ['2026-08-01', '2026-07-01', '2026-06-01', '2026-05-01'].map((data, i) => ({
      ...postFixture[0],
      slug: `post-${i}`,
      data,
    }))

    const { container } = render(<PillarCards locale="pt" posts={espalhados} />)

    expect(container.querySelector('[data-cadencia]')).not.toBeNull()
  })

  it('linka cada cartão para a página do pilar no idioma corrente', () => {
    render(<PillarCards locale="en" posts={postFixture} />)

    expect(screen.getByRole('link', { name: /Teaching/ })).toHaveAttribute('href', '/en/pillars/ensino')
  })
})
