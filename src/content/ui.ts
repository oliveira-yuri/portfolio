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
  newsletter: {
    trilhas: { pt: 'Trilhas', en: 'Tracks' },
    destaques: { pt: 'Destaques', en: 'Featured' },
    arquivo: { pt: 'Arquivo', en: 'Archive' },
    textos: { pt: 'textos', en: 'texts' },
    desde: { pt: 'desde', en: 'since' },
    ultimo: { pt: 'último em', en: 'latest on' },
    verTodas: { pt: 'Ver todas as tags', en: 'See all tags' },
  },
  post: {
    nesteTexto: { pt: 'Neste texto', en: 'In this text' },
    tempoLeitura: { pt: 'min de leitura', en: 'min read' },
    atualizadoEm: { pt: 'atualizado em', en: 'updated on' },
    restante: { pt: 'restante', en: 'left' },
    notas: { pt: 'Notas', en: 'Notes' },
    noSite: { pt: 'No site', en: 'On the site' },
    daquiVocePodeIr: { pt: 'Daqui você pode ir para', en: 'From here you can go to' },
    estudarAFundo: { pt: 'Se quiser estudar isso a fundo', en: 'If you want to study this in depth' },
    divulgacao: {
      pt: 'Divulgação: sou assistente de ensino no ibe.IA — este link é do lugar onde eu trabalho.',
      en: 'Disclosure: I am a teaching assistant at ibe.IA — this link points to where I work.',
    },
    soEmPortugues: {
      pt: 'Este texto existe apenas em português.',
      en: 'This text is only available in Portuguese.',
    },
    soEmIngles: {
      pt: 'Este texto existe apenas em inglês.',
      en: 'This text is only available in English.',
    },
    lerNoIdiomaDisponivel: { pt: 'Ler em português', en: 'Read in English' },
  },
  nav: {
    newsletter: { pt: 'Newsletter', en: 'Newsletter' },
    portfolio: { pt: 'Portfólio', en: 'Portfolio' },
  },
  footer: {
    vinculo: { pt: 'Assistente de ensino no', en: 'Teaching assistant at' },
  },
} satisfies LocalizedTree
