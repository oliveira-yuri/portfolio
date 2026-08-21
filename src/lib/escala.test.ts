import { describe, expect, it } from 'vitest'
import { classesDoPilar, corDeTextoDoPilar, corDoPilar } from '@/lib/escala'
import { pilares } from '@/lib/posts'

describe('classesDoPilar', () => {
  it('usa a mesma classe de texto verde acessível para os três pilares — não há 3 passos de texto', () => {
    // Medido em src/lib/escala.ts: nenhum trio de verdes no mesmo matiz bate
    // 4.5:1 (texto) contra --papel nos dois temas E fica visivelmente
    // distinto entre si. Por isso o texto do rótulo não varia por pilar.
    expect(classesDoPilar('academico').texto).toBe('text-verde')
    expect(classesDoPilar('ensino').texto).toBe('text-verde')
    expect(classesDoPilar('projetos').texto).toBe('text-verde')
  })

  it('usa uma classe de fundo (marca não textual) diferente por pilar, na ordem abstrato ao aplicado', () => {
    expect(classesDoPilar('academico').fundo).toBe('bg-pilar-academico')
    expect(classesDoPilar('ensino').fundo).toBe('bg-pilar-ensino')
    expect(classesDoPilar('projetos').fundo).toBe('bg-pilar-projetos')
  })

  it('devolve classes estáticas, porque Tailwind não vê classe montada em tempo de execução', () => {
    for (const pilar of pilares) {
      const { texto, fundo } = classesDoPilar(pilar)
      expect(texto).not.toContain('${')
      expect(fundo).not.toContain('${')
    }
  })
})

describe('corDoPilar', () => {
  it('devolve a custom property de MARCA (selo/barra) do pilar, uma por pilar', () => {
    expect(corDoPilar('academico')).toBe('var(--pilar-academico)')
    expect(corDoPilar('ensino')).toBe('var(--pilar-ensino)')
    expect(corDoPilar('projetos')).toBe('var(--pilar-projetos)')
  })

  it('cobre todos os pilares existentes, sem sobrar nem faltar', () => {
    const cores = new Set(pilares.map(corDoPilar))
    expect(cores.size).toBe(pilares.length)
  })
})

describe('corDeTextoDoPilar', () => {
  it('devolve sempre o mesmo verde acessível, independente do pilar', () => {
    expect(corDeTextoDoPilar()).toBe('var(--verde)')
  })
})
