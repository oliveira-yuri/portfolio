import type { Certificate, Education, Experience, Profile, Project, SkillGroup } from '@/content/types'
import type { Post } from '@/lib/posts'

export const profileFixture: Profile = {
  name: 'Fulano de Tal',
  headline: { pt: 'Estudante de Sistemas', en: 'Systems student' },
  bio: [
    { pt: 'Primeiro parágrafo da bio.', en: 'First bio paragraph.' },
    { pt: 'Segundo parágrafo da bio.', en: 'Second bio paragraph.' },
  ],
  location: { pt: 'São Paulo, SP', en: 'São Paulo, Brazil' },
  intent: { pt: 'Buscando estágio em dados.', en: 'Looking for a data internship.' },
  links: {
    github: 'https://github.com/fulano',
    linkedin: 'https://www.linkedin.com/in/fulano',
    email: 'fulano@exemplo.com',
  },
  cv: { pt: '/cv/curriculo-pt.pdf', en: '/cv/resume-en.pdf' },
}

export const experienceFixture: Experience[] = [
  {
    id: 'monitoria',
    role: { pt: 'Monitor de IA', en: 'AI teaching assistant' },
    organization: 'Instituto Exemplo',
    organizationUrl: 'https://exemplo.edu',
    period: { start: '2025-02', end: null },
    highlights: [
      { pt: 'Acompanhou 60 alunos.', en: 'Supported 60 students.' },
      { pt: 'Produziu 12 aulas práticas.', en: 'Produced 12 hands-on classes.' },
    ],
    tech: ['Python'],
  },
  {
    id: 'freela',
    role: { pt: 'Desenvolvedor freelance', en: 'Freelance developer' },
    organization: 'Autônomo',
    period: { start: '2023-05', end: '2024-03' },
    highlights: [{ pt: 'Entregou um site institucional.', en: 'Delivered a company website.' }],
  },
]

export const projectFixture: Project[] = [
  {
    slug: 'analisador',
    title: 'Analisador de Notas',
    summary: { pt: 'Resume boletins automaticamente.', en: 'Summarizes report cards automatically.' },
    description: { pt: 'Descrição longa do projeto.', en: 'Long project description.' },
    tech: ['Python', 'FastAPI'],
    role: { pt: 'Projeto pessoal', en: 'Personal project' },
    period: { start: '2025-01', end: '2025-04' },
    links: { repo: 'https://github.com/fulano/analisador', demo: 'https://analisador.exemplo.com' },
    image: { src: '/images/projects/analisador.png', alt: { pt: 'Tela do analisador', en: 'Analyzer screen' }, width: 1200, height: 750 },
    featured: true,
  },
  {
    slug: 'sem-demo',
    title: 'CLI de Estudos',
    summary: { pt: 'Organiza sessões de estudo.', en: 'Organizes study sessions.' },
    description: { pt: 'Outra descrição.', en: 'Another description.' },
    tech: ['TypeScript'],
    role: { pt: 'Projeto pessoal', en: 'Personal project' },
    period: { start: '2024-08', end: '2024-11' },
    links: { repo: 'https://github.com/fulano/cli' },
    featured: false,
  },
]

export const skillGroupsFixture: SkillGroup[] = [
  { level: 'core', items: ['Python', 'TypeScript'] },
  { level: 'used', items: ['SQL'] },
  { level: 'learning', items: ['Docker'] },
]

export const educationFixture: Education = {
  institution: 'Instituto Exemplo',
  degree: { pt: 'Sistemas de Informação', en: 'Information Systems' },
  period: { start: '2024-02', end: '2027-12' },
  status: { pt: 'Em andamento', en: 'In progress' },
}

export const certificatesFixture: Certificate[] = [
  {
    id: 'fundamentos-ia',
    title: { pt: 'Fundamentos de IA', en: 'AI Foundations' },
    issuer: 'Exemplo Academy',
    date: '2025-03',
    credentialUrl: 'https://exemplo.com/credencial/1',
  },
  {
    id: 'sql-aplicado',
    title: { pt: 'SQL Aplicado', en: 'Applied SQL' },
    issuer: 'Exemplo Academy',
    date: '2024-09',
  },
]

export const postFixture: Post[] = [
  {
    slug: 'com-cta',
    locale: 'pt',
    data: '2026-08-12',
    titulo: 'Post com CTA',
    resumo: 'Resumo do post com CTA.',
    pilar: 'projetos',
    tags: ['estatistica', 'esports'],
    destaque: true,
    cta: 'ia-para-negocios',
    corpo: '## Uma seção\n\nCorpo.',
  },
  {
    slug: 'sem-cta',
    locale: 'pt',
    data: '2026-07-30',
    titulo: 'Post sem CTA',
    resumo: 'Resumo do post sem CTA.',
    pilar: 'academico',
    tags: ['probabilidade'],
    destaque: false,
    corpo: 'Corpo sem seções.',
  },
  {
    slug: 'de-ensino',
    locale: 'pt',
    data: '2026-06-05',
    titulo: 'Post de ensino',
    resumo: 'Resumo do post de ensino.',
    pilar: 'ensino',
    tags: ['ia', 'ensino'],
    destaque: false,
    corpo: 'Corpo.',
  },
]
