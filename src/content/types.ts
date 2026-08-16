import type { Localized } from '@/lib/i18n'

export type { Localized }

/** Datas em 'YYYY-MM'. `end: null` significa "até hoje". */
export type Period = { start: string; end: string | null }

export type Profile = {
  name: string
  headline: Localized
  bio: Localized[]
  location: Localized
  intent: Localized
  links: {
    github: string
    linkedin: string
    email: string
    whatsapp?: string
  }
  /** Caminhos dos PDFs em /public, um por idioma. */
  cv: { pt: string; en: string }
}

export type Experience = {
  id: string
  role: Localized
  organization: string
  organizationUrl?: string
  period: Period
  /** 2 a 3 bullets de impacto: o que mudou, não que tarefa foi feita. */
  highlights: Localized[]
  tech?: string[]
}

export type Project = {
  slug: string
  title: string
  summary: Localized
  description: Localized
  tech: string[]
  role: Localized
  period: Period
  links: { repo?: string; demo?: string }
  image?: { src: string; alt: Localized; width: number; height: number }
  featured: boolean
  /** Não renderizado nesta versão; habilita páginas de detalhe no futuro. */
  caseStudy?: Localized
}

export type SkillLevel = 'core' | 'used' | 'learning'

export type SkillGroup = { level: SkillLevel; items: string[] }

export type Education = {
  institution: string
  degree: Localized
  period: Period
  status: Localized
}

export type Certificate = {
  id: string
  title: Localized
  issuer: string
  /** 'YYYY-MM' */
  date: string
  credentialUrl?: string
}
