import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderizarMdx } from '@/lib/mdx'

describe('renderizarMdx', () => {
  it('renderiza títulos com id derivado do texto', async () => {
    render(await renderizarMdx('## Primeira seção\n\nTexto.'))

    const titulo = screen.getByRole('heading', { level: 2, name: 'Primeira seção' })
    expect(titulo).toHaveAttribute('id', 'primeira-secao')
  })

  it('tipografa fórmula em bloco com KaTeX', async () => {
    const { container } = render(await renderizarMdx('$$x^2$$'))

    expect(container.querySelector('.katex')).not.toBeNull()
  })

  it('realça bloco de código no build, sem enviar JS ao cliente', async () => {
    const { container } = render(await renderizarMdx('```ts\nconst a = 1\n```'))

    // rehype-pretty-code marca os tokens com data-attributes no HTML gerado.
    expect(container.querySelector('pre[data-language="ts"]')).not.toBeNull()
    expect(container.querySelector('script')).toBeNull()
  })

  it('renderiza tabela escrita em Markdown', async () => {
    render(await renderizarMdx('| Modelo | Log loss |\n| --- | --- |\n| baseline | 0,589 |'))

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Log loss' })).toBeInTheDocument()
  })
})
