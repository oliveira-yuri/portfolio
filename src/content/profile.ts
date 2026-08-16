import type { Profile } from '@/content/types'

export const profile: Profile = {
  name: 'PENDENTE: nome completo',
  headline: {
    pt: 'PENDENTE: Estudante de <curso> · Foco em IA e desenvolvimento web',
    en: 'PENDENTE: <course> student · Focused on AI and web development',
  },
  bio: [
    { pt: 'PENDENTE: parágrafo 1 — de onde vem e o que puxou para tecnologia.', en: 'PENDENTE: paragraph 1.' },
    { pt: 'PENDENTE: parágrafo 2 — o que constrói hoje e como trabalha.', en: 'PENDENTE: paragraph 2.' },
  ],
  location: { pt: 'PENDENTE: Cidade, Estado', en: 'PENDENTE: City, State — Brazil' },
  intent: {
    pt: 'PENDENTE: buscando estágio em <área>.',
    en: 'PENDENTE: looking for an internship in <field>.',
  },
  links: {
    github: 'https://github.com/oliveira-yuri',
    linkedin: 'PENDENTE: https://www.linkedin.com/in/<perfil>',
    email: 'PENDENTE: email@exemplo.com',
  },
  cv: { pt: '/cv/curriculo-pt.pdf', en: '/cv/resume-en.pdf' },
}
