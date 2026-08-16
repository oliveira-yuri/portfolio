import type { Certificate, Education } from '@/content/types'

export const education: Education = {
  institution: 'Faculdade de Tecnologia de Campinas',
  degree: {
    pt: 'Tecnólogo em Análise e Desenvolvimento de Sistemas',
    en: 'Technology degree in Systems Analysis and Development',
  },
  period: { start: '2025-01', end: '2027-12' },
  status: { pt: 'Em andamento', en: 'In progress' },
}

export const certificates: Certificate[] = [
  {
    id: 'estrutura-de-dados-e-algoritmos',
    title: { pt: 'Estrutura de Dados e Algoritmos', en: 'Data Structures and Algorithms' },
    issuer: 'Augusto Galego (Hubla)',
    date: '2026-08',
    credentialUrl: '/certificados/estrutura-de-dados-e-algoritmos.pdf',
  },
]
