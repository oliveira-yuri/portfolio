import type { Pilar } from '@/lib/posts'

/**
 * A paleta do site é uma escala divergente, e os três pilares ocupam seus três
 * pontos na ordem do abstrato ao aplicado: teoria (académico) → transmissão
 * (ensino) → construção (projetos). A cor codifica esse eixo; não é enfeite.
 */
export type Polo = 'frio' | 'neutro' | 'quente'

const POLO: Record<Pilar, Polo> = {
  academico: 'frio',
  ensino: 'neutro',
  projetos: 'quente',
}

/** Classes literais: Tailwind não enxerga classe montada em tempo de execução. */
const CLASSES: Record<Polo, { texto: string; fundo: string }> = {
  frio: { texto: 'text-frio', fundo: 'bg-frio' },
  neutro: { texto: 'text-suave', fundo: 'bg-suave' },
  quente: { texto: 'text-quente', fundo: 'bg-quente' },
}

const COR: Record<Polo, string> = {
  frio: 'var(--frio)',
  neutro: 'var(--suave)',
  quente: 'var(--quente)',
}

export function poloDoPilar(pilar: Pilar): Polo {
  return POLO[pilar]
}

export function classesDoPilar(pilar: Pilar): { texto: string; fundo: string } {
  return CLASSES[POLO[pilar]]
}

export function corDoPilar(pilar: Pilar): string {
  return COR[POLO[pilar]]
}
