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

  it('legenda uma <Figura numero="1"> de verdade pelo pipeline de MDX — não só via prop React direta', async () => {
    // O motivo de `numero` aceitar string (ver comentário em Figura.tsx): o
    // pipeline de MDX (blockJS, ligado por padrão) descarta em silêncio
    // qualquer atributo JSX escrito como expressão (`numero={1}`) — só um
    // literal string (`numero="1"`) sobrevive vindo de um post real. Um
    // teste que só passa `numero={1}` como prop React direta (como
    // Figura.test.tsx) nunca exercita esse caminho.
    const { container } = render(
      await renderizarMdx(
        '<Figura numero="1" legenda="Legenda de verificação.">\n  <svg role="img" aria-label="gráfico de teste" />\n</Figura>',
      ),
    )

    const legenda = container.querySelector('figcaption')
    expect(legenda?.textContent).toContain('Fig. 1')
    expect(legenda?.textContent).toContain('Legenda de verificação.')
  })
})
