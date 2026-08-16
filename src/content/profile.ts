import type { Profile } from '@/content/types'

export const profile: Profile = {
  name: 'Yuri Oliveira',
  headline: {
    pt: 'Desenvolvedor de automações e assistente de ensino · Estudante de ADS na Fatec Campinas',
    en: 'Automation developer and teaching assistant · Systems Analysis and Development student at Fatec Campinas',
  },
  bio: [
    {
      pt: 'Construo fluxos automatizados e integrações com n8n, CRM e APIs — de WhatsApp a Supabase — para reduzir trabalho manual, qualificar leads e organizar processos operacionais.',
      en: 'I build automated flows and integrations with n8n, CRM and APIs — from WhatsApp to Supabase — to cut manual work, qualify leads and organise operational processes.',
    },
    {
      pt: 'Também produzo conteúdo educacional sobre inteligência artificial e ferramentas de automação. Sou nativo em português e tenho inglês nível B2.',
      en: 'I also produce educational content about artificial intelligence and automation tools. I am a native Portuguese speaker with B2 English.',
    },
  ],
  location: { pt: 'Campinas, São Paulo', en: 'Campinas, São Paulo, Brazil' },
  intent: {
    pt: 'Hoje me divido entre criar automações para processos comerciais e operacionais e produzir conteúdo educacional sobre IA.',
    en: 'Today I split my time between building automations for commercial and operational processes and producing educational content about AI.',
  },
  links: {
    github: 'https://github.com/oliveira-yuri',
    linkedin: 'PENDENTE: URL do LinkedIn',
    email: 'yuri.oliveira.silva.24@gmail.com',
  },
  cv: { pt: '/cv/curriculo-pt.pdf', en: '/cv/curriculo-pt.pdf' },
}
