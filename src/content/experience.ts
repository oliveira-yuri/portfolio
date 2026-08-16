import type { Experience } from '@/content/types'

export const experiences: Experience[] = [
  {
    id: 'assistente-ensino-ia',
    role: { pt: 'Assistente de ensino', en: 'Teaching assistant' },
    organization: 'Asse Software / IBEIA',
    period: { start: '2025-06', end: null },
    highlights: [
      {
        pt: 'Cria conteúdo educacional e videoaulas sobre ferramentas de IA para produção de imagem, vídeo, áudio e automações.',
        en: 'Creates educational content and video lessons on AI tools for producing images, video, audio and automations.',
      },
      {
        pt: 'Planeja, roteiriza, grava e edita videoaulas com aplicação prática de ferramentas como Freepik, Google VEO3, HeyGen, Bardeen, Gamma, Suno AI e Adobe Firefly.',
        en: 'Plans, scripts, records and edits video lessons with practical application of tools such as Freepik, Google VEO3, HeyGen, Bardeen, Gamma, Suno AI and Adobe Firefly.',
      },
      {
        pt: 'Produz material de apoio e relatórios de atividades, mantendo consistência narrativa e visual do conteúdo, e pesquisa continuamente as plataformas de IA indicadas pelo cliente.',
        en: 'Produces supporting material and activity reports, keeping narrative and visual consistency across content, and continuously researches the AI platforms indicated by the client.',
      },
    ],
    tech: ['Freepik', 'Google VEO3', 'HeyGen', 'Bardeen', 'Gamma', 'Suno AI', 'Adobe Firefly'],
  },
  {
    id: 'freelance-automacoes',
    role: { pt: 'Freelancer em automações', en: 'Freelance automation developer' },
    organization: 'Freelancer',
    period: { start: '2025-01', end: '2025-06' },
    highlights: [
      {
        pt: 'Construiu automações personalizadas para processos comerciais e operacionais usando n8n, API do WhatsApp, Google Sheets e integrações com CRM.',
        en: 'Built custom automations for commercial and operational processes using n8n, WhatsApp API, Google Sheets and CRM integrations.',
      },
      {
        pt: 'Estruturou fluxos de captação, organização e qualificação de leads, reduzindo o trabalho manual do dia a dia.',
        en: 'Structured flows for capturing, organising and qualifying leads, reducing day-to-day manual work.',
      },
      {
        pt: 'Integrou ferramentas para acompanhar informações e manter a continuidade do atendimento, padronizando processos em busca de produtividade operacional.',
        en: 'Integrated tools to track information and keep service continuity, standardising processes for operational productivity.',
      },
    ],
    tech: ['n8n', 'WhatsApp API', 'Google Sheets', 'CRM'],
  },
]
