import type { Localized } from '@/lib/i18n'
import type { FormacaoId } from '@/lib/posts'

export type Formacao = { id: FormacaoId; nome: string; url: string; descricao: Localized }

export const formacoes: Record<FormacaoId, Formacao> = {
  'vibe-coding': {
    id: 'vibe-coding',
    nome: 'Formação em Vibe Coding',
    url: 'https://ibe.ia.br/',
    descricao: {
      pt: 'Construir aplicações e SaaS com assistentes de código.',
      en: 'Building apps and SaaS with coding assistants.',
    },
  },
  'agentes-ia': {
    id: 'agentes-ia',
    nome: 'Formação em Agentes IA',
    url: 'https://ibe.ia.br/',
    descricao: {
      pt: 'Agentes e automações para atendimento e processos.',
      en: 'Agents and automations for support and operations.',
    },
  },
  'ia-para-negocios': {
    id: 'ia-para-negocios',
    nome: 'Formação em IA para Negócios',
    url: 'https://ibe.ia.br/',
    descricao: {
      pt: 'Decisão com dados e uso de IA nas áreas da empresa.',
      en: 'Data-driven decisions and AI across business areas.',
    },
  },
}
