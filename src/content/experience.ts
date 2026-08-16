import type { Experience } from '@/content/types'

export const experiences: Experience[] = [
  {
    id: 'assistente-ensino-ia',
    role: { pt: 'Assistente de ensino — IA', en: 'Teaching assistant — AI' },
    organization: 'PENDENTE: instituição',
    period: { start: '2025-01', end: null },
    highlights: [
      { pt: 'PENDENTE: impacto 1 (número de alunos, conteúdo lecionado).', en: 'PENDENTE: impact 1.' },
      { pt: 'PENDENTE: impacto 2 (material produzido, resultado).', en: 'PENDENTE: impact 2.' },
    ],
    tech: ['Python'],
  },
  {
    id: 'freelance',
    role: { pt: 'Desenvolvedor freelance', en: 'Freelance developer' },
    organization: 'PENDENTE: cliente ou "Autônomo"',
    period: { start: '2024-01', end: '2024-12' },
    highlights: [
      { pt: 'PENDENTE: problema do cliente e resultado entregue.', en: 'PENDENTE: client problem and delivered result.' },
    ],
  },
]
