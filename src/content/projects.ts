import type { Project } from '@/content/types'

export const projects: Project[] = [
  {
    slug: 'pendente-projeto-1',
    title: 'PENDENTE: nome do projeto',
    summary: { pt: 'PENDENTE: uma linha sobre o que resolve.', en: 'PENDENTE: one line.' },
    description: { pt: 'PENDENTE: parágrafo sobre o problema e a solução.', en: 'PENDENTE: paragraph.' },
    tech: ['TypeScript'],
    role: { pt: 'Projeto pessoal', en: 'Personal project' },
    period: { start: '2025-06', end: null },
    links: { repo: 'https://github.com/oliveira-yuri' },
    featured: true,
  },
]
