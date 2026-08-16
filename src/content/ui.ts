import type { Localized } from '@/lib/i18n'

type LocalizedTree = { [key: string]: Localized | LocalizedTree }

export const ui = {
  skipToContent: { pt: 'Pular para o conteúdo', en: 'Skip to content' },
  present: { pt: 'atual', en: 'present' },
  sections: {
    about: { pt: 'Sobre', en: 'About' },
    experience: { pt: 'Experiência', en: 'Experience' },
    projects: { pt: 'Projetos', en: 'Projects' },
    skills: { pt: 'Habilidades', en: 'Skills' },
    education: { pt: 'Formação', en: 'Education' },
    certificates: { pt: 'Certificados', en: 'Certificates' },
    contact: { pt: 'Contato', en: 'Contact' },
  },
  actions: {
    downloadCv: { pt: 'Baixar currículo', en: 'Download résumé' },
    viewRepo: { pt: 'Ver código', en: 'View code' },
    viewDemo: { pt: 'Ver demo', en: 'View demo' },
    verifyCredential: { pt: 'Verificar credencial', en: 'Verify credential' },
    switchLanguage: { pt: 'Ver em inglês', en: 'Ver em português' },
    toggleTheme: { pt: 'Alternar tema', en: 'Toggle theme' },
  },
  skillLevels: {
    core: { pt: 'Uso em projetos', en: 'Use in projects' },
    used: { pt: 'Já usei', en: 'Have used' },
    learning: { pt: 'Estudando agora', en: 'Currently learning' },
  },
} satisfies LocalizedTree
