import { describe, expect, it } from 'vitest'
import { caminhoPilar, segmentoPilares } from '@/lib/routes'

describe('caminhoPilar', () => {
  it('usa "pilares" em português e "pillars" em inglês', () => {
    expect(caminhoPilar('pt', 'ensino')).toBe('/pt/pilares/ensino')
    expect(caminhoPilar('en', 'ensino')).toBe('/en/pillars/ensino')
  })

  it('não traduz a chave do pilar, porque ela é enum e não texto de interface', () => {
    expect(caminhoPilar('en', 'academico')).toBe('/en/pillars/academico')
  })

  it('cobre os dois idiomas no mapa de segmentos', () => {
    expect(Object.keys(segmentoPilares).sort()).toEqual(['en', 'pt'])
  })
})
