import type { Pilar } from '@/lib/posts'

/**
 * A paleta do site é uma escala SEQUENCIAL de verde (direção "Clorofila"),
 * e os três pilares ocupam três passos na ordem do abstrato ao aplicado:
 * teoria (academico) → transmissão (ensino) → construção (projetos). A cor
 * codifica esse eixo; não é enfeite.
 *
 * MEDIÇÃO, não gosto — por que o texto do rótulo NÃO usa as três cores:
 *
 * Um verde claro o bastante para ler como "abstrato" falha contraste feio
 * como texto sobre `--papel` claro: no mesmo matiz usado abaixo (~150°),
 * ainda tentando bater 4.5:1 (texto normal, WCAG AA), a faixa que passa em
 * modo claro fica presa a tons bem escuros (L HSL até ~30%; a partir de
 * L=32% já cai a 4.69:1 e some rápido — em L=56% mede só 1.90:1). Isso força
 * os três passos a se espremerem numa banda estreita e escura, quase sem
 * diferença visível entre si: medindo o contraste dos três candidatos mais
 * afastados possíveis dentro dessa banda (#0c3112, #14521f, #1d722b, todos
 * ≥4.5:1 contra o papel claro) uns contra os outros, o par mais próximo dá
 * 1.54:1 e o mais distante 2.39:1 — nenhum dos dois se lê como "cor
 * diferente" ao lado do outro. Três passos SIMULTANEAMENTE ≥4.5:1 nos dois
 * temas E visivelmente distintos entre si não existem neste matiz. Script de
 * medição e tabela completa no relatório desta tarefa
 * (.superpowers/sdd/2026-08-20-redesenho-intervalo/clorofila-report.md).
 *
 * SAÍDA (a exigida pela spec quando os três passos não existem): o rótulo de
 * texto do pilar usa uma única cor verde acessível (`--verde`, ≥4.5:1 contra
 * `--papel` nos dois temas — medido: 8.13:1 claro, 8.35:1 escuro) para os
 * três pilares. A cor por pilar continua existindo, mas só em marcas NÃO
 * textuais — o selo da legenda e a barra de tempo de leitura — onde o limiar
 * WCAG 1.4.11 é 3:1, não 4.5:1. Nessa faixa mais larga (L HSL até ~40% em
 * modo claro, a partir de ~27% em modo escuro) os três passos
 * (`--pilar-academico/ensino/projetos`) folgam 3:1 contra `--papel` E contra
 * `--fio` (a trilha da barra) nos dois temas — medido, tabela no relatório.
 * A ordem abstrato→aplicado é: o passo mais perto de `--papel` (mais
 * "apagado") é o academico; o mais distante (mais "cheio") é projetos.
 */

/** Único verde de texto, acessível nos dois temas — ver medição acima. */
const COR_TEXTO = 'var(--verde)'
const CLASSE_TEXTO = 'text-verde'

/** Cores de marca (não-textuais) por pilar, na ordem abstrato → aplicado. */
const COR_MARCA: Record<Pilar, string> = {
  academico: 'var(--pilar-academico)',
  ensino: 'var(--pilar-ensino)',
  projetos: 'var(--pilar-projetos)',
}

/** Classes literais: Tailwind não enxerga classe montada em tempo de execução. */
const CLASSE_MARCA: Record<Pilar, string> = {
  academico: 'bg-pilar-academico',
  ensino: 'bg-pilar-ensino',
  projetos: 'bg-pilar-projetos',
}

export function classesDoPilar(pilar: Pilar): { texto: string; fundo: string } {
  return { texto: CLASSE_TEXTO, fundo: CLASSE_MARCA[pilar] }
}

/** Cor de MARCA (selo/barra) do pilar — nunca do texto do rótulo, ver medição acima. */
export function corDoPilar(pilar: Pilar): string {
  return COR_MARCA[pilar]
}

/** Cor de TEXTO do rótulo de pilar — sempre a mesma, ver medição acima. */
export function corDeTextoDoPilar(): string {
  return COR_TEXTO
}
