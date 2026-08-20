import { describe, expect, it } from 'vitest'
import { classesDoPilar, corDoPilar, poloDoPilar } from '@/lib/escala'
import { pilares } from '@/lib/posts'

describe('poloDoPilar', () => {
  it('ordena os pilares do abstrato ao aplicado na escala divergente', () => {
    expect(poloDoPilar('academico')).toBe('frio')
    expect(poloDoPilar('ensino')).toBe('neutro')
    expect(poloDoPilar('projetos')).toBe('quente')
  })

  it('cobre todos os pilares existentes, sem sobrar nem faltar', () => {
    expect(pilares.map(poloDoPilar).sort()).toEqual(['frio', 'neutro', 'quente'])
  })
})

describe('classesDoPilar', () => {
  it('usa a cor do polo no texto', () => {
    expect(classesDoPilar('academico').texto).toBe('text-frio')
    expect(classesDoPilar('ensino').texto).toBe('text-suave')
    expect(classesDoPilar('projetos').texto).toBe('text-quente')
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
  it('devolve a custom property, para posição e cor calculadas em SVG', () => {
    expect(corDoPilar('academico')).toBe('var(--frio)')
    expect(corDoPilar('ensino')).toBe('var(--suave)')
    expect(corDoPilar('projetos')).toBe('var(--quente)')
  })
})
