import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EixoDoTempo } from '@/components/archive/EixoDoTempo'
import type { Post } from '@/lib/posts'
import { postFixture } from '@/test/fixtures'

/**
 * Fixture local só desta suíte — NÃO usar `postFixture` para os testes de
 * posição/altura: seus três corpos são curtos demais e todos batem no piso
 * de `tempoDeLeitura` (1 min), o que colapsa a altura das três marcas em
 * 100% e esconde qualquer regressão na normalização.
 *
 * Datas limpas (janela de 30 dias, texto do meio a 10 dias do início) tornam
 * a posição esperada do meio um valor exato (33.333...%) em vez de uma
 * fração de calendário arbitrária, e — mais importante — diferente dos 50%
 * que uma implementação por índice produziria para qualquer trio.
 *
 * Ordenado data-DESCENDENTE, como `lerPosts` produz: mais recente primeiro.
 */
function corpoComPalavras(n: number): string {
  return Array(n).fill('palavra').join(' ')
}

function diasEntre(data: string): number {
  return Date.parse(`${data}T12:00:00Z`) / 86_400_000
}

const postFixtureEixo: Post[] = [
  {
    slug: 'mais-recente',
    locale: 'pt',
    data: '2026-01-31',
    titulo: 'Texto mais recente',
    resumo: 'Resumo.',
    pilar: 'projetos',
    tags: ['teste'],
    destaque: false,
    corpo: corpoComPalavras(2000), // 2000 palavras / 200 ppm → 10 min
  },
  {
    slug: 'meio',
    locale: 'pt',
    data: '2026-01-11',
    titulo: 'Texto do meio',
    resumo: 'Resumo.',
    pilar: 'academico',
    tags: ['teste'],
    destaque: false,
    corpo: corpoComPalavras(1000), // 1000 palavras / 200 ppm → 5 min
  },
  {
    slug: 'mais-antigo',
    locale: 'pt',
    data: '2026-01-01',
    titulo: 'Texto mais antigo',
    resumo: 'Resumo.',
    pilar: 'ensino',
    tags: ['teste'],
    destaque: false,
    corpo: corpoComPalavras(200), // 200 palavras / 200 ppm → 1 min
  },
]

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

  it('posiciona o traço do meio proporcionalmente aos dias decorridos, não ao índice', () => {
    // Com 3 textos, uma implementação por índice (i / (n - 1) * 100) cai em
    // 0%, 50%, 100% — os mesmos extremos do teste acima, mas com o meio
    // errado. Só inspecionar o traço do meio expõe esse atalho: aqui ele
    // fica em 10 dos 30 dias de janela (33.333...%), nunca em 50%.
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixtureEixo} />)
    const meio = container.querySelector<HTMLElement>('[data-traco][data-pilar="academico"]')

    const inicio = diasEntre('2026-01-01')
    const fim = diasEntre('2026-01-31')
    const esperado = `${((diasEntre('2026-01-11') - inicio) / (fim - inicio)) * 100}%`

    expect(meio?.style.left).toBe(esperado)
    expect(meio?.style.left).not.toBe('50%')
  })

  it('a altura de cada traço é proporcional ao tempo de leitura, normalizada pela maior presente', () => {
    // ALTURA_MINIMA = 22, ALTURA_MAXIMA = 100, normalizado pelos 10 min do
    // texto mais longo do fixture: 10→100%, 5→61%, 1→29.8%. Valores
    // computados a partir da especificação, não lidos do DOM em ordem.
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixtureEixo} />)

    const maisLongo = container.querySelector<HTMLElement>('[data-traco][data-pilar="projetos"]') // 10 min
    const doMeio = container.querySelector<HTMLElement>('[data-traco][data-pilar="academico"]') // 5 min
    const maisCurto = container.querySelector<HTMLElement>('[data-traco][data-pilar="ensino"]') // 1 min

    expect(maisLongo?.style.height).toBe('100%')
    expect(doMeio?.style.height).toBe('61%')
    expect(maisCurto?.style.height).toBe('29.8%')

    expect(maisLongo?.style.height).not.toBe(doMeio?.style.height)
    expect(doMeio?.style.height).not.toBe(maisCurto?.style.height)
  })

  it('colore cada traço pela cor de marca do pilar, na escala sequencial', () => {
    const { container } = render(<EixoDoTempo locale="pt" posts={postFixture} />)

    expect(container.querySelector('[data-traco][data-pilar="projetos"]')).toHaveStyle({
      backgroundColor: 'var(--pilar-projetos)',
    })
    expect(container.querySelector('[data-traco][data-pilar="academico"]')).toHaveStyle({
      backgroundColor: 'var(--pilar-academico)',
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
