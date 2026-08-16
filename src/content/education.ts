import type { Certificate, Education } from '@/content/types'

export const education: Education = {
  institution: 'PENDENTE: instituição',
  degree: { pt: 'PENDENTE: nome do curso', en: 'PENDENTE: course name' },
  period: { start: '2024-02', end: '2027-12' },
  status: { pt: 'Em andamento', en: 'In progress' },
}

export const certificates: Certificate[] = [
  {
    id: 'pendente-certificado-1',
    title: { pt: 'PENDENTE: nome do certificado', en: 'PENDENTE: certificate name' },
    issuer: 'PENDENTE: emissor',
    date: '2025-03',
  },
]
