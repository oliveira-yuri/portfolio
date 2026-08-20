import type { Localized } from '@/lib/i18n'
import type { Pilar } from '@/lib/posts'

export const descricaoPilar: Record<Pilar, { nome: Localized; descricao: Localized }> = {
  academico: {
    nome: { pt: 'Acadêmico', en: 'Academic' },
    descricao: {
      pt: 'Estatística, probabilidade e estrutura de dados na Fatec.',
      en: 'Statistics, probability and data structures at Fatec.',
    },
  },
  ensino: {
    nome: { pt: 'Ensino', en: 'Teaching' },
    descricao: {
      pt: 'O que dar aula de IA no ibe.IA me ensinou sobre IA.',
      en: 'What teaching AI at ibe.IA taught me about AI.',
    },
  },
  projetos: {
    nome: { pt: 'Projetos', en: 'Projects' },
    descricao: {
      pt: 'Análise de padrões em e-sports, pipelines e experimentos.',
      en: 'Pattern analysis in e-sports, pipelines and experiments.',
    },
  },
}
